"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/layout/navbar";
import PageLoading from "@/app/components/layout/page-loading";
import { supabase } from "@/lib/supabase/client";
import { PlanKey } from "@/lib/plans";

type WizardStep =
  | "welcome"
  | "environments"
  | "markets"
  | "assets"
  | "strategies"
  | "psychology"
  | "risk"
  | "fields"
  | "review";

type SetupTemplate = "forex" | "crypto" | "stocks" | "manual" | null;

type RiskRules = {
  riskPercent: string;
  maxDailyLoss: string;
  maxWeeklyLoss: string;
  rrTarget: string;
};

type PsychologyToggles = {
  confidenceRating: boolean;
  disciplineRating: boolean;
  emotionalState: boolean;
  mistakeTracking: boolean;
};

type SetupState = {
  setup_template: SetupTemplate;
  environments: string[];
  markets: string[];
  pairs: string[];
  strategies: string[];
  trade_types: string[];
  emotions: string[];
  checklist: Record<string, boolean>;
  notes_template: string;
  risk_rules: RiskRules;
  psychology_tracking: PsychologyToggles;
  journal_fields: string[];
};

const cardClass =
  "rounded-3xl border border-[var(--border)] bg-white p-6 shadow-[0_16px_40px_rgba(0,0,0,0.05)]";
const optionClass =
  "rounded-2xl border border-[var(--border)] bg-[#f8f6f2] p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--gold)] hover:bg-white hover:shadow-sm";

const manualSteps: WizardStep[] = [
  "welcome",
  "environments",
  "markets",
  "assets",
  "strategies",
  "psychology",
  "risk",
  "fields",
  "review",
];

const freeManualSteps: WizardStep[] = manualSteps.filter(
  (step) => step !== "psychology",
);

const templateSteps: WizardStep[] = ["welcome", "review"];

const defaultRiskRules: RiskRules = {
  riskPercent: "1",
  maxDailyLoss: "3",
  maxWeeklyLoss: "6",
  rrTarget: "2",
};

const defaultPsychologyTracking: PsychologyToggles = {
  confidenceRating: true,
  disciplineRating: true,
  emotionalState: true,
  mistakeTracking: true,
};

const emptySetupState: SetupState = {
  setup_template: null,
  environments: [],
  markets: [],
  pairs: [],
  strategies: [],
  trade_types: [],
  emotions: [],
  checklist: {},
  notes_template: "",
  risk_rules: defaultRiskRules,
  psychology_tracking: defaultPsychologyTracking,
  journal_fields: [],
};

const templates: Record<"forex" | "crypto" | "stocks", SetupState> = {
  forex: {
    ...emptySetupState,
    setup_template: "forex",
    environments: ["Live", "Demo"],
    markets: ["Forex", "Commodities"],
    pairs: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"],
    strategies: ["Breakout", "Trend Continuation", "Reversal"],
    trade_types: ["Scalp", "Day Trade", "Swing"],
    emotions: ["Calm", "Confident", "Impatient"],
    checklist: {
      plan_confirmed: false,
      risk_checked: false,
      news_checked: false,
    },
    notes_template:
      "Session:\nSetup:\nReason for entry:\nRisk plan:\nTrade management:\nLesson:",
    risk_rules: defaultRiskRules,
    psychology_tracking: defaultPsychologyTracking,
    journal_fields: [
      "Entry",
      "Exit",
      "Stop Loss",
      "Take Profit",
      "Session",
      "Setup",
      "Notes",
    ],
  },
  crypto: {
    ...emptySetupState,
    setup_template: "crypto",
    environments: ["Live", "Paper"],
    markets: ["Crypto"],
    pairs: ["BTC", "ETH"],
    strategies: ["Breakout", "Trend Continuation", "Swing"],
    trade_types: ["Scalp", "Day Trade", "Swing"],
    emotions: ["Calm", "FOMO", "Patient"],
    checklist: {
      risk_checked: false,
      market_condition_checked: false,
      invalidation_clear: false,
    },
    notes_template:
      "Market condition:\nSetup:\nReason for entry:\nRisk:\nTrade management:\nLesson:",
    risk_rules: defaultRiskRules,
    psychology_tracking: defaultPsychologyTracking,
    journal_fields: ["Entry", "Exit", "Risk", "Market Condition", "Notes"],
  },
  stocks: {
    ...emptySetupState,
    setup_template: "stocks",
    environments: ["Live", "Paper"],
    markets: ["Stocks"],
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
      "Ticker:\nSector:\nSetup:\nReason for entry:\nRisk:\nTrade management:\nLesson:",
    risk_rules: defaultRiskRules,
    psychology_tracking: defaultPsychologyTracking,
    journal_fields: ["Ticker", "Sector", "Entry", "Exit", "Risk", "Notes"],
  },
};

