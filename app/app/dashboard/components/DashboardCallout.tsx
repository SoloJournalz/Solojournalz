type DashboardCalloutProps = {
  eyebrow?: string;
  title?: string;
  children: string;
};

export default function DashboardCallout({
  eyebrow = "Journal Insight",
  title = "What your journal is showing",
  children,
}: DashboardCalloutProps) {
  return (
    <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
        {eyebrow}
      </p>

      <h3 className="mt-3 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
        {title}
      </h3>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
        {children}
      </p>
    </div>
  );
}
