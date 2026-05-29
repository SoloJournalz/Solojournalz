import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";

const values = [
  {
    title: "Simple by design",
    text: "SoloJournalz is built to keep traders focused on logging, reviewing, and improving — not fighting with clutter.",
  },
  {
    title: "Consistency first",
    text: "The goal is to make journaling easy enough to become part of your daily trading routine.",
  },
  {
    title: "Built for review",
    text: "Every feature should help you understand your decisions, spot mistakes, and improve execution over time.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <PublicNavbar />

      <section className="mx-auto max-w-5xl px-6 pb-16 pt-20 text-center md:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
          About SoloJournalz
        </p>

        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
          A cleaner way to stay accountable as a trader.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
          SoloJournalz exists to help traders build consistency through simple
          trade logging, clear review, and better awareness of their trading
          behaviour.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20 md:px-10">
        <div className="rounded-[30px] border border-[var(--border)] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
            Mission
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Help traders stop guessing and start reviewing with clarity.
          </h2>

          <p className="mt-6 max-w-3xl leading-8 text-[var(--text-secondary)]">
            Most traders do not need more noise. They need a simple place to
            record what happened, why it happened, and what they can improve
            next time. SoloJournalz is designed around that idea.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-6 pb-24 md:grid-cols-3 md:px-10">
        {values.map((value) => (
          <div
            key={value.title}
            className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(0,0,0,0.08)]"
          >
            <div className="mb-5 h-1 w-12 rounded-full bg-[var(--accent)]" />
            <h3 className="text-xl font-black">{value.title}</h3>
            <p className="mt-4 text-[15px] leading-7 text-[var(--text-secondary)]">
              {value.text}
            </p>
          </div>
        ))}
      </section>

      <PublicFooter />
    </main>
  );
}