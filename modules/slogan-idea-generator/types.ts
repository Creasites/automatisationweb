export type IdeaTone = "neutre" | "professionnel" | "creatif";

export interface SloganIdeaInput {
  topic: string;
  tone: IdeaTone;
}

export interface SloganIdeaResult {
  topic: string;
  tone: IdeaTone;
  slogan: string;
  idea: string;
}