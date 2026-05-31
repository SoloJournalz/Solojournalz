import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";
import FeatureCard from "@/app/components/public/feature-card";
import PublicHero from "@/app/components/public/public-hero";

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

      <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        <PublicHero
          label="About Us"
          title="Built for traders who take review seriously."
          description="SoloJournalz exists because most traders do not need more noise. They need a cleaner way to track decisions, review mistakes, understand patterns, and build consistency over time."
        />

        <section className="mx-auto max-w-7xl px-6 pb-20 md:px-10">
          <div className="rounded-[2rem] border border-[var(--border)] bg-white p-8 shadow-sm md:p-12">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--gold)]">
              Philosophy
            </p>

            <h2 className="mt-5 max-w-4xl text-4xl font-black tracking-tight md:text-5xl">
              Trading improvement starts with honest review.
            </h2>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--text-secondary)]">
              The product is designed around a simple belief: if you can clearly see how you trade, you can make better decisions. That means logging the trade, reviewing the context, tracking your behaviour, and learning from the patterns that keep repeating.
            </p>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 py-20 md:grid-cols-3 md:px-10">
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
