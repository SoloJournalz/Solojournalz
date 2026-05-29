const cardClass =
  "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]";

const formatChecklistLabel = (key: string) =>
  key.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

type ChecklistSettingsProps = {
  checklist: Record<string, boolean>;
  newChecklistItem: string;
  maxItems: number;
  setNewChecklistItem: (value: string) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
  onToggle: (key: string) => void;
};

export default function ChecklistSettings({
  checklist,
  newChecklistItem,
  maxItems,
  setNewChecklistItem,
  onAdd,
  onRemove,
  onToggle,
}: ChecklistSettingsProps) {
  const checklistCount = Object.keys(checklist).length;
  const isAtLimit = checklistCount >= maxItems;

  return (
    <section className={cardClass}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Pre-Trade Checklist
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Create checklist rules that match your trading plan.
          </p>
        </div>

        <span className="rounded-full bg-[#efeee9] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
          {checklistCount}/{maxItems}
        </span>
      </div>

      <div className="mt-5 flex gap-3">
        <input
          value={newChecklistItem}
          onChange={(e) => setNewChecklistItem(e.target.value)}
          disabled={isAtLimit}
          placeholder={
            isAtLimit ? "Checklist limit reached" : "Add checklist item..."
          }
          className="min-w-0 flex-1 rounded-xl border border-[#d8d5cf] bg-[#efeee9] px-4 py-3 text-sm font-semibold outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)] disabled:opacity-60"
        />

        <button
          type="button"
          onClick={onAdd}
          disabled={isAtLimit}
          className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {checklistCount === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-[var(--border)] bg-[#f8f6f2] px-4 py-5 text-sm font-semibold leading-6 text-[var(--text-secondary)]">
          Create checklist rules that match your trading plan.
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {Object.entries(checklist).map(([key, value]) => (
            <div
              key={key}
              className="flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[#efeee9] px-3 py-3 text-sm font-semibold"
            >
              <button
                type="button"
                onClick={() => onToggle(key)}
                className="flex items-center gap-3"
              >
                <span
                  className={`h-5 w-5 rounded-md ${
                    value ? "bg-[var(--accent)]" : "bg-white"
                  }`}
                />
                <span>{formatChecklistLabel(key)}</span>
              </button>

              <button
                type="button"
                onClick={() => onRemove(key)}
                className="text-sm font-bold text-[var(--accent)]"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
