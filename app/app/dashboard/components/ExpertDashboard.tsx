import type { DashboardAnalytics, DashboardTrade } from "@/lib/dashboard-analytics";
import { getPerformanceInsights } from "@/lib/dashboard-insights";

import DashboardConsistencySection from "./DashboardConsistencySection";
import DashboardEnvironmentChart from "./DashboardEnvironmentChart";
import DashboardEquityPanel from "./DashboardEquityPanel";
import DashboardInsightsGrid from "./DashboardInsightsGrid";
import DashboardOverviewGrid from "./DashboardOverviewGrid";
import DashboardPerformanceBreakdowns from "./DashboardPerformanceBreakdowns";

type ExpertDashboardProps = {
  analytics: DashboardAnalytics;
  trades?: DashboardTrade[];
};

export default function ExpertDashboard({ analytics, trades = [] }: ExpertDashboardProps) {
  return (
    <>
      <DashboardOverviewGrid analytics={analytics} variant="expert" />

      <DashboardEquityPanel analytics={analytics} trades={trades} />

      <DashboardEnvironmentChart analytics={analytics} />

      <DashboardInsightsGrid
        eyebrow="Expert Intelligence"
        title="Performance Insights"
        subtitle="These cards interpret the data instead of only displaying it. Use them to find where your process is strongest and weakest."
        insights={getPerformanceInsights(analytics)}
      />

      <DashboardConsistencySection analytics={analytics} />

      <DashboardPerformanceBreakdowns analytics={analytics} />
    </>
  );
}
