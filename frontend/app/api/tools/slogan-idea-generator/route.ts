import { apiError, apiSuccess } from "@backend/api-response";
import { generateSloganIdea } from "@modules/slogan-idea-generator/generator";
import { IdeaTone } from "@modules/slogan-idea-generator/types";
import { NextResponse } from "next/server";

interface SloganIdeaBody {
  topic?: string;
  tone?: IdeaTone;
}

function isValidTone(tone: string): tone is IdeaTone {
  return tone === "neutre" || tone === "professionnel" || tone === "creatif";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SloganIdeaBody;

    if (!body.topic || body.topic.trim().length === 0) {
      return NextResponse.json(apiError("Merci de saisir un sujet."), { status: 400 });
    }

    if (!body.tone || !isValidTone(body.tone)) {
      return NextResponse.json(apiError("Ton invalide."), { status: 400 });
    }

    const result = generateSloganIdea({
      topic: body.topic,
      tone: body.tone,
    });

    return NextResponse.json(apiSuccess(result));
  } catch (error) {
    if (error instanceof Error && error.message === "TOPIC_TOO_SHORT") {
      return NextResponse.json(apiError("Le sujet doit contenir au moins 3 caractères."), {
        status: 400,
      });
    }

    return NextResponse.json(apiError("Impossible de générer le slogan et l'idée pour le moment."), {
      status: 500,
    });
  }
}