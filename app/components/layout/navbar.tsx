"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Logo from "@/app/components/layout/logo";
import { supabase } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trade-log", label: "Trade Log" },
  { href: "/trade-review", label: "Trade Review" },
  { href: "/settings", label: "Settings" },
];

function WorkspaceTransitionLoader({ label }: { label: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 top-[64px] z-40 flex items-center justify-center bg-[var(--background)] text-[var(--text-primary)] lg:top-[72px]">
      <div className="flex flex-col items-center px-6 text-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#efeee9] border-t-[var(--accent)]" />
        <p className="mt-5 text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </p>
      </div>
    </div>
  );
}

function NavbarInner({
  hasUnsavedChanges = false,
}: {
  hasUnsavedChanges?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [showTransitionLoader, setShowTransitionLoader] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isEditMode = Boolean(searchParams.get("edit"));

  useEffect(() => {
    links.forEach((link) => router.prefetch(link.href));
  }, [router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!pendingHref) return;

    if (pathname === pendingHref) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      hideTimerRef.current = setTimeout(() => {
        setPendingHref(null);
        setShowTransitionLoader(false);
      }, 700);
    }
  }, [pathname, pendingHref]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const pendingLabel = links.find((link) => link.href === pendingHref)?.label;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleNavClick = (href: string, e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === href) return;

    if (hasUnsavedChanges) {
      const leave = confirm("You have unsaved changes. Leave without saving?");

      if (!leave) {
        e.preventDefault();
        setPendingHref(null);
        setShowTransitionLoader(false);
        return;
      }
    }

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    setPendingHref(href);
    setShowTransitionLoader(true);
  };

  const navLinkClass = (active: boolean, compact = false) =>
    active
      ? `rounded-xl bg-[var(--accent)] font-bold text-white shadow-[0_6px_18px_rgba(110,17,17,0.18)] transition ${
          compact ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-sm"
        }`
      : `rounded-xl font-bold text-[var(--text-secondary)] transition hover:bg-black/[0.03] hover:text-[var(--text-primary)] ${
          compact ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-sm"
        }`;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[64px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-[72px] lg:grid lg:grid-cols-[auto_1fr_auto] lg:px-10">
          <div className="min-w-0 justify-self-start">
            <Logo href="/dashboard" />
          </div>

          <nav className="hidden items-center justify-center gap-3 text-sm lg:flex">
            {links.map((link) => {
              const active = pendingHref
                ? pendingHref === link.href
                : pathname === link.href;

              const label =
                link.href === "/trade-log" && isEditMode
                  ? "Trade Log • Edit Mode"
                  : link.label;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch
                  onMouseEnter={() => router.prefetch(link.href)}
                  onFocus={() => router.prefetch(link.href)}
                  onClick={(e) => handleNavClick(link.href, e)}
                  aria-current={active ? "page" : undefined}
                  className={navLinkClass(active)}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="hidden justify-self-end rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] lg:block"
          >
            Logout
          </button>

          <div className="relative lg:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-extrabold text-[var(--text-primary)] shadow-[0_5px_15px_rgba(0,0,0,0.06)]"
              aria-expanded={menuOpen}
            >
              Menu
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 z-50 w-[245px] rounded-2xl border border-[var(--border)] bg-white p-2 shadow-[0_18px_35px_rgba(0,0,0,0.12)]">
                <div className="space-y-1">
                  {links.map((link) => {
                    const active = pathname === link.href;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        prefetch
                        onClick={(e) => handleNavClick(link.href, e)}
                        className={`block w-full text-center ${navLinkClass(active, true)}`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-center text-sm font-bold text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {showTransitionLoader ? (
        <WorkspaceTransitionLoader
          label={`Loading ${pendingLabel || "workspace"}`}
        />
      ) : null}
    </>
  );
}

export default function Navbar({
  hasUnsavedChanges = false,
}: {
  hasUnsavedChanges?: boolean;
}) {
  return (
    <Suspense fallback={null}>
      <NavbarInner hasUnsavedChanges={hasUnsavedChanges} />
    </Suspense>
  );
}
