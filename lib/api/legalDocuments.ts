import { apiFetch } from "@/lib/api/client";
import type { LegalAcceptance, LegalDocument, LegalVersions } from "@/types/legalDocument";

export function getTerms() {
  return apiFetch<LegalDocument>("/terms");
}

export function getPrivacyPolicy() {
  return apiFetch<LegalDocument>("/privacy");
}

export function updateTerms(content: string, token: string) {
  return apiFetch<LegalDocument>("/terms", { method: "PUT", body: JSON.stringify({ content }), token });
}

export function updatePrivacyPolicy(content: string, token: string) {
  return apiFetch<LegalDocument>("/privacy", { method: "PUT", body: JSON.stringify({ content }), token });
}

// Versões vigentes dos dois textos, pra enviar no cadastro junto com o aceite.
export async function getCurrentLegalVersions(): Promise<LegalVersions> {
  const [terms, privacy] = await Promise.all([getTerms(), getPrivacyPolicy()]);
  return { termsVersion: terms.version, privacyVersion: privacy.version };
}

export function acceptLegal(versions: LegalVersions, token: string) {
  return apiFetch<LegalAcceptance>("/users/me/legal-acceptances", {
    method: "POST",
    body: JSON.stringify(versions),
    token,
  });
}
