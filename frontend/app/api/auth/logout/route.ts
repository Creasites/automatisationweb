import { apiSuccess } from "@backend/api-response";
import { SESSION_COOKIE_NAME } from "@backend/auth/constants";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(apiSuccess({ ok: true }));
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
