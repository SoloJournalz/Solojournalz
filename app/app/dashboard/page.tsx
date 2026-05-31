import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import Navbar from "@/app/components/layout/navbar";
import DashboardShell from "./components/DashboardShell";
import {
  getDashboardAnalytics,
  type DashboardPlan,
  type DashboardTrade,
} from "@/lib/dashboard-analytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizePlan(value: unknown): DashboardPlan {
  const normalized = String(value || "FREE").trim().toUpperCase();
  return normalized === "EXPERT" ? "EXPERT" : "FREE";
}

export default async function DashboardPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [tradesResult, planResult] = await Promise.all([
    supabase
      .from("trades")
      .select(
        "id, trade_date, entry_time, environment, pair, strategy, trade_type, direction, entry_price, position_size, stop_loss, take_profit, risk_percent, pnl, result, checklist, emotions, notes, created_at",
      )
      .eq("user_id", user.id)
      .order("trade_date", { ascending: true }),

    supabase
      .from("user_plans")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Trader";

  const firstName = fullName.split(" ")[0];
  if (!planResult.data) {
    redirect("/select-plan");
  }

  const plan = normalizePlan(planResult.data.plan);

  const trades = (tradesResult.data || []) as DashboardTrade[];
  const analytics = getDashboardAnalytics(trades);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <Navbar />

      <DashboardShell
        firstName={firstName}
        plan={plan}
        analytics={analytics}
        trades={trades}
      />
    </main>
  );
}
