import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { PLANS } from "@/lib/plans";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

const toIsoDate = (timestamp: number | null | undefined) =>
  timestamp ? new Date(timestamp * 1000).toISOString() : null;

const getCustomerId = (
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
) => {
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
};

type StripeSubscriptionWithPeriod = Stripe.Subscription & {
  current_period_start?: number | null;
  current_period_end?: number | null;
};

type StripeSubscriptionItemWithPeriod = Stripe.SubscriptionItem & {
  current_period_start?: number | null;
  current_period_end?: number | null;
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

async function syncSubscription(
  subscription: Stripe.Subscription,
  fallbackUserId?: string | null,
) {
  const userId = subscription.metadata.user_id || fallbackUserId;

  if (!userId) {
    console.warn(
      "Stripe subscription sync skipped: missing user_id metadata.",
      subscription.id,
    );
    return;
  }

  const isActive =
    subscription.status === "active" || subscription.status === "trialing";

  const priceId = subscription.items.data[0]?.price.id ?? null;
  const freePlan = PLANS.FREE;
  const { currentPeriodStart, currentPeriodEnd } =
    getSubscriptionPeriod(subscription);

  const { error } = await supabaseAdmin.from("user_plans").upsert(
    {
      user_id: userId,
      plan: isActive ? "EXPERT" : "FREE",
      trade_limit_monthly: isActive ? 999999 : freePlan.monthlyTrades,
      screenshot_limit_monthly: isActive ? 999999 : freePlan.monthlyScreenshots,
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

  if (error) throw error;
}

async function downgradeSubscription(
  subscription: Stripe.Subscription,
  fallbackUserId?: string | null,
) {
  const userId = subscription.metadata.user_id || fallbackUserId;

  if (!userId) {
    console.warn(
      "Stripe subscription downgrade skipped: missing user_id metadata.",
      subscription.id,
    );
    return;
  }

  const freePlan = PLANS.FREE;
  const { currentPeriodStart, currentPeriodEnd } =
    getSubscriptionPeriod(subscription);

  const { error } = await supabaseAdmin
    .from("user_plans")
    .update({
      plan: "FREE",
      trade_limit_monthly: freePlan.monthlyTrades,
      screenshot_limit_monthly: freePlan.monthlyScreenshots,
      subscription_status: subscription.status,
      current_period_start: toIsoDate(currentPeriodStart),
      current_period_end: toIsoDate(currentPeriodEnd),
      cancel_at_period_end: isScheduledToCancel(subscription),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) throw error;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
          );

          await syncSubscription(
            subscription,
            session.metadata?.user_id || session.client_reference_id,
          );
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await downgradeSubscription(subscription);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler failed:", error);
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 },
    );
  }
}
