"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/app/components/layout/navbar";
import PageLoading from "@/app/components/layout/page-loading";
import { supabase } from "@/lib/supabase/client";
import {
  PLANS,
  PlanKey,
  canAddScreenshotToTrade,
  getScreenshotLimit,
  getScreenshotLimitLabel,
} from "@/lib/plans";
import { canCreateTrade, getCreatedAtForNewTrade, getCurrentUserPlan } from "@/lib/usage";
import type { TradeFormData } from "@/types/trade";
import { calculateTradeMetrics } from "@/types/trade";

import TradeDetailsForm from "./components/TradeDetailsForm";
import ScreenshotPanel from "./components/ScreenshotPanel";
import TradeChecklist from "./components/TradeChecklist";
import TradeNotes from "./components/TradeNotes";
import PsychologyPanel from "./components/PsychologyPanel";
import SaveTradeBar from "./components/SaveTradeBar";

type ScreenshotDraft = {
  id?: string;
  imageUrl: string;
  isNew: boolean;
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
  environments: ["LIVE", "TESTING", "BACKTESTING"],
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
  risk_percent: 0,
  rr: 0,
  pnl: 0,
  result: "BE",
  notes: settings.notes_template || "",
  checklist: limitChecklistForPlan(settings.checklist, plan),
  emotions: PLANS[plan].psychologyTracking
    ? [settings.emotions[0] || "focused"]
    : [],
});

function TradeLogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const editTradeId = searchParams.get("edit");
  const isEditMode = Boolean(editTradeId);

  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<PlanKey>("FREE");
  const [settings, setSettings] = useState<UserTradeSettings>(fallbackSettings);
  const [form, setForm] = useState<TradeFormData>(
    createInitialForm(fallbackSettings, "FREE"),
  );
  const [saving, setSaving] = useState(false);
  const [screenshots, setScreenshots] = useState<ScreenshotDraft[]>([]);
  const [activeScreenshotIndex, setActiveScreenshotIndex] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialScreenshotIds, setInitialScreenshotIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState("");

  const markDirty = () => setHasUnsavedChanges(true);

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
            checklist: limitChecklistForPlan(
              settingsData.checklist || fallbackSettings.checklist,
              resolvedPlan,
            ),
            notes_template: settingsData.notes_template || "",
          }
        : {
            ...fallbackSettings,
            checklist: limitChecklistForPlan(
              fallbackSettings.checklist,
              resolvedPlan,
            ),
          };

      setSettings(loadedSettings);

      if (!editTradeId) {
        setForm(createInitialForm(loadedSettings, resolvedPlan));
        setScreenshots([]);
        setInitialScreenshotIds([]);
        setActiveScreenshotIndex(0);
        setHasUnsavedChanges(false);
        setLoading(false);
        return;
      }

      const { data: trade, error: tradeError } = await supabase
        .from("trades")
        .select("*")
        .eq("id", editTradeId)
        .single();

      if (tradeError || !trade) {
        alert(tradeError?.message || "Could not load trade.");
        router.push("/storage");
        setLoading(false);
        return;
      }

      setForm({
        trade_date: trade.trade_date || getToday(),
        entry_time: trade.entry_time || getCurrentTime(),
        environment: (trade.environment ||
          "BACKTESTING") as TradeFormData["environment"],
        pair: trade.pair || "",
        strategy: trade.strategy || "",
        trade_type: trade.trade_type || "",
        direction: trade.direction || "BUY",
        entry_price: trade.entry_price ?? 0,
        position_size: trade.position_size ?? 0,
        stop_loss: trade.stop_loss ?? 0,
        take_profit: trade.take_profit ?? 0,
        risk_percent: trade.risk_percent ?? 0,
        rr: trade.rr ?? 0,
        pnl: trade.pnl ?? 0,
        result: trade.result || "BE",
        notes: trade.notes || "",
        checklist: limitChecklistForPlan(
          trade.checklist || fallbackSettings.checklist,
          resolvedPlan,
        ),
        emotions: PLANS[resolvedPlan].psychologyTracking
          ? trade.emotions || [fallbackSettings.emotions[0]]
          : [],
      });

      const { data: shotData } = await supabase
        .from("trade_screenshots")
        .select("*")
        .eq("trade_id", editTradeId)
        .order("created_at", { ascending: true });

      const loadedScreenshots =
        shotData?.map((shot) => ({
          id: shot.id as string,
          imageUrl: shot.image_url as string,
          isNew: false,
        })) || [];

      setScreenshots(loadedScreenshots);
      setInitialScreenshotIds(loadedScreenshots.map((s) => s.id!));
      setActiveScreenshotIndex(0);
      setHasUnsavedChanges(false);
      setLoading(false);
    };

    loadTradeLog();
  }, [editTradeId, router]);

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
    setScreenshots([]);
    setInitialScreenshotIds([]);
    setActiveScreenshotIndex(0);
    setHasUnsavedChanges(false);
  };

  const updateNumber = (key: keyof TradeFormData, value: string) => {
    setForm((current) => {
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
        pnl: key === "pnl" ? nextForm.pnl : current.pnl,
      };
    });

    markDirty();
  };

  const showScreenshotLimitAlert = () => {
    alert(
      `${getScreenshotLimitLabel(currentPlan)} allowed on your current plan. Upgrade to Expert for unlimited screenshots.`,
    );
  };

  const addScreenshotUrl = (imageUrl: string) => {
    if (!canAddScreenshotToTrade(currentPlan, screenshots.length)) {
      showScreenshotLimitAlert();
      return;
    }

    setScreenshots((current) => {
      if (!canAddScreenshotToTrade(currentPlan, current.length)) {
        return current;
      }

      const nextScreenshots = [...current, { imageUrl, isNew: true }];
      setActiveScreenshotIndex(nextScreenshots.length - 1);
      return nextScreenshots;
    });

    markDirty();
  };

  const captureScreenshot = async () => {
    if (!canAddScreenshotToTrade(currentPlan, screenshots.length)) {
      showScreenshotLimitAlert();
      return;
    }

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

      addScreenshotUrl(canvas.toDataURL("image/jpeg", 0.85));
    } catch {
      alert("Screenshot capture cancelled or blocked.");
    }
  };

  const handlePasteScreenshot = (
    event: React.ClipboardEvent<HTMLDivElement>,
  ) => {
    if (!canAddScreenshotToTrade(currentPlan, screenshots.length)) {
      showScreenshotLimitAlert();
      return;
    }

    const items = event.clipboardData.items;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (!file) return;

        addScreenshotUrl(URL.createObjectURL(file));
        return;
      }
    }
  };

  const deleteCurrentScreenshot = () => {
    setScreenshots((current) => {
      if (current.length === 0) return current;

      const nextScreenshots = current.filter(
        (_, index) => index !== activeScreenshotIndex,
      );

      setActiveScreenshotIndex((currentIndex) =>
        Math.max(0, Math.min(currentIndex, nextScreenshots.length - 1)),
      );

      return nextScreenshots;
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

  const uploadScreenshot = async (
    userId: string,
    tradeId: string,
    imageUrl: string,
    index: number,
  ) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const filePath = `${userId}/${tradeId}/${index + 1}-${crypto.randomUUID()}.jpg`;

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
      trade_id: tradeId,
      image_url: publicUrl,
    });

    if (dbError) throw dbError;
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

    if (!isEditMode) {
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
    }

    const metrics = calculateTradeMetrics(form);

    const payload = {
      user_id: user.id,
      trade_date: form.trade_date,
      entry_time: form.entry_time || null,
      environment: form.environment,
      pair: form.pair,
      strategy: form.strategy || null,
      trade_type: form.trade_type || null,
      direction: form.direction,
      entry_price: form.entry_price,
      position_size: form.position_size,
      stop_loss: form.stop_loss,
      take_profit: form.take_profit,
      risk_percent: metrics.risk_percent,
      rr: metrics.rr,
      pnl: form.pnl ?? 0,
      result: form.result,
      notes: form.notes || null,
      checklist: limitChecklistForPlan(form.checklist, latestPlan),
      emotions: PLANS[latestPlan].psychologyTracking ? form.emotions : [],
    };

    if (isEditMode && editTradeId) {
      const { error } = await supabase
        .from("trades")
        .update(payload)
        .eq("id", editTradeId);

      if (error) {
        alert(error.message);
        setSaving(false);
        return;
      }

      const keptExistingIds = screenshots
        .filter((s) => !s.isNew && s.id)
        .map((s) => s.id!);

      const deletedIds = initialScreenshotIds.filter(
        (id) => !keptExistingIds.includes(id),
      );

      if (deletedIds.length > 0) {
        await supabase.from("trade_screenshots").delete().in("id", deletedIds);
      }

      try {
        await Promise.all(
          screenshots
            .filter((s) => s.isNew)
            .map((screenshot, index) =>
              uploadScreenshot(user.id, editTradeId, screenshot.imageUrl, index),
            ),
        );
      } catch {
        alert("Trade updated, but screenshot upload failed.");
        setSaving(false);
        return;
      }

      setSaving(false);
      setHasUnsavedChanges(false);
      alert("Trade updated successfully.");
      router.push("/storage");
      return;
    }

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

    try {
      await Promise.all(
        screenshots
          .map((screenshot, index) =>
            uploadScreenshot(user.id, savedTrade.id, screenshot.imageUrl, index),
          ),
      );
    } catch {
      alert("Trade saved, but screenshot upload failed.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setHasUnsavedChanges(false);
    alert("Trade saved successfully.");
    resetTradeLog();
  };

  if (loading) {
    return <PageLoading label="Loading Trade Log" workspace />;
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <Navbar hasUnsavedChanges={hasUnsavedChanges} />

      <section className="mx-auto max-w-7xl px-5 py-5">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.25fr]">
          <TradeDetailsForm
            form={form}
            settings={settings}
            isEditMode={isEditMode}
            onReset={resetTradeLog}
            updateForm={updateForm}
            updateNumber={updateNumber}
          />

          <ScreenshotPanel
            screenshots={screenshots}
            activeScreenshotIndex={activeScreenshotIndex}
            maxScreenshots={getScreenshotLimit(currentPlan)}
            onPaste={handlePasteScreenshot}
            onCapture={captureScreenshot}
            onDelete={deleteCurrentScreenshot}
            onSelect={setActiveScreenshotIndex}
          />

          <TradeChecklist
            checklist={form.checklist}
            onToggle={toggleChecklist}
            limitLabel={`${Object.keys(form.checklist).length}/${PLANS[currentPlan].checklistItems}`}
          />

          <section className="space-y-4">
            <TradeNotes
              value={form.notes ?? ""}
              onChange={(value) => updateForm("notes", value)}
            />

            {PLANS[currentPlan].psychologyTracking && (
              <PsychologyPanel
                emotions={settings.emotions}
                selectedEmotions={form.emotions}
                onSelect={setEmotion}
              />
            )}
          </section>
        </div>

        {saveError && (
          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[#f8f6f2] p-4 text-sm font-semibold text-[var(--accent)] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            {saveError}
          </div>
        )}

        <SaveTradeBar
          isEditMode={isEditMode}
          saving={saving}
          hasUnsavedChanges={hasUnsavedChanges}
          onCancel={() => router.push("/storage")}
          onSave={handleSaveTrade}
        />
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
