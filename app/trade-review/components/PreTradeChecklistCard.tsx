type PreTradeChecklistCardProps = {
  checklist?: Record<string, boolean> | null;
  onToggle?: (key: string) => void;
};

export default function PreTradeChecklistCard({
  checklist,
  onToggle,
}: PreTradeChecklistCardProps) {
  const entries = Object.entries(checklist || {});
  const completed = entries.filter(([, checked]) => checked).length;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">Pre-trade Checklist</h2>

        <span className="rounded-full bg-[#efeee9] px-3 py-1 text-xs font-black text-[var(--text-secondary)]">
          {entries.length ? `${completed}/${entries.length}` : "N/A"}
        </span>
      </div>

      {entries.length ? (
        <div className="grid gap-2">
          {entries.map(([key, checked]) => (
            <button
              key={key}
              type="button"
              onClick={() => onToggle?.(key)}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[#efeee9] px-3 py-3 text-left text-sm font-bold transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
            >
              <span
                className={`h-5 w-5 shrink-0 rounded-md border transition ${
                  checked
                    ? "border-[var(--accent)] bg-[var(--accent)]"
                    : "border-[#d8d5cf] bg-white"
                }`}
              />
              <span className="capitalize">{key.replaceAll("_", " ")}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-[#efeee9] px-3 py-3 text-sm font-semibold text-[var(--text-secondary)]">
          Select a saved trade to view its checklist.
        </p>
      )}
    </section>
  );
}
