import { apiError, apiSuccess } from "@backend/api-response";
import { convertUnit } from "@modules/unit-converter/converter";
import { ConverterCategory, ConverterUnit } from "@modules/unit-converter/types";
import { NextResponse } from "next/server";

interface ConverterBody {
  category?: ConverterCategory;
  value?: number;
  fromUnit?: ConverterUnit;
  toUnit?: ConverterUnit;
}

function isValidCategory(value: string): value is ConverterCategory {
  return value === "length" || value === "weight" || value === "temperature";
}

function isValidUnit(value: string): value is ConverterUnit {
  return ["m", "km", "cm", "mm", "kg", "g", "lb", "c", "f", "k"].includes(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConverterBody;

    if (!body.category || !isValidCategory(body.category)) {
      return NextResponse.json(apiError("Catégorie invalide."), { status: 400 });
    }

    if (typeof body.value !== "number" || Number.isNaN(body.value)) {
      return NextResponse.json(apiError("Valeur numérique invalide."), { status: 400 });
    }

    if (!body.fromUnit || !isValidUnit(body.fromUnit)) {
      return NextResponse.json(apiError("Unité source invalide."), { status: 400 });
    }

    if (!body.toUnit || !isValidUnit(body.toUnit)) {
      return NextResponse.json(apiError("Unité cible invalide."), { status: 400 });
    }

    const result = convertUnit({
      category: body.category,
      value: body.value,
      fromUnit: body.fromUnit,
      toUnit: body.toUnit,
    });

    return NextResponse.json(apiSuccess(result));
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_UNIT_FOR_CATEGORY") {
      return NextResponse.json(apiError("Les unités ne correspondent pas à la catégorie choisie."), {
        status: 400,
      });
    }

    if (error instanceof Error && error.message === "INVALID_VALUE") {
      return NextResponse.json(apiError("Valeur numérique invalide."), { status: 400 });
    }

    return NextResponse.json(apiError("Impossible de convertir pour le moment."), {
      status: 500,
    });
  }
}