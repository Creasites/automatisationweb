import { PageGoal, PageSection, PageStructureInput, PageStructureResult, PageType } from "./types";

function normalizeTopic(topic: string): string {
  return topic.trim().replace(/\s+/g, " ");
}

function baseSections(topic: string): PageSection[] {
  return [
    {
      title: `Hero - ${topic}`,
      objective: "Présenter immédiatement la promesse principale.",
    },
    {
      title: "Preuves / Réassurance",
      objective: "Montrer des éléments de confiance (avis, chiffres, références).",
    },
    {
      title: "FAQ",
      objective: "Lever les objections fréquentes avant l'action.",
    },
    {
      title: "Call To Action final",
      objective: "Inviter l'utilisateur à passer à l'action.",
    },
  ];
}

function sectionsByPageType(pageType: PageType): PageSection[] {
  if (pageType === "service") {
    return [
      {
        title: "Présentation du service",
        objective: "Expliquer clairement ce que vous proposez.",
      },
      {
        title: "Processus en étapes",
        objective: "Montrer comment se déroule la prestation.",
      },
      {
        title: "Tarifs / formules",
        objective: "Rendre l'offre lisible et comparer les options.",
      },
    ];
  }

  if (pageType === "blog") {
    return [
      {
        title: "Introduction du sujet",
        objective: "Poser le contexte et la problématique de l'article.",
      },
      {
        title: "Développement principal",
        objective: "Apporter conseils, méthode et exemples concrets.",
      },
      {
        title: "Conclusion + prochaine étape",
        objective: "Résumer et guider vers une action utile.",
      },
    ];
  }

  return [
    {
      title: "Bénéfices clés",
      objective: "Montrer ce que l'utilisateur gagne en choisissant votre solution.",
    },
    {
      title: "Fonctionnement simple",
      objective: "Expliquer en 3 étapes comment ça marche.",
    },
    {
      title: "Offre / argument commercial",
      objective: "Donner une raison forte de passer à l'action.",
    },
  ];
}

function sectionByGoal(goal: PageGoal): PageSection {
  if (goal === "information") {
    return {
      title: "Ressources complémentaires",
      objective: "Proposer des liens ou contenus pour approfondir.",
    };
  }

  if (goal === "contact") {
    return {
      title: "Bloc contact direct",
      objective: "Faciliter la prise de contact rapide (formulaire, email, téléphone).",
    };
  }

  return {
    title: "Bloc conversion",
    objective: "Mettre en avant le CTA principal (devis, essai, achat).",
  };
}

export function generatePageStructure(input: PageStructureInput): PageStructureResult {
  const topic = normalizeTopic(input.topic);
  if (topic.length < 3) {
    throw new Error("TOPIC_TOO_SHORT");
  }

  const sections: PageSection[] = [
    ...baseSections(topic).slice(0, 1),
    ...sectionsByPageType(input.pageType),
    ...baseSections(topic).slice(1, 3),
    sectionByGoal(input.goal),
    ...baseSections(topic).slice(3),
  ];

  return {
    topic,
    pageType: input.pageType,
    goal: input.goal,
    sections,
  };
}