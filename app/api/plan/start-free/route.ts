import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { PLANS } from "@/lib/plans";

export async function POST() {
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

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: existingPlan, error: existingPlanError } = await supabase
    .from("user_plans")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingPlanError) {
    return NextResponse.json({ error: existingPlanError.message }, { status: 500 });
  }

  const freePlan = PLANS.FREE;

  const { error } = await supabase.from("user_plans").upsert(
    {
      user_id: user.id,
      plan: "FREE",
      trade_limit_monthly: freePlan.monthlyTrades,
      screenshot_limit_monthly: freePlan.monthlyScreenshots,
      subscription_status: "free",
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If the plan was cleared for testing, force onboarding to run again.
  // Keep the user's existing Settings values, but remove the completed flag.
  if (!existingPlan) {
    const { error: setupResetError } = await supabase
      .from("user_trade_settings")
      .upsert(
        {
          user_id: user.id,
          setup_completed: false,
          setup_completed_at: null,
          setup_template: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (setupResetError) {
      return NextResponse.json({ error: setupResetError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
