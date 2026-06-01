import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

type StripeSubscriptionWithPeriod = Stripe.Subscription & {
  current_period_start?: number | null;
  current_period_end?: number | null;
};

type StripeSubscriptionItemWithPeriod = Stripe.SubscriptionItem & {
  current_period_start?: number | null;
  current_period_end?: number | null;
};

const toIsoDate = (timestamp: number | null | undefined) =>
  timestamp ? new Date(timestamp * 1000).toISOString() : null;

const getCustomerId = (
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
) => {
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
};

function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  const typedSubscription = subscription as StripeSubscriptionWithPeriod;
  const firstItem = subscription.items.data[0] as
    | StripeSubscriptionItemWithPeriod
    | undefined;

  return {
    currentPeriodStart:
      typedSubscription.current_period_start ?? firstItem?.current_period_start ?? null,
    currentPeriodEnd:
      typedSubscription.current_period_end ?? firstItem?.current_period_end ?? null,
  };
}

const isScheduledToCancel = (subscription: Stripe.Subscription) =>
  Boolean(subscription.cancel_at_period_end || subscription.cancel_at);

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = (await request.json().catch(() => null)) as {
    sessionId?: string;
  } | null;

  const sessionId = body?.sessionId;

  if (!sessionId) {
    return NextResponse.json({ error: "Missing checkout session." }, { status: 400 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.client_reference_id !== user.id && session.metadata?.user_id !== user.id) {
    return NextResponse.json({ error: "Checkout session does not match this user." }, { status: 403 });
  }

  if (session.payment_status !== "paid" || !session.subscription) {
    return NextResponse.json({ error: "Checkout payment is not complete yet." }, { status: 409 });
  }

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string,
  );

  const isActive =
    subscription.status === "active" || subscription.status === "trialing";

  if (!isActive) {
    return NextResponse.json({ error: "Subscription is not active yet." }, { status: 409 });
  }

  const { currentPeriodStart, currentPeriodEnd } = getSubscriptionPeriod(subscription);
  const priceId = subscription.items.data[0]?.price.id ?? null;

  const { error } = await supabase.from("user_plans").upsert(
    {
      user_id: user.id,
      plan: "EXPERT",
      trade_limit_monthly: 999999,
      screenshot_limit_monthly: 999999,
      stripe_customer_id: getCustomerId(subscription.customer),
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      subscription_status: subscription.status,
      current_period_start: toIsoDate(currentPeriodStart),
      current_period_end: toIsoDate(currentPeriodEnd),
      cancel_at_period_end: isScheduledToCancel(subscription),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // New Expert checkout should enter onboarding again if the user plan was cleared during testing.
  await supabase.from("user_trade_settings").upsert(
    {
      user_id: user.id,
      setup_completed: false,
      setup_completed_at: null,
      setup_template: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  return NextResponse.json({ ok: true });
}
