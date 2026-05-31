import Link from "next/link";
import { redirect } from "next/navigation";
import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";

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

  // Safety net for OAuth providers that return the code to / instead of /auth/callback.
  if (code) {
    redirect(`/auth/callback?code=${encodeURIComponent(code)}&next=/dashboard`);
  }

  return (
    <>
      <PublicNavbar />

      <main className="min-h-screen overflow-x-hidden bg-[#f7f7f5] text-black">
        <section className="relative overflow-hidden border-b border-black/10">
          <div className="absolute left-1/2 top-16 h-[420px] w-[420px] max-w-[90vw] -translate-x-1/2 rounded-full bg-[#7f1010]/10 blur-3xl" />
          <div className="absolute right-[-120px] top-48 hidden h-[300px] w-[300px] rounded-full bg-[#d4af37]/10 blur-3xl md:block" />

          <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#b8860b] sm:text-sm">
              Trading journal
            </p>

            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-6xl">
              Trading journal built for serious traders.
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[#5f6673] sm:text-lg lg:text-xl">
              Track trades, review performance, and build consistency through structured journaling.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/pricing"
                className="rounded-2xl bg-[#7f1010] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(127,16,16,0.18)] transition hover:-translate-y-0.5 hover:bg-[#681010] sm:px-8 sm:py-4"
              >
                View Prices
              </Link>

              <Link
                href="/about"
                className="rounded-2xl border border-black/10 bg-white px-6 py-3.5 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:border-[#7f1010]/35 hover:shadow-lg sm:px-8 sm:py-4"
              >
                Learn More
              </Link>
            </div>

            <div className="mt-14 grid w-full gap-4 text-left sm:grid-cols-3">
              {cards.map((card) => (
                <article
                  key={card.title}
                  className="group rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#7f1010]/30 hover:shadow-xl sm:p-6"
                >
                  <div className="mb-5 h-2 w-12 rounded-full bg-[#7f1010]/20 transition group-hover:w-16 group-hover:bg-[#7f1010]" />
                  <h2 className="text-lg font-semibold tracking-tight">{card.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[#6b7280]">{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-black/10 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#b8860b]">
                Simple plans
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Start simple. Upgrade when you need deeper review.
              </h2>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {previewPlans.map((plan) => (
                <article key={plan.name} className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
                  <h3 className="text-2xl font-semibold">{plan.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#6b7280]">{plan.text}</p>
                </article>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/pricing"
                className="inline-flex rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:border-[#7f1010]/35 hover:shadow-lg"
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
