export interface LegalDocument {
  id: string;
  documentType: "TermsOfService" | "PrivacyPolicy";
  content: string;
  version: number;
  createdAt: string;
}
