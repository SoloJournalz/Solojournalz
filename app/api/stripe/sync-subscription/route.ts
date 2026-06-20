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

const keepsExpertAccess = (subscription: Stripe.Subscription) =>
  subscription.status === "active" ||
  subscription.status === "trialing" ||
  subscription.status === "past_due" ||
  subscription.status === "unpaid" ||
  Boolean(subscription.cancel_at || subscription.cancel_at_period_end);

const isScheduledToCancel = (subscription: Stripe.Subscription) =>
  Boolean(subscription.cancel_at_period_end || subscription.cancel_at);

async function findLatestStripeSubscription({
  subscriptionId,
  customerId,
  email,
}: {
  subscriptionId?: string | null;
  customerId?: string | null;
  email?: string | null;
}) {
  if (subscriptionId) {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      console.error("Could not retrieve saved Stripe subscription:", error);
    }
  }

  const customerIds = new Set<string>();

  if (customerId) customerIds.add(customerId);

  if (email) {
    const customers = await stripe.customers.list({ email, limit: 10 });
    customers.data.forEach((customer) => customerIds.add(customer.id));
  }

  const subscriptions: Stripe.Subscription[] = [];

  for (const id of customerIds) {
    const result = await stripe.subscriptions.list({
      customer: id,
      status: "all",
      limit: 10,
    });

    subscriptions.push(...result.data);
  }

  return subscriptions.sort((a, b) => b.created - a.created)[0] || null;
}

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: currentPlan, error: planError } = await supabase
    .from("user_plans")
    .select("plan, subscription_status, stripe_customer_id, stripe_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (planError) {
    return NextResponse.json({ error: planError.message }, { status: 500 });
  }

  if (
    currentPlan?.subscription_status === "dev_active" &&
    currentPlan?.plan === "EXPERT" &&
    !currentPlan?.stripe_subscription_id &&
    !currentPlan?.stripe_customer_id
  ) {
    return NextResponse.json({ ok: true, synced: false, devOverride: true });
  }

  const subscription = await findLatestStripeSubscription({
    subscriptionId: currentPlan?.stripe_subscription_id,
    customerId: currentPlan?.stripe_customer_id,
    email: user.email,
  });

  if (!subscription) {
    return NextResponse.json({ ok: true, synced: false });
  }

  const { currentPeriodStart, currentPeriodEnd } = getSubscriptionPeriod(subscription);
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const stillHasExpert = keepsExpertAccess(subscription);

  const { error } = await supabase.from("user_plans").upsert(
    {
      user_id: user.id,
      plan: stillHasExpert ? "EXPERT" : "FREE",
      trade_limit_monthly: stillHasExpert ? 999999 : 30,
      screenshot_limit_monthly: stillHasExpert ? 999999 : 10,
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

  return NextResponse.json({
    ok: true,
    synced: true,
    plan: stillHasExpert ? "EXPERT" : "FREE",
    cancel_at_period_end: isScheduledToCancel(subscription),
  });
}
