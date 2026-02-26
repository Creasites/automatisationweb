import { SiteTemplate, TemplateCategory } from "./types";

const templateCatalog: SiteTemplate[] = [
  {
    id: "landing-start",
    name: "Landing Start",
    category: "landing",
    description: "Template minimal pour présenter une offre et convertir.",
    sections: ["Hero", "Bénéfices", "Preuves", "CTA"],
  },
  {
    id: "service-pro",
    name: "Service Pro",
    category: "service",
    description: "Template orienté services avec process et tarifs.",
    sections: ["Présentation", "Process", "Tarifs", "FAQ", "Contact"],
  },
  {
    id: "blog-clean",
    name: "Blog Clean",
    category: "blog",
    description: "Template article avec structure lisible et CTA final.",
    sections: ["Titre", "Intro", "Contenu", "Conclusion", "CTA"],
  },
  {
    id: "portfolio-simple",
    name: "Portfolio Simple",
    category: "portfolio",
    description: "Template portfolio sobre pour projets et contact.",
    sections: ["Présentation", "Projets", "Compétences", "Contact"],
  },
];

export function getTemplates(category?: TemplateCategory): SiteTemplate[] {
  if (!category) {
    return templateCatalog;
  }
  return templateCatalog.filter((template) => template.category === category);
}