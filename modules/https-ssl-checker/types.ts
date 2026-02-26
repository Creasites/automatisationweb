export type SslCheckStatus = "ok" | "attention" | "error";

export interface SslCheck {
  id: string;
  label: string;
  status: SslCheckStatus;
  message: string;
  value?: string;
}

export interface HttpsSslInput {
  url: string;
  timeoutMs?: number;
}

export interface HttpsSslResult {
  normalizedUrl: string;
  checks: SslCheck[];
  score: number;
  suggestions: string[];
}