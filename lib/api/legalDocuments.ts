import { apiFetch } from "@/lib/api/client";
import type { LegalDocument } from "@/types/legalDocument";

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