const environmentOptions = ["Live", "Demo", "Paper"];
const marketOptions = ["Forex", "Crypto", "Stocks", "Indices", "Commodities", "Futures"];
const strategyExamples = ["Breakout", "Trend Continuation", "Reversal", "Scalping", "Swing"];
const fieldOptions = [
  "Entry",
  "Exit",
  "Stop Loss",
  "Take Profit",
  "Notes",
  "Session",
  "Strategy",
  "Emotion",
  "Screenshot",
  "Risk",
  "Ticker",
  "Sector",
  "Market Condition",
];

const mergeUnique = (items: string[], value: string) => {
  const clean = value.trim();
  if (!clean) return items;
  if (items.some((item) => item.toLowerCase() === clean.toLowerCase())) return items;
  return [...items, clean];
};

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanKey>("FREE");
  const [stepIndex, setStepIndex] = useState(0);
  const [setup, setSetup] = useState<SetupState>(emptySetupState);
  const [newAsset, setNewAsset] = useState("");
  const [newStrategy, setNewStrategy] = useState("");

  const isExpert = currentPlan === "EXPERT";
  const steps = useMemo(() => {
    if (setup.setup_template && setup.setup_template !== "manual") return templateSteps;
    return isExpert ? manualSteps : freeManualSteps;
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

      const { data: planData } = await supabase
        .from("user_plans")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!planData) {
        router.replace("/select-plan");
        return;
      }

      const resolvedPlan: PlanKey = planData.plan === "EXPERT" ? "EXPERT" : "FREE";
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
        router.replace("/dashboard");
        return;
      }

      if (settingsData) {
        setSetup({
          setup_template: settingsData.setup_template || null,
          environments: settingsData.environments || [],
          markets: settingsData.markets || [],
          pairs: settingsData.pairs || [],
          strategies: settingsData.strategies || [],
          trade_types: settingsData.trade_types || [],
          emotions: settingsData.emotions || [],
          checklist: settingsData.checklist || {},
          notes_template: settingsData.notes_template || "",
          risk_rules: settingsData.risk_rules || defaultRiskRules,
          psychology_tracking:
            settingsData.psychology_tracking || defaultPsychologyTracking,
          journal_fields: settingsData.journal_fields || [],
        });
      }

      setLoading(false);
    };

    loadSetup();
  }, [router]);

  const saveProgress = async (nextSetup = setup) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase.from("user_trade_settings").upsert(
      {
        user_id: user.id,
        environments: nextSetup.environments,
        markets: nextSetup.markets,
        pairs: nextSetup.pairs,
        strategies: nextSetup.strategies,
        trade_types: nextSetup.trade_types,
        emotions: isExpert ? nextSetup.emotions : [],
        checklist: nextSetup.checklist,
        notes_template: nextSetup.notes_template,
        setup_template: nextSetup.setup_template,
        risk_rules: nextSetup.risk_rules,
        psychology_tracking: isExpert
          ? nextSetup.psychology_tracking
          : defaultPsychologyTracking,
        journal_fields: nextSetup.journal_fields,
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

  const toggleArrayValue = (key: keyof SetupState, value: string) => {
    setSetup((current) => {
      const currentValue = current[key];
      if (!Array.isArray(currentValue)) return current;

      return {
        ...current,
        [key]: currentValue.includes(value)
          ? currentValue.filter((item) => item !== value)
          : [...currentValue, value],
      };
    });
  };

  const addAsset = () => {
    setSetup((current) => ({ ...current, pairs: mergeUnique(current.pairs, newAsset) }));
    setNewAsset("");
  };

  const addStrategy = (value = newStrategy) => {
    setSetup((current) => ({
      ...current,
      strategies: mergeUnique(current.strategies, value),
    }));
    setNewStrategy("");
  };

  const removeFromArray = (key: "pairs" | "strategies", value: string) => {
    setSetup((current) => ({
      ...current,
      [key]: current[key].filter((item) => item !== value),
    }));
  };

  const continueStep = async () => {
    setSaving(true);
    const ok = await saveProgress();
    setSaving(false);
    if (!ok) return;

    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const backStep = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

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
        markets: setup.markets,
        pairs: setup.pairs,
        strategies: setup.strategies,
        trade_types: setup.trade_types,
        emotions: isExpert ? setup.emotions : [],
        checklist: setup.checklist,
        notes_template: setup.notes_template,
        setup_template: setup.setup_template,
        risk_rules: setup.risk_rules,
        psychology_tracking: isExpert
          ? setup.psychology_tracking
          : defaultPsychologyTracking,
        journal_fields: setup.journal_fields,
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

    router.replace("/dashboard");
  };

  if (loading) {
    return <PageLoading label="Loading Setup" workspace />;
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <Navbar />

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
              Let's configure your trading journal so Dashboard, Trade Log, and Storage open with the settings you actually trade with.
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
                Use a template for a fast setup, or configure each settings section manually.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {([
                  ["forex", "Forex", "Live/Demo, London/New York, major pairs."],
                  ["crypto", "Crypto", "Live/Paper, BTC, ETH, market condition notes."],
                  ["stocks", "Stocks", "Live/Paper, tickers, sector notes, risk rules."],
                ] as const).map(([key, title, description]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => chooseTemplate(key)}
                    className={optionClass}
                  >
                    <span className="rounded-full bg-[#fff8e8] px-3 py-1 text-xs font-black text-[var(--gold)]">
                      Recommended
                    </span>
                    <h3 className="mt-4 text-xl font-black">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                      {description}
                    </p>
                  </button>
                ))}

                <button type="button" onClick={chooseManual} className={optionClass}>
                  <span className="rounded-full bg-[#efeee9] px-3 py-1 text-xs font-black text-[var(--text-secondary)]">
                    Advanced
                  </span>
                  <h3 className="mt-4 text-xl font-black">Configure Manually</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    Go step by step through environments, markets, assets, strategies, risk, and journal fields.
                  </p>
                </button>
              </div>
            </div>
          ) : null}

          {activeStep === "environments" ? (
            <ChoiceStep
              title="Trading Environments"
              description="Select the environments you want available in Trade Log. Multiple selections are allowed."
              options={environmentOptions}
              selected={setup.environments}
              onToggle={(value) => toggleArrayValue("environments", value)}
            />
          ) : null}

          {activeStep === "markets" ? (
            <ChoiceStep
              title="Markets"
              description="Choose the markets you trade. These help shape your assets and journal fields."
              options={marketOptions}
              selected={setup.markets}
              onToggle={(value) => toggleArrayValue("markets", value)}
            />
          ) : null}

          {activeStep === "assets" ? (
            <ListStep
              title="Pairs / Assets"
              description="Add the pairs, tickers, or assets you want available in Trade Log."
              value={newAsset}
              placeholder="Example: EURUSD, BTCUSD, AAPL"
              items={setup.pairs}
              onChange={setNewAsset}
              onAdd={addAsset}
              onRemove={(item) => removeFromArray("pairs", item)}
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
                onAdd={() => addStrategy()}
                onRemove={(item) => removeFromArray("strategies", item)}
              />
              <div className="mt-5 flex flex-wrap gap-2">
                {strategyExamples.map((strategy) => (
                  <button
                    key={strategy}
                    type="button"
                    onClick={() => addStrategy(strategy)}
                    className="rounded-full border border-[var(--border)] bg-[#f8f6f2] px-4 py-2 text-sm font-bold transition hover:bg-white"
                  >
                    + {strategy}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {activeStep === "psychology" ? (
            <div>
              <h2 className="text-2xl font-black">Psychology Tracking</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Expert users can track decision quality and emotional execution.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {([
                  ["confidenceRating", "Confidence Rating"],
                  ["disciplineRating", "Discipline Rating"],
                  ["emotionalState", "Emotional State"],
                  ["mistakeTracking", "Mistake Tracking"],
                ] as const).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center justify-between rounded-2xl border border-[var(--border)] bg-[#f8f6f2] p-4 text-sm font-bold"
                  >
                    {label}
                    <input
                      type="checkbox"
                      checked={setup.psychology_tracking[key]}
                      onChange={() =>
                        setSetup((current) => ({
                          ...current,
                          psychology_tracking: {
                            ...current.psychology_tracking,
                            [key]: !current.psychology_tracking[key],
                          },
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {activeStep === "risk" ? (
            <div>
              <h2 className="text-2xl font-black">Risk Management</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Set the rules you want visible while reviewing your trading performance.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <NumberInput label="Risk %" value={setup.risk_rules.riskPercent} onChange={(value) => setSetup((current) => ({ ...current, risk_rules: { ...current.risk_rules, riskPercent: value } }))} />
                <NumberInput label="Max Daily Loss %" value={setup.risk_rules.maxDailyLoss} onChange={(value) => setSetup((current) => ({ ...current, risk_rules: { ...current.risk_rules, maxDailyLoss: value } }))} />
                <NumberInput label="Max Weekly Loss %" value={setup.risk_rules.maxWeeklyLoss} onChange={(value) => setSetup((current) => ({ ...current, risk_rules: { ...current.risk_rules, maxWeeklyLoss: value } }))} />
                <NumberInput label="R:R Target" value={setup.risk_rules.rrTarget} onChange={(value) => setSetup((current) => ({ ...current, risk_rules: { ...current.risk_rules, rrTarget: value } }))} />
              </div>
            </div>
          ) : null}

          {activeStep === "fields" ? (
            <ChoiceStep
              title="Journal Fields"
              description="Choose which fields you want to focus on inside Trade Log."
              options={fieldOptions}
              selected={setup.journal_fields}
              onToggle={(value) => toggleArrayValue("journal_fields", value)}
            />
          ) : null}

          {activeStep === "review" ? (
            <ReviewStep setup={setup} isExpert={isExpert} />
          ) : null}

          {activeStep !== "welcome" ? (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
              <button
                type="button"
                onClick={backStep}
                disabled={stepIndex === 0 || saving}
                className="rounded-2xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>

              {activeStep === "review" ? (
                <button
                  type="button"
                  onClick={completeSetup}
                  disabled={saving}
                  className="rounded-2xl bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(110,17,17,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Completing..." : "Complete Setup"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={continueStep}
                  disabled={saving}
                  className="rounded-2xl bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(110,17,17,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
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
              className={`rounded-2xl border p-4 text-left text-sm font-black transition ${
                active
                  ? "border-[var(--accent)] bg-[#fff8e8] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[#f8f6f2] text-[var(--text-primary)] hover:bg-white"
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
  onRemove: (value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
      <div className="mt-6 flex gap-3">
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
          className="min-w-0 flex-1 rounded-2xl border border-[var(--border)] bg-[#efeee9] px-4 py-3 text-sm font-bold outline-none focus:border-[var(--accent)]"
        />
        <button
          type="button"
          onClick={onAdd}
          className="rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white"
        >
          Add
        </button>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {items.length ? (
          items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-bold"
            >
              {item}
              <button type="button" onClick={() => onRemove(item)} className="text-[var(--accent)]">
                ×
              </button>
            </span>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[#f8f6f2] px-4 py-5 text-sm font-bold text-[var(--text-secondary)]">
            Nothing added yet.
          </p>
        )}
      </div>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="number"
        min="0"
        step="0.1"
        className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[#efeee9] px-4 py-3 text-sm font-bold outline-none focus:border-[var(--accent)]"
      />
    </label>
  );
}

function ReviewStep({ setup, isExpert }: { setup: SetupState; isExpert: boolean }) {
  const rows = [
    ["Template", setup.setup_template || "Manual"],
    ["Markets", setup.markets.join(", ") || "Not selected"],
    ["Environments", setup.environments.join(", ") || "Not selected"],
    ["Assets", setup.pairs.join(", ") || "Not selected"],
    ["Strategies", setup.strategies.join(", ") || "Not selected"],
    ["Risk Rules", `${setup.risk_rules.riskPercent}% risk, ${setup.risk_rules.rrTarget}R target`],
    ["Journal Fields", setup.journal_fields.join(", ") || "Default fields"],
    ["Psychology", isExpert ? "Enabled" : "Expert only"],
  ];

  return (
    <div>
      <h2 className="text-2xl font-black">Review Setup</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        Confirm your setup. You can edit everything later from Settings.
      </p>
      <div className="mt-6 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[#f8f6f2]">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-2 p-4 sm:grid-cols-[180px_1fr]">
            <p className="text-sm font-black text-[var(--text-primary)]">{label}</p>
            <p className="text-sm font-semibold leading-6 text-[var(--text-secondary)]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
