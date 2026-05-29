import type { DashboardAnalytics } from "@/lib/dashboard-analytics";

export type DashboardInsightTone = "default" | "positive" | "negative" | "gold";

export type DashboardInsight = {
  title: string;
  value: string;
  description: string;
  tone?: DashboardInsightTone;
};

function formatMoney(value: number | null | undefined) {
  const amount = Number(value || 0);
  return `${amount >= 0 ? "+" : ""}${amount.toFixed(2)}`;
}

function getBestByPnl<T extends { pnl: number }>(items: T[] | undefined): T | null {
  if (!items || items.length === 0) return null;
  return [...items].sort((a, b) => Number(b.pnl || 0) - Number(a.pnl || 0))[0] || null;
}

function getWorstByPnl<T extends { pnl: number }>(items: T[] | undefined): T | null {
  if (!items || items.length === 0) return null;
  return [...items].sort((a, b) => Number(a.pnl || 0) - Number(b.pnl || 0))[0] || null;
}

function qualityLabel(totalTrades: number) {
  if (totalTrades >= 30) return "Ready";
  if (totalTrades >= 10) return "Building";
  if (totalTrades > 0) return "Early";
  return "Start";
}

export function getDashboardReadinessMessage(analytics: DashboardAnalytics): string {
  const totalTrades = Number(analytics.totalTrades || 0);

  if (totalTrades === 0) {
    return "Log your first trade to begin building your trading profile.";
  }

  if (totalTrades < 10) {
    return "Keep logging trades to reveal more reliable trading patterns.";
  }

  if (totalTrades < 30) {
    return "Your dashboard is starting to reveal useful trading behaviour.";
  }

  return "Your dashboard has enough data to start revealing meaningful trading patterns.";
}

export function getFreeDashboardInsightSentence(analytics: DashboardAnalytics): string {
  const bestPair = getBestByPnl(analytics.pairPerformance);
  const bestEnvironment = getBestByPnl(analytics.environmentBreakdown);
  const totalTrades = Number(analytics.totalTrades || 0);

  if (totalTrades === 0) {
    return "Log your first trade to unlock starter performance insights.";
  }

  if (bestEnvironment && Number(bestEnvironment.pnl || 0) > 0) {
    return `${bestEnvironment.environment} is currently your strongest environment by journaled PnL.`;
  }

  if (bestPair && Number(bestPair.pnl || 0) > 0) {
    return `${bestPair.name} is currently your strongest market by journaled PnL.`;
  }

  if (Number(analytics.averageRisk || 0) > 1) {
    return "Your average risk is above 1%, so risk discipline deserves attention.";
  }

  return "Your journal is building the sample size needed for clearer trading patterns.";
}

export function getFreeDashboardInsights(analytics: DashboardAnalytics): DashboardInsight[] {
  const totalTrades = Number(analytics.totalTrades || 0);
  const bestPair = getBestByPnl(analytics.pairPerformance);
  const bestEnvironment = getBestByPnl(analytics.environmentBreakdown);

  return [
    {
      title: "Pattern Quality",
      value: qualityLabel(totalTrades),
      tone: totalTrades >= 30 ? "gold" : "default",
      description:
        totalTrades >= 30
          ? "Your sample size is large enough to start reviewing meaningful patterns."
          : totalTrades > 0
            ? "Keep logging trades so your dashboard becomes more reliable."
            : "Log trades consistently to start building your trading profile.",
    },
    {
      title: "Best Pair",
      value: bestPair ? bestPair.name : "--",
      tone: bestPair && bestPair.pnl >= 0 ? "positive" : "default",
      description: bestPair
        ? `${formatMoney(bestPair.pnl)} across ${bestPair.trades} trades`
        : "Pair performance appears once your logged trades include markets.",
    },
    {
      title: "Best Environment",
      value: bestEnvironment ? bestEnvironment.environment : "--",
      tone: bestEnvironment && bestEnvironment.pnl >= 0 ? "positive" : "default",
      description: bestEnvironment
        ? `${bestEnvironment.trades} trades · ${formatMoney(bestEnvironment.pnl)}`
        : "Environment insights appear once LIVE, TESTING, or BACKTESTING is used.",
    },
  ];
}

