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
import TradeChecklist from "./components/TradeChecklist";
import PsychologyPanel from "./components/PsychologyPanel";

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

const createInitialForm = (
  settings: UserTradeSettings = fallbackSettings,
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
  checklist: settings.checklist || {},
  emotions: [],
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
      setForm(createInitialForm(loadedSettings));
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
    setForm(createInitialForm(settings));
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

  const toggleChecklist = (key: keyof TradeFormData["checklist"]) => {
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
      checklist: form.checklist,
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
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <Navbar hasUnsavedChanges={hasUnsavedChanges} />

      <section className="mx-auto max-w-6xl px-4 py-4 sm:px-5 md:py-5">
        <div className="mb-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                Phase 1 · 30% Capture
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                Fast Trade Log
              </h1>
              <p className="mt-1 text-sm font-medium text-[var(--text-secondary)] md:text-[13px]">
                Capture the setup quickly. Phase 2 execution and Phase 3 review happen in Trade Review.
              </p>
            </div>
            <span className="w-fit rounded-full bg-[#efeee9] px-3 py-1 text-xs font-black text-[var(--text-secondary)]">
              30% setup
            </span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#efeee9]">
            <div className="h-full w-[30%] rounded-full bg-[var(--accent)]" />
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
          <TradeDetailsForm
            form={form}
            settings={settings}
            isEditMode={false}
            mode="capture"
            onReset={resetTradeLog}
            updateForm={updateForm}
            updateNumber={updateNumber}
          />

          <div className="space-y-3">
            <TradeChecklist
              checklist={form.checklist}
              onToggle={toggleChecklist}
              limitLabel={`${Object.keys(form.checklist).length}/${PLANS[currentPlan].checklistItems}`}
            />

            {PLANS[currentPlan].psychologyTracking ? (
              <PsychologyPanel
                emotions={settings.emotions}
                selectedEmotions={form.emotions}
                onSelect={setEmotion}
              />
            ) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[#efeee9] p-4 text-sm font-semibold text-[var(--text-secondary)]">
                Psychology capture unlocks with Expert. Your checklist is still saved with this setup.
              </div>
            )}
          </div>
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
