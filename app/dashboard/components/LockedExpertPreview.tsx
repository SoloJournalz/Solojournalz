import Link from "next/link";

export default function LockedExpertPreview() {
  return (
    <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h3 className="text-2xl font-bold tracking-tight">Unlock Psychology Intelligence</h3>

      <p className="mx-auto mt-3 max-w-3xl text-[var(--text-secondary)]">
        Upgrade to Expert for emotional analytics, discipline scoring, deeper performance breakdowns, checklist impact, and advanced trader self-awareness insights.
      </p>

      <Link
        href="/get-started"
        className="mt-6 inline-flex rounded-2xl bg-[var(--accent)] px-6 py-3 font-semibold text-white shadow-[0_10px_25px_rgba(110,17,17,0.18)] transition hover:opacity-90"
      >
        Upgrade to Expert
      </Link>
    </div>
  );
}
