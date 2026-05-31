import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: plan, error: planError } = await supabase
    .from("user_plans")
    .select("plan, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (planError) {
    return NextResponse.json({ error: planError.message }, { status: 500 });
  }

  if (!plan || plan.plan !== "EXPERT" || !plan.stripe_customer_id) {
    return NextResponse.json(
      { error: "Billing portal is only available for Expert users." },
      { status: 403 },
    );
  }

  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    return NextResponse.json(
      { error: "Billing portal return URL is not configured." },
      { status: 500 },
    );
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: plan.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
