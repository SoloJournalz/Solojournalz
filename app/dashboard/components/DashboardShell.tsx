import type { DashboardAnalytics, DashboardPlan, DashboardTrade } from "@/lib/dashboard-analytics";
import { getDashboardReadinessMessage } from "@/lib/dashboard-insights";

import DashboardHeader from "./DashboardHeader";
import ExpertDashboard from "./ExpertDashboard";
import FreeDashboard from "./FreeDashboard";
import RecentTradesCard from "./RecentTradesCard";

type DashboardShellProps = {
  firstName: string;
  plan: DashboardPlan;
  analytics: DashboardAnalytics;
  trades?: DashboardTrade[];
};

export default function DashboardShell({
  firstName,
  plan,
  analytics,
  trades = [],
}: DashboardShellProps) {
  const isExpert = String(plan || "FREE").toUpperCase() === "EXPERT";

  return (
    <section className="mx-auto max-w-7xl p-6 md:p-8">
      <DashboardHeader
        firstName={firstName}
        plan={plan}
        readinessMessage={getDashboardReadinessMessage(analytics)}
      />

      {isExpert ? (
        <ExpertDashboard analytics={analytics} trades={trades} />
      ) : (
        <FreeDashboard analytics={analytics} trades={trades} />
      )}

      <RecentTradesCard trades={analytics.recentTrades} />
    </section>
  );
}
