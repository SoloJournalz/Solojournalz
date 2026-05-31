import Link from "next/link";
import Logo from "@/app/components/layout/logo";

const links = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/pricing", label: "Prices" },
];

export default function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-[72px] max-w-[1600px] flex-col items-center justify-center gap-3 px-4 py-3 sm:flex-row sm:justify-between sm:px-6 md:px-10">
        <Logo href="/" />

        <nav className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:gap-2 sm:text-sm md:gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-2 font-medium text-[var(--text-secondary)] transition hover:bg-black/[0.03] hover:text-[var(--text-primary)] sm:px-4 md:px-5"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/login"
            className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 font-medium text-[var(--text-primary)] shadow-sm transition hover:bg-black/[0.03] sm:px-4 md:px-5"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
