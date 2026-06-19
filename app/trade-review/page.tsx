"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { ClipboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Navbar from "@/app/components/layout/navbar";
import PageLoading from "@/app/components/layout/page-loading";

import { supabase } from "@/lib/supabase/client";
import { PLANS, PlanKey } from "@/lib/plans";
import type { ScreenshotPhase, TradeFormData, TradeProgressPercent } from "@/types/trade";
import { calculateTradeMetrics } from "@/types/trade";

import TradeReviewTradeList from "./components/TradeReviewTradeList";
import TradeDetailsForm from "../trade-log/components/TradeDetailsForm";
import TradeChecklist from "../trade-log/components/TradeChecklist";
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
    phase: "PHASE_1",
    title: "Setup screenshot",
    expertOnly: true,
    helper: "Pre-entry context before the trade triggers.",
  },
  {
    phase: "PHASE_2",
    title: "Execution screenshot",
    expertOnly: true,
    helper: "Trade management while the position is active.",
  },
  {
    phase: "PHASE_3",
    title: "Review screenshot",
    expertOnly: false,
    helper: "Post-trade outcome and reflection.",
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

const getProgressLabel = (progress: TradeProgressPercent) => {
  if (progress === 100) return "Phase 3 · 100% Reviewed";
  if (progress === 60) return "Phase 2 · 60% Execution Added";
  return "Phase 1 · 30% Captured";
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

function ScreenshotSlot({
  title,
  helper,
  screenshot,
  locked,
  saving,
  onCapture,
  onPaste,
  onDelete,
}: {
  title: string;
  helper: string;
  screenshot?: TradeScreenshot;
  locked: boolean;
  saving: boolean;
  onCapture: () => void;
  onPaste: (event: ClipboardEvent<HTMLDivElement>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[#efeee9] p-4">
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
        className="relative flex h-52 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--border)] bg-white text-sm font-semibold text-[var(--text-secondary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
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
          <span>{locked ? "Upgrade to add this phase." : "Paste a snip or capture screenshot."}</span>
        )}

        {!locked && !screenshot && (
          <button
            type="button"
            disabled={saving}
            onClick={onCapture}
            className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-xl font-semibold text-white shadow-[0_10px_25px_rgba(110,17,17,0.2)] disabled:opacity-60"
            aria-label={`Add ${title}`}
          >
            +
          </button>
        )}

        {!locked && screenshot && (
          <button
            type="button"
            disabled={saving}
            onClick={onDelete}
            className="absolute bottom-4 right-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-[var(--accent)] shadow-[0_8px_20px_rgba(0,0,0,0.08)] disabled:opacity-60"
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

    if (selected) {
      await fetchScreenshots(selected.id);
    } else {
      setScreenshots([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTrades();
  }, [tradeParam]);

  const selectTrade = async (trade: Trade) => {
    setSelectedTrade(trade);
    setForm(createFormFromTrade(trade, settings, currentPlan));
    router.replace(`/trade-review?trade=${trade.id}`);
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

  const toggleChecklist = (key: keyof TradeFormData["checklist"]) => {
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
        progress_percent: 60,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedTrade.id);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    await fetchTrades();
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

    await fetchTrades();
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

  const uploadScreenshot = async (phase: ScreenshotPhase, imageUrl: string) => {
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

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const filePath = `${user.id}/${selectedTrade.id}/${phase}-${crypto.randomUUID()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("trade-screenshots")
        .upload(filePath, blob, {
          contentType: "image/jpeg",
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

  const captureScreenshot = async (phase: ScreenshotPhase) => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not capture screenshot.");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach((track) => track.stop());

      await uploadScreenshot(phase, canvas.toDataURL("image/jpeg", 0.85));
    } catch {
      alert("Screenshot capture cancelled or blocked.");
    }
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

        await uploadScreenshot(phase, URL.createObjectURL(file));
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

      <section className="mx-auto max-w-7xl px-5 py-5">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.85fr_1.35fr]">
          <div className="space-y-4">
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

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                    Review Workspace
                  </p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight">
                    {selectedTrade ? getProgressLabel(selectedProgress) : "No trade selected"}
                  </h2>
                </div>

                <span className="rounded-full bg-[#efeee9] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
                  {selectedTrade ? `${selectedProgress}%` : "0%"}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#efeee9]">
                <div
                  className="h-full rounded-full bg-[var(--accent)]"
                  style={{ width: `${selectedTrade ? selectedProgress : 0}%` }}
                />
              </div>

              <p className="mt-3 text-sm font-medium text-[var(--text-secondary)]">
                Phase 1 is captured in Trade Log. Complete execution details, then finish the review and reflection here.
              </p>
            </section>
          </div>

          <div className="space-y-4">
            {!selectedTrade || !form ? (
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <div className="flex min-h-60 items-center justify-center rounded-2xl border border-[var(--border)] bg-[#efeee9] text-sm font-semibold text-[var(--text-secondary)]">
                  Select a trade to review.
                </div>
              </section>
            ) : (
              <>
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
                    className="rounded-2xl bg-[var(--accent)] px-8 py-3 font-semibold text-white shadow-[0_10px_25px_rgba(110,17,17,0.18)] disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Phase 2 · 60%"}
                  </button>
                </div>

                <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold tracking-tight">Structured Screenshots</h2>
                    <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                      Free gets one review screenshot. Expert gets the full setup → execution → review trade story.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {phaseScreenshotConfig.map((item) => {
                      const locked = item.expertOnly && currentPlan !== "EXPERT";

                      return (
                        <ScreenshotSlot
                          key={item.phase}
                          title={item.title}
                          helper={item.helper}
                          screenshot={screenshotsByPhase[item.phase]}
                          locked={locked}
                          saving={screenshotSaving}
                          onCapture={() => captureScreenshot(item.phase)}
                          onPaste={(event) => handlePasteScreenshot(item.phase, event)}
                          onDelete={() => deleteScreenshot(item.phase)}
                        />
                      );
                    })}
                  </div>
                </section>

                <TradeChecklist
                  checklist={form.checklist}
                  onToggle={toggleChecklist}
                  limitLabel={`${Object.keys(form.checklist).length}/${PLANS[currentPlan].checklistItems}`}
                />

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

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">
                    {selectedTrade.result || "BE"} · {formatPnl(selectedTrade.pnl)} · {selectedTrade.trade_date}
                  </p>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={savePhase3}
                    className="rounded-2xl bg-[var(--accent)] px-8 py-3 font-semibold text-white shadow-[0_10px_25px_rgba(110,17,17,0.18)] disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Complete Review · 100%"}
                  </button>
                </div>
              </>
            )}
          </div>
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
