type StorageTradeInfoProps = {
  tradeInfo?: [string, string | number][];
  hasSelectedTrade: boolean;
  onEdit: () => void;
};

const cardClass =
  "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]";

export default function StorageTradeInfo({
  tradeInfo = [],
  hasSelectedTrade,
  onEdit,
}: StorageTradeInfoProps) {
  return (
    <section className={cardClass}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Trade Info</h2>

        <button
          type="button"
          disabled={!hasSelectedTrade}
          onClick={onEdit}
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          Edit Mode
        </button>
      </div>

      {!hasSelectedTrade ? (
        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-[var(--border)] bg-[#efeee9] text-sm font-semibold text-[var(--text-secondary)]">
          Select a trade to view details.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {tradeInfo.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[95px_1fr] gap-2">
              <div className="flex items-center rounded-lg border border-[#d8d5cf] bg-white px-3 py-2 text-[10.5px] font-bold tracking-wide text-[#6b7280]">
                {label}
              </div>

              <div className="flex items-center rounded-lg border border-[#d8d5cf] bg-[#efeee9] px-3 py-2 text-[10.5px] font-bold text-[var(--text-secondary)]">
                {String(value)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}