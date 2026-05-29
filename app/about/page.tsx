import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";
import FeatureCard from "@/app/components/public/feature-card";

const principles = [
  {
    title: "Clarity over clutter",
    text: "A trading journal should make review easier, not become another messy dashboard to manage.",
  },
  {
    title: "Discipline over noise",
    text: "SoloJournalz is built around execution quality, psychology, consistency, and repeatable behaviour.",
  },
  {
    title: "Review over guessing",
    text: "The goal is to help traders understand what happened, why it happened, and what to improve next.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PublicNavbar />

      <main className="min-h-screen bg-[#f7f7f5] text-black">
        <section className="mx-auto max-w-5xl px-6 py-24 text-center">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-[#b8860b]">
            About SoloJournalz
          </p>

          <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight md:text-6xl">
            Built for traders who take review seriously.
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-[#6b7280]">
            SoloJournalz exists because most traders do not need more noise.
            They need a cleaner way to track their decisions, review mistakes,
            understand patterns, and build consistency over time.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm md:p-12">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#b8860b]">
              Philosophy
            </p>

            <h2 className="mt-5 max-w-4xl text-4xl font-black tracking-tight md:text-5xl">
              Trading improvement starts with honest review.
            </h2>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#6b7280]">
              The product is designed around a simple belief: if you can clearly
              see how you trade, you can make better decisions. That means
              logging the trade, reviewing the context, tracking your behaviour,
              and learning from the patterns that keep repeating.
            </p>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 py-20 md:grid-cols-3">
            {principles.map((principle) => (
              <FeatureCard key={principle.title} {...principle} />
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
