import { apiError, apiSuccess } from "@backend/api-response";
import { getAccessStatus } from "@backend/billing/access";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@backend/auth/constants";
import { createSessionToken } from "@backend/auth/session";
import { findUserByEmail } from "@backend/users/store";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!email || !password) {
      return NextResponse.json(apiError("Email et mot de passe requis."), { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(apiError("Identifiants invalides."), { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(apiError("Identifiants invalides."), { status: 401 });
    }

    const token = await createSessionToken({
      email: user.email,
      trialEndsAt: user.trialEndsAt,
      subscriptionStatus: user.subscriptionStatus,
    });

    const response = NextResponse.json(
      apiSuccess({
        email: user.email,
        access: getAccessStatus(user),
      })
    );

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    return response;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    console.error("AUTH_LOGIN_ERROR", reason);

    if (reason === "SUPABASE_CONFIG_MISSING" || reason === "LOCAL_STORAGE_UNAVAILABLE") {
      return NextResponse.json(
        apiError("Configuration serveur incomplète (Supabase manquant sur Vercel)."),
        { status: 500 }
      );
    }

    if (reason.startsWith("SUPABASE_")) {
      return NextResponse.json(apiError("Connexion à la base impossible (Supabase)."), {
        status: 500,
      });
    }

    return NextResponse.json(apiError("Impossible de se connecter."), { status: 500 });
  }
}
