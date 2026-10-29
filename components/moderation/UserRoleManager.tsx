"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import BanUserDialog from "@/components/moderation/BanUserDialog";
import { useAuth } from "@/lib/hooks/useAuth";
import { searchUsers, changeUserRole, unbanUser } from "@/lib/api/moderation";
import { formatDate } from "@/lib/utils/formatDate";
import type { User, UserRole } from "@/types/user";

const ROLE_LABELS: Record<UserRole, string> = { User: "Usuário", Moderator: "Moderador", Admin: "Admin" };
const ROLES: UserRole[] = ["User", "Moderator", "Admin"];

export default function UserRoleManager() {
  const { user: currentUser, getAccessToken } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [pendingRoles, setPendingRoles] = useState<Record<string, UserRole>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [banTarget, setBanTarget] = useState<User | null>(null);
  const [unbanTarget, setUnbanTarget] = useState<User | null>(null);
  const [isUnbanning, setIsUnbanning] = useState(false);

  const loadUsers = async () => {
    setIsSearching(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente.");
        return;
      }
      const page = await searchUsers(token, query.trim() || undefined, undefined, 20);
      setResults(page.items);
      setHasSearched(true);
    } catch {
      setError("Não foi possível buscar usuários agora.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    return loadUsers();
  };

  // O ban/unban responde 204 sem corpo, então recarrega a lista pra mostrar o estado novo
  // (inclusive a data de fim do ban temporário).
  const handleBanned = () => {
    setBanTarget(null);
    return loadUsers();
  };

  const handleConfirmUnban = async () => {
    if (!unbanTarget) return;
    setIsUnbanning(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente.");
        return;
      }
      await unbanUser(unbanTarget.id, token);
      setUnbanTarget(null);
      await loadUsers();
    } catch {
      setError("Não foi possível remover o banimento agora.");
      setUnbanTarget(null);
    } finally {
      setIsUnbanning(false);
    }
  };

  const handleSaveRole = async (targetUser: User) => {
    const newRole = pendingRoles[targetUser.id];
    if (!newRole || newRole === targetUser.role) return;

    setSavingId(targetUser.id);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente.");
        return;
      }
      const updated = await changeUserRole(targetUser.id, newRole, token);
      setResults((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setPendingRoles((prev) => {
        const next = { ...prev };
        delete next[targetUser.id];
        return next;
      });
    } catch {
      setError("Não foi possível atualizar o papel agora.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome ou e-mail (em branco lista os mais recentes)"
          className="min-w-64 flex-1 rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
        />
        <Button type="submit" variant="accent" disabled={isSearching}>
          {isSearching ? "Buscando..." : "Buscar"}
        </Button>
      </form>

      {error && <p className="mb-4 text-sm text-sun-deep">{error}</p>}

      {hasSearched && results.length === 0 && (
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Nenhum usuário encontrado.</p>
      )}

      {results.length > 0 && (
        <ul className="flex flex-col gap-3">
          {results.map((u) => {
            const pending = pendingRoles[u.id] ?? u.role;
            const isDirty = pending !== u.role;
            const isSelf = u.id === currentUser?.id;
            return (
              <li key={u.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 p-4 light:border-line">
                <div className="flex-1">
                  <p className="font-medium">
                    {u.name}
                    {isSelf && <span className="ml-2 font-mono text-xs opacity-60">(você)</span>}
                  </p>
                  <p className="font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">{u.email}</p>
                  {u.isBanned && (
                    <p className="mt-1 font-mono text-xs text-sun-deep">
                      {u.bannedUntil ? `Banido até ${formatDate(u.bannedUntil)}` : "Banido permanentemente"}
                    </p>
                  )}
                </div>
                <select
                  value={pending}
                  onChange={(event) => setPendingRoles((prev) => ({ ...prev, [u.id]: event.target.value as UserRole }))}
                  disabled={isSelf}
                  title={isSelf ? "Você não pode alterar seu próprio papel por aqui." : undefined}
                  className="rounded-full border border-white/15 bg-transparent px-4 py-2 text-sm text-cream focus:border-white/40 focus:outline-none disabled:opacity-40 light:border-ink/15 light:text-ink light:focus:border-ink/40"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role} className="bg-dusk-900 text-cream light:bg-paper light:text-ink">
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleSaveRole(u)}
                  disabled={!isDirty || savingId === u.id}
                  className="rounded-full bg-sun-core px-4 py-2 text-xs font-bold text-ink disabled:opacity-40"
                >
                  {savingId === u.id ? "Salvando..." : "Salvar"}
                </button>
                {/* Ninguém age sobre um Admin nem sobre si mesmo (a API responde 403). */}
                {!isSelf && u.role !== "Admin" && (
                  <button
                    onClick={() => (u.isBanned ? setUnbanTarget(u) : setBanTarget(u))}
                    className="rounded-full border border-sun-deep/40 px-4 py-2 text-xs font-medium text-sun-deep hover:bg-sun-deep/10"
                  >
                    {u.isBanned ? "Remover banimento" : "Banir"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <BanUserDialog
        open={banTarget !== null}
        userId={banTarget?.id ?? ""}
        userName={banTarget?.name ?? ""}
        onBanned={handleBanned}
        onCancel={() => setBanTarget(null)}
      />
      <ConfirmDialog
        open={unbanTarget !== null}
        title={`Remover o banimento de ${unbanTarget?.name ?? ""}?`}
        description="O usuário poderá entrar de novo na conta."
        confirmLabel="Remover banimento"
        isConfirming={isUnbanning}
        onConfirm={handleConfirmUnban}
        onCancel={() => setUnbanTarget(null)}
      />
    </div>
  );
}
