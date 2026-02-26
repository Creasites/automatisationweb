export type SeoStatus = "ok" | "attention" | "error";

export interface SeoCheck {
  id: string;
  label: string;
  status: SeoStatus;
  message: string;
  value?: string;
}

export interface BasicSeoInput {
  url: string;
  timeoutMs?: number;
}

export interface BasicSeoResult {
  normalizedUrl: string;
  httpStatus: number | null;
  responseTimeMs: number | null;
  score: number;
  checks: SeoCheck[];
  suggestions: string[];
}