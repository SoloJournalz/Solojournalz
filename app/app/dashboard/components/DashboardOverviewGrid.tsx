import type { DashboardAnalytics } from "@/lib/dashboard-analytics";

import DashboardStatCard from "./DashboardStatCard";

type DashboardOverviewGridProps = {
  analytics: DashboardAnalytics;
  variant: "free" | "expert";
};

function formatMoney(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

export default function DashboardOverviewGrid({ analytics, variant }: DashboardOverviewGridProps) {
  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardStatCard
        label="Total Trades"
        value={String(analytics.totalTrades)}
        helper="Your logged sample size."
      />
      <DashboardStatCard
        label="Win Rate"
        value={`${analytics.winRate.toFixed(1)}%`}
        helper="Wins compared with total completed trades."
      />
      <DashboardStatCard
        label="Net PnL"
        value={formatMoney(analytics.netPnl)}
        tone={analytics.netPnl >= 0 ? "positive" : "negative"}
        helper="Your total journaled outcome."
      />
      {variant === "expert" ? (
        <DashboardStatCard
          label="Profit Factor"
          value={analytics.profitFactor ? analytics.profitFactor.toFixed(2) : "--"}
          helper="Gross wins divided by gross losses."
        />
      ) : (
        <DashboardStatCard
          label="Average Risk"
          value={`${analytics.averageRisk.toFixed(2)}%`}
          helper="Useful for discipline tracking."
        />
      )}
    </div>
  );
}
