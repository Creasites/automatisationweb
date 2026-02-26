import { apiError, apiSuccess } from "@backend/api-response";
import { runCodec } from "@modules/encoder-decoder-tools/codec";
import { CodecAction, CodecType } from "@modules/encoder-decoder-tools/types";
import { NextResponse } from "next/server";

interface CodecBody {
  text?: string;
  codec?: CodecType;
  action?: CodecAction;
}

function isValidCodec(value: string): value is CodecType {
  return value === "base64" || value === "url";
}

function isValidAction(value: string): value is CodecAction {
  return value === "encode" || value === "decode";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CodecBody;

    if (typeof body.text !== "string") {
      return NextResponse.json(apiError("Texte invalide."), { status: 400 });
    }

    if (!body.codec || !isValidCodec(body.codec)) {
      return NextResponse.json(apiError("Type de codec invalide."), { status: 400 });
    }

    if (!body.action || !isValidAction(body.action)) {
      return NextResponse.json(apiError("Action invalide."), { status: 400 });
    }

    const result = runCodec({
      text: body.text,
      codec: body.codec,
      action: body.action,
    });

    return NextResponse.json(apiSuccess(result));
  } catch (error) {
    if (error instanceof Error && error.message === "TEXT_EMPTY") {
      return NextResponse.json(apiError("Le texte ne peut pas être vide."), { status: 400 });
    }

    if (error instanceof Error && error.message === "INVALID_BASE64") {
      return NextResponse.json(apiError("Le texte Base64 est invalide."), { status: 400 });
    }

    if (error instanceof Error && error.message === "INVALID_URL_ENCODING") {
      return NextResponse.json(apiError("Le texte encodé URL est invalide."), { status: 400 });
    }

    return NextResponse.json(apiError("Impossible d'exécuter l'encodage/décodage pour le moment."), {
      status: 500,
    });
  }
}