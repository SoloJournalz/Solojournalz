import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const priceId = process.env.STRIPE_EXPERT_PRICE_ID;

  if (!siteUrl || !priceId) {
    return NextResponse.json(
      { error: "Missing Stripe environment variables." },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    },
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: existingPlan } = await supabase
    .from("user_plans")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existingPlan?.stripe_customer_id || undefined,
    customer_email: existingPlan?.stripe_customer_id ? undefined : user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/settings?setup=true&checkout=success`,
    cancel_url: `${siteUrl}/select-plan?checkout=cancelled`,
    metadata: {
      user_id: user.id,
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
