export type TextTone = "neutre" | "professionnel" | "dynamique";

export type TextFormat = "description" | "accroche" | "cta";

export interface TextGeneratorInput {
  topic: string;
  format: TextFormat;
  tone: TextTone;
}

export interface TextGeneratorResult {
  topic: string;
  format: TextFormat;
  tone: TextTone;
  generatedText: string;
}