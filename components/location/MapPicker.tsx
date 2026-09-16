"use client";

import { useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
}

const DEFAULT_CENTER = { lat: -14.235, lng: -51.9253 }; // aprox. centro do Brasil
const DEFAULT_ZOOM = 4;
const SELECTED_ZOOM = 14;

// setOptions só pode ser chamado antes da primeira importLibrary — guarda pra
// não chamar de novo se este componente for montado mais de uma vez.
let optionsSet = false;
function ensureOptionsSet(apiKey: string) {
  if (!optionsSet) {
    setOptions({ key: apiKey, v: "weekly" });
    optionsSet = true;
  }
}

export default function MapPicker({ latitude, longitude, onChange }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  // Atribuir ref fora de um efeito conta como acesso durante a renderização —
  // mantém a "latest ref" sincronizada depois do commit, não durante o render.
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  // Só usado pra semear a posição inicial do mapa (ex.: reabrindo com um pino já
  // escolhido) — mudanças depois disso vêm do próprio mapa via onChange, não o
  // contrário, então não precisa (e não deve) re-rodar o efeito de inicialização.
  const initialPositionRef = useRef(latitude !== null && longitude !== null ? { lat: latitude, lng: longitude } : null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !containerRef.current) return;

    let cancelled = false;
    const initial = initialPositionRef.current;
    ensureOptionsSet(apiKey);

    importLibrary("maps")
      .then(({ Map }) => {
        if (cancelled || !containerRef.current) return;

        const map = new Map(containerRef.current, {
          center: initial ?? DEFAULT_CENTER,
          zoom: initial ? SELECTED_ZOOM : DEFAULT_ZOOM,
          streetViewControl: false,
          mapTypeControl: false,
        });

        const marker = new google.maps.Marker({
          map,
          position: initial ?? undefined,
          draggable: true,
        });
        markerRef.current = marker;

        const applyPosition = (lat: number, lng: number) => {
          marker.setPosition({ lat, lng });
          onChangeRef.current(lat, lng);
        };

        map.addListener("click", (event: google.maps.MapMouseEvent) => {
          if (!event.latLng) return;
          applyPosition(event.latLng.lat(), event.latLng.lng());
        });

        marker.addListener("dragend", () => {
          const position = marker.getPosition();
          if (position) applyPosition(position.lat(), position.lng());
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError("Não foi possível carregar o mapa agora.");
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  const error = !apiKey ? "Mapa indisponível no momento." : loadError;

  if (error) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-white/10 bg-dusk-900 text-sm text-cream-dim opacity-70 light:border-line light:bg-paper-dim light:text-ink-dim light:opacity-100">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div ref={containerRef} className="h-64 w-full rounded-2xl" />
      <p className="mt-2 text-xs text-cream-dim opacity-60 light:text-ink-dim light:opacity-100">
        Clique no mapa ou arraste o marcador para posicionar o local.
      </p>
    </div>
  );
}
