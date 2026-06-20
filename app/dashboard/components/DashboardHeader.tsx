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
    <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-sm font-medium text-[var(--gold)]">Dashboard</p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h1>

        <p className="mt-3 max-w-2xl text-base text-[var(--text-secondary)]">
          {readinessMessage || "Track your trades, performance, and journaling progress."}
        </p>
      </div>

      <span className="w-fit rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-2 text-xs font-bold tracking-wide text-[var(--gold)]">
        {isExpert ? "EXPERT PLAN" : "FREE PLAN"}
      </span>
    </div>
  );
}
