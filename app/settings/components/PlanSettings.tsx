import { useState } from "react";
import { PLANS, PlanKey, formatLimit } from "@/lib/plans";

const cardClass =
  "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]";

const planCardClass =
  "rounded-2xl border border-[var(--border)] bg-[#f8f6f2] p-5";

type BillingDetails = {
  subscription_status: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  stripe_customer_id: string | null;
};

type PlanSettingsProps = {
  currentPlan: PlanKey;
  billingDetails: BillingDetails | null;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export default function PlanSettings({ currentPlan, billingDetails }: PlanSettingsProps) {
  const isExpert = currentPlan === "EXPERT";
  const expertPrice = PLANS.EXPERT.priceMonthlyGbp;
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState("");

  const openCheckout = async () => {
    setBillingLoading(true);
    setBillingError("");

    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnTo: "settings" }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.url) {
      setBillingError(payload?.error || "Could not open Stripe checkout.");
      setBillingLoading(false);
      return;
    }

    window.location.href = payload.url;
  };

  const openBillingPortal = async () => {
    setBillingLoading(true);
    setBillingError("");

    const response = await fetch("/api/stripe/create-billing-portal", {
      method: "POST",
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.url) {
      setBillingError(payload?.error || "Could not open billing portal.");
      setBillingLoading(false);
      return;
    }

    window.location.href = payload.url;
  };

  const status = billingDetails?.subscription_status || (isExpert ? "active" : "free");
  const isCancelling = Boolean(
    isExpert &&
      (billingDetails?.cancel_at_period_end ||
        status === "canceled" ||
        status === "incomplete_expired"),
  );
  const periodEndLabel = formatDate(billingDetails?.current_period_end);
  const renewalLabel = isCancelling ? "Subscription Ends" : "Renews";

  return (
    <section className={cardClass}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscription</h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Manage your SoloJournalz plan, upgrade to Expert, or open your Stripe billing portal.
          </p>
        </div>

        <span className="rounded-full border border-[var(--border)] bg-[#efeee9] px-4 py-2 text-xs font-bold text-[var(--text-secondary)]">
          Current: {isExpert ? "Expert" : "Free"}
        </span>
      </div>

      {billingError ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {billingError}
        </div>
      ) : null}

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
              onClick={openCheckout}
              disabled={billingLoading}
              className="mt-5 w-full rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(110,17,17,0.18)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {billingLoading ? "Opening checkout" : "Upgrade to Expert"}
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
                {isCancelling
                  ? "Your cancellation is scheduled in Stripe."
                  : "Your subscription is managed securely through Stripe."}
              </p>
            </div>

            <span
              className={
                isCancelling
                  ? "rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800"
                  : "rounded-full bg-[#efeee9] px-3 py-1 text-xs font-bold capitalize text-[var(--text-secondary)]"
              }
            >
              {isCancelling ? "Cancelling" : status.replaceAll("_", " ")}
            </span>
          </div>

          {isCancelling ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-900">
              Your subscription ends on
              <span className="font-black"> {periodEndLabel}</span>. You keep Expert access until then, and your account will switch to the Free plan after that date.
            </div>
          ) : null}

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
                {isCancelling ? "Subscription Ends" : renewalLabel}
              </p>
              <p className="mt-2 text-sm font-bold">
                {periodEndLabel}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[#f8f6f2] p-4">
            <div>
              <p className="text-sm font-bold">Plan management</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {isCancelling
                  ? `Your Expert subscription ends on ${periodEndLabel}. You can manage billing or reactivate from Stripe.`
                  : "Update payment method, view billing, or manage your Expert subscription."}
              </p>
            </div>

            <button
              type="button"
              onClick={openBillingPortal}
              disabled={billingLoading || !billingDetails?.stripe_customer_id}
              className="rounded-xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-bold text-[var(--text-primary)] transition hover:bg-[#efeee9] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {billingLoading ? "Opening" : "Manage Billing"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
