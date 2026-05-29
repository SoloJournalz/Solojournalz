"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Logo from "@/app/components/layout/logo";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trade-log", label: "Trade Log" },
  { href: "/storage", label: "Storage" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar({
  hasUnsavedChanges = false,
}: {
  hasUnsavedChanges?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isEditMode = Boolean(searchParams.get("edit"));

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between px-10">
        {/* LOGO */}
        <Logo href="/dashboard" />

        {/* NAVIGATION */}
        <nav className="flex items-center gap-4 text-sm">
          {links.map((link) => {
            const active = pathname === link.href;

            const label =
              link.href === "/trade-log" && isEditMode
                ? "Trade Log • Edit Mode"
                : link.label;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  if (!hasUnsavedChanges) return;

                  const leave = confirm(
                    "You have unsaved changes. Leave without saving?"
                  );

                  if (!leave) e.preventDefault();
                }}
                className={
                  active
                    ? "rounded-xl bg-[var(--accent)] px-5 py-2.5 font-medium text-white shadow-[0_6px_18px_rgba(110,17,17,0.18)] transition"
                    : "rounded-xl px-5 py-2.5 font-medium text-[var(--text-secondary)] transition hover:bg-black/[0.03] hover:text-[var(--text-primary)]"
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}