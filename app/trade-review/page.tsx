"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ClipboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Navbar from "@/app/components/layout/navbar";
import PageLoading from "@/app/components/layout/page-loading";

import { supabase } from "@/lib/supabase/client";
import { PLANS, PlanKey } from "@/lib/plans";
import type { ScreenshotPhase, TradeFormData, TradeProgressPercent } from "@/types/trade";
import { calculateTradeMetrics } from "@/types/trade";

import TradeReviewTradeList from "./components/TradeReviewTradeList";
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

type TradeScreenshot = {
  id: string;
  trade_id: string;
  image_url: string;
  phase: ScreenshotPhase | null;
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

const phaseScreenshotConfig: {
  phase: ScreenshotPhase;
  title: string;
  expertOnly: boolean;
  helper: string;
}[] = [
  {
    phase: "PHASE_2",
    title: "Execution screenshot",
    expertOnly: true,
    helper: "Expert only. Upload or paste the trade management screenshot while the position is active.",
  },
  {
    phase: "PHASE_3",
    title: "Review screenshot",
    expertOnly: false,
    helper: "Free and Expert. Upload or paste the post-trade outcome screenshot before completing the review.",
  },
];

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

const formatPnl = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "P/L N/A";
  const number = Number(value);
  if (number > 0) return `P/L +${number}`;
  return `P/L ${number}`;
};

const mergeTradeUpdate = (trade: Trade, values: Partial<Trade>): Trade => ({
  ...trade,
  ...values,
});

