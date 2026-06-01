"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/app/components/layout/logo";

const planCard =
  "flex h-full min-h-[460px] flex-col rounded-[1.35rem] border border-[var(--border)] bg-white p-6 shadow-sm";

export default function SelectPlanPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<"FREE" | "EXPERT" | null>(
    null,
  );
  const [error, setError] = useState("");

  const startFree = async () => {
    setLoadingPlan("FREE");
    setError("");

    const response = await fetch("/api/plan/start-free", {
      method: "POST",
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error || "Could not start Free plan.");
      setLoadingPlan(null);
      return;
    }

    router.replace("/setup");
  };

  const startExpert = async () => {
    setLoadingPlan("EXPERT");
    setError("");

    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error || "Could not start checkout.");
      setLoadingPlan(null);
      return;
    }

    const payload = await response.json();

    if (!payload?.url) {
      setError("Checkout session did not return a URL.");
      setLoadingPlan(null);
      return;
    }

    window.location.href = payload.url;
  };

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[var(--text-primary)]">
      <header className="fixed left-0 top-0 z-50 w-full border-b border-black/5 bg-white/90 backdrop-blur-sm">
        <div className="flex h-[72px] items-center px-6 sm:px-10">
          <Logo href="/" />
        </div>
      </header>

      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 pt-36 pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--gold)]">
            Choose your workspace
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Select your SoloJournalz plan
          </h1>

          <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
            Choose the workspace that fits your trading journey.
          </p>
        </div>

        {error && (
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mx-auto mt-9 grid w-full max-w-[820px] gap-5 md:grid-cols-2">
          <article className={planCard}>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              Free
            </p>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-black">£0</span>
              <span className="pb-2 text-sm font-semibold text-[var(--text-secondary)]">
                / month
              </span>
            </div>

            <ul className="mt-7 space-y-2.5 text-[13px] font-bold leading-6 text-[var(--text-secondary)]">
              <li>30 trades/month</li>
              <li>Core journaling</li>
              <li>Basic analytics</li>
              <li>Screenshot support</li>
              <li>Basic customization</li>
            </ul>

            <div className="mt-auto pt-10">
              <button
                type="button"
                onClick={startFree}
                disabled={loadingPlan !== null}
                className="w-full rounded-2xl bg-[#efeee9] px-6 py-3.5 text-sm font-bold text-[var(--accent)] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingPlan === "FREE" ? "Starting" : "Start Free"}
              </button>
            </div>
          </article>

          <article className={`${planCard} border-[var(--gold)]`}>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--gold)]">
              Expert
            </p>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-black">£23</span>
              <span className="pb-2 text-sm font-semibold text-[var(--text-secondary)]">
                / month
              </span>
            </div>

            <ul className="mt-7 space-y-2.5 text-[13px] font-bold leading-6 text-[var(--text-secondary)]">
              <li>Unlimited trades</li>
              <li>Unlimited screenshots</li>
              <li>Environment Edge</li>
              <li>Performance Insights</li>
              <li>Consistency Intelligence</li>
              <li>Psychology Tracking</li>
              <li>Advanced analytics</li>
              <li>Unlimited customization</li>
            </ul>

            <div className="mt-auto pt-10">
              <button
                type="button"
                onClick={startExpert}
                disabled={loadingPlan !== null}
                className="w-full rounded-2xl bg-[var(--accent)] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(110,17,17,0.18)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingPlan === "EXPERT" ? "Opening checkout" : "Start Expert"}
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}