import Link from "next/link";

export default function Logo({
  href = "/",
  centered = false,
}: {
  href?: string;
  centered?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col ${centered ? "items-center" : "items-start"}`}
    >
      <h1 className="text-[1.7rem] font-bold leading-none tracking-tight text-[var(--text-primary)]">
        Solo<span className="text-[var(--accent)]">Journalz</span>
      </h1>

      <p className="mt-1.5 w-full text-center text-[8.5px] uppercase tracking-[0.38em] text-[var(--gold)]/80">
        Trading Journal
      </p>
    </Link>
  );
}