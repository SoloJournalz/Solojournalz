"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/app/components/layout/logo";
import PageLoading from "@/app/components/layout/page-loading";
import { supabase } from "@/lib/supabase/client";
import { PLANS, PlanKey } from "@/lib/plans";

type WizardStep =
  | "welcome"
  | "environments"
  | "pairs"
  | "strategies"
  | "trade_types"
  | "checklist"
  | "psychology"
  | "notes"
  | "review";

type SetupTemplate = "forex" | "crypto" | "stocks" | "manual" | null;

type SetupState = {
  setup_template: SetupTemplate;
  environments: string[];
  pairs: string[];
  strategies: string[];
  trade_types: string[];
  emotions: string[];
  checklist: Record<string, boolean>;
  notes_template: string;
};

const cardClass =
  "rounded-3xl border border-[var(--border)] bg-white p-6 shadow-[0_16px_40px_rgba(0,0,0,0.05)]";
const optionClass =
  "rounded-2xl border border-[var(--border)] bg-[#f8f6f2] p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--gold)] hover:bg-white hover:shadow-sm";

const expertManualSteps: WizardStep[] = [
  "welcome",
  "environments",
  "pairs",
  "strategies",
  "trade_types",
  "checklist",
  "psychology",
  "notes",
  "review",
];

const freeManualSteps: WizardStep[] = expertManualSteps.filter(
  (step) => step !== "psychology",
);

const templateSteps: WizardStep[] = ["welcome", "review"];

const emptySetupState: SetupState = {
  setup_template: null,
  environments: [],
  pairs: [],
  strategies: [],
  trade_types: [],
  emotions: [],
  checklist: {},
  notes_template: "",
};

const templates: Record<"forex" | "crypto" | "stocks", SetupState> = {
  forex: {
    setup_template: "forex",
    environments: ["Live", "Demo"],
    pairs: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"],
    strategies: ["Breakout", "Trend Continuation", "Reversal"],
    trade_types: ["Scalp", "Day Trade", "Swing"],
    emotions: ["Calm", "Confident", "Impatient"],
    checklist: {
      news_checked: false,
      risk_checked: false,
      plan_confirmed: false,
    },
    notes_template:
      "Session:\nSetup:\nReason for entry:\nRisk plan:\nTrade management:\nLesson:",
  },
  crypto: {
    setup_template: "crypto",
    environments: ["Live", "Paper"],
    pairs: ["BTC", "ETH"],
    strategies: ["Breakout", "Trend Continuation", "Swing"],
    trade_types: ["Scalp", "Day Trade", "Swing"],
    emotions: ["Calm", "Patient", "FOMO"],
    checklist: {
      risk_checked: false,
      market_condition_checked: false,
      invalidation_clear: false,
    },
    notes_template:
      "Market condition:\nSetup:\nReason for entry:\nRisk plan:\nTrade management:\nLesson:",
  },
  stocks: {
    setup_template: "stocks",
    environments: ["Live", "Paper"],
    pairs: ["AAPL", "TSLA", "NVDA", "MSFT"],
    strategies: ["Breakout", "Reversal", "Swing"],
    trade_types: ["Day Trade", "Swing", "Position"],
    emotions: ["Calm", "Confident", "Hesitant"],
    checklist: {
      ticker_reviewed: false,
      risk_checked: false,
      market_context_checked: false,
    },
    notes_template:
      "Ticker:\nSector:\nSetup:\nReason for entry:\nRisk plan:\nTrade management:\nLesson:",
  },
};

const environmentOptions = ["Live", "Demo", "Paper"];
const tradeTypeOptions = ["Scalp", "Day Trade", "Swing", "Position"];
const strategyExamples = ["Breakout", "Trend Continuation", "Reversal", "Scalping", "Swing"];
const emotionExamples = ["Calm", "Confident", "Patient", "Hesitant", "FOMO", "Frustrated"];

const createChecklistKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const formatChecklistLabel = (key: string) =>
  key.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const mergeUnique = (items: string[], value: string) => {
  const clean = value.trim();
  if (!clean) return items;
  if (items.some((item) => item.toLowerCase() === clean.toLowerCase())) return items;
  return [...items, clean];
};

const limitChecklistForPlan = (checklist: Record<string, boolean>, plan: PlanKey) =>
  Object.fromEntries(Object.entries(checklist).slice(0, PLANS[plan].checklistItems));

const resolvePlan = (plan: unknown): PlanKey => (plan === "EXPERT" ? "EXPERT" : "FREE");

export default function SetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanKey>("FREE");
  const [stepIndex, setStepIndex] = useState(0);
  const [setup, setSetup] = useState<SetupState>(emptySetupState);
  const [newPair, setNewPair] = useState("");
  const [newStrategy, setNewStrategy] = useState("");
  const [newTradeType, setNewTradeType] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [newEmotion, setNewEmotion] = useState("");

  const isExpert = currentPlan === "EXPERT";
  const steps = useMemo(() => {
    if (setup.setup_template && setup.setup_template !== "manual") return templateSteps;
    return isExpert ? expertManualSteps : freeManualSteps;
  }, [isExpert, setup.setup_template]);
  const activeStep = steps[stepIndex] || "welcome";
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  useEffect(() => {
    const loadSetup = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const checkoutSuccess = searchParams.get("checkout") === "success";
      const checkoutSessionId = searchParams.get("session_id");

      if (checkoutSuccess && checkoutSessionId) {
        for (let attempt = 0; attempt < 10; attempt += 1) {
          const syncResponse = await fetch("/api/stripe/sync-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: checkoutSessionId }),
          });

          if (syncResponse.ok) break;

          if (attempt === 9) {
            router.replace("/select-plan?checkout=pending");
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      let planData: { plan: string | null } | null = null;

      for (let attempt = 0; attempt < (checkoutSuccess ? 12 : 1); attempt += 1) {
        const { data } = await supabase
          .from("user_plans")
          .select("plan")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data) {
          planData = data;
          break;
        }

        if (checkoutSuccess) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!planData) {
        router.replace(checkoutSuccess ? "/select-plan?checkout=pending" : "/select-plan");
        return;
      }

      const resolvedPlan = resolvePlan(planData.plan);
      setCurrentPlan(resolvedPlan);

      const { data: settingsData, error } = await supabase
        .from("user_trade_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      if (settingsData?.setup_completed) {
        window.location.assign("/settings?setup=complete");
        return;
      }

      if (settingsData) {
        setSetup({
          setup_template: settingsData.setup_template || null,
          environments: settingsData.environments || [],
          pairs: settingsData.pairs || [],
          strategies: settingsData.strategies || [],
          trade_types: settingsData.trade_types || [],
          emotions: settingsData.emotions || [],
          checklist: limitChecklistForPlan(settingsData.checklist || {}, resolvedPlan),
          notes_template: settingsData.notes_template || "",
        });
      }

      setLoading(false);
    };

    loadSetup();
  }, [router, searchParams]);

  const saveProgress = async (nextSetup = setup) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase.from("user_trade_settings").upsert(
      {
        user_id: user.id,
        environments: nextSetup.environments,
        pairs: nextSetup.pairs,
        strategies: nextSetup.strategies,
        trade_types: nextSetup.trade_types,
        emotions: isExpert ? nextSetup.emotions : [],
        checklist: limitChecklistForPlan(nextSetup.checklist, currentPlan),
        notes_template: nextSetup.notes_template,
        setup_template: nextSetup.setup_template,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      alert(error.message);
      return false;
    }

    return true;
  };

  const chooseTemplate = async (template: "forex" | "crypto" | "stocks") => {
    const nextSetup = templates[template];
    setSetup(nextSetup);
    setStepIndex(1);
    await saveProgress(nextSetup);
  };

  const chooseManual = async () => {
    const nextSetup = { ...setup, setup_template: "manual" as const };
    setSetup(nextSetup);
    setStepIndex(1);
    await saveProgress(nextSetup);
  };

  const toggleArrayValue = (key: "environments" | "trade_types", value: string) => {
    setSetup((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  };

  const addToList = (key: "pairs" | "strategies" | "trade_types" | "emotions", value: string, reset: () => void) => {
    setSetup((current) => ({ ...current, [key]: mergeUnique(current[key], value) }));
    reset();
  };

  const removeFromList = (key: "pairs" | "strategies" | "trade_types" | "emotions", value: string) => {
    setSetup((current) => ({
      ...current,
      [key]: current[key].filter((item) => item !== value),
    }));
  };

  const addChecklistItem = () => {
    const key = createChecklistKey(newChecklistItem);
    if (!key) return;
    if (Object.keys(setup.checklist).length >= PLANS[currentPlan].checklistItems) {
      alert(`Your ${currentPlan === "EXPERT" ? "Expert" : "Free"} plan allows ${PLANS[currentPlan].checklistItems} checklist items.`);
      return;
    }
    setSetup((current) => ({
      ...current,
      checklist: { ...current.checklist, [key]: false },
    }));
    setNewChecklistItem("");
  };

  const removeChecklistItem = (key: string) => {
    setSetup((current) => {
      const checklist = { ...current.checklist };
      delete checklist[key];
      return { ...current, checklist };
    });
  };

  const continueStep = async () => {
    setSaving(true);
    const ok = await saveProgress();
    setSaving(false);
    if (!ok) return;
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const backStep = () => setStepIndex((current) => Math.max(current - 1, 0));

  const completeSetup = async () => {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      router.replace("/login");
      return;
    }

    const { error } = await supabase.from("user_trade_settings").upsert(
      {
        user_id: user.id,
        environments: setup.environments,
        pairs: setup.pairs,
        strategies: setup.strategies,
        trade_types: setup.trade_types,
        emotions: isExpert ? setup.emotions : [],
        checklist: limitChecklistForPlan(setup.checklist, currentPlan),
        notes_template: setup.notes_template,
        setup_template: setup.setup_template,
        setup_completed: true,
        setup_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.assign("/settings?setup=complete");
  };

  if (loading) return <PageLoading label="Loading Setup" workspace />;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border)] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between px-10">
          <Logo href="/" />
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-bold text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8 grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              First-time setup
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Welcome to SoloJournalz
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
              Choose a template or configure the same settings fields you can edit later from Settings.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm font-bold text-[var(--text-secondary)]">
              <span>Step {stepIndex + 1} of {steps.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[#efeee9]">
              <div
                className="h-2 rounded-full bg-[var(--accent)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <section className={cardClass}>
          {activeStep === "welcome" ? (
            <div>
              <h2 className="text-2xl font-black">Choose the quickest way to get started.</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Templates fill Environments, Pairs, Strategies, Trade Types, Checklist, Notes Template, and Expert psychology tags.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {([
                  ["forex", "Forex", "Live/Demo, major pairs, scalp/day-trade workflow."],
                  ["crypto", "Crypto", "Live/Paper, BTC, ETH, market-condition notes."],
                  ["stocks", "Stocks", "Live/Paper, tickers, sector-style notes."],
                ] as const).map(([key, title, description]) => (
                  <button key={key} type="button" onClick={() => chooseTemplate(key)} className={optionClass}>
                    <span className="rounded-full bg-[#fff8e8] px-3 py-1 text-xs font-black text-[var(--gold)]">
                      Recommended
                    </span>
                    <h3 className="mt-4 text-xl font-black">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
                  </button>
                ))}

                <button type="button" onClick={chooseManual} className={optionClass}>
                  <span className="rounded-full bg-[#efeee9] px-3 py-1 text-xs font-black text-[var(--text-secondary)]">
                    Advanced
                  </span>
                  <h3 className="mt-4 text-xl font-black">Configure Manually</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    Go step by step through the actual Settings fields.
                  </p>
                </button>
              </div>
            </div>
          ) : null}

          {activeStep === "environments" ? (
            <ChoiceStep
              title="Trading Environments"
              description="Select the environments available in Trade Log."
              options={environmentOptions}
              selected={setup.environments}
              onToggle={(value) => toggleArrayValue("environments", value)}
            />
          ) : null}

          {activeStep === "pairs" ? (
            <ListStep
              title="Pairs"
              description="Add the pairs, tickers, or assets you want available in Trade Log."
              value={newPair}
              placeholder="Example: EURUSD, BTC, AAPL"
              items={setup.pairs}
              onChange={setNewPair}
              onAdd={() => addToList("pairs", newPair, () => setNewPair(""))}
              onRemove={(item) => removeFromList("pairs", item)}
            />
          ) : null}

          {activeStep === "strategies" ? (
            <div>
              <ListStep
                title="Strategies"
                description="Create the strategy list you want to review against later."
                value={newStrategy}
                placeholder="Example: Breakout"
                items={setup.strategies}
                onChange={setNewStrategy}
                onAdd={() => addToList("strategies", newStrategy, () => setNewStrategy(""))}
                onRemove={(item) => removeFromList("strategies", item)}
              />
              <div className="mt-5 flex flex-wrap gap-2">
                {strategyExamples.map((strategy) => (
                  <button
                    key={strategy}
                    type="button"
                    onClick={() => addToList("strategies", strategy, () => setNewStrategy(""))}
                    className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-bold hover:border-[var(--gold)]"
                  >
                    + {strategy}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {activeStep === "trade_types" ? (
            <ChoiceStep
              title="Trade Types"
              description="Select the trade categories you use most."
              options={tradeTypeOptions}
              selected={setup.trade_types}
              onToggle={(value) => toggleArrayValue("trade_types", value)}
            />
          ) : null}

          {activeStep === "checklist" ? (
            <ChecklistStep
              checklist={setup.checklist}
              value={newChecklistItem}
              maxItems={PLANS[currentPlan].checklistItems}
              onChange={setNewChecklistItem}
              onAdd={addChecklistItem}
              onRemove={removeChecklistItem}
            />
          ) : null}

          {activeStep === "psychology" ? (
            <div>
              <ListStep
                title="Psychology Tags"
                description="Expert users can configure psychology tracking before entering the workspace."
                value={newEmotion}
                placeholder="Example: Calm"
                items={setup.emotions}
                onChange={setNewEmotion}
                onAdd={() => addToList("emotions", newEmotion, () => setNewEmotion(""))}
                onRemove={(item) => removeFromList("emotions", item)}
              />
              <div className="mt-5 flex flex-wrap gap-2">
                {emotionExamples.map((emotion) => (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => addToList("emotions", emotion, () => setNewEmotion(""))}
                    className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-bold hover:border-[var(--gold)]"
                  >
                    + {emotion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {activeStep === "notes" ? (
            <div>
              <h2 className="text-2xl font-black">Notes Template</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Create a default note structure for each new trade.
              </p>
              <textarea
                value={setup.notes_template}
                onChange={(event) => setSetup((current) => ({ ...current, notes_template: event.target.value }))}
                placeholder={`Reason for entry:\nWhat I followed:\nWhat I ignored:\nLesson:`}
                className="mt-5 h-56 w-full resize-none rounded-2xl border border-[var(--border)] bg-[#efeee9] p-4 text-sm font-medium outline-none focus:border-[var(--accent)]"
              />
            </div>
          ) : null}

          {activeStep === "review" ? (
            <ReviewStep setup={setup} isExpert={isExpert} />
          ) : null}

          {activeStep !== "welcome" ? (
            <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-5">
              <button type="button" onClick={backStep} className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-bold">
                Back
              </button>

              {activeStep === "review" ? (
                <button
                  type="button"
                  onClick={completeSetup}
                  disabled={saving}
                  className="rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(110,17,17,0.18)] disabled:opacity-60"
                >
                  {saving ? "Completing..." : "Complete Setup"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={continueStep}
                  disabled={saving}
                  className="rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(110,17,17,0.18)] disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Continue"}
                </button>
              )}
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}

function ChoiceStep({
  title,
  description,
  options,
  selected,
  onToggle,
}: {
  title: string;
  description: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-2xl border px-5 py-4 text-left text-sm font-black transition ${
                active
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--border)] bg-[#f8f6f2] hover:border-[var(--gold)]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ListStep({
  title,
  description,
  value,
  placeholder,
  items,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  description: string;
  value: string;
  placeholder: string;
  items: string[];
  onChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (item: string) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
      <div className="mt-5 flex gap-3">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-xl border border-[#d8d5cf] bg-[#efeee9] px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--accent)]"
        />
        <button type="button" onClick={onAdd} className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white">
          Add
        </button>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {items.length ? (
          items.map((item) => (
            <span key={item} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-bold">
              {item}
              <button type="button" onClick={() => onRemove(item)} className="text-[var(--accent)]">×</button>
            </span>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[#f8f6f2] px-4 py-5 text-sm font-semibold text-[var(--text-secondary)]">
            Nothing added yet.
          </p>
        )}
      </div>
    </div>
  );
}

function ChecklistStep({
  checklist,
  value,
  maxItems,
  onChange,
  onAdd,
  onRemove,
}: {
  checklist: Record<string, boolean>;
  value: string;
  maxItems: number;
  onChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
}) {
  const count = Object.keys(checklist).length;
  const atLimit = count >= maxItems;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">Pre-Trade Checklist</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Add checklist rules that match your trading plan.
          </p>
        </div>
        <span className="rounded-full bg-[#efeee9] px-3 py-1 text-xs font-black text-[var(--text-secondary)]">
          {count}/{maxItems}
        </span>
      </div>

      <div className="mt-5 flex gap-3">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={atLimit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
            }
          }}
          placeholder={atLimit ? "Checklist limit reached" : "Example: Risk checked"}
          className="min-w-0 flex-1 rounded-xl border border-[#d8d5cf] bg-[#efeee9] px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--accent)] disabled:opacity-60"
        />
        <button type="button" onClick={onAdd} disabled={atLimit} className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
          Add
        </button>
      </div>

      <div className="mt-5 space-y-2">
        {Object.keys(checklist).length ? (
          Object.keys(checklist).map((key) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#efeee9] px-4 py-3 text-sm font-bold">
              <span>{formatChecklistLabel(key)}</span>
              <button type="button" onClick={() => onRemove(key)} className="text-[var(--accent)]">×</button>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[#f8f6f2] px-4 py-5 text-sm font-semibold text-[var(--text-secondary)]">
            No checklist rules added yet.
          </p>
        )}
      </div>
    </div>
  );
}

function ReviewStep({ setup, isExpert }: { setup: SetupState; isExpert: boolean }) {
  const rows = [
    ["Template", setup.setup_template || "Manual"],
    ["Environments", setup.environments.join(", ") || "Not selected"],
    ["Pairs", setup.pairs.join(", ") || "Not added"],
    ["Strategies", setup.strategies.join(", ") || "Not added"],
    ["Trade Types", setup.trade_types.join(", ") || "Not added"],
    ["Checklist", Object.keys(setup.checklist).map(formatChecklistLabel).join(", ") || "Not added"],
    ["Psychology", isExpert ? setup.emotions.join(", ") || "Not added" : "Expert only"],
    ["Notes Template", setup.notes_template ? "Configured" : "Not configured"],
  ];

  return (
    <div>
      <h2 className="text-2xl font-black">Review Setup</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        Confirm your setup. After this, you will land in Settings and can edit anything before using the workspace.
      </p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)]">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-3 border-b border-[var(--border)] bg-[#f8f6f2] px-4 py-4 last:border-b-0 sm:grid-cols-[180px_1fr]">
            <p className="text-sm font-black">{label}</p>
            <p className="text-sm font-bold text-[var(--text-secondary)]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
