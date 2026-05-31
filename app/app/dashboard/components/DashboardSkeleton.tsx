export default function DashboardSkeleton() {
  return (
    <section className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="animate-pulse">
        <div className="h-4 w-24 rounded bg-black/10" />
        <div className="mt-4 h-10 w-80 max-w-full rounded bg-black/10" />
        <div className="mt-4 h-5 w-96 max-w-full rounded bg-black/10" />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-36 rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
          ))}
        </div>

        <div className="mt-4 h-80 rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
      </div>
    </section>
  );
}
