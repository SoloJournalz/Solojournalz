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
      <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between px-6 md:px-10">
        <Logo href="/" />

        <nav className="flex items-center gap-2 text-sm md:gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden rounded-xl px-4 py-2.5 font-medium text-[var(--text-secondary)] transition hover:bg-black/[0.03] hover:text-[var(--text-primary)] sm:block md:px-5"
            >
              {link.label}
            </Link>
          ))}

          {!isWaitlistMode ? (
            <Link
              href="/login"
              className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 font-medium text-[var(--text-primary)] shadow-sm transition hover:bg-black/[0.03] md:px-5"
            >
              Sign in
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
