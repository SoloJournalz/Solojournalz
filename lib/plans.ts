export type PlanKey = "FREE" | "EXPERT";

export type PlanLimits = {
  monthlyTrades: number | null;
  monthlyScreenshots: number | null;
  perTradeScreenshots: number | null;
  checklistItems: number;
  psychologyTracking: boolean;
  equityCurve: boolean;
  advancedAnalytics: boolean;
  aiReviewTools: boolean;
  sampleTradesSeedCount: number;
  maxEnvironments: number | null;
  maxStrategies: number | null;
  maxPairs: number | null;
  maxTradeTypes: number | null;
  maxPsychologyTags: number | null;
  priceMonthlyGbp: number;
};

export const PLANS: Record<PlanKey, PlanLimits> = {
  FREE: {
    monthlyTrades: 30,
    monthlyScreenshots: 30,
    perTradeScreenshots: 1,
    checklistItems: 3,
    psychologyTracking: false,
    equityCurve: false,
    advancedAnalytics: false,
    aiReviewTools: false,
    sampleTradesSeedCount: 30,
    maxEnvironments: 2,
    maxStrategies: 3,
    maxPairs: 5,
    maxTradeTypes: 3,
    maxPsychologyTags: 0,
    priceMonthlyGbp: 0,
  },

  EXPERT: {
    monthlyTrades: null,
    monthlyScreenshots: null,
    perTradeScreenshots: 3,
    checklistItems: 6,
    psychologyTracking: true,
    equityCurve: true,
    advancedAnalytics: true,
    aiReviewTools: true,
    sampleTradesSeedCount: 60,
    maxEnvironments: null,
    maxStrategies: null,
    maxPairs: null,
    maxTradeTypes: null,
    maxPsychologyTags: null,
    priceMonthlyGbp: 23,
  },
};

export const EXPERT_PRICE_MONTHLY_GBP = PLANS.EXPERT.priceMonthlyGbp;

export const formatLimit = (value: number | null) =>
  value === null ? "Unlimited" : String(value);

export const formatPlanPrice = (plan: PlanKey) =>
  PLANS[plan].priceMonthlyGbp === 0
    ? "£0"
    : `£${PLANS[plan].priceMonthlyGbp}`;

export const isPlanKey = (value: unknown): value is PlanKey =>
  value === "FREE" || value === "EXPERT";

export const getScreenshotLimit = (plan: PlanKey) =>
  PLANS[plan].perTradeScreenshots;

export const getMonthlyScreenshotLimit = (plan: PlanKey) =>
  PLANS[plan].monthlyScreenshots;

export const canAddScreenshotToTrade = (
  plan: PlanKey,
  currentScreenshotCount: number,
) => {
  const limit = getScreenshotLimit(plan);

  if (limit === null) return true;

  return currentScreenshotCount < limit;
};

export const getScreenshotLimitLabel = (plan: PlanKey) => {
  const limit = getScreenshotLimit(plan);

  return limit === null ? "Unlimited screenshots" : `${limit} screenshot${limit === 1 ? "" : "s"}`;
};
