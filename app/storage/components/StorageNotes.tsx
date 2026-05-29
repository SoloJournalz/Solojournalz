type StorageNotesProps = {
  notes: string | null | undefined;
};

const cardClass =
  "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]";

export default function StorageNotes({ notes }: StorageNotesProps) {
  return (
    <section className={cardClass}>
      <h2 className="mb-4 text-xl font-bold tracking-tight">Notes</h2>

      <div className="h-36 rounded-2xl border border-[var(--border)] bg-[#efeee9] p-4 text-sm font-medium text-[var(--text-secondary)]">
        {notes || "No saved notes..."}
      </div>
    </section>
  );
}