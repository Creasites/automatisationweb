export type MobileCheckStatus = "ok" | "attention" | "error";

export interface MobileCheck {
  id: string;
  label: string;
  status: MobileCheckStatus;
  message: string;
  value?: string;
}

export interface MobileFriendlyInput {
  url: string;
  timeoutMs?: number;
}

export interface MobileFriendlyResult {
  normalizedUrl: string;
  httpStatus: number | null;
  responseTimeMs: number | null;
  score: number;
  checks: MobileCheck[];
  suggestions: string[];
}