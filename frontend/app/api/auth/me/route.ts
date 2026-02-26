import { apiError, apiSuccess } from "@backend/api-response";
import { getAccessStatus } from "@backend/billing/access";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@backend/auth/constants";
import { createSessionToken, verifySessionToken } from "@backend/auth/session";
import { findUserByEmail } from "@backend/users/store";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(apiError("Non connecté."), { status: 401 });
  }

  try {
    const payload = await verifySessionToken(token);
    const user = await findUserByEmail(payload.email);

    if (!user) {
      const response = NextResponse.json(apiError("Session invalide."), { status: 401 });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    const refreshedToken = await createSessionToken({
      email: user.email,
      trialEndsAt: user.trialEndsAt,
      subscriptionStatus: user.subscriptionStatus,
    });

    const response = NextResponse.json(
      apiSuccess({
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        trialEndsAt: user.trialEndsAt,
        access: getAccessStatus(user),
      })
    );

    response.cookies.set(SESSION_COOKIE_NAME, refreshedToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    return response;
  } catch {
    const response = NextResponse.json(apiError("Session invalide."), { status: 401 });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
}
