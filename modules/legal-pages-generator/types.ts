export type LegalPageType = "mentions-legales" | "politique-confidentialite" | "cgu";

export interface LegalGeneratorInput {
  pageType: LegalPageType;
  companyName: string;
  websiteName: string;
  contactEmail: string;
  country: string;
}

export interface LegalGeneratorResult {
  pageType: LegalPageType;
  title: string;
  content: string;
}