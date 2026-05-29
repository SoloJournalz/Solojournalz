import type { DashboardInsightTone } from "@/lib/dashboard-insights";

type DashboardInsightCardProps = {
  title: string;
  value: string;
  description: string;
  tone?: DashboardInsightTone;
};

export default function DashboardInsightCard({
  title,
  value,
  description,
  tone = "default",
}: DashboardInsightCardProps) {
  const toneClass =
    tone === "positive"
      ? "text-green-700"
      : tone === "negative"
        ? "text-red-700"
        : tone === "gold"
          ? "text-[var(--gold)]"
          : "text-[var(--text-primary)]";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
      <p className={`mt-3 text-2xl font-bold tracking-tight ${toneClass}`}>{value}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}
