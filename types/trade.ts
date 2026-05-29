export type TradeEnvironment = "LIVE" | "TESTING" | "BACKTESTING";

export type TradeDirection = "BUY" | "SELL";
export type TradeResult = "WIN" | "LOSS" | "BE";

export type TradeScreenshot = {
  id: string;
  trade_id: string;
  image_url: string;
  created_at: string;
};

export type TradeFormData = {
  trade_date: string;
  entry_time?: string;
  environment: TradeEnvironment;

  pair: string;
  strategy?: string;
  trade_type?: string;

  direction: TradeDirection;

  entry_price?: number;
  position_size?: number;
  stop_loss?: number;
  take_profit?: number;

  risk_percent?: number;
  rr?: number;
  pnl?: number;

  result?: TradeResult;
  notes?: string;

  checklist: Record<string, boolean>;
  emotions: string[];
};

export type TradeRecord = {
  id: string;
  user_id?: string;
  trade_date: string;
  entry_time: string | null;
  environment: TradeEnvironment | null;
  pair: string;
  strategy: string | null;
  trade_type: string | null;
  direction: TradeDirection | null;
  entry_price: number | null;
  position_size: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  risk_percent: number | null;
  pnl: number | null;
  result: TradeResult | null;
  checklist: Record<string, boolean> | null;
  emotions: string[] | null;
  notes: string | null;
  created_at: string;
};

const safeNumber = (value?: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const round = (value: number, decimals = 2) => Number(value.toFixed(decimals));

export function calculateTradeMetrics(form: TradeFormData) {
  const entry = safeNumber(form.entry_price);
  const stop = safeNumber(form.stop_loss);
  const takeProfit = safeNumber(form.take_profit);

  if (!entry || !stop) {
    return {
      risk_percent: 0,
      rr: 0,
    };
  }

  const riskDistance = Math.abs(entry - stop);
  const riskPercent = (riskDistance / entry) * 100;
  const rewardDistance = takeProfit > 0 ? Math.abs(takeProfit - entry) : 0;
  const rr =
    riskDistance > 0 && rewardDistance > 0
      ? rewardDistance / riskDistance
      : 0;

  return {
    risk_percent: round(riskPercent, 2),
    rr: round(rr, 2),
  };
}
