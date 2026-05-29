import { PLANS, PlanKey, formatLimit } from "@/lib/plans";

const cardClass =
  "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]";

const planCardClass =
  "rounded-2xl border border-[var(--border)] bg-[#f8f6f2] p-5";

type PlanSettingsProps = {
  currentPlan: PlanKey;
};

export default function PlanSettings({ currentPlan }: PlanSettingsProps) {
  const isExpert = currentPlan === "EXPERT";
  const expertPrice = PLANS.EXPERT.priceMonthlyGbp;

  return (
    <section className={cardClass}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscription</h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Manage your SoloJournalz plan. Billing controls will connect here
            once payments are live.
          </p>
        </div>

        <span className="rounded-full border border-[var(--border)] bg-[#efeee9] px-4 py-2 text-xs font-bold text-[var(--text-secondary)]">
          Current: {isExpert ? "Expert" : "Free"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className={planCardClass}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Free</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Start with the essentials.
              </p>
            </div>

            {!isExpert && (
              <span className="rounded-full bg-[#efeee9] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
                Active
              </span>
            )}
          </div>

          <p className="mt-5 text-2xl font-bold">£0</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Per month</p>

          <div className="mt-5 space-y-3 text-sm font-semibold text-[var(--text-primary)]">
            <p>{formatLimit(PLANS.FREE.monthlyTrades)} trades / month</p>
            <p>Core trade journaling</p>
            <p>Basic dashboard analytics</p>
            <p>Limited customization</p>
          </div>
        </div>

        <div className={planCardClass}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Expert</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Built for serious review and consistency.
              </p>
            </div>

            {isExpert && (
              <span className="rounded-full bg-[#efeee9] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
                Active
              </span>
            )}
          </div>

          <p className="mt-5 text-2xl font-bold">£{expertPrice}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Per month</p>

          <div className="mt-5 space-y-3 text-sm font-semibold text-[var(--text-primary)]">
            <p>Unlimited journaling</p>
            <p>Environment Edge</p>
            <p>Performance Insights</p>
            <p>Consistency Intelligence</p>
            <p>Advanced trade analytics</p>
            <p>Psychology tracking</p>
          </div>

          {!isExpert && (
            <button
              type="button"
              disabled
              className="mt-5 w-full rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white opacity-60 shadow-[0_8px_20px_rgba(110,17,17,0.18)]"
            >
              Upgrade Coming Soon
            </button>
          )}
        </div>
      </div>

      {isExpert && (
        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Billing Overview</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Expert billing details will appear here once payments are connected.
              </p>
            </div>

            <span className="rounded-full bg-[#efeee9] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
              Payment Setup Pending
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-[#f8f6f2] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                Plan
              </p>
              <p className="mt-2 text-sm font-bold">Expert</p>
            </div>

            <div className="rounded-xl bg-[#f8f6f2] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                Monthly Billing
              </p>
              <p className="mt-2 text-sm font-bold">£{expertPrice}/month</p>
            </div>

            <div className="rounded-xl bg-[#f8f6f2] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                Status
              </p>
              <p className="mt-2 text-sm font-bold">Coming Soon</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[#f8f6f2] p-4">
            <div>
              <p className="text-sm font-bold">Plan management</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Downgrade controls will connect here once billing is live.
              </p>
            </div>

            <button
              type="button"
              disabled
              className="rounded-xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-bold text-[var(--text-primary)] opacity-60"
            >
              Downgrade Coming Soon
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
