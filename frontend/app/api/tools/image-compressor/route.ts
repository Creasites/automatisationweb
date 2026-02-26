import { apiSuccess } from "@backend/api-response";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    apiSuccess({
      mode: "client-side",
      message: "La compression se fait localement dans le navigateur.",
    }),
  );
}