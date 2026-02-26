import { apiSuccess } from "@backend/api-response";
import { getTemplates } from "@modules/templates-library/catalog";
import { TemplateCategory } from "@modules/templates-library/types";
import { NextResponse } from "next/server";

function isValidCategory(value: string): value is TemplateCategory {
  return value === "landing" || value === "service" || value === "blog" || value === "portfolio";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryValue = searchParams.get("category");

  if (!categoryValue) {
    return NextResponse.json(apiSuccess({ templates: getTemplates() }));
  }

  if (!isValidCategory(categoryValue)) {
    return NextResponse.json(apiSuccess({ templates: getTemplates() }));
  }

  return NextResponse.json(apiSuccess({ templates: getTemplates(categoryValue) }));
}