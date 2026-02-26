import { apiError, apiSuccess } from "@backend/api-response";
import { runSpeedTest } from "@modules/speed-test/tester";
import { NextResponse } from "next/server";

interface SpeedTestBody {
  url?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SpeedTestBody;

    if (!body.url || body.url.trim().length === 0) {
      return NextResponse.json(apiError("Merci de saisir une URL."), { status: 400 });
    }

    const result = await runSpeedTest({
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

    return NextResponse.json(apiError("Impossible de lancer le test de vitesse pour le moment."), {
      status: 500,
    });
  }
}