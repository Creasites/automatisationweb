import { apiError, apiSuccess } from "@backend/api-response";
import { generateText } from "@modules/text-generator/generator";
import { TextFormat, TextTone } from "@modules/text-generator/types";
import { NextResponse } from "next/server";

interface TextGeneratorBody {
  topic?: string;
  format?: TextFormat;
  tone?: TextTone;
}

function isValidFormat(format: string): format is TextFormat {
  return format === "description" || format === "accroche" || format === "cta";
}

function isValidTone(tone: string): tone is TextTone {
  return tone === "neutre" || tone === "professionnel" || tone === "dynamique";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TextGeneratorBody;

    if (!body.topic || body.topic.trim().length === 0) {
      return NextResponse.json(apiError("Merci de saisir un sujet."), { status: 400 });
    }

    if (!body.format || !isValidFormat(body.format)) {
      return NextResponse.json(apiError("Format invalide."), { status: 400 });
    }

    if (!body.tone || !isValidTone(body.tone)) {
      return NextResponse.json(apiError("Ton invalide."), { status: 400 });
    }

    const result = generateText({
      topic: body.topic,
      format: body.format,
      tone: body.tone,
    });

    return NextResponse.json(apiSuccess(result));
  } catch (error) {
    if (error instanceof Error && error.message === "TOPIC_TOO_SHORT") {
      return NextResponse.json(apiError("Le sujet doit contenir au moins 3 caractères."), {
        status: 400,
      });
    }

    return NextResponse.json(apiError("Impossible de générer le texte pour le moment."), {
      status: 500,
    });
  }
}