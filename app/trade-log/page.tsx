"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/layout/navbar";
import PageLoading from "@/app/components/layout/page-loading";
import { supabase } from "@/lib/supabase/client";
import { PLANS, PlanKey } from "@/lib/plans";
import { canCreateTrade, getCreatedAtForNewTrade, getCurrentUserPlan } from "@/lib/usage";
import type { TradeFormData } from "@/types/trade";

import TradeDetailsForm from "./components/TradeDetailsForm";
import SaveTradeBar from "./components/SaveTradeBar";

type UserTradeSettings = {
  environments: string[];
  strategies: string[];
  pairs: string[];
  trade_types: string[];
  emotions: string[];
  checklist: Record<string, boolean>;
  notes_template: string;
};

const fallbackSettings: UserTradeSettings = {
  environments: ["LIVE", "TESTING", "BACKTESTING", "CHALLENGE"],
  strategies: ["Breakout", "Reversal", "Continuation"],
  pairs: ["EUR/USD", "GBP/USD", "XAU/USD"],
  trade_types: ["Scalp", "Day Trade", "Swing"],
  emotions: ["calm", "focused", "anxious", "revenge", "tilt"],
  checklist: {},
  notes_template: "",
};

const getToday = () => new Date().toISOString().slice(0, 10);

const getCurrentTime = () => {
  const now = new Date();

  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
};

const limitChecklistForPlan = (
  checklist: Record<string, boolean>,
  plan: PlanKey,
) =>
  Object.fromEntries(
    Object.entries(checklist).slice(0, PLANS[plan].checklistItems),
  );

const createInitialForm = (
  settings: UserTradeSettings = fallbackSettings,
  plan: PlanKey = "FREE",
): TradeFormData => ({
  trade_date: getToday(),
  entry_time: getCurrentTime(),
  environment: (settings.environments[0] ||
    "BACKTESTING") as TradeFormData["environment"],
  pair: settings.pairs[0] || "EUR/USD",
  strategy: settings.strategies[0] || "Breakout",
  trade_type: settings.trade_types[0] || "Scalp",
  direction: "BUY",
  entry_price: 0,
  position_size: 0,
  stop_loss: 0,
  take_profit: 0,
  exit_price: 0,
  risk_percent: 0,
  rr: 0,
  pnl: 0,
  result: "BE",
  notes: "",
  checklist: limitChecklistForPlan(settings.checklist || {}, plan),
  emotions: PLANS[plan].psychologyTracking
    ? [settings.emotions[0] || "focused"]
    : [],
  progress_percent: 30,
});