export function getPerformanceInsights(analytics: DashboardAnalytics): DashboardInsight[] {
  const bestPair = getBestByPnl(analytics.pairPerformance);
  const worstPair = getWorstByPnl(analytics.pairPerformance);
  const bestStrategy = getBestByPnl(analytics.strategyPerformance);
  const bestEnvironment = getBestByPnl(analytics.environmentBreakdown);

  return [
    {
      title: "Best Pair",
      value: bestPair ? bestPair.name : "--",
      tone: bestPair && bestPair.pnl >= 0 ? "positive" : "default",
      description: bestPair
        ? `${formatMoney(bestPair.pnl)} across ${bestPair.trades} trades. This market currently deserves attention.`
        : "Log trades with pairs selected to reveal your strongest market.",
    },
    {
      title: "Weakest Pair",
      value: worstPair ? worstPair.name : "--",
      tone: worstPair && worstPair.pnl < 0 ? "negative" : "default",
      description: worstPair
        ? `${formatMoney(worstPair.pnl)} across ${worstPair.trades} trades. Review whether this market fits your process.`
        : "Weak spots appear once more pair data is available.",
    },
    {
      title: "Best Strategy",
      value: bestStrategy ? bestStrategy.name : "--",
      tone: bestStrategy && bestStrategy.pnl >= 0 ? "positive" : "default",
      description: bestStrategy
        ? `${bestStrategy.winRate.toFixed(0)}% win rate · ${formatMoney(bestStrategy.pnl)} journaled PnL.`
        : "Name your setups to reveal which strategies are working best.",
    },
    {
      title: "Environment Edge",
      value: bestEnvironment ? bestEnvironment.environment : "--",
      tone: bestEnvironment && bestEnvironment.pnl >= 0 ? "positive" : "default",
      description: bestEnvironment
        ? `${bestEnvironment.trades} trades · ${formatMoney(bestEnvironment.pnl)}. Compare this against live execution quality.`
        : "Use environment tags to separate practice from real execution.",
    },
  ];
}

export function getConsistencyInsights(analytics: DashboardAnalytics): DashboardInsight[] {
  const totalTrades = Number(analytics.totalTrades || 0);
  const averageRisk = Number(analytics.averageRisk || 0);
  const consistencyScore = Number(analytics.consistencyScore || 0);
  const bestWinStreak = Number(analytics.bestWinStreak || 0);

  return [
    {
      title: "Consistency Score",
      value: `${consistencyScore}%`,
      tone: consistencyScore >= 70 ? "positive" : consistencyScore >= 40 ? "gold" : "default",
      description:
        totalTrades >= 10
          ? "A simple measure of how repeatable your logged trading results look."
          : "More logged trades will make this score more meaningful.",
    },
    {
      title: "Average Risk",
      value: `${averageRisk.toFixed(2)}%`,
      tone: averageRisk > 1 ? "negative" : averageRisk > 0 ? "positive" : "default",
      description:
        averageRisk > 1
          ? "Risk is above the common 1% benchmark. Review whether this matches your plan."
          : averageRisk > 0
            ? "Your risk level is being tracked clearly across the journal."
            : "Add risk percentage to trades to measure discipline properly.",
    },
    {
      title: "Best Win Streak",
      value: String(bestWinStreak),
      tone: bestWinStreak >= 3 ? "positive" : "default",
      description:
        bestWinStreak > 0
          ? "Momentum is useful, but only when the same process is repeated."
          : "Streak tracking appears as your trade history grows.",
    },
    {
      title: "Journal Sample",
      value: String(totalTrades),
      tone: totalTrades >= 30 ? "gold" : "default",
      description:
        totalTrades >= 30
          ? "You now have enough trades for more reliable pattern review."
          : "Keep building your sample size before making major process changes.",
    },
  ];
}
