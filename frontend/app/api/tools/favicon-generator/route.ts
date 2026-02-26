import { apiError, apiSuccess } from "@backend/api-response";
import { generateFavicon } from "@modules/favicon-generator/generator";
import { NextResponse } from "next/server";

interface FaviconBody {
  letter?: string;
  backgroundColor?: string;
  textColor?: string;
  rounded?: boolean;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FaviconBody;

    if (!body.letter || body.letter.trim().length === 0) {
      return NextResponse.json(apiError("Merci de saisir une lettre."), { status: 400 });
    }

    if (!body.backgroundColor || body.backgroundColor.trim().length === 0) {
      return NextResponse.json(apiError("Merci de saisir une couleur de fond."), { status: 400 });
    }

    if (!body.textColor || body.textColor.trim().length === 0) {
      return NextResponse.json(apiError("Merci de saisir une couleur de texte."), { status: 400 });
    }

    const result = generateFavicon({
      letter: body.letter,
      backgroundColor: body.backgroundColor,
      textColor: body.textColor,
      rounded: Boolean(body.rounded),
    });

    return NextResponse.json(apiSuccess(result));
  } catch (error) {
    if (error instanceof Error && error.message === "LETTER_EMPTY") {
      return NextResponse.json(apiError("La lettre ne peut pas être vide."), { status: 400 });
    }

    if (error instanceof Error && error.message === "INVALID_COLOR") {
      return NextResponse.json(apiError("Couleur invalide. Exemple attendu: #1D4ED8"), { status: 400 });
    }

    return NextResponse.json(apiError("Impossible de générer le favicon pour le moment."), {
      status: 500,
    });
  }
}