function TradeLogPageContent() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<PlanKey>("FREE");
  const [settings, setSettings] = useState<UserTradeSettings>(fallbackSettings);
  const [form, setForm] = useState<TradeFormData>(createInitialForm());
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedTradeId, setSavedTradeId] = useState<string | null>(null);

  const markDirty = () => {
    setHasUnsavedChanges(true);
    setSavedTradeId(null);
  };

  const updateForm = <K extends keyof TradeFormData>(
    key: K,
    value: TradeFormData[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    markDirty();
  };

  useEffect(() => {
    const loadTradeLog = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        setLoading(false);
        return;
      }

      const { data: planData } = await supabase
        .from("user_plans")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!planData) {
        router.replace("/select-plan");
        setLoading(false);
        return;
      }

      const resolvedPlan: PlanKey =
        planData.plan === "EXPERT" ? "EXPERT" : "FREE";

      setCurrentPlan(resolvedPlan);

      const { data: settingsData, error: settingsError } = await supabase
        .from("user_trade_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (settingsError) {
        console.error(settingsError);
      }

      if (settingsData?.setup_completed !== true) {
        router.replace("/setup");
        setLoading(false);
        return;
      }

      const loadedSettings: UserTradeSettings = settingsData
        ? {
            environments:
              settingsData.environments || fallbackSettings.environments,
            strategies: settingsData.strategies || fallbackSettings.strategies,
            pairs: settingsData.pairs || fallbackSettings.pairs,
            trade_types:
              settingsData.trade_types || fallbackSettings.trade_types,
            emotions: settingsData.emotions || fallbackSettings.emotions,
            checklist: settingsData.checklist || fallbackSettings.checklist,
            notes_template: settingsData.notes_template || "",
          }
        : fallbackSettings;

      setSettings(loadedSettings);
      setForm(createInitialForm(loadedSettings, resolvedPlan));
      setHasUnsavedChanges(false);
      setSavedTradeId(null);
      setLoading(false);
    };

    loadTradeLog();
  }, [router]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const resetTradeLog = () => {
    setForm(createInitialForm(settings, currentPlan));
    setHasUnsavedChanges(false);
    setSaveError("");
    setSavedTradeId(null);
  };

  const updateNumber = (key: keyof TradeFormData, value: string) => {
    setForm((current) => {
      const nextValue = value === "" || value === "." ? 0 : Number(value);

      return {
        ...current,
        [key]: Number.isFinite(nextValue) ? nextValue : 0,
      };
    });

    markDirty();
  };

  const toggleChecklist = (key: string) => {
    setForm((current) => ({
      ...current,
      checklist: {
        ...current.checklist,
        [key]: !current.checklist[key],
      },
    }));

    markDirty();
  };

  const setEmotion = (emotion: string) => {
    setForm((current) => ({ ...current, emotions: [emotion] }));
    markDirty();
  };

  const handleSaveTrade = async () => {
    setSaveError("");
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Not logged in. Please sign in again.");
      setSaving(false);
      return;
    }

    let latestPlan: PlanKey = currentPlan;

    try {
      latestPlan = await getCurrentUserPlan(user.id);
      setCurrentPlan(latestPlan);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not check your plan.";
      setSaveError(message);
      setSaving(false);
      return;
    }

    try {
      const usage = await canCreateTrade(user.id, latestPlan);

      if (!usage.allowed) {
        setSaveError(
          usage.message ||
            "You’ve reached your monthly trade limit. Upgrade to Expert for unlimited trades.",
        );
        setSaving(false);
        return;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not check your monthly trade usage.";
      setSaveError(message);
      setSaving(false);
      return;
    }

    const payload = {
      user_id: user.id,
      trade_date: form.trade_date,
      entry_time: form.entry_time || null,
      environment: form.environment,
      pair: form.pair,
      strategy: form.strategy || null,
      trade_type: form.trade_type || null,
      direction: form.direction,
      entry_price: form.entry_price || null,
      checklist: limitChecklistForPlan(form.checklist, latestPlan),
      emotions: PLANS[latestPlan].psychologyTracking ? form.emotions : [],
      progress_percent: 30,
    };

    const simulatedCreatedAt = await getCreatedAtForNewTrade();

    const insertPayload = simulatedCreatedAt
      ? { ...payload, created_at: simulatedCreatedAt }
      : payload;

    const { data: savedTrade, error } = await supabase
      .from("trades")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error || !savedTrade) {
      alert(error?.message || "Failed to save trade.");
      setSaving(false);
      return;
    }

    setSavedTradeId(savedTrade.id);
    setSaving(false);
    setHasUnsavedChanges(false);
  };

  if (loading) {
    return <PageLoading label="Loading Trade Log" workspace />;
  }

  return (
    <main className="min-h-screen overflow-y-auto bg-[var(--background)] text-[var(--text-primary)]">
      <Navbar hasUnsavedChanges={hasUnsavedChanges} />

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--gold)]">Trade Log</p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">Trade Log</h1>

            <p className="mt-3 max-w-2xl text-base text-[var(--text-secondary)]">
              Capture the setup quickly. Execution, screenshots, and final review happen in Trade Review.
            </p>
          </div>

          <span className="w-fit rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-2 text-xs font-bold tracking-wide text-[var(--gold)]">
            PHASE 1 · 30% CAPTURE
          </span>
        </div>

        <TradeDetailsForm
          form={form}
          settings={settings}
          isEditMode={false}
          mode="capture"
          onReset={resetTradeLog}
          updateForm={updateForm}
          updateNumber={updateNumber}
        />

        <div className="mx-auto mt-3 grid max-w-5xl gap-3">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                  Phase 1 checklist
                </p>
                <h2 className="mt-1 text-lg font-bold tracking-tight">Pre-trade checklist</h2>
              </div>
              <span className="rounded-full bg-[#efeee9] px-3 py-1 text-xs font-black text-[var(--text-secondary)]">
                {Object.values(form.checklist).filter(Boolean).length}/{Object.keys(form.checklist).length}
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {Object.entries(form.checklist).map(([key, checked]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleChecklist(key)}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[#efeee9] px-3 py-2.5 text-left text-sm font-bold transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
                >
                  <span
                    className={`h-5 w-5 shrink-0 rounded-md border transition ${
                      checked
                        ? "border-[var(--accent)] bg-[var(--accent)]"
                        : "border-[#d8d5cf] bg-white"
                    }`}
                  />
                  <span>{key.replaceAll("_", " ")}</span>
                </button>
              ))}
            </div>
          </section>

          {PLANS[currentPlan].psychologyTracking ? (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                Expert psychology
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight">Entry emotion</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {settings.emotions.map((emotion) => {
                  const active = form.emotions.includes(emotion);

                  return (
                    <button
                      key={emotion}
                      type="button"
                      onClick={() => setEmotion(emotion)}
                      className={`rounded-full px-3 py-2 text-xs font-black transition hover:-translate-y-0.5 ${
                        active
                          ? "bg-[var(--accent)] text-white shadow-[0_8px_18px_rgba(110,17,17,0.18)]"
                          : "bg-[#efeee9] text-[var(--text-secondary)] hover:text-[var(--accent)]"
                      }`}
                    >
                      {emotion}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>

        {saveError && (
          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[#f8f6f2] p-4 text-sm font-semibold text-[var(--accent)] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            {saveError}
          </div>
        )}

        {savedTradeId ? (
          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <h2 className="text-xl font-bold tracking-tight">Trade captured.</h2>
            <p className="mt-1 text-sm font-medium text-[var(--text-secondary)] md:text-[13px]">
              This trade is saved at 30% completion.
            </p>

            <div className="mt-4 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={resetTradeLog}
                className="rounded-2xl bg-[#efeee9] px-8 py-3 font-semibold text-[var(--text-secondary)] transition hover:-translate-y-0.5 hover:text-[var(--accent)]"
              >
                Go back to Trade Log
              </button>

              <button
                type="button"
                onClick={() => router.push(`/trade-review?trade=${savedTradeId}`)}
                className="rounded-2xl bg-[var(--accent)] px-8 py-3 font-semibold text-white shadow-[0_10px_25px_rgba(110,17,17,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(110,17,17,0.24)]"
              >
                Continue to Review this trade
              </button>
            </div>
          </div>
        ) : (
          <SaveTradeBar
            isEditMode={false}
            saving={saving}
            hasUnsavedChanges={hasUnsavedChanges}
            onCancel={resetTradeLog}
            onSave={handleSaveTrade}
          />
        )}
      </section>
    </main>
  );
}

export default function TradeLogPage() {
  return (
    <Suspense fallback={<PageLoading label="Loading Trade Log" workspace />}>
      <TradeLogPageContent />
    </Suspense>
  );
}
