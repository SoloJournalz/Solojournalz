import Link from "next/link";

export default function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="leading-none">
          <div className="text-3xl font-black tracking-tight text-text-primary">
            Solo<span className="text-accent">Journalz</span>
          </div>
          <div className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.45em] text-gold">
            Trading Journal
          </div>
        </Link>

        <nav className="hidden items-center gap-10 text-sm font-medium text-text-secondary md:flex">
          <Link href="/about" className="transition hover:text-text-primary">
            About Us
          </Link>

          <Link href="/contact" className="transition hover:text-text-primary">
            Contact Us
          </Link>

          <Link href="/pricing" className="transition hover:text-text-primary">
            Prices
          </Link>

          <Link
            href="/login"
            className="rounded-2xl border border-border bg-card px-6 py-3 font-semibold text-text-primary shadow-sm transition hover:border-accent"
          >
            Sign in / Signup
          </Link>
        </nav>

        <Link
          href="/login"
          className="rounded-2xl border border-border bg-card px-4 py-2 text-sm font-semibold text-text-primary shadow-sm transition hover:border-accent md:hidden"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}
