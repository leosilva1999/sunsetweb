import { apiFetch } from "@/lib/api/client";
import type { LegalDocument } from "@/types/legalDocument";

export function getTerms() {
  return apiFetch<LegalDocument>("/terms");
}

export function getPrivacyPolicy() {
  return apiFetch<LegalDocument>("/privacy");
}
