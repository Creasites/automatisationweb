export type TemplateCategory = "landing" | "service" | "blog" | "portfolio";

export interface SiteTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  sections: string[];
}