function PreTradeChecklistCard({
  checklist,
  onToggle,
}: {
  checklist?: Record<string, boolean> | null;
  onToggle?: (key: string) => void;
}) {
  const entries = Object.entries(checklist || {});
  const completed = entries.filter(([, checked]) => checked).length;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">Pre-trade checklist</h2>

        <span className="rounded-full bg-[#efeee9] px-3 py-1 text-xs font-black text-[var(--text-secondary)]">
          {entries.length ? `${completed}/${entries.length}` : "N/A"}
        </span>
      </div>

      {entries.length ? (
        <div className="grid gap-2">
          {entries.map(([key, checked]) => (
            <button
              key={key}
              type="button"
              onClick={() => onToggle?.(key)}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[#efeee9] px-3 py-3 text-left text-sm font-bold transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
            >
              <span
                className={`h-5 w-5 shrink-0 rounded-md border transition ${
                  checked
                    ? "border-[var(--accent)] bg-[var(--accent)]"
                    : "border-[#d8d5cf] bg-white"
                }`}
              />
              <span className="capitalize">{key.replaceAll("_", " ")}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-[#efeee9] px-3 py-3 text-sm font-semibold text-[var(--text-secondary)]">
          Select a saved trade to view its checklist.
        </p>
      )}
    </section>
  );
}

function ScreenshotSlot({
  title,
  helper,
  screenshot,
  locked,
  saving,
  onUpload,
  onPaste,
  onDelete,
}: {
  title: string;
  helper: string;
  screenshot?: TradeScreenshot;
  locked: boolean;
  saving: boolean;
  onUpload: (file: File) => void;
  onPaste: (event: ClipboardEvent<HTMLDivElement>) => void;
  onDelete: () => void;
}) {
  const inputId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-upload`;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    onUpload(file);
    event.target.value = "";
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold tracking-tight">{title}</h3>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
            {helper}
          </p>
        </div>

        {locked && (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--accent)]">
            Expert
          </span>
        )}
      </div>

      <div
        tabIndex={locked ? -1 : 0}
        onPaste={locked ? undefined : onPaste}
        className="relative flex h-80 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--border)] bg-white text-center text-sm font-semibold text-[var(--text-secondary)] outline-none transition focus:ring-2 focus:ring-[var(--accent)]/20 md:h-[420px]"
      >
        {screenshot ? (
          <a
            href={screenshot.image_url}
            target="_blank"
            rel="noreferrer"
            className="flex h-full w-full items-center justify-center"
          >
            <img
              src={screenshot.image_url}
              alt={title}
              className="h-full w-full rounded-2xl object-contain"
            />
          </a>
        ) : (
          <span className="px-4">
            {locked
              ? "Upgrade to add this phase."
              : "Paste a snip here, or upload a screenshot."}
          </span>
        )}

        {!locked && !screenshot && (
          <label
            htmlFor={inputId}
            className="absolute bottom-4 left-4 cursor-pointer rounded-full bg-[var(--accent)] px-5 py-3 text-xs font-bold text-white shadow-[0_10px_25px_rgba(110,17,17,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(110,17,17,0.26)]"
          >
            {saving ? "Uploading..." : "Upload Screenshot"}
            <input
              id={inputId}
              type="file"
              accept="image/*"
              disabled={saving}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}

        {!locked && screenshot && (
          <button
            type="button"
            disabled={saving}
            onClick={onDelete}
            className="absolute bottom-4 right-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-[var(--accent)] shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:bg-[var(--accent)] hover:text-white disabled:opacity-60"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}


function TradeReviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tradeParam = searchParams.get("trade");

  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [form, setForm] = useState<TradeFormData | null>(null);
  const [screenshots, setScreenshots] = useState<TradeScreenshot[]>([]);
  const [settings, setSettings] = useState<UserTradeSettings>(fallbackSettings);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Newest First");
  const [environmentFilter, setEnvironmentFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [screenshotSaving, setScreenshotSaving] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanKey>("FREE");
  const [activePhase, setActivePhase] = useState<"PHASE_2" | "PHASE_3">("PHASE_2");

  const fetchScreenshots = async (tradeId: string) => {
    const { data, error } = await supabase
      .from("trade_screenshots")
      .select("*")
      .eq("trade_id", tradeId)
      .order("created_at", { ascending: true });

    if (error) {
      setScreenshots([]);
      return;
    }

    setScreenshots((data || []) as TradeScreenshot[]);
  };

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

    if (selected) {
      await fetchScreenshots(selected.id);
    } else {
      setScreenshots([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectTrade = async (trade: Trade) => {
    setSelectedTrade(trade);
    setForm(createFormFromTrade(trade, settings, currentPlan));
    setActivePhase(getProgress(trade) >= 60 ? "PHASE_3" : "PHASE_2");
    window.history.replaceState(null, "", `/trade-review?trade=${trade.id}`);
    await fetchScreenshots(trade.id);
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

    setScreenshots([]);
    await fetchTrades();
  };

  const uploadScreenshot = async (phase: ScreenshotPhase, file: File | Blob) => {
    if (!selectedTrade) return;
    setScreenshotSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Not logged in. Please sign in again.");
      setScreenshotSaving(false);
      return;
    }

    try {
      const existing = screenshots.find((shot) => shot.phase === phase);
      if (existing) {
        await supabase.from("trade_screenshots").delete().eq("id", existing.id);
      }

      const contentType = file.type || "image/png";
      const extension = contentType.includes("png") ? "png" : "jpg";
      const filePath = `${user.id}/${selectedTrade.id}/${phase}-${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("trade-screenshots")
        .upload(filePath, file, {
          contentType,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("trade-screenshots").getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("trade_screenshots").insert({
        trade_id: selectedTrade.id,
        image_url: publicUrl,
        phase,
      });

      if (dbError) throw dbError;
      await fetchScreenshots(selectedTrade.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Screenshot upload failed.");
    }

    setScreenshotSaving(false);
  };

  const handlePasteScreenshot = async (
    phase: ScreenshotPhase,
    event: ClipboardEvent<HTMLDivElement>,
  ) => {
    const items = event.clipboardData.items;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (!file) return;

        await uploadScreenshot(phase, file);
        return;
      }
    }
  };

  const deleteScreenshot = async (phase: ScreenshotPhase) => {
    const screenshot = screenshots.find((shot) => shot.phase === phase);
    if (!screenshot) return;

    const { error } = await supabase
      .from("trade_screenshots")
      .delete()
      .eq("id", screenshot.id);

    if (error) {
      alert(error.message);
      return;
    }

    if (selectedTrade) await fetchScreenshots(selectedTrade.id);
  };

  const selectedProgress = getProgress(selectedTrade);
  const screenshotsByPhase = Object.fromEntries(
    screenshots.map((screenshot) => [screenshot.phase || "PHASE_3", screenshot]),
  ) as Partial<Record<ScreenshotPhase, TradeScreenshot>>;

  if (loading) {
    return <PageLoading label="Loading Review Workspace" workspace />;
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--gold)]">Trade Review Workspace</p>

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
                <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                      {activePhase === "PHASE_2" ? "Phase 2 · Execution" : "Phase 3 · Review"}
                    </p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight md:text-2xl">
                      {activePhase === "PHASE_2" ? "Execution details" : "Review and reflection"}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 rounded-2xl bg-[#efeee9] p-1 text-sm font-black text-[var(--text-secondary)] lg:w-[340px]">
                    <button
                      type="button"
                      onClick={() => setActivePhase("PHASE_2")}
                      className={`rounded-xl px-4 py-2.5 transition hover:-translate-y-0.5 ${
                        activePhase === "PHASE_2"
                          ? "bg-[var(--accent)] text-white shadow-[0_8px_20px_rgba(110,17,17,0.18)]"
                          : "hover:text-[var(--accent)]"
                      }`}
                    >
                      Phase 2
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePhase("PHASE_3")}
                      disabled={selectedProgress < 60}
                      className={`rounded-xl px-4 py-2.5 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 ${
                        activePhase === "PHASE_3"
                          ? "bg-[var(--accent)] text-white shadow-[0_8px_20px_rgba(110,17,17,0.18)]"
                          : "hover:text-[var(--accent)]"
                      }`}
                    >
                      Phase 3
                    </button>
                  </div>
                </div>

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

                      {currentPlan === "EXPERT" ? (
                        <ScreenshotSlot
                          title={phaseScreenshotConfig[0].title}
                          helper={phaseScreenshotConfig[0].helper}
                          screenshot={screenshotsByPhase.PHASE_2}
                          locked={false}
                          saving={screenshotSaving}
                          onUpload={(file) => uploadScreenshot("PHASE_2", file)}
                          onPaste={(event) => handlePasteScreenshot("PHASE_2", event)}
                          onDelete={() => deleteScreenshot("PHASE_2")}
                        />
                      ) : (
                        <div className="rounded-2xl border border-[var(--border)] bg-[#efeee9] p-5 text-sm font-semibold text-[var(--text-secondary)]">
                          Upgrade to Expert to unlock Phase 2 execution screenshots. Free users keep review screenshot upload/paste in Phase 3.
                        </div>
                      )}

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

                      <ScreenshotSlot
                        title={phaseScreenshotConfig[1].title}
                        helper={phaseScreenshotConfig[1].helper}
                        screenshot={screenshotsByPhase.PHASE_3}
                        locked={false}
                        saving={screenshotSaving}
                        onUpload={(file) => uploadScreenshot("PHASE_3", file)}
                        onPaste={(event) => handlePasteScreenshot("PHASE_3", event)}
                        onDelete={() => deleteScreenshot("PHASE_3")}
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
