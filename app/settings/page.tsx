"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/app/components/layout/navbar";
import PageLoading from "@/app/components/layout/page-loading";
import { supabase } from "@/lib/supabase/client";
import SettingsList from "./components/SettingsList";
import ChecklistSettings from "./components/ChecklistSettings";
import PlanSettings from "./components/PlanSettings";
import DangerZone from "./components/DangerZone";
import { PLANS, PlanKey } from "@/lib/plans";
import {
  getRemainingTrades,
  getStoredDevBillingCycleStart,
  setStoredDevBillingCycleStart,
  updateUserPlan,
} from "@/lib/usage";

const ADMIN_EMAIL = "maem.soliman@gmail.com";

type UserTradeSettings = {
  id?: string;
  environments: string[];
  strategies: string[];
  pairs: string[];
  trade_types: string[];
  emotions: string[];
  checklist: Record<string, boolean>;
  notes_template: string;
};

type SettingListKey =
  | "environments"
  | "strategies"
  | "pairs"
  | "trade_types"
  | "emotions";

type UsagePreview = {
  used: number;
  limit: number | null;
  remaining: number | null;
  cycleStart: string;
  cycleEnd: string;
};

type BillingDetails = {
  subscription_status: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  stripe_customer_id: string | null;
};

type SampleTradeTemplate = {
  pair: string;
  strategy: string;
  trade_type: string;
  direction: "BUY" | "SELL";
  entry_price: number;
  position_size: number;
  stop_loss: number;
  take_profit: number;
  pnl: number;
  result: "WIN" | "LOSS" | "BE";
  notes: string;
};

const defaultSettings: UserTradeSettings = {
  environments: [],
  strategies: [],
  pairs: [],
  trade_types: [],
  emotions: [],
  checklist: {},
  notes_template: "",
};

const cardClass =
  "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]";

const sampleTradeTemplates: SampleTradeTemplate[] = [
  {
    pair: "XAU/USD",
    strategy: "London Sweep",
    trade_type: "Scalp",
    direction: "BUY",
    entry_price: 2341.5,
    position_size: 0.1,
    stop_loss: 2336.2,
    take_profit: 2354.8,
    pnl: 132,
    result: "WIN",
    notes: "London low sweep followed by displacement and clean continuation into prior highs.",
  },
  {
    pair: "EUR/USD",
    strategy: "Breakout Retest",
    trade_type: "Day Trade",
    direction: "BUY",
    entry_price: 1.0842,
    position_size: 0.25,
    stop_loss: 1.0816,
    take_profit: 1.0908,
    pnl: 86,
    result: "WIN",
    notes: "Breakout held above range high, retest respected, partials taken into liquidity.",
  },
  {
    pair: "GBP/USD",
    strategy: "Liquidity Grab",
    trade_type: "Scalp",
    direction: "SELL",
    entry_price: 1.2685,
    position_size: 0.1,
    stop_loss: 1.2712,
    take_profit: 1.2628,
    pnl: -42,
    result: "LOSS",
    notes: "Entered after buy-side sweep but rejection was weak and price reclaimed the level.",
  },
  {
    pair: "NAS100",
    strategy: "Trend Continuation",
    trade_type: "Day Trade",
    direction: "BUY",
    entry_price: 18425.5,
    position_size: 0.05,
    stop_loss: 18382.0,
    take_profit: 18530.0,
    pnl: 214,
    result: "WIN",
    notes: "Clean higher-low continuation after New York open. Trade followed HTF momentum.",
  },
  {
    pair: "BTC/USD",
    strategy: "Breakout Retest",
    trade_type: "Swing",
    direction: "BUY",
    entry_price: 67250,
    position_size: 0.01,
    stop_loss: 65880,
    take_profit: 70400,
    pnl: 315,
    result: "WIN",
    notes: "Daily breakout retest held. Position managed with wider stop and swing target.",
  },
  {
    pair: "XAU/USD",
    strategy: "Liquidity Grab",
    trade_type: "Scalp",
    direction: "SELL",
    entry_price: 2362.4,
    position_size: 0.5,
    stop_loss: 2367.8,
    take_profit: 2350.6,
    pnl: -95,
    result: "LOSS",
    notes: "Good setup idea, but entry was early before confirmation candle closed.",
  },
  {
    pair: "EUR/USD",
    strategy: "Trend Continuation",
    trade_type: "Day Trade",
    direction: "SELL",
    entry_price: 1.0768,
    position_size: 1,
    stop_loss: 1.0792,
    take_profit: 1.0714,
    pnl: 0,
    result: "BE",
    notes: "Moved stop to break even after first push. Market reversed before target.",
  },
  {
    pair: "NAS100",
    strategy: "London Sweep",
    trade_type: "Scalp",
    direction: "SELL",
    entry_price: 18610.0,
    position_size: 0.05,
    stop_loss: 18642.5,
    take_profit: 18535.0,
    pnl: 118,
    result: "WIN",
    notes: "Sweep above pre-market high rejected quickly. Good execution after confirmation.",
  },
];

const createChecklistKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const limitChecklistForPlan = (
  checklist: Record<string, boolean>,
  plan: PlanKey,
) =>
  Object.fromEntries(
    Object.entries(checklist).slice(0, PLANS[plan].checklistItems),
  );

const calculateRiskPercent = (entryPrice: number, stopLoss: number) => {
  if (!entryPrice || !stopLoss) return 0;

  const riskDistance = Math.abs(entryPrice - stopLoss);
  const riskPercent = (riskDistance / entryPrice) * 100;

  return Number(riskPercent.toFixed(2));
};

const resolvePlan = (plan: unknown): PlanKey =>
  plan === "EXPERT" ? "EXPERT" : "FREE";

const normalizeSettings = (
  data: Partial<UserTradeSettings> | null | undefined,
  plan: PlanKey,
): UserTradeSettings => ({
  id: data?.id,
  environments: data?.environments?.length
    ? data.environments
    : defaultSettings.environments,
  strategies: data?.strategies?.length ? data.strategies : defaultSettings.strategies,
  pairs: data?.pairs?.length ? data.pairs : defaultSettings.pairs,
  trade_types: data?.trade_types?.length
    ? data.trade_types
    : defaultSettings.trade_types,
  emotions: data?.emotions?.length ? data.emotions : defaultSettings.emotions,
  checklist: limitChecklistForPlan(
    data?.checklist || defaultSettings.checklist,
    plan,
  ),
  notes_template: data?.notes_template || "",
});

const buildSettingsPayload = (
  userId: string,
  settings: UserTradeSettings,
  plan: PlanKey,
) => ({
  user_id: userId,
  environments: settings.environments,
  strategies: settings.strategies,
  pairs: settings.pairs,
  trade_types: settings.trade_types,
  emotions: settings.emotions,
  checklist: limitChecklistForPlan(settings.checklist, plan),
  notes_template: settings.notes_template,
  updated_at: new Date().toISOString(),
});

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const randomItem = <T,>(items: T[]) =>
  items[Math.floor(Math.random() * items.length)] || items[0];

