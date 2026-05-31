type DashboardStatCardProps = {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
  helper?: string;
};

export default function DashboardStatCard({
  label,
  value,
  tone = "default",
  helper,
}: DashboardStatCardProps) {
  const valueTone =
    tone === "positive"
      ? "text-green-600"
      : tone === "negative"
        ? "text-red-600"
        : "text-[var(--text-primary)]";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>

      <p className={`mt-4 text-3xl font-bold tracking-tight ${valueTone}`}>{value}</p>

      {helper ? (
        <p className="mt-3 min-h-10 text-sm leading-5 text-[var(--text-secondary)]">{helper}</p>
      ) : null}

      <div className="mt-5 h-1 w-10 rounded-full bg-[var(--accent)]" />
    </div>
  );
}
