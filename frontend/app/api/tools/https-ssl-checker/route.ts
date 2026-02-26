import { apiError, apiSuccess } from "@backend/api-response";
import { checkHttpsSsl } from "@modules/https-ssl-checker/checker";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface HttpsSslBody {
  url?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HttpsSslBody;

    if (!body.url || body.url.trim().length === 0) {
      return NextResponse.json(apiError("Merci de saisir une URL."), { status: 400 });
    }

    const result = await checkHttpsSsl({
      url: body.url,
      timeoutMs: 10000,
    });

    return NextResponse.json(apiSuccess(result));
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json(apiError("Temps dépassé (10 secondes max)."), {
          status: 408,
        });
      }

      if (error.message.toLowerCase().includes("invalid url")) {
        return NextResponse.json(apiError("URL invalide. Exemple: https://monsite.com"), {
          status: 400,
        });
      }
    }

    return NextResponse.json(apiError("Impossible de vérifier HTTPS/SSL pour le moment."), {
      status: 500,
    });
  }
}