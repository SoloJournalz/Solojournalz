"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/app/components/layout/logo";

const links = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/pricing", label: "Prices" },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-[72px] max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 md:px-10">
        <Logo href="/" />

        <nav className="hidden items-center gap-2 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-5 py-2 font-medium text-[var(--text-secondary)] transition hover:bg-black/[0.03] hover:text-[var(--text-primary)]"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/login"
            className="rounded-xl border border-[var(--border)] bg-white px-5 py-2 font-medium text-[var(--text-primary)] shadow-sm transition hover:bg-black/[0.03]"
          >
            Sign In
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-black text-[var(--text-primary)] shadow-sm md:hidden"
        >
          Menu
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] bg-white px-4 py-4 md:hidden">
          <nav className="mx-auto grid max-w-[1600px] gap-2 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold text-[var(--text-secondary)] transition hover:bg-black/[0.03] hover:text-[var(--text-primary)]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-[var(--accent)] px-4 py-3 font-black text-white transition hover:bg-[var(--accent-hover)]"
            >
              Sign In
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
