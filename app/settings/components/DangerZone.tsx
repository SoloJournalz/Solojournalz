import { PlanKey } from "@/lib/plans";

type UsagePreview = {
  used: number;
  limit: number | null;
  remaining: number | null;
  cycleStart: string;
  cycleEnd: string;
};

const cardClass =
  "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]";

const formatDate = (value?: string) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

type DangerZoneProps = {
  isAdmin: boolean;
  sampleTradeCount: number;
  currentPlan: PlanKey;
  planUpdating?: boolean;
  usagePreview?: UsagePreview | null;
  devBillingCycleStart: string;
  onResetSettings: () => void;
  onSeedSampleTrades: () => void;
  onResetTradeDatabase: () => void;
  onTogglePlan: () => void;
  onRefreshUsage: () => void;
  onSimulateNextBillingCycle: () => void;
  onDevBillingCycleStartChange: (value: string) => void;
  onClearDevBillingCycleStart: () => void;
  onDeleteAccount: () => void;
};

export default function DangerZone({
  isAdmin,
  sampleTradeCount,
  currentPlan,
  planUpdating = false,
  usagePreview,
  devBillingCycleStart,
  onResetSettings,
  onSeedSampleTrades,
  onResetTradeDatabase,
  onTogglePlan,
  onRefreshUsage,
  onSimulateNextBillingCycle,
  onDevBillingCycleStartChange,
  onClearDevBillingCycleStart,
  onDeleteAccount,
}: DangerZoneProps) {
  const nextPlan = currentPlan === "FREE" ? "EXPERT" : "FREE";
  const usageLabel = usagePreview
    ? usagePreview.limit === null
      ? `${usagePreview.used} / Unlimited`
      : `${Math.min(usagePreview.used, usagePreview.limit)}${
          usagePreview.used > usagePreview.limit ? "+" : ""
        } / ${usagePreview.limit}`
    : "—";

  const seedButtonLabel =
    currentPlan === "FREE"
      ? "Randomize Current Cycle to 30"
      : `Seed ${sampleTradeCount} Random Trades`;

  return (
    <section className={cardClass}>
      <h2 className="text-xl font-bold tracking-tight">Danger Zone</h2>

      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        Reset your journal safely without deleting your account.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onResetSettings}
          className="rounded-xl bg-[#efeee9] px-5 py-3 text-sm font-bold text-[var(--accent)] transition hover:bg-red-50"
        >
          Reset Settings
        </button>

        <button
          type="button"
          onClick={onResetTradeDatabase}
          className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(110,17,17,0.18)]"
        >
          Reset Data
        </button>
      </div>

      <p className="mt-4 text-xs leading-5 text-[var(--text-secondary)]">
        Reset Settings clears your custom setup. Reset Data deletes saved trades for this account only.
      </p>

      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
        <h3 className="text-lg font-bold tracking-tight text-red-900">Delete Account</h3>
        <p className="mt-2 text-sm leading-6 text-red-800">
          Permanently delete your account, trades, settings, and plan data. Expert subscriptions are cancelled in Stripe before the account is removed.
        </p>
        <button
          type="button"
          onClick={onDeleteAccount}
          className="mt-4 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(185,28,28,0.18)] transition hover:bg-red-800"
        >
          Delete Account
        </button>
      </div>

      {isAdmin && (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[#f8f6f2] p-5">
          <p className="text-sm font-bold tracking-wide text-[var(--gold)]">
            Developer Testing Only
          </p>

          <h3 className="mt-2 text-lg font-bold tracking-tight">
            Test plan and billing-cycle behavior
          </h3>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Randomize trades inside the active FREE cycle, step forward one billing cycle at a time,
            and customize the cycle anchor date to test awkward signup days.
          </p>

          <div className="mt-5 grid gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                Active plan
              </p>
              <p className="mt-1 text-lg font-bold">{currentPlan}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                Cycle usage
              </p>
              <p className="mt-1 text-lg font-bold">{usageLabel}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                Remaining
              </p>
              <p className="mt-1 text-lg font-bold">
                {usagePreview
                  ? usagePreview.remaining === null
                    ? "Unlimited"
                    : usagePreview.remaining
                  : "—"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
              Current simulated cycle
            </p>

            <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
              {formatDate(usagePreview?.cycleStart)} → {formatDate(usagePreview?.cycleEnd)}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                  Simulated cycle anchor date
                </span>
                <input
                  type="date"
                  value={devBillingCycleStart}
                  onChange={(event) =>
                    onDevBillingCycleStartChange(event.target.value)
                  }
                  className="input mt-2"
                />
              </label>

              <button
                type="button"
                onClick={onClearDevBillingCycleStart}
                className="rounded-xl bg-[#efeee9] px-5 py-3 text-sm font-bold text-[var(--accent)] transition hover:bg-red-50"
              >
                Use Real Signup Date
              </button>

              <button
                type="button"
                onClick={onRefreshUsage}
                className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(110,17,17,0.18)] transition hover:bg-[var(--accent-hover)]"
              >
                Refresh Usage
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onSeedSampleTrades}
                className="rounded-xl bg-[#efeee9] px-5 py-3 text-sm font-bold text-[var(--accent)] transition hover:bg-red-50"
              >
                {seedButtonLabel}
              </button>

              <button
                type="button"
                onClick={onSimulateNextBillingCycle}
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[var(--accent)] ring-1 ring-[var(--border)] transition hover:bg-red-50"
              >
                Simulate Next Cycle
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={planUpdating}
              onClick={onTogglePlan}
              className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(110,17,17,0.18)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {planUpdating ? "Updating..." : `Switch to ${nextPlan}`}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
