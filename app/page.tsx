import Link from "next/link";
import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";
import FeatureCard from "@/app/components/public/feature-card";

const features = [
  {
    title: "Log with structure",
    text: "Capture trades, screenshots, notes, mistakes, and context without turning your journal into clutter.",
  },
  {
    title: "Review your edge",
    text: "Understand which environments, setups, and behaviours are actually helping your performance.",
  },
  {
    title: "Build consistency",
    text: "Use a calmer review process to improve discipline, execution quality, and decision-making over time.",
  },
];

export default function HomePage() {
  return (
    <>
      <PublicNavbar />

      <main className="min-h-screen bg-[#f7f7f5] text-black">
        <section className="relative overflow-hidden border-b border-black/10">
          <div className="absolute left-1/2 top-20 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#7f1010]/8 blur-3xl" />

          <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#b8860b]">
              SoloJournalz
            </p>

            <h1 className="mt-7 max-w-5xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">
              A cleaner way to review your trading performance.
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-[#5f6673] md:text-xl">
              Track your trades, screenshots, psychology, execution quality,
              and performance patterns in one calm workspace built for serious
              review.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/pricing"
                className="rounded-2xl bg-[#7f1010] px-8 py-4 text-base font-bold text-white shadow-xl shadow-red-950/10 transition hover:bg-[#650d0d]"
              >
                View prices
              </Link>

              <Link
                href="/about"
                className="rounded-2xl border border-black/10 bg-white px-8 py-4 text-base font-bold text-black shadow-sm transition hover:border-[#7f1010]/40 hover:shadow-md"
              >
                About Us
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 py-20 md:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#b8860b]">
                Performance intelligence
              </p>
              <h2 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
                Built for traders who want clarity, not noise.
              </h2>
            </div>

            <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm md:p-10">
              <p className="text-lg leading-8 text-[#6b7280]">
                SoloJournalz is not a signal tool, copy-trading platform, or
                hype dashboard. It is a focused review system for traders who
                want to understand their execution, psychology, environments,
                and consistency with less friction.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {["Environment Edge", "Psychology Review", "Performance Insights", "Consistency Intelligence"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-black/10 bg-[#f7f7f5] p-5 font-black transition hover:-translate-y-1 hover:border-[#7f1010]/25 hover:bg-white hover:shadow-lg"
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
