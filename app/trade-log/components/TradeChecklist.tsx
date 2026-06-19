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
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-4 lg:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight lg:text-xl">
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
            className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[#efeee9] px-3 py-2 text-left text-xs font-semibold sm:text-sm"
          >
            <span
              className={`h-4 w-4 shrink-0 rounded-md sm:h-5 sm:w-5 ${
                value ? "bg-[var(--accent)]" : "bg-white"
              }`}
            />
            <span className="truncate">{formatChecklistLabel(key)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
