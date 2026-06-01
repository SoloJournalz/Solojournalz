import { NextResponse } from "next/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

const supabaseAdmin = createSupabaseAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

const ACTIVE_STRIPE_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "incomplete",
]);

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Account deletion is not configured." },
      { status: 500 },
    );
  }

  const { data: planRow, error: planError } = await supabaseAdmin
    .from("user_plans")
    .select("plan, stripe_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (planError) {
    return NextResponse.json({ error: planError.message }, { status: 500 });
  }

  if (planRow?.stripe_subscription_id) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        planRow.stripe_subscription_id,
      );

      if (ACTIVE_STRIPE_STATUSES.has(subscription.status)) {
        await stripe.subscriptions.cancel(planRow.stripe_subscription_id);
      }
    } catch (error) {
      console.error("Stripe subscription cancellation failed:", error);
      return NextResponse.json(
        {
          error:
            "Could not cancel your Stripe subscription. Open billing from Settings and cancel the subscription before deleting your account.",
        },
        { status: 500 },
      );
    }
  }

  const tablesToClear = ["trades", "user_trade_settings", "user_plans"];

  for (const table of tablesToClear) {
    const { error } = await supabaseAdmin.from(table).delete().eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (deleteUserError) {
    return NextResponse.json({ error: deleteUserError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
