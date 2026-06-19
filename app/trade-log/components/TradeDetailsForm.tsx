import { useEffect, useState } from "react";
import type { TradeFormData } from "@/types/trade";
import Field from "./Field";

type UserTradeSettings = {
  environments: string[];
  strategies: string[];
  pairs: string[];
  trade_types: string[];
  emotions: string[];
  checklist: Record<string, boolean>;
  notes_template: string;
};

type TradeDetailsFormProps = {
  form: TradeFormData;
  settings: UserTradeSettings;
  isEditMode: boolean;
  mode?: "capture" | "full" | "execution";
  onReset: () => void;
  updateForm: <K extends keyof TradeFormData>(
    key: K,
    value: TradeFormData[K],
  ) => void;
  updateNumber: (key: keyof TradeFormData, value: string) => void;
};

const toInputValue = (value?: number) => {
  if (value === undefined || value === null || value === 0) return "";
  return String(value);
};

export default function TradeDetailsForm({
  form,
  settings,
  isEditMode,
  mode = "full",
  onReset,
  updateForm,
  updateNumber,
}: TradeDetailsFormProps) {
  const [positionSizeInput, setPositionSizeInput] = useState(
    toInputValue(form.position_size),
  );

  useEffect(() => {
    setPositionSizeInput(toInputValue(form.position_size));
  }, [form.position_size]);

  const showExecutionFields = mode === "full" || mode === "execution";

  return (
    <section
      onDoubleClick={() => {
        if (isEditMode || mode !== "capture") return;
        onReset();
      }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
    >
      <h2 className="mb-4 text-xl font-bold tracking-tight">
        {mode === "capture"
          ? "Entry Details"
          : isEditMode
            ? "Edit Execution Details"
            : "Trade Info"}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Environment">
          <select
            value={form.environment}
            onChange={(e) =>
              updateForm(
                "environment",
                e.target.value as TradeFormData["environment"],
              )
            }
            className="input"
          >
            {settings.environments.map((environment) => (
              <option key={environment} value={environment}>
                {environment}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Date">
          <input
            type="date"
            value={form.trade_date}
            onChange={(e) => updateForm("trade_date", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Entry Time">
          <input
            value={form.entry_time || ""}
            onChange={(e) => updateForm("entry_time", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Pair">
          <select
            value={form.pair}
            onChange={(e) => updateForm("pair", e.target.value)}
            className="input"
          >
            {settings.pairs.map((pair) => (
              <option key={pair} value={pair}>
                {pair}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Strategy">
          <select
            value={form.strategy || ""}
            onChange={(e) => updateForm("strategy", e.target.value)}
            className="input"
          >
            {settings.strategies.map((strategy) => (
              <option key={strategy} value={strategy}>
                {strategy}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Trade Type">
          <select
            value={form.trade_type || ""}
            onChange={(e) => updateForm("trade_type", e.target.value)}
            className="input"
          >
            {settings.trade_types.map((tradeType) => (
              <option key={tradeType} value={tradeType}>
                {tradeType}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Direction">
          <select
            value={form.direction}
            onChange={(e) =>
              updateForm("direction", e.target.value as "BUY" | "SELL")
            }
            className="input"
          >
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
          </select>
        </Field>

        <Field label="Entry Price">
          <input
            type="number"
            step="0.00001"
            min="0"
            value={toInputValue(form.entry_price)}
            onChange={(e) => updateNumber("entry_price", e.target.value)}
            placeholder="4454.368"
            className="input"
          />
        </Field>

        {showExecutionFields && (
          <>
            <Field label="Position Size">
              <input
                type="text"
                inputMode="decimal"
                value={positionSizeInput}
                onChange={(e) => {
                  const value = e.target.value;

                  if (!/^\d*\.?\d*$/.test(value)) return;

                  setPositionSizeInput(value);
                  updateNumber("position_size", value);
                }}
                placeholder="0.01"
                className="input"
              />
            </Field>

            <Field label="Stop Loss">
              <input
                type="number"
                step="0.00001"
                min="0"
                value={toInputValue(form.stop_loss)}
                onChange={(e) => updateNumber("stop_loss", e.target.value)}
                placeholder="4434.831"
                className="input"
              />
            </Field>

            <Field label="Take Profit">
              <input
                type="number"
                step="0.00001"
                min="0"
                value={toInputValue(form.take_profit)}
                onChange={(e) => updateNumber("take_profit", e.target.value)}
                placeholder="4511.475"
                className="input"
              />
            </Field>

            <Field label="Exit Price">
              <input
                type="number"
                step="0.00001"
                min="0"
                value={toInputValue(form.exit_price)}
                onChange={(e) => updateNumber("exit_price", e.target.value)}
                placeholder="4480.000"
                className="input"
              />
            </Field>

            <Field label="P/L">
              <input
                type="number"
                step="0.01"
                value={toInputValue(form.pnl)}
                onChange={(e) => updateNumber("pnl", e.target.value)}
                placeholder="25.50"
                className="input"
              />
            </Field>

            <Field label="Risk %">
              <input
                type="number"
                value={form.risk_percent ? String(form.risk_percent) : ""}
                readOnly
                placeholder="Auto"
                className="input cursor-not-allowed opacity-70"
              />
            </Field>

            <Field label="Result">
              <select
                value={form.result}
                onChange={(e) =>
                  updateForm("result", e.target.value as "WIN" | "LOSS" | "BE")
                }
                className="input"
              >
                <option value="BE">Break Even</option>
                <option value="WIN">Win</option>
                <option value="LOSS">Loss</option>
              </select>
            </Field>
          </>
        )}
      </div>
    </section>
  );
}
