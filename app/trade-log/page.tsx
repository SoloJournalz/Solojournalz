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
  checklist: Object.fromEntries(
    Object.entries(settings.checklist || {}).slice(0, PLANS.FREE.checklistItems),
  ),
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
    <main className="h-[100dvh] overflow-hidden bg-[var(--background)] text-[var(--text-primary)]">
      <Navbar hasUnsavedChanges={hasUnsavedChanges} />

      <section className="mx-auto flex h-[calc(100dvh-64px)] max-w-5xl flex-col gap-3 px-3 py-3 sm:px-5 lg:h-[calc(100dvh-72px)] lg:py-4">
        <div className="shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
            Phase 1 · 30% Setup
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            Fast Trade Log
          </h1>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)] sm:text-sm">
            Capture the setup quickly. Execution and final review happen in Trade Review.
          </p>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="min-h-0">
            <TradeDetailsForm
              form={form}
              settings={settings}
              isEditMode={false}
              mode="capture"
              onReset={resetTradeLog}
              updateForm={updateForm}
              updateNumber={updateNumber}
            />
          </div>

          <div className="min-h-0 space-y-3">
            <TradeChecklist
              checklist={form.checklist}
              onToggle={toggleChecklist}
              limitLabel={`${Object.keys(form.checklist).length}/${PLANS[currentPlan].checklistItems}`}
            />

            {saveError && (
              <div className="rounded-2xl border border-[var(--border)] bg-[#f8f6f2] p-3 text-xs font-semibold text-[var(--accent)] shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:text-sm">
                {saveError}
              </div>
            )}

            {savedTradeId ? (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <h2 className="text-lg font-bold tracking-tight">Trade captured.</h2>
                <p className="mt-1 text-xs font-medium text-[var(--text-secondary)] sm:text-sm">
                  Saved at 30% completion.
                </p>

                <div className="mt-3 grid gap-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/trade-review?trade=${savedTradeId}&phase=2`)}
                    className="rounded-2xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(110,17,17,0.18)]"
                  >
                    Continue to Phase 2
                  </button>

                  <button
                    type="button"
                    onClick={resetTradeLog}
                    className="rounded-2xl bg-[#efeee9] px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)]"
                  >
                    Log Another Trade
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
          </div>
        </div>
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
