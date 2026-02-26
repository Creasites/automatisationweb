import { apiError, apiSuccess } from "@backend/api-response";
import { getAccessStatus } from "@backend/billing/access";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@backend/auth/constants";
import { createSessionToken } from "@backend/auth/session";
import { createUser, findUserByEmail } from "@backend/users/store";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

type RegisterBody = {
  email?: string;
  password?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!email || !password) {
      return NextResponse.json(apiError("Email et mot de passe requis."), { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(apiError("Email invalide."), { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(apiError("Mot de passe trop court (8 caractères minimum)."), {
        status: 400,
      });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(apiError("Un compte existe déjà avec cet email."), { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const trialEndsAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const user = await createUser({
      email,
      passwordHash,
      trialEndsAt,
    });

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
    console.error("AUTH_REGISTER_ERROR", reason);

    if (reason === "SUPABASE_CONFIG_MISSING" || reason === "LOCAL_STORAGE_UNAVAILABLE") {
      return NextResponse.json(
        apiError("Configuration serveur incomplète (Supabase manquant sur Vercel)."),
        { status: 500 }
      );
    }

    if (reason.startsWith("SUPABASE_")) {
      return NextResponse.json(apiError(`Connexion à la base impossible (Supabase: ${reason}).`), {
        status: 500,
      });
    }

    return NextResponse.json(apiError("Impossible de créer le compte."), { status: 500 });
  }
}
