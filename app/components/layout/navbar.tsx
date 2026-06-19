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
      }, 900);
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

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (pathname === href) {
      setMenuOpen(false);
      return;
    }

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
    setMenuOpen(false);
  };

  const renderLink = (link: (typeof links)[number], mobile = false) => {
    const active = pendingHref ? pendingHref === link.href : pathname === link.href;
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
        onClick={(event) => handleNavClick(event, link.href)}
        aria-current={active ? "page" : undefined}
        className={
          active
            ? `${mobile ? "w-full" : ""} rounded-xl bg-[var(--accent)] px-4 py-2.5 text-center font-semibold text-white shadow-[0_6px_18px_rgba(110,17,17,0.18)] transition lg:px-5`
            : `${mobile ? "w-full" : ""} rounded-xl px-4 py-2.5 text-center font-semibold text-[var(--text-secondary)] transition hover:bg-black/[0.03] hover:text-[var(--text-primary)] lg:px-5`
        }
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex min-h-[72px] max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-6 lg:px-10">
          <div className="min-w-0 shrink-0 lg:justify-self-start">
            <Logo href="/dashboard" />
          </div>

          <nav className="hidden items-center justify-center gap-2 text-sm lg:flex">
            {links.map((link) => renderLink(link))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 lg:justify-self-end">
            <button
              type="button"
              onClick={handleLogout}
              className="hidden rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] sm:inline-flex"
            >
              Logout
            </button>

            <button
              type="button"
              aria-label="Open workspace menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-black text-[var(--text-primary)] shadow-sm lg:hidden"
            >
              Menu
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-[var(--border)] bg-white px-4 py-4 lg:hidden">
            <nav className="mx-auto grid max-w-[1600px] gap-2 text-sm">
              {links.map((link) => renderLink(link, true))}

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-center text-sm font-bold text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] sm:hidden"
              >
                Logout
              </button>
            </nav>
          </div>
        ) : null}
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
