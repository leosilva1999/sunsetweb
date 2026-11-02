export interface LegalDocument {
  id: string;
  documentType: "TermsOfService" | "PrivacyPolicy";
  content: string;
  version: number;
  createdAt: string;
}

// Situação do aceite de um documento. currentVersion é null se nunca foi publicado
// (e aí nunca fica pendente).
export interface LegalDocumentAcceptance {
  currentVersion: number | null;
  acceptedVersion: number | null;
  acceptedAt: string | null;
  pending: boolean;
}

// Vem em toda resposta de register/login/google/refresh e em /users/me/legal-acceptances.
// pending = há versão publicada que o usuário ainda não aceitou.
export interface LegalAcceptance {
  terms: LegalDocumentAcceptance;
  privacy: LegalDocumentAcceptance;
  pending: boolean;
}

export interface LegalVersions {
  termsVersion: number;
  privacyVersion: number;
}
