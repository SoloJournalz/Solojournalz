import type { DashboardAnalytics, DashboardTrade } from "@/lib/dashboard-analytics";
import { getFreeDashboardInsights, getFreeDashboardInsightSentence } from "@/lib/dashboard-insights";

import DashboardCallout from "./DashboardCallout";
import DashboardEquityPanel from "./DashboardEquityPanel";
import DashboardInsightsGrid from "./DashboardInsightsGrid";
import DashboardOverviewGrid from "./DashboardOverviewGrid";
import LockedExpertPreview from "./LockedExpertPreview";

type FreeDashboardProps = {
  analytics: DashboardAnalytics;
  trades?: DashboardTrade[];
};

export default function FreeDashboard({ analytics, trades = [] }: FreeDashboardProps) {
  return (
    <>
      <DashboardOverviewGrid analytics={analytics} variant="free" />

      <DashboardEquityPanel analytics={analytics} trades={trades} variant="free" />

      <DashboardCallout>{getFreeDashboardInsightSentence(analytics)}</DashboardCallout>

      <DashboardInsightsGrid
        eyebrow="Trading Profile"
        title="Starter Insights"
        subtitle="A clean overview of what your journal is starting to reveal. Expert unlocks deeper psychology and consistency intelligence."
        insights={getFreeDashboardInsights(analytics)}
      />

      <LockedExpertPreview />
    </>
  );
}
