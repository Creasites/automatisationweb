import { apiError, apiSuccess } from "@backend/api-response";
import { generatePageStructure } from "@modules/page-structure-generator/generator";
import { PageGoal, PageType } from "@modules/page-structure-generator/types";
import { NextResponse } from "next/server";

interface PageStructureBody {
  topic?: string;
  pageType?: PageType;
  goal?: PageGoal;
}

function isValidPageType(value: string): value is PageType {
  return value === "landing" || value === "service" || value === "blog";
}

function isValidGoal(value: string): value is PageGoal {
  return value === "conversion" || value === "information" || value === "contact";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PageStructureBody;

    if (!body.topic || body.topic.trim().length === 0) {
      return NextResponse.json(apiError("Merci de saisir un sujet."), { status: 400 });
    }

    if (!body.pageType || !isValidPageType(body.pageType)) {
      return NextResponse.json(apiError("Type de page invalide."), { status: 400 });
    }

    if (!body.goal || !isValidGoal(body.goal)) {
      return NextResponse.json(apiError("Objectif de page invalide."), { status: 400 });
    }

    const result = generatePageStructure({
      topic: body.topic,
      pageType: body.pageType,
      goal: body.goal,
    });

    return NextResponse.json(apiSuccess(result));
  } catch (error) {
    if (error instanceof Error && error.message === "TOPIC_TOO_SHORT") {
      return NextResponse.json(apiError("Le sujet doit contenir au moins 3 caractères."), {
        status: 400,
      });
    }

    return NextResponse.json(apiError("Impossible de générer la structure de page pour le moment."), {
      status: 500,
    });
  }
}