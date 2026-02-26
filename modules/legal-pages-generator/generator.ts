import { LegalGeneratorInput, LegalGeneratorResult, LegalPageType } from "./types";

function clean(value: string): string {
  return value.trim();
}

function ensure(input: LegalGeneratorInput): LegalGeneratorInput {
  const companyName = clean(input.companyName);
  const websiteName = clean(input.websiteName);
  const contactEmail = clean(input.contactEmail);
  const country = clean(input.country);

  if (!companyName || !websiteName || !contactEmail || !country) {
    throw new Error("MISSING_FIELDS");
  }

  return {
    ...input,
    companyName,
    websiteName,
    contactEmail,
    country,
  };
}

function titleByType(pageType: LegalPageType): string {
  if (pageType === "mentions-legales") {
    return "Mentions légales";
  }
  if (pageType === "politique-confidentialite") {
    return "Politique de confidentialité";
  }
  return "Conditions générales d'utilisation";
}

function contentByType(input: LegalGeneratorInput): string {
  if (input.pageType === "mentions-legales") {
    return [
      `Éditeur du site : ${input.companyName}.`,
      `Nom du site : ${input.websiteName}.`,
      `Contact : ${input.contactEmail}.`,
      `Pays d'exploitation : ${input.country}.`,
      "Le site est proposé à titre informatif. L'utilisateur est responsable de l'usage qu'il fait des informations publiées.",
      "Toute reproduction du contenu sans autorisation préalable est interdite.",
    ].join("\n\n");
  }

  if (input.pageType === "politique-confidentialite") {
    return [
      `${input.websiteName} collecte uniquement les données strictement nécessaires au fonctionnement du service.`,
      `Le responsable du traitement est ${input.companyName}.`,
      `Pour toute question relative à vos données, contactez ${input.contactEmail}.`,
      "Les données ne sont pas revendues à des tiers.",
      "L'utilisateur peut demander l'accès, la correction ou la suppression de ses données selon la réglementation locale en vigueur.",
      `Cette politique s'applique aux utilisateurs situés en ${input.country} et à l'international selon les usages du service.`,
    ].join("\n\n");
  }

  return [
    `Les présentes conditions définissent les règles d'utilisation du site ${input.websiteName}.`,
    `Le service est proposé par ${input.companyName}.`,
    "L'utilisateur s'engage à utiliser le service de manière licite et respectueuse.",
    "Le service peut évoluer ou être interrompu à tout moment pour maintenance ou amélioration.",
    "En utilisant ce site, l'utilisateur accepte les présentes conditions.",
    `Pour toute demande, contactez ${input.contactEmail}.`,
  ].join("\n\n");
}

export function generateLegalPage(input: LegalGeneratorInput): LegalGeneratorResult {
  const sanitized = ensure(input);

  return {
    pageType: sanitized.pageType,
    title: titleByType(sanitized.pageType),
    content: contentByType(sanitized),
  };
}