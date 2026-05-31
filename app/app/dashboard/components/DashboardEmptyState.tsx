import Link from "next/link";

type DashboardEmptyStateProps = {
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
  showAction?: boolean;
};

export default function DashboardEmptyState({
  title,
  description,
  href = "/trade-log",
  actionLabel = "Log a Trade",
  showAction = false,
}: DashboardEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[#fbfaf7] p-6 text-center">
      <h4 className="text-lg font-semibold tracking-tight">{title}</h4>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
        {description}
      </p>

      {showAction ? (
        <Link
          href={href}
          className="mt-5 inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(110,17,17,0.16)] transition hover:opacity-90"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
