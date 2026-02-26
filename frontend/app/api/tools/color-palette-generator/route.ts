import { apiError, apiSuccess } from "@backend/api-response";
import { generateColorPalette } from "@modules/color-palette-generator/generator";
import { PaletteMode } from "@modules/color-palette-generator/types";
import { NextResponse } from "next/server";

interface ColorPaletteBody {
  baseColor?: string;
  mode?: PaletteMode;
}

function isValidMode(value: string): value is PaletteMode {
  return value === "soft" || value === "vibrant" || value === "contrast";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ColorPaletteBody;

    if (!body.baseColor || body.baseColor.trim().length === 0) {
      return NextResponse.json(apiError("Merci de saisir une couleur de base (hex)."), {
        status: 400,
      });
    }

    if (!body.mode || !isValidMode(body.mode)) {
      return NextResponse.json(apiError("Mode de palette invalide."), { status: 400 });
    }

    const result = generateColorPalette({
      baseColor: body.baseColor,
      mode: body.mode,
    });

    return NextResponse.json(apiSuccess(result));
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_HEX_COLOR") {
      return NextResponse.json(apiError("Couleur invalide. Exemple attendu: #3B82F6"), {
        status: 400,
      });
    }

    return NextResponse.json(apiError("Impossible de générer la palette pour le moment."), {
      status: 500,
    });
  }
}