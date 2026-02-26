import { apiError, apiSuccess } from "@backend/api-response";
import { SESSION_COOKIE_NAME } from "@backend/auth/constants";
import { verifySessionToken } from "@backend/auth/session";
import { findUserByEmail, updateUser } from "@backend/users/store";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

type ConfirmBody = {
  sessionId?: string;
};

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }

  return new Stripe(key);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as ConfirmBody;
    const sessionId = body.sessionId?.trim();

    if (!sessionId) {
      return NextResponse.json(apiError("Session de paiement manquante."), { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(apiError("Connexion requise."), { status: 401 });
    }

    let email: string;
    try {
      const payload = await verifySessionToken(token);
      email = payload.email;
    } catch {
      return NextResponse.json(apiError("Session utilisateur invalide."), { status: 401 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(apiError("Utilisateur introuvable."), { status: 404 });
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(apiError("Configuration Stripe manquante."), { status: 500 });
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    const sessionEmail = checkoutSession.metadata?.email ?? checkoutSession.customer_details?.email;

    if (!sessionEmail || sessionEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(apiError("Cette session de paiement ne correspond pas à ton compte."), {
        status: 403,
      });
    }

    if (checkoutSession.mode !== "subscription") {
      return NextResponse.json(apiError("Session Stripe invalide."), { status: 400 });
    }

    const hasPaid = checkoutSession.payment_status === "paid" || checkoutSession.status === "complete";
    const customerId = typeof checkoutSession.customer === "string" ? checkoutSession.customer : undefined;
    const subscriptionId =
      typeof checkoutSession.subscription === "string" ? checkoutSession.subscription : undefined;

    if (!hasPaid || !subscriptionId) {
      return NextResponse.json(apiError("Paiement non confirmé pour le moment."), { status: 409 });
    }

    await updateUser(email, {
      subscriptionStatus: "active",
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    });

    return NextResponse.json(apiSuccess({ active: true }));
  } catch {
    return NextResponse.json(apiError("Impossible de confirmer le paiement."), { status: 500 });
  }
}
