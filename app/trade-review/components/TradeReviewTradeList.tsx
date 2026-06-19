type Trade = {
  id: string;
  environment: "LIVE" | "TESTING" | "BACKTESTING" | "CHALLENGE" | null;
  trade_date: string;
  pair: string;
  strategy: string | null;
  result: "WIN" | "LOSS" | "BE" | null;
  pnl?: number | null;
  created_at: string;
};

type TradeReviewTradeListProps = {
  trades?: Trade[];
  selectedTradeId?: string;
  loading: boolean;
  search: string;
  filter: string;
  environmentFilter: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onEnvironmentFilterChange: (value: string) => void;
  onSelectTrade: (trade: Trade) => void;
  onDeleteTrade: () => void;
};

const formatPnl = (value?: number | null) => {
  if (value === null || value === undefined) return "P/L N/A";

  const number = Number(value);

  if (number > 0) return `P/L +${number}`;
  return `P/L ${number}`;
};

export default function TradeReviewTradeList({
  trades = [],
  selectedTradeId,
  loading,
  search,
  filter,
  environmentFilter,
  onSearchChange,
  onFilterChange,
  onEnvironmentFilterChange,
  onSelectTrade,
  onDeleteTrade,
}: TradeReviewTradeListProps) {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-4 lg:p-5">
      <div className="shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
          Saved Trades
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight sm:text-xl">
          Select a trade
        </h2>
      </div>

      <div className="mt-3 grid shrink-0 gap-2">
        <button
          type="button"
          onClick={onDeleteTrade}
          disabled={!selectedTradeId}
          className="rounded-xl bg-[#efeee9] px-4 py-2 text-sm font-bold text-[var(--accent)] transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          Delete selected
        </button>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <select
            value={environmentFilter}
            onChange={(e) => onEnvironmentFilterChange(e.target.value)}
            className="w-full rounded-xl border border-[#d8d5cf] bg-[#efeee9] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] outline-none focus:border-[var(--accent)]"
          >
            <option value="All">All Environments</option>
            <option value="LIVE">Live</option>
            <option value="TESTING">Testing</option>
            <option value="BACKTESTING">Backtesting</option>
            <option value="CHALLENGE">Challenge</option>
          </select>

          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="rounded-xl border border-[#d8d5cf] bg-[#efeee9] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] outline-none focus:border-[var(--accent)]"
          >
            <option>Newest First</option>
            <option>Oldest First</option>
            <option>Wins</option>
            <option>Losses</option>
            <option>Break Even</option>
          </select>
        </div>

        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search trades..."
          className="w-full rounded-xl border border-[#d8d5cf] bg-[#efeee9] px-4 py-2.5 text-sm font-semibold outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)]"
        />
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[#efeee9] p-2">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-[var(--text-secondary)]">
            Loading trades
          </div>
        ) : trades.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-[var(--text-secondary)]">
            No trades available.
          </div>
        ) : (
          <div className="space-y-2">
            {trades.map((trade, index) => (
              <button
                key={trade.id}
                type="button"
                onClick={() => onSelectTrade(trade)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  selectedTradeId === trade.id
                    ? "bg-[var(--accent)] text-white"
                    : "bg-white text-[var(--text-primary)] hover:bg-black/5"
                }`}
              >
                #{index + 1} · {trade.strategy || "No Strategy"} · {trade.pair}

                <span className="block pt-1 text-xs opacity-70">
                  {trade.environment || "N/A"} · {trade.result || "N/A"} · {formatPnl(trade.pnl)} · {trade.trade_date}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
