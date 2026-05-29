import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PLANS } from "@/lib/plans";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const toIso = (value?: number | null) =>
  value ? new Date(value * 1000).toISOString() : null;

async function upsertSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;

  if (!userId) return;

  const item = subscription.items.data[0];
  const priceId = item?.price?.id || null;
  const status = subscription.status;
  const isActive = status === "active" || status === "trialing";

  await supabaseAdmin.from("user_plans").upsert(
    {
      user_id: userId,
      plan: isActive ? "EXPERT" : "FREE",
      trade_limit_monthly: isActive ? PLANS.EXPERT.monthlyTrades : PLANS.FREE.monthlyTrades,
      screenshot_limit_monthly: isActive
        ? PLANS.EXPERT.monthlyScreenshots
        : PLANS.FREE.monthlyScreenshots,
      stripe_customer_id:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      subscription_status: status,
      current_period_start: toIso(subscription.current_period_start),
      current_period_end: toIso(subscription.current_period_end),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;

  if (!userId || !session.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id,
  );

  subscription.metadata.user_id ||= userId;

  await upsertSubscription(subscription);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe webhook signature or secret." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case "customer.subscription.created":
    case "customer.subscription.updated":
      await upsertSubscription(event.data.object as Stripe.Subscription);
      break;

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.user_id;

      if (userId) {
        await supabaseAdmin.from("user_plans").upsert(
          {
            user_id: userId,
            plan: "FREE",
            trade_limit_monthly: PLANS.FREE.monthlyTrades,
            screenshot_limit_monthly: PLANS.FREE.monthlyScreenshots,
            stripe_customer_id:
              typeof subscription.customer === "string"
                ? subscription.customer
                : subscription.customer.id,
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0]?.price?.id || null,
            subscription_status: "canceled",
            current_period_start: toIso(subscription.current_period_start),
            current_period_end: toIso(subscription.current_period_end),
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      }

      break;
    }

    case "invoice.payment_succeeded":
    case "invoice.payment_failed":
      break;

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
