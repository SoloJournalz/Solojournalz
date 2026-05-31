import type { TradeFormData } from "@/types/trade";

const formatChecklistLabel = (key: string) =>
  key.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

type TradeChecklistProps = {
  checklist: TradeFormData["checklist"];
  onToggle: (key: keyof TradeFormData["checklist"]) => void;
  limitLabel?: string;
};

export default function TradeChecklist({
  checklist,
  onToggle,
  limitLabel,
}: TradeChecklistProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">
          Pre-Trade Checklist
        </h2>

        {limitLabel && (
          <span className="rounded-full bg-[#efeee9] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
            {limitLabel}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {Object.entries(checklist).map(([key, value]) => (
          <button
            type="button"
            key={key}
            onClick={() => onToggle(key as keyof TradeFormData["checklist"])}
            className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[#efeee9] px-3 py-2 text-left text-sm font-semibold"
          >
            <span
              className={`h-5 w-5 rounded-md ${
                value ? "bg-[var(--accent)]" : "bg-white"
              }`}
            />
            <span>{formatChecklistLabel(key)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}