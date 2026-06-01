import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

const BLOCKING_SUBSCRIPTION_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
  "past_due",
  "unpaid",
]);

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

async function emailHasBlockingStripeSubscription(email: string) {
  const customers = await stripe.customers.list({
    email,
    limit: 10,
  });

  for (const customer of customers.data) {
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 10,
    });

    const blockingSubscription = subscriptions.data.find((subscription) => {
      if (subscription.status === "canceled" || subscription.status === "incomplete_expired") {
        return false;
      }

      return (
        BLOCKING_SUBSCRIPTION_STATUSES.has(subscription.status) ||
        Boolean(subscription.cancel_at || subscription.cancel_at_period_end)
      );
    });

    if (blockingSubscription) {
      return blockingSubscription;
    }
  }

  return null;
}

async function syncExistingExpertSubscription({
  supabase,
  userId,
  subscription,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  subscription: Stripe.Subscription;
}) {
  const { currentPeriodStart, currentPeriodEnd } = getSubscriptionPeriod(subscription);
  const priceId = subscription.items.data[0]?.price.id ?? null;

  const { error: planSyncError } = await supabase.from("user_plans").upsert(
    {
      user_id: userId,
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

  if (planSyncError) return planSyncError.message;

  const { error: settingsSyncError } = await supabase.from("user_trade_settings").upsert(
    {
      user_id: userId,
      setup_completed: false,
      setup_completed_at: null,
      setup_template: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  return settingsSyncError?.message ?? null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json().catch(() => null) as { returnTo?: string } | null;
  const checkoutReturnPath = body?.returnTo === "settings" ? "/settings?checkout=success&session_id={CHECKOUT_SESSION_ID}" : "/setup?checkout=success&session_id={CHECKOUT_SESSION_ID}";
  const checkoutCancelPath = body?.returnTo === "settings" ? "/settings?checkout=cancelled" : "/select-plan?checkout=cancelled";

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const priceId = process.env.STRIPE_EXPERT_PRICE_ID;

  if (!siteUrl || !priceId) {
    return NextResponse.json(
      { error: "Stripe checkout is not configured." },
      { status: 500 },
    );
  }

  const { data: existingPlan, error: planError } = await supabase
    .from("user_plans")
    .select(
      "plan, stripe_customer_id, stripe_subscription_id, subscription_status, cancel_at_period_end",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (planError) {
    return NextResponse.json({ error: planError.message }, { status: 500 });
  }

  const hasBlockingLocalSubscription =
    existingPlan?.plan === "EXPERT" ||
    existingPlan?.subscription_status === "active" ||
    existingPlan?.subscription_status === "trialing" ||
    existingPlan?.subscription_status === "past_due" ||
    existingPlan?.subscription_status === "unpaid" ||
    existingPlan?.cancel_at_period_end === true;

  if (hasBlockingLocalSubscription) {
    return NextResponse.json({ redirectUrl: "/setup?checkout=recovered" });
  }

  if (user.email) {
    const blockingStripeSubscription = await emailHasBlockingStripeSubscription(user.email);

    if (blockingStripeSubscription) {
      const syncError = await syncExistingExpertSubscription({
        supabase,
        userId: user.id,
        subscription: blockingStripeSubscription,
      });

      if (syncError) {
        return NextResponse.json({ error: syncError }, { status: 500 });
      }

      return NextResponse.json({ redirectUrl: "/setup?checkout=recovered" });
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existingPlan?.stripe_customer_id || undefined,
    customer_email: existingPlan?.stripe_customer_id ? undefined : user.email || undefined,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}${checkoutReturnPath}`,
    cancel_url: `${siteUrl}${checkoutCancelPath}`,
    metadata: { user_id: user.id },
    subscription_data: { metadata: { user_id: user.id } },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe did not return a checkout URL." },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
