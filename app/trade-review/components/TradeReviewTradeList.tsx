type Trade = {
  id: string;
  environment: "LIVE" | "TESTING" | "BACKTESTING" | "CHALLENGE" | null;
  trade_date: string;
  pair: string;
  strategy: string | null;
  result: "WIN" | "LOSS" | "BE" | null;
  pnl?: number | null;
  progress_percent?: 30 | 60 | 100 | null;
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

const getProgress = (trade: Trade) => {
  if (trade.progress_percent === 100 || trade.progress_percent === 60) {
    return trade.progress_percent;
  }

  return 30;
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
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-5 md:flex md:h-full md:min-h-0 md:flex-col">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
            Saved Trades
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight">Select a trade</h2>
        </div>

        <button
          type="button"
          onClick={onDeleteTrade}
          disabled={!selectedTradeId}
          className="rounded-xl bg-[#efeee9] px-4 py-2 text-xs font-black text-[var(--accent)] transition hover:-translate-y-0.5 hover:bg-[var(--accent)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Delete
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-1">
        <select
          value={environmentFilter}
          onChange={(e) => onEnvironmentFilterChange(e.target.value)}
          className="w-full rounded-xl border border-[#d8d5cf] bg-[#efeee9] px-3 py-2.5 text-sm font-semibold text-[var(--text-secondary)] outline-none transition focus:border-[var(--accent)]"
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
          className="w-full rounded-xl border border-[#d8d5cf] bg-[#efeee9] px-3 py-2.5 text-sm font-semibold text-[var(--text-secondary)] outline-none transition focus:border-[var(--accent)]"
        >
          <option>Newest First</option>
          <option>Oldest First</option>
          <option>Wins</option>
          <option>Losses</option>
          <option>Break Even</option>
        </select>

        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search trades..."
          className="w-full rounded-xl border border-[#d8d5cf] bg-[#efeee9] px-3 py-2.5 text-sm font-semibold outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)]"
        />
      </div>

      <div className="mt-3 min-h-[170px] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[#efeee9] p-2 md:min-h-0 md:flex-1">
        {loading ? (
          <div className="flex h-full min-h-[150px] items-center justify-center text-sm font-semibold text-[var(--text-secondary)]">
            Loading trades
          </div>
        ) : trades.length === 0 ? (
          <div className="flex h-full min-h-[150px] items-center justify-center text-sm font-semibold text-[var(--text-secondary)]">
            No trades available.
          </div>
        ) : (
          <div className="space-y-2">
            {trades.map((trade, index) => {
              const progress = getProgress(trade);

              return (
                <button
                  key={trade.id}
                  type="button"
                  onClick={() => onSelectTrade(trade)}
                  className={`w-full rounded-xl px-3 py-3 text-left text-sm font-semibold transition hover:-translate-y-0.5 ${
                    selectedTradeId === trade.id
                      ? "bg-[var(--accent)] text-white shadow-[0_8px_22px_rgba(110,17,17,0.22)]"
                      : "bg-white text-[var(--text-primary)] hover:bg-white hover:shadow-[0_8px_18px_rgba(0,0,0,0.08)]"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate">
                      #{index + 1} · {trade.strategy || "No Strategy"} · {trade.pair}
                    </span>
                    <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[11px]">
                      {progress}%
                    </span>
                  </span>

                  <span className="block pt-1 text-xs opacity-75">
                    {trade.environment || "N/A"} · {trade.result || "N/A"} · {formatPnl(trade.pnl)} · {trade.trade_date}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
