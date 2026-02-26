import { IdeaTone, SloganIdeaInput, SloganIdeaResult } from "./types";

function normalizeTopic(topic: string): string {
  return topic.trim().replace(/\s+/g, " ");
}

function hashText(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickFromList(list: string[], seed: number): string {
  return list[seed % list.length];
}

function sloganTemplates(tone: IdeaTone): string[] {
  if (tone === "professionnel") {
    return [
      "${topic} : la solution claire pour avancer.",
      "${topic}, votre levier de performance durable.",
      "Avec ${topic}, structurez votre réussite.",
    ];
  }

  if (tone === "creatif") {
    return [
      "${topic} : l'idée qui fait décoller vos projets.",
      "${topic}, créez plus, stressez moins.",
      "Faites briller vos ambitions avec ${topic}.",
    ];
  }

  return [
    "${topic} : simple, utile, efficace.",
    "${topic}, pour passer à l'action facilement.",
    "${topic} : votre coup de pouce quotidien.",
  ];
}

function ideaTemplates(tone: IdeaTone): string[] {
  if (tone === "professionnel") {
    return [
      "Créer une page de démonstration ${topic} avec 3 bénéfices, 1 preuve et 1 appel à l'action.",
      "Lancer une mini campagne LinkedIn centrée sur ${topic} avec une publication conseil par semaine.",
      "Proposer un audit express de ${topic} en 15 minutes pour attirer des prospects qualifiés.",
    ];
  }

  if (tone === "creatif") {
    return [
      "Construire un challenge 7 jours autour de ${topic} avec une action simple par jour.",
      "Publier une mini série de contenus 'avant/après' pour montrer l'impact de ${topic}.",
      "Imaginer un kit gratuit sur ${topic} pour capter des emails et créer une communauté.",
    ];
  }

  return [
    "Créer une page simple qui explique ${topic} en 3 étapes claires.",
    "Publier un post par semaine avec un conseil pratique sur ${topic}.",
    "Proposer une version découverte de ${topic} pour obtenir les premiers retours clients.",
  ];
}

function applyTopic(template: string, topic: string): string {
  return template.replaceAll("${topic}", topic);
}

export function generateSloganIdea(input: SloganIdeaInput): SloganIdeaResult {
  const topic = normalizeTopic(input.topic);
  if (topic.length < 3) {
    throw new Error("TOPIC_TOO_SHORT");
  }

  const seed = hashText(`${topic}|${input.tone}`);
  const slogans = sloganTemplates(input.tone);
  const ideas = ideaTemplates(input.tone);

  return {
    topic,
    tone: input.tone,
    slogan: applyTopic(pickFromList(slogans, seed), topic),
    idea: applyTopic(pickFromList(ideas, seed + 7), topic),
  };
}