export type SpeedStatus = "ok" | "attention" | "error";

export interface SpeedCheck {
  id: string;
  label: string;
  status: SpeedStatus;
  message: string;
  value?: string;
}

export interface SpeedTestInput {
  url: string;
  timeoutMs?: number;
}

export interface SpeedTestResult {
  normalizedUrl: string;
  httpStatus: number | null;
  responseTimeMs: number | null;
  totalTimeMs: number | null;
  htmlSizeKb: number | null;
  score: number;
  checks: SpeedCheck[];
  suggestions: string[];
}