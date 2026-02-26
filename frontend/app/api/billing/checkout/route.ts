import { apiError, apiSuccess } from "@backend/api-response";
import { SESSION_COOKIE_NAME } from "@backend/auth/constants";
import { verifySessionToken } from "@backend/auth/session";
import { findUserByEmail, updateUser } from "@backend/users/store";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";

type CheckoutBody = {
  plan?: "monthly" | "yearly";
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
    const body = (await request.json().catch(() => ({}))) as CheckoutBody;
    const plan = body.plan === "yearly" ? "yearly" : "monthly";

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
      return NextResponse.json(apiError("Session invalide."), { status: 401 });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(apiError("Connexion requise."), { status: 401 });
    }

    const priceId =
      plan === "yearly"
        ? process.env.STRIPE_PRICE_YEARLY_ID
        : process.env.STRIPE_PRICE_MONTHLY_ID;

    if (!priceId) {
      return NextResponse.json(
        apiError(
          plan === "yearly"
            ? "Prix Stripe annuel manquant (STRIPE_PRICE_YEARLY_ID)."
            : "Prix Stripe mensuel manquant (STRIPE_PRICE_MONTHLY_ID)."
        ),
        {
          status: 500,
        }
      );
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(apiError("Configuration Stripe manquante."), { status: 500 });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { email: user.email },
      });
      customerId = customer.id;
      await updateUser(user.email, { stripeCustomerId: customerId });
    }

    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.email,
      metadata: {
        email: user.email,
        plan,
      },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/facturation/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/tarifs?annule=1`,
    });

    if (!session.url) {
      return NextResponse.json(apiError("Impossible de créer la session Stripe."), {
        status: 500,
      });
    }

    return NextResponse.json(apiSuccess({ url: session.url }));
  } catch {
    return NextResponse.json(apiError("Erreur de création du checkout."), { status: 500 });
  }
}
