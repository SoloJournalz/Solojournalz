import { supabase } from "@/lib/supabase/client";
import { PLANS, PlanKey, isPlanKey } from "@/lib/plans";

export const DEV_BILLING_CYCLE_START_KEY =
  "solojournalz_dev_billing_cycle_start";

type UsageCheck = {
  allowed: boolean;
  used: number;
  limit: number | null;
  remaining: number | null;
  cycleStart: string;
  cycleEnd: string;
  message?: string;
};

export type BillingCycle = {
  start: Date;
  end: Date;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const isBrowser = () => typeof window !== "undefined";

const toUtcDateOnly = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const daysInUtcMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

const addUtcMonthsClamped = (date: Date, months: number) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const day = date.getUTCDate();

  const targetMonthStart = new Date(Date.UTC(year, month, 1));
  const targetYear = targetMonthStart.getUTCFullYear();
  const targetMonth = targetMonthStart.getUTCMonth();
  const targetDay = Math.min(day, daysInUtcMonth(targetYear, targetMonth));

  return new Date(Date.UTC(targetYear, targetMonth, targetDay));
};

const parseDateOrNull = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function getStoredDevBillingCycleStart() {
  if (!isBrowser()) return null;

  return window.localStorage.getItem(DEV_BILLING_CYCLE_START_KEY);
}

export function setStoredDevBillingCycleStart(value: string | null) {
  if (!isBrowser()) return;

  if (!value) {
    window.localStorage.removeItem(DEV_BILLING_CYCLE_START_KEY);
    return;
  }

  window.localStorage.setItem(DEV_BILLING_CYCLE_START_KEY, value);
}

export function getEffectiveAccountCreatedAt(accountCreatedAt?: string | null) {
  const devOverride = getStoredDevBillingCycleStart();

  if (devOverride) {
    return new Date(`${devOverride}T00:00:00.000Z`).toISOString();
  }

  return accountCreatedAt || new Date().toISOString();
}

export function getCurrentBillingCycle(
  accountCreatedAt?: string | null,
  now: Date = new Date(),
): BillingCycle {
  const effectiveCreatedAt = getEffectiveAccountCreatedAt(accountCreatedAt);
  const createdAt = parseDateOrNull(effectiveCreatedAt) || now;
  const anchor = toUtcDateOnly(createdAt);
  const today = toUtcDateOnly(now);

  if (today < anchor) {
    return {
      start: anchor,
      end: addUtcMonthsClamped(anchor, 1),
    };
  }

  let months =
    (today.getUTCFullYear() - anchor.getUTCFullYear()) * 12 +
    (today.getUTCMonth() - anchor.getUTCMonth());

  let start = addUtcMonthsClamped(anchor, months);

  if (start > today) {
    months -= 1;
    start = addUtcMonthsClamped(anchor, months);
  }

  let end = addUtcMonthsClamped(anchor, months + 1);

  while (today >= end) {
    months += 1;
    start = end;
    end = addUtcMonthsClamped(anchor, months + 1);
  }

  return { start, end };
}

export function getCurrentMonthlyPeriodStart(accountCreatedAt?: string | null) {
  return getCurrentBillingCycle(accountCreatedAt).start.toISOString();
}


export async function getCreatedAtForNewTrade() {
  const devCycleStart = getStoredDevBillingCycleStart();

  if (!devCycleStart) return null;

  const accountCreatedAt = await getUserAccountCreatedAt();
  const cycle = getCurrentBillingCycle(accountCreatedAt);
  const now = new Date();

  const timeOfDayMs =
    now.getUTCHours() * 60 * 60 * 1000 +
    now.getUTCMinutes() * 60 * 1000 +
    now.getUTCSeconds() * 1000;

  const cycleStartMs = cycle.start.getTime();
  const cycleEndMs = cycle.end.getTime() - 60 * 1000;
  const candidateMs = cycleStartMs + timeOfDayMs;

  return new Date(
    Math.min(Math.max(candidateMs, cycleStartMs), cycleEndMs),
  ).toISOString();
}

export async function getCurrentUserPlan(userId: string): Promise<PlanKey> {
  const { data, error } = await supabase
    .from("user_plans")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error("NO_PLAN_SELECTED");
  }

  return isPlanKey(data.plan) ? data.plan : "FREE";
}

const DB_UNLIMITED_LIMIT = 999999;

const getDatabaseMonthlyLimit = (value: number | null) =>
  value === null ? DB_UNLIMITED_LIMIT : value;

export async function updateUserPlan(
  userId: string,
  plan: PlanKey,
): Promise<PlanKey> {
  const planLimits = PLANS[plan];

  const payload = {
    user_id: userId,
    plan,
    trade_limit_monthly: getDatabaseMonthlyLimit(planLimits.monthlyTrades),
    screenshot_limit_monthly: getDatabaseMonthlyLimit(planLimits.monthlyScreenshots),
    subscription_status: plan === "EXPERT" ? "developer" : "free",
    cancel_at_period_end: false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("user_plans")
    .upsert(payload, { onConflict: "user_id" })
    .select("plan")
    .single();

  if (error) {
    console.error("updateUserPlan Supabase error:", error);
    throw new Error(
      error.message || error.details || error.hint || "Supabase plan update failed",
    );
  }

  return isPlanKey(data.plan) ? data.plan : "FREE";
}

export async function getUserAccountCreatedAt() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  return user?.created_at || new Date().toISOString();
}

