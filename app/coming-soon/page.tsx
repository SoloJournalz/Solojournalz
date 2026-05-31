import Link from "next/link";
import { redirect } from "next/navigation";
import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";
import PublicHero from "@/app/components/public/public-hero";

const cards = [
  {
    title: "Track trades",
    text: "Log entries, screenshots, notes, execution context, and trade outcomes without clutter.",
  },
  {
    title: "Review performance",
    text: "Spot patterns across setups, behaviour, market conditions, and execution quality.",
  },
  {
    title: "Build discipline",
    text: "Create a calmer review habit that helps you stay structured and consistent.",
  },
];

export default async function ComingSoonPage({
  searchParams,
}: {
  searchParams?: Promise<{ code?: string | string[]; joined?: string | string[] }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const code = Array.isArray(params?.code) ? params?.code[0] : params?.code;
  const joined = Array.isArray(params?.joined) ? params?.joined[0] : params?.joined;

  if (code) {
    redirect(`/auth/callback?code=${encodeURIComponent(code)}&next=/dashboard`);
  }

  return (
    <>
      <PublicNavbar />

      <main className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--text-primary)]">
        <section className="relative overflow-hidden border-b border-[var(--border)]">
          <div className="absolute left-1/2 top-12 h-[420px] w-[420px] max-w-[90vw] -translate-x-1/2 rounded-full bg-[var(--accent)]/10 blur-3xl" />
          <div className="absolute right-[-120px] top-40 hidden h-[300px] w-[300px] rounded-full bg-[var(--gold)]/10 blur-3xl md:block" />

          <div className="relative">
            <PublicHero
              label="Coming Soon"
              title="SoloJournalz"
              description="A disciplined trading journal built for serious traders. Private development is currently in progress while we finish production testing, responsive polish, and launch preparation."
            >
              {joined === "1" && (
                <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-[var(--gold)]/30 bg-white/80 px-5 py-3 text-sm font-medium leading-6 text-[var(--text-secondary)] shadow-sm">
                  Your account has been registered successfully. Public workspace access is paused while SoloJournalz is in private development.
                </div>
              )}

              <Link
                href="/pricing"
                className="inline-flex rounded-2xl border border-[var(--border)] bg-white px-6 py-3.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35 hover:shadow-lg sm:px-8 sm:py-4"
              >
                View Prices
              </Link>
            </PublicHero>

            <div className="mx-auto grid max-w-6xl gap-4 px-6 pb-20 text-left sm:grid-cols-3 lg:px-10">
              {cards.map((card) => (
                <article
                  key={card.title}
                  className="group rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)]/30 hover:shadow-xl sm:p-6"
                >
                  <div className="mb-5 h-2 w-12 rounded-full bg-[var(--accent)]/20 transition group-hover:w-16 group-hover:bg-[var(--accent)]" />
                  <h2 className="text-lg font-semibold tracking-tight">{card.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
