"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";
import MapPicker from "@/components/location/MapPicker";
import { useAuth } from "@/lib/hooks/useAuth";
import { searchLocations, createLocation, getLocation, getDuplicateCandidateIds } from "@/lib/api/locations";
import CityPicker from "@/components/city/CityPicker";
import { getGeoCities } from "@/lib/api/cities";
import { getApiErrorMessage } from "@/lib/utils/apiErrorMessage";
import { LOCATION_CATEGORIES, categoryLabel } from "@/lib/utils/locationCategory";
import { cityLabel, type CityOption } from "@/lib/utils/cityLabel";
import type { Location, LocationCategory } from "@/types/location";

interface NewLocationModalProps {
  open: boolean;
  initialName: string;
  onCreated: (location: Location) => void;
  onSelectExisting: (location: Location) => void;
  onCancel: () => void;
}

const DUPLICATE_RADIUS_KM = 0.5;
const DEBOUNCE_MS = 400;
const DESCRIPTION_MAX_LENGTH = 1000;

const FIELD_CLASS =
  "rounded-2xl border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40";

export default function NewLocationModal({ open, initialName, onCreated, onSelectExisting, onCancel }: NewLocationModalProps) {
  const { getAccessToken } = useAuth();
  const [name, setName] = useState(initialName);
  const [city, setCity] = useState<CityOption | null>(null);
  // Enquanto a pessoa não escolhe a cidade, ela segue o pino (a mais próxima); depois de escolher, fica.
  const [cityChosenByUser, setCityChosenByUser] = useState(false);
  // Pino a mais de 150 km do centro da cidade escolhida: aviso, nunca bloqueio.
  const [cityFarAway, setCityFarAway] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<LocationCategory | "">("");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [duplicates, setDuplicates] = useState<Location[]>([]);
  const [duplicatesDismissed, setDuplicatesDismissed] = useState(false);
  // A API já apontou possível duplicata pra este nome/posição: dispensar a lista passa a
  // significar "é outro lugar" e o reenvio leva confirmDistinct.
  const [serverFlagged, setServerFlagged] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);

  // Reajusta o estado durante a renderização (não num efeito) ao abrir o modal —
  // mesmo padrão já usado em EditProfileModal/UploadPhotoModal/RatingWidget.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(initialName);
      setCity(null);
      setCityChosenByUser(false);
      setCityFarAway(null);
      setDescription("");
      setCategory("");
      setPosition(null);
      setDuplicates([]);
      setDuplicatesDismissed(false);
      setServerFlagged(false);
      setError(null);
    }
  }

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  // Ajusta o estado durante a renderização (não num efeito) quando nome ou
  // posição mudam — limpa duplicatas antigas e exige dispensar de novo antes
  // de poder criar, antes mesmo da busca debounced abaixo rodar.
  const trimmedName = name.trim();
  const duplicateCheckKey = `${trimmedName}|${position ? `${position.lat},${position.lng}` : ""}`;
  const [lastDuplicateCheckKey, setLastDuplicateCheckKey] = useState(duplicateCheckKey);
  if (duplicateCheckKey !== lastDuplicateCheckKey) {
    setLastDuplicateCheckKey(duplicateCheckKey);
    setDuplicatesDismissed(false);
    setServerFlagged(false);
    setDuplicates([]);
  }

  // Checa duplicatas por nome (busca textual) e por proximidade (uma vez que o
  // pino é posicionado), mesclando os resultados.
  useEffect(() => {
    if (!open) return;
    if (!trimmedName && !position) return;

    const timeoutId = setTimeout(async () => {
      setIsCheckingDuplicates(true);
      try {
        const [byName, byPosition] = await Promise.all([
          trimmedName ? searchLocations({ q: trimmedName, limit: 5 }) : null,
          position ? searchLocations({ lat: position.lat, lng: position.lng, radius: DUPLICATE_RADIUS_KM, limit: 5 }) : null,
        ]);
        const merged = new Map<string, Location>();
        for (const page of [byName, byPosition]) {
          if (!page) continue;
          for (const location of page.items) merged.set(location.id, location);
        }
        setDuplicates([...merged.values()]);
      } catch {
        // Checagem de duplicata é best-effort — uma falha aqui não deve travar
        // o fluxo de criação.
      } finally {
        setIsCheckingDuplicates(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [open, trimmedName, position]);

  // Ao posicionar/mover o pino: sugere a cidade mais próxima (se a pessoa ainda não escolheu uma)
  // e, se escolheu, checa a distância até ela. Best-effort, como a checagem de duplicatas.
  const chosenCityId = cityChosenByUser ? city?.id : undefined;
  useEffect(() => {
    if (!open || !position) return;

    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      try {
        const result = await getGeoCities(position.lat, position.lng, { limit: 3, cityId: chosenCityId });
        if (cancelled) return;
        if (chosenCityId) {
          setCityFarAway(result.chosenCity?.farAway ? Math.round(result.chosenCity.distanceKm) : null);
        } else {
          setCityFarAway(null);
          if (result.items[0]) setCity(result.items[0]);
        }
      } catch {
        // Sem sugestão a pessoa ainda pode buscar a cidade à mão.
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [open, position, chosenCityId]);

  if (!open) return null;

  const handleCitySelect = (selected: CityOption) => {
    setCity(selected);
    setCityChosenByUser(true);
    setCityFarAway(null);
  };

  const hasPendingDuplicates = duplicates.length > 0 && !duplicatesDismissed;

  // A checagem do servidor é a oficial (150 m ou mesmo nome no município): troca a lista da
  // busca do cliente pelos candidatos dela e exige uma nova decisão.
  const showServerCandidates = async (ids: string[]) => {
    const results = await Promise.allSettled(ids.map((id) => getLocation(id)));
    const candidates = results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
    if (candidates.length === 0) {
      setError("Já existe um local parecido com este. Confira a busca antes de criar um novo.");
      return;
    }
    setDuplicates(candidates);
    setDuplicatesDismissed(false);
    setServerFlagged(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!position) {
      setError("Posicione o local no mapa.");
      return;
    }
    if (!city) {
      setError("Escolha a cidade do local.");
      return;
    }
    if (hasPendingDuplicates) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente.");
        return;
      }
      const location = await createLocation(
        {
          name: name.trim(),
          cityId: city.id,
          latitude: position.lat,
          longitude: position.lng,
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(category ? { category } : {}),
          ...(serverFlagged ? { confirmDistinct: true } : {}),
        },
        token,
      );
      onCreated(location);
    } catch (err) {
      const candidateIds = getDuplicateCandidateIds(err);
      if (candidateIds) {
        await showServerCandidates(candidateIds);
      } else {
        setError(getApiErrorMessage(err, "Não foi possível criar o local agora."));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Portal pro <body> — LocationPicker (que abre este modal) vive dentro do
  // <form> do UploadPhotoModal, e este modal tem seu próprio <form>; sem o
  // portal, o HTML resultante teria um <form> aninhado dentro de outro
  // (inválido — erro de hidratação e comportamento de submit imprevisível).
  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-dusk-950/70 px-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-location-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-dusk-900 p-6 light:border-line light:bg-paper"
      >
        <h2 id="new-location-title" className="mb-6 font-display text-lg font-semibold">
          Adicionar novo local
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome do local"
            required
            className="rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
          />

          <MapPicker latitude={position?.lat ?? null} longitude={position?.lng ?? null} onChange={(lat, lng) => setPosition({ lat, lng })} />

          <CityPicker value={city} onSelect={handleCitySelect} />
          {city && !cityChosenByUser && (
            <p className="-mt-2 px-2 text-xs text-cream-dim opacity-80 light:text-ink-dim light:opacity-100">
              Sugerida pelo pino no mapa. Use &quot;Trocar&quot; se não for essa.
            </p>
          )}
          {cityFarAway !== null && city && (
            <p className="-mt-2 px-2 text-xs text-sun-deep">
              O pino está a cerca de {cityFarAway} km de {cityLabel(city)}. Confira se a cidade e a posição estão certas — você ainda pode continuar.
            </p>
          )}

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as LocationCategory | "")}
            aria-label="Tipo de local"
            className={FIELD_CLASS}
          >
            <option value="">Tipo de local (opcional)</option>
            {LOCATION_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {categoryLabel(value)}
              </option>
            ))}
          </select>
          <div>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={DESCRIPTION_MAX_LENGTH}
              rows={3}
              placeholder="Descrição (opcional): como chegar, melhor época, o que esperar..."
              className={`w-full resize-none ${FIELD_CLASS}`}
            />
            <p className="mt-1 text-right font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
              {description.length}/{DESCRIPTION_MAX_LENGTH}
            </p>
          </div>

          {(duplicates.length > 0 || isCheckingDuplicates) && (
            <div className="rounded-2xl border border-sun-deep/40 bg-sun-deep/10 p-4">
              <p className="mb-2 text-sm font-medium">
                {isCheckingDuplicates && duplicates.length === 0 ? "Checando locais parecidos..." : "Local parecido encontrado — é um desses?"}
              </p>
              {duplicates.length > 0 && (
                <>
                  <ul className="flex flex-col gap-2">
                    {duplicates.map((location) => (
                      <li key={location.id}>
                        <button
                          type="button"
                          onClick={() => onSelectExisting(location)}
                          className="w-full rounded-xl border border-white/10 px-3 py-2 text-left text-sm hover:bg-white/5 light:border-line light:hover:bg-black/5"
                        >
                          <span className="font-medium">{location.name}</span>{" "}
                          <span className="font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
                            · {location.city}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setDuplicatesDismissed(true)}
                    className="mt-3 text-xs font-medium text-cream-dim underline opacity-80 hover:opacity-100 light:text-ink-dim light:opacity-100"
                  >
                    Nenhum desses — continuar criando &quot;{name.trim()}&quot;
                  </button>
                </>
              )}
            </div>
          )}

          {error && <p className="text-sm text-sun-deep">{error}</p>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
            >
              Cancelar
            </button>
            <Button type="submit" variant="accent" disabled={isSubmitting || hasPendingDuplicates}>
              {isSubmitting ? "Criando..." : "Criar local"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
