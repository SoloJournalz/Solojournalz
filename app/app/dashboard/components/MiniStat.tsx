type MiniStatProps = {
  label: string;
  value: string;
};

export default function MiniStat({ label, value }: MiniStatProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
