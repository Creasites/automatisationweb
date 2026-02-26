export type CheckStatus = "ok" | "attention" | "error";

export interface AnalyzerInput {
  url: string;
  timeoutMs?: number;
}

export interface AnalyzerCheck {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
  value?: string;
}

export interface AnalyzerResult {
  normalizedUrl: string;
  httpStatus: number | null;
  responseTimeMs: number | null;
  score: number;
  checks: AnalyzerCheck[];
  suggestions: string[];
}