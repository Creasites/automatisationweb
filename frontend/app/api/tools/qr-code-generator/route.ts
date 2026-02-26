import { apiError, apiSuccess } from "@backend/api-response";
import { generateQrCode } from "@modules/qr-code-generator/generator";
import { NextResponse } from "next/server";

interface QrCodeBody {
  text?: string;
  size?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QrCodeBody;

    if (!body.text || body.text.trim().length === 0) {
      return NextResponse.json(apiError("Merci de saisir un texte ou un lien."), {
        status: 400,
      });
    }

    const result = await generateQrCode({
      text: body.text,
      size: body.size,
      margin: body.margin,
      darkColor: body.darkColor,
      lightColor: body.lightColor,
    });

    return NextResponse.json(apiSuccess(result));
  } catch (error) {
    if (error instanceof Error && error.message === "TEXT_EMPTY") {
      return NextResponse.json(apiError("Le texte ne peut pas être vide."), {
        status: 400,
      });
    }

    return NextResponse.json(apiError("Impossible de générer le QR code pour le moment."), {
      status: 500,
    });
  }
}