import { apiError, apiSuccess } from "@backend/api-response";
import { generateLegalPage } from "@modules/legal-pages-generator/generator";
import { LegalPageType } from "@modules/legal-pages-generator/types";
import { NextResponse } from "next/server";

interface LegalPageBody {
  pageType?: LegalPageType;
  companyName?: string;
  websiteName?: string;
  contactEmail?: string;
  country?: string;
}

function isValidPageType(value: string): value is LegalPageType {
  return value === "mentions-legales" || value === "politique-confidentialite" || value === "cgu";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LegalPageBody;

    if (!body.pageType || !isValidPageType(body.pageType)) {
      return NextResponse.json(apiError("Type de page légale invalide."), { status: 400 });
    }

    const result = generateLegalPage({
      pageType: body.pageType,
      companyName: body.companyName ?? "",
      websiteName: body.websiteName ?? "",
      contactEmail: body.contactEmail ?? "",
      country: body.country ?? "",
    });

    return NextResponse.json(apiSuccess(result));
  } catch (error) {
    if (error instanceof Error && error.message === "MISSING_FIELDS") {
      return NextResponse.json(apiError("Merci de remplir tous les champs."), { status: 400 });
    }

    return NextResponse.json(apiError("Impossible de générer cette page légale pour le moment."), {
      status: 500,
    });
  }
}