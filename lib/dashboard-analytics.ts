export type DashboardTrade = {
  id: string;
  trade_date: string | null;
  entry_time?: string | null;
  environment?: string | null;
  pair?: string | null;
  strategy?: string | null;
  trade_type?: string | null;
  direction?: string | null;
  entry_price?: number | string | null;
  position_size?: number | string | null;
  stop_loss?: number | string | null;
  take_profit?: number | string | null;
  risk_percent?: number | string | null;
  pnl?: number | string | null;
  result?: "WIN" | "LOSS" | "BE" | string | null;
  checklist?: unknown;
  emotions?: unknown;
  notes?: string | null;
  created_at?: string | null;
};

export type EquityPoint = {
  date: string;
  equity: number;
};

export type GroupPerformance = {
  name: string;
  trades: number;
  wins: number;
  losses: number;
  pnl: number;
  winRate: number;
};

export type EnvironmentBreakdown = {
  environment: string;
  trades: number;
  pnl: number;
};

export type DashboardPlan = "FREE" | "EXPERT" | string;

export type DashboardAnalytics = {
  totalTrades: number;
  wins: number;
  losses: number;
  breakEven: number;
  winRate: number;
  netPnl: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number | null;
  averageRisk: number;
  averageRR: number | null;
  bestTrade: number;
  worstTrade: number;
  equityData: EquityPoint[];
  recentTrades: DashboardTrade[];
  pairPerformance: GroupPerformance[];
  strategyPerformance: GroupPerformance[];
  environmentBreakdown: EnvironmentBreakdown[];
  bestWinStreak: number;
  currentWinStreak: number;
  currentLossStreak: number;
  psychologyEntries: number;
  consistencyScore: number;
};

function toNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function hasMeaningfulValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value);
}

function normalizeEnvironmentLabel(value?: string | null): string | null {
  const clean = String(value || "").trim();
  if (!clean) return null;

  const lowered = clean.toLowerCase();

  if (["unknown", "n/a", "na", "untagged", "undefined", "null"].includes(lowered)) {
    return null;
  }

  return clean;
}

function sortTrades(trades: DashboardTrade[]) {
  return [...trades].sort((a, b) => {
    const aDate = `${a.trade_date || ""} ${a.entry_time || ""} ${a.created_at || ""}`;
    const bDate = `${b.trade_date || ""} ${b.entry_time || ""} ${b.created_at || ""}`;
    return aDate.localeCompare(bDate);
  });
}

function calculateAverageRR(trades: DashboardTrade[]): number | null {
  const rrValues = trades
    .map((trade) => {
      const entry = toNumber(trade.entry_price);
      const stop = toNumber(trade.stop_loss);
      const target = toNumber(trade.take_profit);

      const risk = Math.abs(entry - stop);
      const reward = Math.abs(target - entry);

      if (!entry || !stop || !target || risk <= 0 || reward <= 0) {
        return null;
      }

      return reward / risk;
    })
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  if (rrValues.length === 0) return null;

  return rrValues.reduce((sum, value) => sum + value, 0) / rrValues.length;
}

function calculateGroupPerformance(
  trades: DashboardTrade[],
  key: "pair" | "strategy",
  fallback: string,
): GroupPerformance[] {
  const grouped = trades.reduce<Record<string, GroupPerformance>>((acc, trade) => {
    const name = String(trade[key] || fallback);

    if (!acc[name]) {
      acc[name] = {
        name,
        trades: 0,
        wins: 0,
        losses: 0,
        pnl: 0,
        winRate: 0,
      };
    }

    acc[name].trades += 1;
    acc[name].pnl += toNumber(trade.pnl);

    if (trade.result === "WIN") acc[name].wins += 1;
    if (trade.result === "LOSS") acc[name].losses += 1;

    return acc;
  }, {});

  return Object.values(grouped)
    .map((item) => ({
      ...item,
      winRate: item.trades > 0 ? (item.wins / item.trades) * 100 : 0,
    }))
    .sort((a, b) => b.pnl - a.pnl);
}

export function getDashboardAnalytics(rawTrades: DashboardTrade[]): DashboardAnalytics {
  const trades = sortTrades(rawTrades);
  const totalTrades = trades.length;

  const wins = trades.filter((trade) => trade.result === "WIN").length;
  const losses = trades.filter((trade) => trade.result === "LOSS").length;
  const breakEven = trades.filter((trade) => trade.result === "BE").length;

  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

  const pnlValues = trades.map((trade) => toNumber(trade.pnl));
  const netPnl = pnlValues.reduce((sum, value) => sum + value, 0);
  const grossProfit = pnlValues.filter((value) => value > 0).reduce((sum, value) => sum + value, 0);
  const grossLoss = Math.abs(pnlValues.filter((value) => value < 0).reduce((sum, value) => sum + value, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : null;

  const averageRisk =
    totalTrades > 0
      ? trades.reduce((sum, trade) => sum + toNumber(trade.risk_percent), 0) / totalTrades
      : 0;

  const bestTrade = pnlValues.length > 0 ? Math.max(...pnlValues) : 0;
  const worstTrade = pnlValues.length > 0 ? Math.min(...pnlValues) : 0;

  let equity = 0;
  const equityData = trades.map((trade) => {
    equity += toNumber(trade.pnl);

    return {
      date: trade.trade_date || trade.created_at || "Unknown",
      equity,
    };
  });

  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let bestWinStreak = 0;

  trades.forEach((trade) => {
    if (trade.result === "WIN") {
      currentWinStreak += 1;
      currentLossStreak = 0;
      bestWinStreak = Math.max(bestWinStreak, currentWinStreak);
      return;
    }

    if (trade.result === "LOSS") {
      currentLossStreak += 1;
      currentWinStreak = 0;
      return;
    }

    currentWinStreak = 0;
    currentLossStreak = 0;
  });

  const environmentBreakdown = Object.values(
    trades.reduce<Record<string, EnvironmentBreakdown>>((acc, trade) => {
      const environment = normalizeEnvironmentLabel(trade.environment);

      if (!environment) return acc;

      if (!acc[environment]) {
        acc[environment] = {
          environment,
          trades: 0,
          pnl: 0,
        };
      }

      acc[environment].trades += 1;
      acc[environment].pnl += toNumber(trade.pnl);

      return acc;
    }, {}),
  ).sort((a, b) => b.trades - a.trades);

  const psychologyEntries = trades.filter((trade) => hasMeaningfulValue(trade.emotions)).length;

  const consistencyScore =
    totalTrades === 0
      ? 0
      : Math.round(
          Math.min(
            100,
            (psychologyEntries / totalTrades) * 35 +
              (trades.filter((trade) => hasMeaningfulValue(trade.checklist)).length / totalTrades) * 35 +
              Math.min(totalTrades, 30),
          ),
        );

  return {
    totalTrades,
    wins,
    losses,
    breakEven,
    winRate,
    netPnl,
    grossProfit,
    grossLoss,
    profitFactor,
    averageRisk,
    averageRR: calculateAverageRR(trades),
    bestTrade,
    worstTrade,
    equityData,
    recentTrades: [...trades].reverse().slice(0, 5),
    pairPerformance: calculateGroupPerformance(trades, "pair", "Unknown Pair").slice(0, 5),
    strategyPerformance: calculateGroupPerformance(trades, "strategy", "No Strategy").slice(0, 5),
    environmentBreakdown,
    bestWinStreak,
    currentWinStreak,
    currentLossStreak,
    psychologyEntries,
    consistencyScore,
  };
}

export function formatMoney(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