const buildSampleTrades = (
  userId: string,
  plan: PlanKey,
  count: number,
  cycleStart?: string,
  cycleEnd?: string,
) => {
  const checklist = limitChecklistForPlan(defaultSettings.checklist, plan);
  const canUsePsychology = PLANS[plan].psychologyTracking;
  const now = Date.now();
  const startTime = cycleStart
    ? new Date(cycleStart).getTime()
    : now - 7 * 24 * 60 * 60 * 1000;
  const endTime = Math.min(
    cycleEnd ? new Date(cycleEnd).getTime() - 60 * 1000 : now,
    now,
  );
  const safeStartTime = Number.isFinite(startTime) ? startTime : now;
  const safeEndTime =
    Number.isFinite(endTime) && endTime > safeStartTime ? endTime : now;
  const timeRange = Math.max(safeEndTime - safeStartTime, 60 * 1000);

  const timestamps = Array.from({ length: count })
    .map(() => safeStartTime + randomBetween(0.03, 0.97) * timeRange)
    .sort((a, b) => a - b);

  let streakBias: "WIN" | "LOSS" = Math.random() > 0.35 ? "WIN" : "LOSS";

  return Array.from({ length: count }).map((_, index) => {
    if (index % 6 === 0 && index !== 0) {
      streakBias = Math.random() > 0.45 ? "WIN" : "LOSS";
    }

    const template = randomItem(sampleTradeTemplates);
    const date = new Date(timestamps[index] || safeEndTime);
    const entryHour = 7 + Math.floor(Math.random() * 9);
    const entryMinute = String(["05", "15", "30", "45"][index % 4]);
    const positionMultiplier = randomBetween(0.65, 1.8);
    const outcomeRoll = Math.random();
    const result =
      outcomeRoll > 0.9 ? "BE" : outcomeRoll > 0.38 ? streakBias : streakBias === "WIN" ? "LOSS" : "WIN";

    const baseWin = Math.abs(template.pnl || 90);
    const baseLoss = -Math.abs(template.pnl || 60) * randomBetween(0.45, 0.85);
    const pnl =
      result === "BE"
        ? Number(randomBetween(-3, 3).toFixed(2))
        : result === "WIN"
          ? Number((baseWin * randomBetween(0.65, 1.75)).toFixed(2))
          : Number((baseLoss * randomBetween(0.75, 1.35)).toFixed(2));

    const entryPrice = Number((template.entry_price * randomBetween(0.995, 1.005)).toFixed(5));
    const stopLoss = Number((template.stop_loss * randomBetween(0.995, 1.005)).toFixed(5));
    const takeProfit = Number((template.take_profit * randomBetween(0.995, 1.005)).toFixed(5));

    return {
      user_id: userId,
      trade_date: date.toISOString().slice(0, 10),
      entry_time: `${String(entryHour).padStart(2, "0")}:${entryMinute}`,
      environment: randomItem(defaultSettings.environments),
      pair: template.pair,
      strategy: template.strategy,
      trade_type: template.trade_type,
      direction: template.direction,
      entry_price: entryPrice,
      position_size: Number((template.position_size * positionMultiplier).toFixed(2)),
      stop_loss: stopLoss,
      take_profit: takeProfit,
      risk_percent: calculateRiskPercent(entryPrice, stopLoss),
      pnl,
      result,
      checklist,
      emotions: canUsePsychology ? [randomItem(defaultSettings.emotions)] : [],
      notes: template.notes,
      created_at: date.toISOString(),
    };
  });
};

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetupMode = searchParams.get("setup") === "true";

  const [settings, setSettings] = useState<UserTradeSettings>(defaultSettings);
  const [currentPlan, setCurrentPlan] = useState<PlanKey>("FREE");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planUpdating, setPlanUpdating] = useState(false);
  const [usagePreview, setUsagePreview] = useState<UsagePreview | null>(null);
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [devBillingCycleStart, setDevBillingCycleStart] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [newEnvironment, setNewEnvironment] = useState("");
  const [newStrategy, setNewStrategy] = useState("");
  const [newPair, setNewPair] = useState("");
  const [newTradeType, setNewTradeType] = useState("");
  const [newEmotion, setNewEmotion] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");

  const refreshUsagePreview = async (planOverride?: PlanKey) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const usage = await getRemainingTrades(user.id, planOverride || currentPlan);
    setUsagePreview(usage);
  };

  const updateDevBillingCycleStart = async (value: string) => {
    setDevBillingCycleStart(value);
    setStoredDevBillingCycleStart(value || null);
    await refreshUsagePreview(currentPlan);
  };

  const clearDevBillingCycleStart = async () => {
    setDevBillingCycleStart("");
    setStoredDevBillingCycleStart(null);
    await refreshUsagePreview(currentPlan);
  };

  const simulateNextBillingCycle = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const usage = await getRemainingTrades(user.id, currentPlan);

    if (!usage.cycleEnd) {
      await refreshUsagePreview(currentPlan);
      return;
    }

    const nextCycleStartDate = usage.cycleEnd.slice(0, 10);

    setDevBillingCycleStart(nextCycleStartDate);
    setStoredDevBillingCycleStart(nextCycleStartDate);

    const nextUsage = await getRemainingTrades(user.id, currentPlan);
    setUsagePreview(nextUsage);

    alert(
      `Simulated next billing cycle: ${nextUsage.cycleStart.slice(0, 10)} to ${nextUsage.cycleEnd.slice(0, 10)}. Previous-cycle trades no longer count toward this cycle.`,
    );
  };

  const loadSettings = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserEmail(user.email || null);

    const { data: planData, error: planError } = await supabase
      .from("user_plans")
      .select("plan, subscription_status, current_period_start, current_period_end, cancel_at_period_end, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (planError) {
      alert(planError.message);
      setLoading(false);
      return;
    }

    if (!planData) {
      router.replace("/select-plan");
      return;
    }

    const resolvedPlan = resolvePlan(planData.plan);
    setCurrentPlan(resolvedPlan);
    setBillingDetails({
      subscription_status: planData.subscription_status,
      current_period_start: planData.current_period_start,
      current_period_end: planData.current_period_end,
      cancel_at_period_end: planData.cancel_at_period_end,
      stripe_customer_id: planData.stripe_customer_id,
    });
    setDevBillingCycleStart(getStoredDevBillingCycleStart() || "");

    try {
      const usage = await getRemainingTrades(user.id, resolvedPlan);
      setUsagePreview(usage);
    } catch (usageError) {
      console.error(usageError);
    }

    const { data, error } = await supabase
      .from("user_trade_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      const startingSettings = normalizeSettings(defaultSettings, resolvedPlan);

      const { data: created, error: createError } = await supabase
        .from("user_trade_settings")
        .upsert(buildSettingsPayload(user.id, startingSettings, resolvedPlan), {
          onConflict: "user_id",
        })
        .select("*")
        .single();

      if (createError) {
        alert(createError.message);
        setLoading(false);
        return;
      }

      setSettings(normalizeSettings(created, resolvedPlan));
      setLoading(false);
      return;
    }

    setSettings(normalizeSettings(data, resolvedPlan));
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const payload = buildSettingsPayload(user.id, settings, currentPlan);

    const { error } = await supabase.from("user_trade_settings").upsert(payload, {
      onConflict: "user_id",
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSettings((prev) => ({
      ...prev,
      checklist: payload.checklist,
    }));

    if (isSetupMode) {
      router.push("/dashboard");
      return;
    }

    alert("Settings saved.");
  };

  const addItem = (key: SettingListKey, value: string, reset: () => void) => {
    const clean = value.trim();
    if (!clean) return;

    if (settings[key].includes(clean)) {
      reset();
      return;
    }

    setSettings((current) => ({
      ...current,
      [key]: [...current[key], clean],
    }));

    reset();
  };

  const removeItem = (key: SettingListKey, item: string) => {
    setSettings((current) => ({
      ...current,
      [key]: current[key].filter((value) => value !== item),
    }));
  };

  const addChecklistItem = () => {
    const key = createChecklistKey(newChecklistItem);
    const checklistLimit = PLANS[currentPlan].checklistItems;

    if (!key) return;

    if (Object.keys(settings.checklist).length >= checklistLimit) {
      alert(`Your current plan is limited to ${checklistLimit} checklist items.`);
      return;
    }

    if (settings.checklist[key] !== undefined) {
      setNewChecklistItem("");
      return;
    }

    setSettings((current) => ({
      ...current,
      checklist: {
        ...current.checklist,
        [key]: false,
      },
    }));

    setNewChecklistItem("");
  };

  const toggleChecklistItem = (key: string) => {
    setSettings((current) => ({
      ...current,
      checklist: {
        ...current.checklist,
        [key]: !current.checklist[key],
      },
    }));
  };

  const removeChecklistItem = (key: string) => {
    setSettings((current) => {
      const updated = { ...current.checklist };
      delete updated[key];

      return {
        ...current,
        checklist: updated,
      };
    });
  };

  const resetSettings = () => {
    if (!confirm("Reset settings to default?")) return;

    setSettings({
      ...defaultSettings,
      id: settings.id,
      checklist: limitChecklistForPlan(defaultSettings.checklist, currentPlan),
    });
  };

  const seedSampleTrades = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const usage = await getRemainingTrades(user.id, currentPlan);
    const isFree = currentPlan === "FREE";
    const seedCount = isFree
      ? Math.max(usage.remaining ?? 0, 0)
      : PLANS[currentPlan].sampleTradesSeedCount;

    if (seedCount <= 0) {
      alert("This FREE billing cycle is already full at 30 trades. Try logging one more trade to test the limit block, or reset the trade database first.");
      await refreshUsagePreview(currentPlan);
      return;
    }

    const confirmMessage = isFree
      ? `Add ${seedCount} sample trades inside the current billing cycle to fill FREE usage to 30/30?`
      : `Add ${seedCount} realistic sample trades inside the current billing cycle?`;

    if (!confirm(confirmMessage)) return;

    const sampleTrades = buildSampleTrades(
      user.id,
      currentPlan,
      seedCount,
      usage.cycleStart,
      usage.cycleEnd,
    );

    const { error } = await supabase.from("trades").insert(sampleTrades);

    if (error) {
      alert(error.message);
      return;
    }

    await refreshUsagePreview(currentPlan);
    alert(
      isFree
        ? `FREE current cycle filled to 30/30. Try saving another trade in Trade Log to confirm the limit blocks.`
        : `${seedCount} realistic sample trades added to the current cycle.`,
    );
  };

  const resetTradeDatabase = async () => {
    if (!confirm("This will delete all your saved trades. Continue?")) return;
    if (!confirm("Final warning: this cannot be undone. Delete all trades?")) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("trades")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    await refreshUsagePreview(currentPlan);
    alert("Trade database reset.");
  };

  const togglePlan = async () => {
    setPlanUpdating(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const nextPlan: PlanKey = currentPlan === "FREE" ? "EXPERT" : "FREE";
      await updateUserPlan(user.id, nextPlan);

      const payload = buildSettingsPayload(user.id, settings, nextPlan);

      const { error } = await supabase.from("user_trade_settings").upsert(payload, {
        onConflict: "user_id",
      });

      if (error) throw error;

      setCurrentPlan(nextPlan);
      setSettings((current) => ({
        ...current,
        checklist: payload.checklist,
      }));

      await refreshUsagePreview(nextPlan);
      alert(`Developer plan switched to ${nextPlan}.`);
    } catch (error) {
      console.error("Developer plan update failed:", error);
      const message = error instanceof Error ? error.message : "Could not update plan.";
      alert(`Could not update plan: ${message}`);
    } finally {
      setPlanUpdating(false);
    }
  };

  const isAdmin = userEmail?.toLowerCase() === ADMIN_EMAIL;

  if (loading) {
    return <PageLoading label="Loading Settings" workspace />;
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--gold)]">Workspace</p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">Settings</h1>

            <p className="mt-3 text-base text-[var(--text-secondary)]">
              Configure your trade log, journaling workflow, and account limits.
            </p>

            {isSetupMode ? (
              <div className="mt-5 rounded-2xl border border-[var(--gold)]/30 bg-[#fff8e8] px-5 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Welcome to SoloJournalz. Set up your environments, strategies,
                pairs, checklist, and journal template before heading into your
                dashboard.
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveSettings}
              disabled={saving || loading}
              className="rounded-2xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(110,17,17,0.18)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="space-y-4">
            <PlanSettings currentPlan={currentPlan} billingDetails={billingDetails} />

            {PLANS[currentPlan].psychologyTracking ? (
              <SettingsList
                title="Psychology Tags"
                description="Control the psychology tags available in Trade Log."
                items={settings.emotions}
                value={newEmotion}
                placeholder="Add psychology tag..."
                onChange={setNewEmotion}
                onAdd={() => addItem("emotions", newEmotion, () => setNewEmotion(""))}
                onRemove={(item) => removeItem("emotions", item)}
              />
            ) : (
              <section className={cardClass}>
                <h2 className="text-xl font-bold tracking-tight">Psychology Tracking</h2>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Psychology tracking is disabled on the Free plan.
                </p>

                <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[#efeee9] p-4">
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">
                    Upgrade to Expert to unlock psychology journaling and emotional trade tracking.
                  </p>
                </div>
              </section>
            )}

            <ChecklistSettings
              checklist={settings.checklist}
              newChecklistItem={newChecklistItem}
              maxItems={PLANS[currentPlan].checklistItems}
              setNewChecklistItem={setNewChecklistItem}
              onAdd={addChecklistItem}
              onRemove={removeChecklistItem}
              onToggle={toggleChecklistItem}
            />
          </div>

          <div className="space-y-4">
            <SettingsList
              title="Environments"
              description="Control the environments available in Trade Log."
              items={settings.environments}
              value={newEnvironment}
              placeholder="Add environment..."
              onChange={setNewEnvironment}
              onAdd={() => addItem("environments", newEnvironment, () => setNewEnvironment(""))}
              onRemove={(item) => removeItem("environments", item)}
            />

            <SettingsList
              title="Strategies"
              description="Add the strategies you actively trade."
              items={settings.strategies}
              value={newStrategy}
              placeholder="Add strategy..."
              onChange={setNewStrategy}
              onAdd={() => addItem("strategies", newStrategy, () => setNewStrategy(""))}
              onRemove={(item) => removeItem("strategies", item)}
            />

            <SettingsList
              title="Pairs"
              description="Choose the markets or pairs you want available."
              items={settings.pairs}
              value={newPair}
              placeholder="Add pair..."
              onChange={setNewPair}
              onAdd={() => addItem("pairs", newPair, () => setNewPair(""))}
              onRemove={(item) => removeItem("pairs", item)}
            />

            <SettingsList
              title="Trade Types"
              description="Set your preferred trade categories."
              items={settings.trade_types}
              value={newTradeType}
              placeholder="Add trade type..."
              onChange={setNewTradeType}
              onAdd={() => addItem("trade_types", newTradeType, () => setNewTradeType(""))}
              onRemove={(item) => removeItem("trade_types", item)}
            />

            <section className={cardClass}>
              <h2 className="text-xl font-bold tracking-tight">Notes Template</h2>

              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Create a default note structure for every new trade.
              </p>

              <textarea
                value={settings.notes_template}
                onChange={(e) =>
                  setSettings((current) => ({
                    ...current,
                    notes_template: e.target.value,
                  }))
                }
                placeholder={`Reason for entry:\nWhat I followed:\nWhat I ignored:\nLesson:`}
                className="mt-5 h-48 w-full resize-none rounded-2xl border border-[var(--border)] bg-[#efeee9] p-4 text-sm font-medium outline-none focus:border-[var(--accent)]"
              />
            </section>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <DangerZone
            isAdmin={isAdmin}
            sampleTradeCount={PLANS[currentPlan].sampleTradesSeedCount}
            currentPlan={currentPlan}
            planUpdating={planUpdating}
            usagePreview={usagePreview}
            devBillingCycleStart={devBillingCycleStart}
            onResetSettings={resetSettings}
            onSeedSampleTrades={seedSampleTrades}
            onResetTradeDatabase={resetTradeDatabase}
            onTogglePlan={togglePlan}
            onRefreshUsage={() => refreshUsagePreview(currentPlan)}
            onSimulateNextBillingCycle={simulateNextBillingCycle}
            onDevBillingCycleStartChange={updateDevBillingCycleStart}
            onClearDevBillingCycleStart={clearDevBillingCycleStart}
          />

          <section className={cardClass}>
            <h2 className="text-xl font-bold tracking-tight">About</h2>

            <div className="mt-5 space-y-3 text-sm font-medium text-[var(--text-secondary)]">
              <p>SoloJournalz Version: 0.1.0 MVP</p>
              <p>Status: Local development</p>
              <p>Focus: Trade logging, storage, screenshots, and settings.</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
