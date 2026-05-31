import type { DashboardInsight } from "@/lib/dashboard-insights";

import DashboardInsightCard from "./DashboardInsightCard";
import SectionHeader from "./SectionHeader";

type DashboardInsightsGridProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  insights: DashboardInsight[];
};

export default function DashboardInsightsGrid({
  eyebrow,
  title,
  subtitle,
  insights,
}: DashboardInsightsGridProps) {
  return (
    <section className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {insights.map((insight) => (
          <DashboardInsightCard key={`${insight.title}-${insight.value}`} {...insight} />
        ))}
      </div>
    </section>
  );
}
