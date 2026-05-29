import Logo from "@/app/components/layout/logo";

export default function SelectPlanLoading() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <header className="fixed left-0 top-0 z-50 w-full px-6 py-6 sm:px-10">
        <Logo href="/" />
      </header>

      <section className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            Loading plans
          </p>
        </div>
      </section>
    </main>
  );
}
