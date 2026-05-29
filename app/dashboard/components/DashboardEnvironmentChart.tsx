import type { DashboardAnalytics } from "@/lib/dashboard-analytics";

import AnalyticsPanel from "./AnalyticsPanel";
import DashboardEmptyState from "./DashboardEmptyState";

type DashboardEnvironmentChartProps = {
  analytics: DashboardAnalytics;
};

function formatMoney(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

function getToneClass(value: number) {
  if (value > 0) return "text-green-700";
  if (value < 0) return "text-red-700";
  return "text-[var(--text-primary)]";
}

export default function DashboardEnvironmentChart({ analytics }: DashboardEnvironmentChartProps) {
  const data = analytics.environmentBreakdown
    .map((item) => ({
      name: item.environment,
      pnl: Number(item.pnl || 0),
      trades: Number(item.trades || 0),
    }))
    .sort((a, b) => b.pnl - a.pnl);

  const strongest = data[0];
  const totalTrades = data.reduce((sum, item) => sum + item.trades, 0);
  const maxAbsPnl = Math.max(...data.map((item) => Math.abs(item.pnl)), 1);

  return (
    <div className="mt-4">
      <AnalyticsPanel
        title="Environment Edge"
        subtitle="A cleaner comparison of where your current results are coming from. Keep the equity curve for direction; use this for environment quality."
      >
        {data.length === 0 ? (
          <DashboardEmptyState
            title="No environment performance yet"
            description="Tag trades with LIVE, TESTING, or BACKTESTING to reveal where your edge is strongest."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[#fbfaf7] p-5 xl:col-span-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                Strongest Environment
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                {strongest?.name || "--"}
              </p>
              <p className={`mt-2 text-sm font-semibold ${getToneClass(strongest?.pnl || 0)}`}>
                {formatMoney(strongest?.pnl || 0)} journaled PnL
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                This gives Expert users a quick read on whether practice, testing, or live execution is currently producing the cleanest results.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 xl:col-span-2">
              <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
                <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-[#efeee9] px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  <span>Environment</span>
                  <span className="text-right">Trades</span>
                  <span className="text-right">PnL</span>
                </div>

                <div className="divide-y divide-[var(--border)] bg-white">
                  {data.map((item) => {
                    const width = `${Math.max(10, Math.round((Math.abs(item.pnl) / maxAbsPnl) * 100))}%`;
                    const share = totalTrades > 0 ? Math.round((item.trades / totalTrades) * 100) : 0;

                    return (
                      <div key={item.name} className="px-4 py-4">
                        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3">
                          <div>
                            <p className="font-semibold text-[var(--text-primary)]">{item.name}</p>
                            <p className="mt-1 text-xs text-[var(--text-secondary)]">
                              {share}% of tracked environment trades
                            </p>
                          </div>

                          <span className="text-sm font-medium text-[var(--text-secondary)]">
                            {item.trades}
                          </span>

                          <span className={`text-sm font-bold ${getToneClass(item.pnl)}`}>
                            {formatMoney(item.pnl)}
                          </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#efeee9]">
                          <div
                            className={`h-full rounded-full ${item.pnl >= 0 ? "bg-green-600" : "bg-[var(--accent)]"}`}
                            style={{ width }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnalyticsPanel>
    </div>
  );
}
