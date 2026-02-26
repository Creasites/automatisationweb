export type PageType = "landing" | "service" | "blog";

export type PageGoal = "conversion" | "information" | "contact";

export interface PageStructureInput {
  topic: string;
  pageType: PageType;
  goal: PageGoal;
}

export interface PageSection {
  title: string;
  objective: string;
}

export interface PageStructureResult {
  topic: string;
  pageType: PageType;
  goal: PageGoal;
  sections: PageSection[];
}