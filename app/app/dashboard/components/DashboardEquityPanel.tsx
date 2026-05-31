"use client";

import { useMemo, useState } from "react";

import EquityChart from "@/app/components/dashboard/equity-chart";
import type { DashboardAnalytics, DashboardTrade } from "@/lib/dashboard-analytics";

import AnalyticsPanel from "./AnalyticsPanel";
import MiniStat from "./MiniStat";
import SectionHeader from "./SectionHeader";

type DashboardEquityPanelProps = {
  analytics: DashboardAnalytics;
  trades?: DashboardTrade[];
  variant?: "free" | "expert";
};

function normalizeEnvironment(value: unknown) {
  return String(value || "UNTAGGED").trim().toUpperCase();
}

function getTradeDate(trade: DashboardTrade) {
  return String(
    trade.trade_date ||
      (trade as DashboardTrade & { created_at?: string }).created_at ||
      "",
  );
}

function buildEquityData(trades: DashboardTrade[], environment: string) {
  let runningTotal = 0;

  return [...trades]
    .filter((trade) => {
      if (environment === "ALL") return true;
      return normalizeEnvironment(trade.environment) === environment;
    })
    .sort((a, b) => {
      const aDate = getTradeDate(a);
      const bDate = getTradeDate(b);
      return aDate.localeCompare(bDate);
    })
    .map((trade) => {
      runningTotal += Number(trade.pnl || 0);

      return {
        date: getTradeDate(trade) || "No date",
        equity: Number(runningTotal.toFixed(2)),
      };
    });
}

export default function DashboardEquityPanel({
  analytics,
  trades = [],
  variant = "expert",
}: DashboardEquityPanelProps) {
  const isExpert = variant === "expert";
  const [selectedEnvironment, setSelectedEnvironment] = useState("ALL");

  const environments = useMemo(() => {
    const unique = new Set<string>();

    trades.forEach((trade) => {
      const environment = normalizeEnvironment(trade.environment);
      if (environment && environment !== "UNTAGGED") unique.add(environment);
    });

    return Array.from(unique).sort();
  }, [trades]);

  const chartData = useMemo(() => {
    if (selectedEnvironment === "ALL") return analytics.equityData;
    return buildEquityData(trades, selectedEnvironment);
  }, [analytics.equityData, selectedEnvironment, trades]);

  return (
    <div className={`mt-4 grid grid-cols-1 gap-4 ${isExpert ? "lg:grid-cols-3" : ""}`}>
      <div
        className={`min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] ${
          isExpert ? "lg:col-span-2" : ""
        }`}
      >
        <SectionHeader
          title="Equity Curve"
          subtitle={
            isExpert
              ? "Cumulative PnL growth over time. Use it to spot whether your process is stabilising or drifting."
              : "A simple view of your cumulative journaled PnL. Use it to feel whether your process is moving in the right direction."
          }
          action={
            environments.length > 0 ? (
              <select
                value={selectedEnvironment}
                onChange={(event) => setSelectedEnvironment(event.target.value)}
                className="w-fit rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-[0_4px_16px_rgba(0,0,0,0.03)] outline-none transition hover:border-[var(--gold)]/50"
                aria-label="Filter equity curve"
              >
                <option value="ALL">All Environments</option>
                {environments.map((environment) => (
                  <option key={environment} value={environment}>
                    {environment}
                  </option>
                ))}
              </select>
            ) : null
          }
        />

        <div className="mt-6 min-w-0">
          <EquityChart data={chartData} />
        </div>
      </div>

      {isExpert ? (
        <AnalyticsPanel title="Performance Snapshot" subtitle="A quick read on your current trading profile.">
          <div className="space-y-3">
            <MiniStat label="Wins" value={String(analytics.wins)} />
            <MiniStat label="Losses" value={String(analytics.losses)} />
            <MiniStat label="Break Even" value={String(analytics.breakEven)} />
            <MiniStat
              label="Average RR"
              value={analytics.averageRR ? analytics.averageRR.toFixed(2) : "--"}
            />
          </div>
        </AnalyticsPanel>
      ) : null}
    </div>
  );
}
