import type { DashboardAnalytics } from "@/lib/dashboard-analytics";

import AnalyticsPanel from "./AnalyticsPanel";
import DashboardEmptyState from "./DashboardEmptyState";

type DashboardPerformanceBreakdownsProps = {
  analytics: DashboardAnalytics;
};

function formatMoney(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

export default function DashboardPerformanceBreakdowns({ analytics }: DashboardPerformanceBreakdownsProps) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
      <AnalyticsPanel title="Pair Performance" subtitle="Top pairs by total PnL.">
        <div className="space-y-3">
          {analytics.pairPerformance.length === 0 ? (
            <DashboardEmptyState
              title="No pair data yet"
              description="Log trades with pairs selected to reveal which markets fit your process best."
            />
          ) : (
            analytics.pairPerformance.map((pair) => (
              <div
                key={pair.name}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[#fbfaf7] px-4 py-3"
              >
                <div>
                  <p className="font-medium">{pair.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {pair.trades} trades · {pair.winRate.toFixed(0)}% WR
                  </p>
                </div>

                <span className={`text-sm font-semibold ${pair.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatMoney(pair.pnl)}
                </span>
              </div>
            ))
          )}
        </div>
      </AnalyticsPanel>

      <AnalyticsPanel title="Strategy Performance" subtitle="Best performing setups.">
        <div className="space-y-3">
          {analytics.strategyPerformance.length === 0 ? (
            <DashboardEmptyState
              title="No strategy data yet"
              description="Name your setups in the trade log to understand which strategies deserve more focus."
            />
          ) : (
            analytics.strategyPerformance.map((strategy) => (
              <div
                key={strategy.name}
                className="rounded-2xl border border-[var(--border)] bg-[#fbfaf7] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{strategy.name}</p>
                  <span className="text-xs text-[var(--gold)]">
                    {strategy.winRate.toFixed(0)}% WR
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm text-[var(--text-secondary)]">
                  <span>{strategy.trades} trades</span>
                  <span>{formatMoney(strategy.pnl)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </AnalyticsPanel>

      <AnalyticsPanel title="Environment Breakdown" subtitle="Where your trades come from.">
        <div className="space-y-3">
          {analytics.environmentBreakdown.length === 0 ? (
            <DashboardEmptyState
              title="No environment data yet"
              description="Use LIVE, TESTING, and BACKTESTING tags so your dashboard separates real execution from practice."
            />
          ) : (
            analytics.environmentBreakdown.map((item) => (
              <div
                key={item.environment}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[#fbfaf7] px-4 py-3"
              >
                <div>
                  <p className="font-medium">{item.environment}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{item.trades} trades</p>
                </div>

                <span className={`text-sm font-semibold ${item.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatMoney(item.pnl)}
                </span>
              </div>
            ))
          )}
        </div>
      </AnalyticsPanel>
    </div>
  );
}
