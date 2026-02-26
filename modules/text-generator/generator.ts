import { TextFormat, TextGeneratorInput, TextGeneratorResult, TextTone } from "./types";

function normalizeTopic(topic: string): string {
  return topic.trim().replace(/\s+/g, " ");
}

function buildIntro(tone: TextTone, topic: string): string {
  if (tone === "professionnel") {
    return `Découvrez notre solution dédiée à ${topic}.`;
  }

  if (tone === "dynamique") {
    return `Passez à la vitesse supérieure avec ${topic} !`;
  }

  return `Voici une solution simple autour de ${topic}.`;
}

function buildDescription(tone: TextTone, topic: string): string {
  const intro = buildIntro(tone, topic);
  const middle =
    tone === "professionnel"
      ? "Elle vous aide à gagner du temps, améliorer vos résultats et garder un suivi clair de vos actions."
      : tone === "dynamique"
        ? "Vous avancez plus vite, vous restez efficace et vous obtenez des résultats concrets sans complexité."
        : "Elle facilite vos tâches du quotidien et vous permet d'aller à l'essentiel.";

  const end =
    tone === "professionnel"
      ? "Mettez-la en place dès aujourd'hui pour structurer votre croissance."
      : tone === "dynamique"
        ? "Testez-la maintenant et voyez la différence immédiatement !"
        : "Essayez-la simplement pour voir si elle répond à votre besoin.";

  return `${intro} ${middle} ${end}`;
}

function buildAccroche(tone: TextTone, topic: string): string {
  if (tone === "professionnel") {
    return `${topic} : la méthode claire pour améliorer vos performances.`;
  }

  if (tone === "dynamique") {
    return `${topic} : plus rapide, plus simple, plus efficace !`;
  }

  return `${topic} : simple, utile et prêt à l'emploi.`;
}

function buildCta(tone: TextTone, topic: string): string {
  if (tone === "professionnel") {
    return `Commencez dès maintenant et optimisez votre stratégie ${topic}.`;
  }

  if (tone === "dynamique") {
    return `Lancez-vous avec ${topic} et boostez vos résultats maintenant !`;
  }

  return `Essayez ${topic} dès aujourd'hui.`;
}

function buildText(format: TextFormat, tone: TextTone, topic: string): string {
  if (format === "description") {
    return buildDescription(tone, topic);
  }

  if (format === "accroche") {
    return buildAccroche(tone, topic);
  }

  return buildCta(tone, topic);
}

export function generateText(input: TextGeneratorInput): TextGeneratorResult {
  const topic = normalizeTopic(input.topic);

  if (topic.length < 3) {
    throw new Error("TOPIC_TOO_SHORT");
  }

  return {
    topic,
    format: input.format,
    tone: input.tone,
    generatedText: buildText(input.format, input.tone, topic),
  };
}