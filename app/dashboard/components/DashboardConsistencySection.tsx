import type { DashboardAnalytics } from "@/lib/dashboard-analytics";
import { getConsistencyInsights } from "@/lib/dashboard-insights";

import DashboardInsightsGrid from "./DashboardInsightsGrid";
import DashboardStatCard from "./DashboardStatCard";

function formatMoney(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

type DashboardConsistencySectionProps = {
  analytics: DashboardAnalytics;
};

export default function DashboardConsistencySection({ analytics }: DashboardConsistencySectionProps) {
  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label="Best Trade"
          value={formatMoney(analytics.bestTrade)}
          tone={analytics.bestTrade >= 0 ? "positive" : "negative"}
          helper="Your strongest individual result."
        />
        <DashboardStatCard
          label="Worst Trade"
          value={formatMoney(analytics.worstTrade)}
          tone={analytics.worstTrade >= 0 ? "positive" : "negative"}
          helper="Review this without emotion. Find the lesson."
        />
        <DashboardStatCard
          label="Best Win Streak"
          value={String(analytics.bestWinStreak)}
          helper="Momentum is useful when discipline stays stable."
        />
        <DashboardStatCard
          label="Consistency"
          value={`${analytics.consistencyScore}%`}
          helper="A simple read on repeatability."
        />
      </div>

      <DashboardInsightsGrid
        eyebrow="Discipline"
        title="Consistency Intelligence"
        subtitle="These metrics turn your journal into a process tracker, not just a result tracker."
        insights={getConsistencyInsights(analytics)}
      />
    </>
  );
}
