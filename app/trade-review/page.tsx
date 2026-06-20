"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Navbar from "@/app/components/layout/navbar";
import PageLoading from "@/app/components/layout/page-loading";

import { supabase } from "@/lib/supabase/client";
import { PLANS, PlanKey } from "@/lib/plans";
import type { TradeFormData, TradeProgressPercent } from "@/types/trade";
import { calculateTradeMetrics } from "@/types/trade";

import TradeReviewTradeList from "./components/TradeReviewTradeList";
import PreTradeChecklistCard from "./components/PreTradeChecklistCard";
import TradeReviewPhaseHeader from "./components/TradeReviewPhaseHeader";
import TradeDetailsForm from "../trade-log/components/TradeDetailsForm";
import TradeNotes from "../trade-log/components/TradeNotes";
import PsychologyPanel from "../trade-log/components/PsychologyPanel";

type Trade = {
  id: string;
  environment: "LIVE" | "TESTING" | "BACKTESTING" | "CHALLENGE" | null;
  trade_date: string;
  entry_time: string | null;
  pair: string;
  strategy: string | null;
  trade_type: string | null;
  direction: "BUY" | "SELL" | null;
  entry_price: number | null;
  position_size: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  exit_price: number | null;
  risk_percent: number | null;
  rr: number | null;
  pnl: number | null;
  result: "WIN" | "LOSS" | "BE" | null;
  notes: string | null;
  checklist: Record<string, boolean> | null;
  emotions: string[] | null;
  progress_percent: TradeProgressPercent | null;
  created_at: string;
};

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
  checklist: {
    a_plus_setup: true,
    htf_bias_confirmed: false,
    rr_greater_than_2: false,
  },
  notes_template: "",
};

const toInputValue = (value: number | null | undefined) =>
  value === null || value === undefined ? 0 : Number(value);

const limitChecklistForPlan = (
  checklist: Record<string, boolean>,
  plan: PlanKey,
) =>
  Object.fromEntries(
    Object.entries(checklist).slice(0, PLANS[plan].checklistItems),
  );

const getProgress = (trade: Trade | null | undefined): TradeProgressPercent => {
  if (trade?.progress_percent === 100 || trade?.progress_percent === 60) {
    return trade.progress_percent;
  }

  return 30;
};

const createFormFromTrade = (
  trade: Trade,
  settings: UserTradeSettings,
  plan: PlanKey,
): TradeFormData => ({
  trade_date: trade.trade_date,
  entry_time: trade.entry_time || "",
  environment: (trade.environment || "BACKTESTING") as TradeFormData["environment"],
  pair: trade.pair || settings.pairs[0] || "EUR/USD",
  strategy: trade.strategy || settings.strategies[0] || "Breakout",
  trade_type: trade.trade_type || settings.trade_types[0] || "Scalp",
  direction: trade.direction || "BUY",
  entry_price: toInputValue(trade.entry_price),
  position_size: toInputValue(trade.position_size),
  stop_loss: toInputValue(trade.stop_loss),
  take_profit: toInputValue(trade.take_profit),
  exit_price: toInputValue(trade.exit_price),
  risk_percent: toInputValue(trade.risk_percent),
  rr: toInputValue(trade.rr),
  pnl: toInputValue(trade.pnl),
  result: trade.result || "BE",
  notes: trade.notes || settings.notes_template || "",
  checklist: limitChecklistForPlan(
    trade.checklist || settings.checklist || fallbackSettings.checklist,
    plan,
  ),
  emotions: PLANS[plan].psychologyTracking
    ? trade.emotions || [settings.emotions[0] || "focused"]
    : [],
  progress_percent: getProgress(trade),
});

const mergeTradeUpdate = (trade: Trade, values: Partial<Trade>): Trade => ({
  ...trade,
  ...values,
});

function TradeReviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tradeParam = searchParams.get("trade");

  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [form, setForm] = useState<TradeFormData | null>(null);
  const [settings, setSettings] = useState<UserTradeSettings>(fallbackSettings);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Newest First");
  const [environmentFilter, setEnvironmentFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanKey>("FREE");
  const [activePhase, setActivePhase] = useState<"PHASE_2" | "PHASE_3">("PHASE_2");

  const fetchTrades = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
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
      alert(settingsError.message);
      setLoading(false);
      return;
    }

    if (settingsData?.setup_completed !== true) {
      router.replace("/setup");
      setLoading(false);
      return;
    }

    const loadedSettings: UserTradeSettings = settingsData
      ? {
          environments: settingsData.environments || fallbackSettings.environments,
          strategies: settingsData.strategies || fallbackSettings.strategies,
          pairs: settingsData.pairs || fallbackSettings.pairs,
          trade_types: settingsData.trade_types || fallbackSettings.trade_types,
          emotions: settingsData.emotions || fallbackSettings.emotions,
          checklist: settingsData.checklist || fallbackSettings.checklist,
          notes_template: settingsData.notes_template || "",
        }
      : fallbackSettings;

    setSettings(loadedSettings);

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const safeTrades = (data || []) as Trade[];
    setTrades(safeTrades);

    const selected =
      safeTrades.find((trade) => trade.id === tradeParam) || safeTrades[0] || null;

    setSelectedTrade(selected);
    setForm(selected ? createFormFromTrade(selected, loadedSettings, resolvedPlan) : null);
    setActivePhase(getProgress(selected) >= 60 ? "PHASE_3" : "PHASE_2");


    setLoading(false);
  };

  useEffect(() => {
    fetchTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectTrade = async (trade: Trade) => {
    const scrollY = window.scrollY;

    setSelectedTrade(trade);
    setForm(createFormFromTrade(trade, settings, currentPlan));
    setActivePhase(getProgress(trade) >= 60 ? "PHASE_3" : "PHASE_2");
    window.history.replaceState(null, "", `/trade-review?trade=${trade.id}`);
    requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: "auto" }));
  };

  const filteredTrades = useMemo(() => {
    let result = [...(trades || [])];

    if (environmentFilter !== "All") {
      result = result.filter(
        (trade) => trade.environment === environmentFilter,
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      result = result.filter(
        (trade) =>
          trade.pair?.toLowerCase().includes(q) ||
          trade.strategy?.toLowerCase().includes(q) ||
          trade.result?.toLowerCase().includes(q) ||
          trade.environment?.toLowerCase().includes(q),
      );
    }

    if (filter === "Oldest First") {
      result.sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime(),
      );
    }

    if (filter === "Wins") result = result.filter((trade) => trade.result === "WIN");
    if (filter === "Losses") result = result.filter((trade) => trade.result === "LOSS");
    if (filter === "Break Even") result = result.filter((trade) => trade.result === "BE");

    return result;
  }, [trades, search, filter, environmentFilter]);

  const updateForm = <K extends keyof TradeFormData>(
    key: K,
    value: TradeFormData[K],
  ) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateNumber = (key: keyof TradeFormData, value: string) => {
    setForm((current) => {
      if (!current) return current;

      const nextValue = value === "" || value === "." ? 0 : Number(value);
      const nextForm = {
        ...current,
        [key]: Number.isFinite(nextValue) ? nextValue : 0,
      };
      const metrics = calculateTradeMetrics(nextForm);

      return {
        ...nextForm,
        risk_percent: metrics.risk_percent,
        rr: metrics.rr,
      };
    });
  };

  const toggleChecklist = (key: string) => {
    setForm((current) =>
      current
        ? {
            ...current,
            checklist: {
              ...current.checklist,
              [key]: !current.checklist[key],
            },
          }
        : current,
    );
  };

  const setEmotion = (emotion: string) => {
    setForm((current) => (current ? { ...current, emotions: [emotion] } : current));
  };

  const savePhase2 = async () => {
    if (!selectedTrade || !form) return;
    setSaving(true);

    const metrics = calculateTradeMetrics(form);

    const { error } = await supabase
      .from("trades")
      .update({
        stop_loss: form.stop_loss || null,
        take_profit: form.take_profit || null,
        position_size: form.position_size || null,
        exit_price: form.exit_price || null,
        pnl: form.pnl ?? 0,
        risk_percent: metrics.risk_percent,
        rr: metrics.rr,
        result: form.result,
        checklist: limitChecklistForPlan(form.checklist, currentPlan),
        emotions: PLANS[currentPlan].psychologyTracking ? form.emotions : [],
        notes: form.notes || null,
        progress_percent: getProgress(selectedTrade) >= 60 ? getProgress(selectedTrade) : 60,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedTrade.id);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    const nextProgress = getProgress(selectedTrade) >= 60 ? getProgress(selectedTrade) : 60;
    const updatedTrade = mergeTradeUpdate(selectedTrade, {
      stop_loss: form.stop_loss || null,
      take_profit: form.take_profit || null,
      position_size: form.position_size || null,
      exit_price: form.exit_price || null,
      pnl: form.pnl ?? 0,
      risk_percent: metrics.risk_percent,
      rr: metrics.rr,
      result: form.result,
      checklist: limitChecklistForPlan(form.checklist, currentPlan),
      emotions: PLANS[currentPlan].psychologyTracking ? form.emotions : [],
      notes: form.notes || null,
      progress_percent: nextProgress,
    });

    setSelectedTrade(updatedTrade);
    setTrades((current) =>
      current.map((trade) => (trade.id === updatedTrade.id ? updatedTrade : trade)),
    );
    setForm(createFormFromTrade(updatedTrade, settings, currentPlan));
    setActivePhase("PHASE_3");
    setSaving(false);
  };

  const savePhase3 = async () => {
    if (!selectedTrade || !form) return;
    setSaving(true);

    const { error } = await supabase
      .from("trades")
      .update({
        checklist: limitChecklistForPlan(form.checklist, currentPlan),
        emotions: PLANS[currentPlan].psychologyTracking ? form.emotions : [],
        notes: form.notes || null,
        progress_percent: 100,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedTrade.id);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    const updatedTrade = mergeTradeUpdate(selectedTrade, {
      checklist: limitChecklistForPlan(form.checklist, currentPlan),
      emotions: PLANS[currentPlan].psychologyTracking ? form.emotions : [],
      notes: form.notes || null,
      progress_percent: 100,
    });

    setSelectedTrade(updatedTrade);
    setTrades((current) =>
      current.map((trade) => (trade.id === updatedTrade.id ? updatedTrade : trade)),
    );
    setForm(createFormFromTrade(updatedTrade, settings, currentPlan));
    setSaving(false);
  };

  const deleteSelectedTrade = async () => {
    if (!selectedTrade) return;
    if (!confirm("Delete this trade?")) return;

    const { error } = await supabase
      .from("trades")
      .delete()
      .eq("id", selectedTrade.id);

    if (error) {
      alert(error.message);
      return;
    }

    await fetchTrades();
  };

  const selectedProgress = getProgress(selectedTrade);


  if (loading) {
    return <PageLoading label="Loading Review Workspace" workspace />;
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--gold)]">Trade Review</p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">Trade Review</h1>

            <p className="mt-3 max-w-2xl text-base text-[var(--text-secondary)]">
              Select a trade, finish execution, then complete the review.
            </p>
          </div>

          <span className="w-fit rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--gold)]">
            {selectedTrade ? `${selectedProgress}% complete` : "Select trade"}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-4 md:sticky md:top-[88px] md:self-start">
            <TradeReviewTradeList
              trades={filteredTrades || []}
              selectedTradeId={selectedTrade?.id}
              loading={loading}
              search={search}
              filter={filter}
              environmentFilter={environmentFilter}
              onSearchChange={setSearch}
              onFilterChange={setFilter}
              onEnvironmentFilterChange={setEnvironmentFilter}
              onSelectTrade={(trade) => selectTrade(trade as Trade)}
              onDeleteTrade={deleteSelectedTrade}
            />

            <PreTradeChecklistCard checklist={form?.checklist} onToggle={toggleChecklist} />
          </aside>

          <section className="space-y-4">
            {!selectedTrade || !form ? (
              <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-[var(--border)] bg-[#efeee9] text-sm font-semibold text-[var(--text-secondary)] md:h-full md:min-h-0">
                Select a trade to review.
              </div>
            ) : (
              <div className="flex flex-col">
                <TradeReviewPhaseHeader
                  activePhase={activePhase}
                  selectedProgress={selectedProgress}
                  onPhaseChange={setActivePhase}
                />

                <div className="mt-3 flex-1">
                  {activePhase === "PHASE_2" ? (
                    <div className="space-y-3">
                      <TradeDetailsForm
                        form={form}
                        settings={settings}
                        isEditMode
                        mode="execution"
                        onReset={() => setForm(createFormFromTrade(selectedTrade, settings, currentPlan))}
                        updateForm={updateForm}
                        updateNumber={updateNumber}
                      />

                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={savePhase2}
                          className="w-full rounded-2xl bg-[var(--accent)] px-8 py-3 font-semibold text-white shadow-[0_10px_25px_rgba(110,17,17,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(110,17,17,0.24)] disabled:opacity-60 sm:w-auto"
                        >
                          {saving ? "Saving..." : selectedProgress >= 60 ? "Save Changes" : "Save Phase 2"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {PLANS[currentPlan].psychologyTracking && (
                        <PsychologyPanel
                          emotions={settings.emotions}
                          selectedEmotions={form.emotions}
                          onSelect={setEmotion}
                        />
                      )}

                      <TradeNotes
                        value={form.notes ?? ""}
                        onChange={(value) => updateForm("notes", value)}
                      />

                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={savePhase3}
                          className="w-full rounded-2xl bg-[var(--accent)] px-8 py-3 font-semibold text-white shadow-[0_10px_25px_rgba(110,17,17,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(110,17,17,0.24)] disabled:opacity-60 sm:w-auto"
                        >
                          {saving ? "Saving..." : selectedProgress >= 100 ? "Save Changes" : "Complete Trade"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default function TradeReviewPage() {
  return (
    <Suspense fallback={<PageLoading label="Loading Review Workspace" workspace />}>
      <TradeReviewPageContent />
    </Suspense>
  );
}