export async function getMonthlyTradeCount(userId: string) {
  const accountCreatedAt = await getUserAccountCreatedAt();
  const cycle = getCurrentBillingCycle(accountCreatedAt);

  const { count, error } = await supabase
    .from("trades")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", cycle.start.toISOString())
    .lt("created_at", cycle.end.toISOString());

  if (error) throw error;

  return count ?? 0;
}

export async function getMonthlyScreenshotCount(userId: string) {
  const accountCreatedAt = await getUserAccountCreatedAt();
  const cycle = getCurrentBillingCycle(accountCreatedAt);

  const { count, error } = await supabase
    .from("trade_screenshots")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", cycle.start.toISOString())
    .lt("created_at", cycle.end.toISOString());

  if (error) throw error;

  return count ?? 0;
}

export async function getTradeScreenshotCount(tradeId: string) {
  const { count, error } = await supabase
    .from("trade_screenshots")
    .select("id", { count: "exact", head: true })
    .eq("trade_id", tradeId);

  if (error) throw error;

  return count ?? 0;
}

export async function canCreateTrade(
  userId: string,
  plan?: PlanKey,
): Promise<UsageCheck> {
  const latestPlan = plan || (await getCurrentUserPlan(userId));
  const limit = PLANS[latestPlan].monthlyTrades;
  const accountCreatedAt = await getUserAccountCreatedAt();
  const cycle = getCurrentBillingCycle(accountCreatedAt);
  const used = await getMonthlyTradeCount(userId);

  if (limit === null) {
    return {
      allowed: true,
      used,
      limit,
      remaining: null,
      cycleStart: cycle.start.toISOString(),
      cycleEnd: cycle.end.toISOString(),
    };
  }

  const remaining = Math.max(limit - used, 0);

  return {
    allowed: used < limit,
    used,
    limit,
    remaining,
    cycleStart: cycle.start.toISOString(),
    cycleEnd: cycle.end.toISOString(),
    message:
      used >= limit
        ? `You’ve reached your ${limit} trade monthly limit. Upgrade to Expert for unlimited trades.`
        : undefined,
  };
}

export async function getRemainingTrades(userId: string, plan?: PlanKey) {
  const usage = await canCreateTrade(userId, plan);

  return {
    used: usage.used,
    limit: usage.limit,
    remaining: usage.remaining,
    cycleStart: usage.cycleStart,
    cycleEnd: usage.cycleEnd,
  };
}

export async function canUploadScreenshot(
  userId: string,
  plan: PlanKey,
  requestedCount = 1,
): Promise<UsageCheck> {
  const limit = PLANS[plan].monthlyScreenshots;
  const accountCreatedAt = await getUserAccountCreatedAt();
  const cycle = getCurrentBillingCycle(accountCreatedAt);
  const used = await getMonthlyScreenshotCount(userId);

  if (limit === null) {
    return {
      allowed: true,
      used,
      limit,
      remaining: null,
      cycleStart: cycle.start.toISOString(),
      cycleEnd: cycle.end.toISOString(),
    };
  }

  const remaining = Math.max(limit - used, 0);

  return {
    allowed: used + requestedCount <= limit,
    used,
    limit,
    remaining,
    cycleStart: cycle.start.toISOString(),
    cycleEnd: cycle.end.toISOString(),
    message:
      used + requestedCount > limit
        ? `You have reached your ${limit} screenshots/month Free plan limit. Upgrade to Expert for unlimited screenshots.`
        : undefined,
  };
}

export async function canAddScreenshotToExistingTrade(
  userId: string,
  tradeId: string,
  plan: PlanKey,
  requestedCount = 1,
): Promise<UsageCheck> {
  const perTradeLimit = PLANS[plan].perTradeScreenshots;
  const used = await getTradeScreenshotCount(tradeId);

  if (perTradeLimit !== null && used + requestedCount > perTradeLimit) {
    const accountCreatedAt = await getUserAccountCreatedAt();
    const cycle = getCurrentBillingCycle(accountCreatedAt);

    return {
      allowed: false,
      used,
      limit: perTradeLimit,
      remaining: Math.max(perTradeLimit - used, 0),
      cycleStart: cycle.start.toISOString(),
      cycleEnd: cycle.end.toISOString(),
      message: `Your current plan allows ${perTradeLimit} screenshot${perTradeLimit === 1 ? "" : "s"} per trade. Upgrade to Expert for unlimited screenshots.`,
    };
  }

  return canUploadScreenshot(userId, plan, requestedCount);
}
