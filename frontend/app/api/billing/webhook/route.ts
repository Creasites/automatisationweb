import { findUserByStripeCustomerId, updateUser, updateUserByStripeCustomerId } from "@backend/users/store";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }

  return new Stripe(key);
}

function isSubscriptionActive(status: Stripe.Subscription.Status) {
  return status === "active" || status === "trialing";
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Webhook Stripe non configuré." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature Stripe manquante." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Signature webhook invalide." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.metadata?.email ?? session.customer_details?.email ?? undefined;
    const customerId = typeof session.customer === "string" ? session.customer : undefined;
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : undefined;

    if (email) {
      await updateUser(email, {
        subscriptionStatus: "active",
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
      });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId =
      typeof subscription.customer === "string" ? subscription.customer : undefined;

    if (customerId) {
      const existing = await findUserByStripeCustomerId(customerId);
      if (existing) {
        await updateUserByStripeCustomerId(customerId, {
          subscriptionStatus: isSubscriptionActive(subscription.status) ? "active" : "inactive",
          stripeSubscriptionId: subscription.id,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
