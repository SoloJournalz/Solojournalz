type TradeNotesProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function TradeNotes({ value, onChange }: TradeNotesProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h2 className="mb-4 text-xl font-bold tracking-tight">Notes</h2>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your notes here..."
        className="h-36 w-full resize-none rounded-2xl border border-[var(--border)] bg-[#efeee9] p-4 text-sm font-medium text-black outline-none"
      />
    </div>
  );
}