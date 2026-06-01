"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/app/components/layout/navbar";
import PageLoading from "@/app/components/layout/page-loading";

import { supabase } from "@/lib/supabase/client";
import { PLANS, PlanKey } from "@/lib/plans";

import StorageTradeList from "./components/StorageTradeList";
import StorageChecklist from "./components/StorageChecklist";
import StoragePsychology from "./components/StoragePsychology";
import StorageTradeInfo from "./components/StorageTradeInfo";
import StorageScreenshot from "./components/StorageScreenshot";
import StorageNotes from "./components/StorageNotes";

type Trade = {
  id: string;
  environment: "LIVE" | "TESTING" | "BACKTESTING" | null;
  trade_date: string;
  entry_time: string | null;

  pair: string;
  strategy: string | null;
  trade_type: string | null;

  direction: "BUY" | "SELL" | null;

  entry_price: number | null;
  position_size: number | null;

  stop_loss: number | null;
  take_profit: number | null;

  risk_percent: number | null;
  pnl: number | null;

  result: "WIN" | "LOSS" | "BE" | null;

  notes: string | null;

  checklist: Record<string, boolean> | null;
  emotions: string[] | null;

  created_at: string;
};

type TradeScreenshot = {
  id: string;
  trade_id: string;
  image_url: string;
  created_at: string;
};

const formatNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "N/A";
  return String(Number(value));
};

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "N/A";
  return `${Number(value)}%`;
};

const formatPnl = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "N/A";

  const number = Number(value);

  if (number > 0) {
    return `+${number}`;
  }

  return String(number);
};

export default function StoragePage() {
  const router = useRouter();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const [screenshots, setScreenshots] = useState<TradeScreenshot[]>([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Newest First");
  const [environmentFilter, setEnvironmentFilter] = useState("All");

  const [loading, setLoading] = useState(true);

  const [currentPlan, setCurrentPlan] = useState<PlanKey>("FREE");

  const fetchTrades = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: planData } = await supabase
      .from("user_plans")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!planData) {
      router.replace("/select-plan");
      setLoading(false);
      return;
    }

    const resolvedPlan: PlanKey =
      planData.plan === "EXPERT" ? "EXPERT" : "FREE";

    setCurrentPlan(resolvedPlan);

    const { data: settingsData, error: settingsError } = await supabase
      .from("user_trade_settings")
      .select("setup_completed")
      .eq("user_id", user.id)
      .maybeSingle();

    if (settingsError) {
      alert(settingsError.message);
      setLoading(false);
      return;
    }

    if (settingsData?.setup_completed !== true) {
      router.replace("/setup");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const safeTrades = (data || []) as Trade[];

    setTrades(safeTrades);

    if (safeTrades.length > 0) {
      setSelectedTrade(safeTrades[0]);
    } else {
      setSelectedTrade(null);
    }

    setLoading(false);
  };

  const fetchScreenshots = async (tradeId: string) => {
    const { data, error } = await supabase
      .from("trade_screenshots")
      .select("*")
      .eq("trade_id", tradeId)
      .order("created_at", { ascending: true });

    if (error) {
      setScreenshots([]);
      return;
    }

    setScreenshots((data || []) as TradeScreenshot[]);
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    if (!selectedTrade?.id) {
      setScreenshots([]);
      return;
    }

    fetchScreenshots(selectedTrade.id);
  }, [selectedTrade?.id]);

  const filteredTrades = useMemo(() => {
    let result = [...(trades || [])];

    if (environmentFilter !== "All") {
      result = result.filter(
        (trade) => trade.environment === environmentFilter,
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      result = result.filter(
        (trade) =>
          trade.pair?.toLowerCase().includes(q) ||
          trade.strategy?.toLowerCase().includes(q) ||
          trade.result?.toLowerCase().includes(q) ||
          trade.environment?.toLowerCase().includes(q),
      );
    }

    if (filter === "Oldest First") {
      result.sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime(),
      );
    }

    if (filter === "Wins") {
      result = result.filter((trade) => trade.result === "WIN");
    }

    if (filter === "Losses") {
      result = result.filter((trade) => trade.result === "LOSS");
    }

    if (filter === "Break Even") {
      result = result.filter((trade) => trade.result === "BE");
    }

    return result;
  }, [trades, search, filter, environmentFilter]);

  const deleteSelectedTrade = async () => {
    if (!selectedTrade) return;

    if (!confirm("Delete this trade?")) return;

    const { error } = await supabase
      .from("trades")
      .delete()
      .eq("id", selectedTrade.id);

    if (error) {
      alert(error.message);
      return;
    }

    setScreenshots([]);

    await fetchTrades();
  };

  const tradeInfo: [string, string | number][] = [
    ["Environment", selectedTrade?.environment || "N/A"],
    ["Date", selectedTrade?.trade_date || "N/A"],
    ["Entry Time", selectedTrade?.entry_time || "N/A"],
    ["Pair", selectedTrade?.pair || "N/A"],
    ["Strategy", selectedTrade?.strategy || "N/A"],
    ["Trade Type", selectedTrade?.trade_type || "N/A"],
    ["Direction", selectedTrade?.direction || "N/A"],
    ["Entry Price", formatNumber(selectedTrade?.entry_price)],
    ["Position Size", formatNumber(selectedTrade?.position_size)],
    ["Stop Loss", formatNumber(selectedTrade?.stop_loss)],
    ["Take Profit", formatNumber(selectedTrade?.take_profit)],
    ["Risk %", formatPercent(selectedTrade?.risk_percent)],
    ["P/L", formatPnl(selectedTrade?.pnl)],
    ["Result", selectedTrade?.result || "N/A"],
  ];

  if (loading) {
    return <PageLoading label="Loading Storage" workspace />;
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-5 py-5">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.25fr]">
          <div className="space-y-4">
            <StorageTradeList
              trades={filteredTrades || []}
              selectedTradeId={selectedTrade?.id}
              loading={loading}
              search={search}
              filter={filter}
              environmentFilter={environmentFilter}
              onSearchChange={setSearch}
              onFilterChange={setFilter}
              onEnvironmentFilterChange={setEnvironmentFilter}
              onSelectTrade={(trade) => setSelectedTrade(trade as Trade)}
              onDeleteTrade={deleteSelectedTrade}
            />

            <StorageChecklist
              checklist={selectedTrade?.checklist}
              currentPlan={currentPlan}
            />

            {PLANS[currentPlan].psychologyTracking && (
              <StoragePsychology emotions={selectedTrade?.emotions} />
            )}
          </div>

          <div className="space-y-4">
            <StorageTradeInfo
              tradeInfo={tradeInfo}
              hasSelectedTrade={Boolean(selectedTrade)}
              onEdit={() => {
                if (!selectedTrade) return;

                router.push(`/trade-log?edit=${selectedTrade.id}`);
              }}
            />

            <StorageScreenshot screenshots={screenshots} />

            <StorageNotes notes={selectedTrade?.notes} />
          </div>
        </div>
      </section>
    </main>
  );
}