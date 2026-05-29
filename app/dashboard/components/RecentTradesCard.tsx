import Link from "next/link";
import type { DashboardTrade } from "@/lib/dashboard-analytics";

type RecentTradesCardProps = {
  trades: DashboardTrade[];
};

export default function RecentTradesCard({ trades }: RecentTradesCardProps) {
  return (
    <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Recent Trades</h3>

        <Link href="/storage" className="text-sm font-medium text-[var(--accent)]">
          View all
        </Link>
      </div>

      {trades.length === 0 ? (
        <div>
          <p className="mt-4 text-[var(--text-secondary)]">No trades logged yet.</p>

          <Link
            href="/trade-log"
            className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Open Trade Log
          </Link>
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead className="bg-[#efeee9]">
              <tr>
                <th className="px-4 py-3 text-left">Pair</th>
                <th className="hidden px-4 py-3 text-left md:table-cell">Strategy</th>
                <th className="px-4 py-3 text-left">Result</th>
                <th className="px-4 py-3 text-left">PnL</th>
              </tr>
            </thead>

            <tbody>
              {trades.map((trade) => {
                const pnl = Number(trade.pnl || 0);

                return (
                  <tr key={trade.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3 font-medium">{trade.pair || "--"}</td>
                    <td className="hidden px-4 py-3 text-[var(--text-secondary)] md:table-cell">{trade.strategy || "--"}</td>
                    <td className="px-4 py-3">{trade.result || "--"}</td>
                    <td className={`px-4 py-3 font-semibold ${pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
