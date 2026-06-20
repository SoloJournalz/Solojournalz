import type { TradeProgressPercent } from "@/types/trade";

type TradeReviewPhaseHeaderProps = {
  activePhase: "PHASE_2" | "PHASE_3";
  selectedProgress: TradeProgressPercent;
  onPhaseChange: (phase: "PHASE_2" | "PHASE_3") => void;
};

export default function TradeReviewPhaseHeader({
  activePhase,
  selectedProgress,
  onPhaseChange,
}: TradeReviewPhaseHeaderProps) {
  return (
    <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          {activePhase === "PHASE_2" ? "Execution Details" : "Review & Reflection"}
        </h2>
        <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
          {activePhase === "PHASE_2"
            ? "Complete the trade outcome and execution details."
            : "Record the lesson, emotion, and final review."}
        </p>
      </div>

      <div className="grid grid-cols-2 rounded-2xl bg-[#efeee9] p-1 text-sm font-black text-[var(--text-secondary)] lg:w-[340px]">
        <button
          type="button"
          onClick={() => onPhaseChange("PHASE_2")}
          className={`rounded-xl px-4 py-2.5 transition hover:-translate-y-0.5 ${
            activePhase === "PHASE_2"
              ? "bg-[var(--accent)] text-white shadow-[0_8px_20px_rgba(110,17,17,0.18)]"
              : "hover:text-[var(--accent)]"
          }`}
        >
          Phase 2
        </button>

        <button
          type="button"
          onClick={() => onPhaseChange("PHASE_3")}
          disabled={selectedProgress < 60}
          className={`rounded-xl px-4 py-2.5 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 ${
            activePhase === "PHASE_3"
              ? "bg-[var(--accent)] text-white shadow-[0_8px_20px_rgba(110,17,17,0.18)]"
              : "hover:text-[var(--accent)]"
          }`}
        >
          Phase 3
        </button>
      </div>
    </div>
  );
}
