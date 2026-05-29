type PsychologyPanelProps = {
  emotions: string[];
  selectedEmotions: string[];
  onSelect: (emotion: string) => void;
};

export default function PsychologyPanel({
  emotions,
  selectedEmotions,
  onSelect,
}: PsychologyPanelProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h2 className="mb-4 text-xl font-bold tracking-tight">Psychology</h2>

      <div className="flex flex-wrap gap-3">
        {emotions.map((emotion) => (
          <button
            type="button"
            key={emotion}
            onClick={() => onSelect(emotion)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${
              selectedEmotions.includes(emotion)
                ? "bg-[var(--accent)] text-white"
                : "bg-[#efeee9] text-[var(--text-secondary)]"
            }`}
          >
            {emotion}
          </button>
        ))}
      </div>
    </div>
  );
}