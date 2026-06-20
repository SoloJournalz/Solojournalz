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
    <div className="fixed inset-x-0 bottom-0 top-[72px] z-40 flex items-center justify-center bg-[var(--background)] text-[var(--text-primary)]">
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
    links.forEach((link) => {
      if (link.href !== "/dashboard") router.prefetch(link.href);
    });
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
      }, 650);
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

  const handleNavigate = (href: string, event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === href) return;

    if (hasUnsavedChanges) {
      const leave = confirm("You have unsaved changes. Leave without saving?");

      if (!leave) {
        event.preventDefault();
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

    if (href === "/dashboard") {
      router.refresh();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur-md">
        <div className="mx-auto grid min-h-[66px] max-w-[1600px] grid-cols-[auto_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:grid-cols-[auto_1fr_auto] lg:px-10">
          <div className="justify-self-start">
            <Logo href="/dashboard" />
          </div>

          <nav className="hidden items-center justify-center gap-4 text-sm lg:flex">
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
                  prefetch={link.href === "/dashboard" ? false : undefined}
                  onMouseEnter={() => { if (link.href !== "/dashboard") router.prefetch(link.href); }}
                  onFocus={() => { if (link.href !== "/dashboard") router.prefetch(link.href); }}
                  onClick={(event) => handleNavigate(link.href, event)}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "rounded-xl bg-[var(--accent)] px-5 py-2.5 font-medium text-white shadow-[0_6px_18px_rgba(110,17,17,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(110,17,17,0.24)]"
                      : "rounded-xl px-5 py-2.5 font-medium text-[var(--text-secondary)] transition hover:-translate-y-0.5 hover:bg-black/[0.03] hover:text-[var(--text-primary)]"
                  }
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="hidden justify-self-end rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-secondary)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)] lg:block"
          >
            Logout
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="justify-self-end rounded-xl border border-[var(--border)] bg-white px-3.5 py-2 text-sm font-black text-[var(--text-primary)] shadow-[0_6px_16px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)] lg:hidden"
          >
            Menu
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-[var(--border)] bg-white px-4 py-2 lg:hidden">
            <div className="mx-auto grid max-w-sm gap-1.5">
              {links.map((link) => {
                const active = pendingHref
                  ? pendingHref === link.href
                  : pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={link.href === "/dashboard" ? false : undefined}
                    onClick={(event) => handleNavigate(link.href, event)}
                    className={
                      active
                        ? "rounded-xl bg-[var(--accent)] px-3 py-2 text-center text-sm font-black text-white shadow-[0_10px_24px_rgba(110,17,17,0.18)]"
                        : "rounded-xl bg-[#f4f2ee] px-3 py-2 text-center text-sm font-black text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-black text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Logout
              </button>
            </div>
          </div>
        )}
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
