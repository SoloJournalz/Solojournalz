import type { DashboardPlan } from "@/lib/dashboard-analytics";

type DashboardHeaderProps = {
  firstName: string;
  plan: DashboardPlan;
  readinessMessage?: string;
};

export default function DashboardHeader({
  firstName,
  plan,
  readinessMessage,
}: DashboardHeaderProps) {
  const normalizedPlan = String(plan || "FREE").toUpperCase();
  const isExpert = normalizedPlan === "EXPERT";

  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-sm text-[var(--gold)]">Dashboard</p>

        <h2 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
          Welcome back, {firstName}
        </h2>

        <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">
          {readinessMessage || "Track your trades, performance, and journaling progress."}
        </p>
      </div>

      <span className="w-fit rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-2 text-xs font-bold tracking-wide text-[var(--gold)]">
        {isExpert ? "EXPERT PLAN" : "FREE PLAN"}
      </span>
    </div>
  );
}
