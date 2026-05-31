import type { ReactNode } from "react";

import SectionHeader from "./SectionHeader";

type AnalyticsPanelProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
};

export default function AnalyticsPanel({ title, subtitle, children, action }: AnalyticsPanelProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <SectionHeader title={title} subtitle={subtitle} action={action} />

      <div className="mt-5">{children}</div>
    </div>
  );
}
