"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";
import { getTerms, getPrivacyPolicy, updateTerms, updatePrivacyPolicy } from "@/lib/api/legalDocuments";
import { formatDate } from "@/lib/utils/formatDate";

interface LegalDocumentEditorProps {
  documentType: "TermsOfService" | "PrivacyPolicy";
}

const NOUN: Record<LegalDocumentEditorProps["documentType"], string> = {
  TermsOfService: "dos termos de uso",
  PrivacyPolicy: "da política de privacidade",
};

const CONTENT_MAX_LENGTH = 20000;

export default function LegalDocumentEditor({ documentType }: LegalDocumentEditorProps) {
  const { getAccessToken } = useAuth();
  const [content, setContent] = useState("");
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);
  const [currentPublishedAt, setCurrentPublishedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const doc = documentType === "TermsOfService" ? await getTerms() : await getPrivacyPolicy();
        if (!cancelled) {
          setContent(doc.content);
          setCurrentVersion(doc.version);
          setCurrentPublishedAt(doc.createdAt);
        }
      } catch {
        if (!cancelled) setError("Não foi possível carregar o documento atual.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [documentType]);

  const handlePublish = async () => {
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente.");
        return;
      }
      const updated =
        documentType === "TermsOfService" ? await updateTerms(content, token) : await updatePrivacyPolicy(content, token);
      setCurrentVersion(updated.version);
      setCurrentPublishedAt(updated.createdAt);
      setSaved(true);
    } catch {
      setError("Não foi possível publicar agora.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Carregando...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {currentVersion !== null && currentPublishedAt && (
        <p className="font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
          Versão atual: {currentVersion} · publicada em {formatDate(currentPublishedAt)}
        </p>
      )}
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value.slice(0, CONTENT_MAX_LENGTH))}
        rows={20}
        className="resize-y rounded-2xl border border-white/15 bg-transparent px-5 py-4 font-mono text-xs leading-relaxed text-cream focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:focus:border-ink/40"
      />
      <span className="text-right font-mono text-xs text-cream-dim opacity-60 light:text-ink-dim light:opacity-100">
        {content.length}/{CONTENT_MAX_LENGTH}
      </span>
      {error && <p className="text-sm text-sun-deep">{error}</p>}
      {saved && <p className="text-sm text-sun-mid light:text-sun-deep">Publicado como versão {currentVersion}.</p>}
      <div className="flex justify-end">
        <Button type="button" variant="accent" onClick={handlePublish} disabled={isSaving || !content.trim()}>
          {isSaving ? "Publicando..." : `Publicar nova versão ${NOUN[documentType]}`}
        </Button>
      </div>
    </div>
  );
}
