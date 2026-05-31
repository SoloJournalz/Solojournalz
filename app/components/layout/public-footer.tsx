import Link from "next/link";

const legalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy-policy", label: "Privacy" },
];


export default function PublicFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 px-6 py-10 text-center md:px-10">
        <div>
          <div className="text-xl font-black text-black">
            Solo<span className="text-[var(--accent)]">Journalz</span>
          </div>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
            A disciplined trading journal built for serious traders.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium text-[var(--text-secondary)]">
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[var(--accent)]">
              {link.label}
            </Link>
          ))}
        </div>

        <p className="text-xs text-[var(--text-secondary)]">© 2026 SoloJournalz</p>
      </div>
    </footer>
  );
}
