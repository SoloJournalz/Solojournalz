type StoragePsychologyProps = {
  emotions: string[] | null | undefined;
};

const cardClass =
  "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]";

export default function StoragePsychology({
  emotions,
}: StoragePsychologyProps) {
  return (
    <section className={cardClass}>
      <h2 className="mb-4 text-xl font-bold tracking-tight">
        Psychology
      </h2>

      <div className="rounded-xl bg-[var(--accent)] px-5 py-3 text-center text-sm font-semibold capitalize text-white">
        {emotions?.[0] || "None Selected"}
      </div>
    </section>
  );
}