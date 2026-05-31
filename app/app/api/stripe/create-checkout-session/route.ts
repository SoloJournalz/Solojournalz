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

export async function POST() {
  const supabase = await createClient();

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
    return NextResponse.json(
      {
        error:
          "This account already has an Expert subscription. Manage billing from Settings instead.",
      },
      { status: 409 },
    );
  }

  if (user.email) {
    const blockingStripeSubscription = await emailHasBlockingStripeSubscription(user.email);

    if (blockingStripeSubscription) {
      return NextResponse.json(
        {
          error:
            "This email already has an active or scheduled Expert subscription. Manage the existing subscription in Stripe Billing before starting another checkout.",
        },
        { status: 409 },
      );
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existingPlan?.stripe_customer_id || undefined,
    customer_email: existingPlan?.stripe_customer_id ? undefined : user.email || undefined,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/dashboard?checkout=success`,
    cancel_url: `${siteUrl}/select-plan?checkout=cancelled`,
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
