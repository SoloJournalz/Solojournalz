import { PLANS, PlanKey } from "@/lib/plans";

type StorageChecklistProps = {
  checklist: Record<string, boolean> | null | undefined;
  currentPlan: PlanKey;
};

const cardClass =
  "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]";

const formatChecklistLabel = (key: string) =>
  key.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default function StorageChecklist({
  checklist,
  currentPlan,
}: StorageChecklistProps) {
  const entries = Object.entries(checklist || {}).slice(
    0,
    PLANS[currentPlan].checklistItems,
  );

  return (
    <section className={cardClass}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">
          Pre-Trade Checklist
        </h2>

        <span className="rounded-full bg-[#efeee9] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
          {entries.length}/{PLANS[currentPlan].checklistItems}
        </span>
      </div>

      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[#efeee9] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)]">
            No checklist saved.
          </div>
        ) : (
          entries.map(([key, checked]) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[#efeee9] px-3 py-2 text-sm font-semibold"
            >
              <span
                className={`h-5 w-5 rounded-md ${
                  checked ? "bg-[var(--accent)]" : "bg-white"
                }`}
              />

              {formatChecklistLabel(key)}
            </div>
          ))
        )}
      </div>
    </section>
  );
}