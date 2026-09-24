import { apiFetch } from "@/lib/api/client";
import type { TermsOfService } from "@/types/terms";

export function getTerms() {
  return apiFetch<TermsOfService>("/terms");
}
