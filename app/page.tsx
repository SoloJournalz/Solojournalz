import Link from "next/link";
import { redirect } from "next/navigation";
import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";
import PublicHero from "@/app/components/public/public-hero";

const cards = [
  {
    title: "Track trades",
    text: "Log entries, screenshots, notes, execution context, and outcomes in one clean workflow.",
  },
  {
    title: "Review performance",
    text: "Find patterns across setups, behaviour, market conditions, and execution quality.",
  },
  {
    title: "Build discipline",
    text: "Turn journaling into a calmer review habit that supports consistency over time.",
  },
];

const previewPlans = [
  {
    name: "Free",
    text: "Core journaling for traders building a structured review routine.",
  },
  {
    name: "Expert",
    text: "Advanced analytics, deeper insights, and unlimited trade review tools.",
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ code?: string | string[] }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const code = Array.isArray(params?.code) ? params?.code[0] : params?.code;

  if (code) {
    redirect(`/auth/callback?code=${encodeURIComponent(code)}&next=/dashboard`);
  }

  return (
    <>
      <PublicNavbar />

      <main className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--text-primary)]">
        <section className="relative overflow-hidden border-b border-[var(--border)]">
          <div className="absolute left-1/2 top-16 h-[420px] w-[420px] max-w-[90vw] -translate-x-1/2 rounded-full bg-[var(--accent)]/10 blur-3xl" />
          <div className="absolute right-[-120px] top-48 hidden h-[300px] w-[300px] rounded-full bg-[var(--gold)]/10 blur-3xl md:block" />

          <div className="relative">
            <PublicHero
              label="SoloJournalz"
              title="Trading journal built for serious traders."
              description="Track trades, review performance, and build consistency through structured journaling."
            >
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/pricing"
                  className="rounded-2xl bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(127,16,16,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] sm:px-8 sm:py-4"
                >
                  View Prices
                </Link>

                <Link
                  href="/about"
                  className="rounded-2xl border border-[var(--border)] bg-white px-6 py-3.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35 hover:shadow-lg sm:px-8 sm:py-4"
                >
                  Learn More
                </Link>
              </div>
            </PublicHero>

            <div className="mx-auto grid max-w-6xl gap-4 px-6 pb-20 text-left sm:grid-cols-3 lg:px-10">
              {cards.map((card) => (
                <article
                  key={card.title}
                  className="group h-full rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)]/30 hover:shadow-xl sm:p-6"
                >
                  <div className="mb-5 h-2 w-12 rounded-full bg-[var(--accent)]/20 transition group-hover:w-16 group-hover:bg-[var(--accent)]" />
                  <h2 className="text-lg font-semibold tracking-tight">{card.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--border)] px-6 py-16 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--gold)]">
                Simple plans
              </p>
              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Start simple. Upgrade when you need deeper review.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {previewPlans.map((plan) => (
                <article key={plan.name} className="rounded-[1.5rem] border border-[var(--border)] bg-white p-6 shadow-sm">
                  <h3 className="text-2xl font-black">{plan.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{plan.text}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/pricing"
                className="inline-flex rounded-2xl border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35 hover:shadow-lg"
              >
                View full pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
