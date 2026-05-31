import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">
        <div>
          <div className="text-xl font-black text-black">
            Solo<span className="text-[var(--accent)]">Journalz</span>
          </div>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            A disciplined trading journal built for serious traders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-[var(--text-secondary)]">
          <Link href="/terms" className="hover:text-[var(--accent)]">Terms</Link>
          <Link href="/privacy-policy" className="hover:text-[var(--accent)]">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
