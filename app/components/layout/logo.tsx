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
      className={`flex min-w-0 flex-col ${centered ? "items-center" : "items-start"}`}
    >
      <h1 className="text-[1.45rem] font-bold leading-none tracking-tight text-[var(--text-primary)] sm:text-[1.7rem]">
        Solo<span className="text-[var(--accent)]">Journalz</span>
      </h1>

      <p className="mt-1.5 self-center whitespace-nowrap text-center text-[7.5px] uppercase tracking-[0.3em] text-[var(--gold)]/80 sm:text-[8.5px] sm:tracking-[0.38em]">
        Trading Journal
      </p>
    </Link>
  );
}
