import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";

const sections = [
  {
    title: "1. Platform purpose",
    text: "SoloJournalz is a trading journal and productivity tool designed to help users record trades, review performance, and build better review habits.",
  },
  {
    title: "2. Not financial advice",
    text: "SoloJournalz does not provide financial, investment, trading, or tax advice. You are fully responsible for your own trades, risk decisions, and financial outcomes.",
  },
  {
    title: "3. Account access",
    text: "SoloJournalz currently uses Google sign-in. During private development or coming soon mode, workspace access may be limited to approved admin accounts.",
  },
  {
    title: "4. Subscriptions and billing",
    text: "Paid subscriptions and billing are handled through Stripe. Plan access, renewals, cancellations, and billing portal actions are subject to Stripe processing and the active SoloJournalz plan rules.",
  },
  {
    title: "5. User data",
    text: "You are responsible for the journal content you enter, including trade records, notes, screenshots, and other uploads. Do not upload anything you do not have the right to use or store.",
  },
  {
    title: "6. Availability and changes",
    text: "SoloJournalz is still evolving. Features, pricing, limits, and access rules may change before public launch as the product is tested and improved.",
  },
  {
    title: "7. Contact",
    text: "For terms or account questions, contact support@solojournalz.com.",
  },
];

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <PublicNavbar />

      <section className="mx-auto max-w-4xl px-6 pb-24 pt-20 md:px-10">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--gold)]">
          Legal
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          Terms of Service
        </h1>

        <p className="mt-6 leading-8 text-[var(--text-secondary)]">
          These simple pre-launch terms govern use of SoloJournalz and related services.
        </p>

        <div className="mt-12 space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="rounded-[1.5rem] border border-[var(--border)] bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">{section.title}</h2>
              <p className="mt-4 leading-8 text-[var(--text-secondary)]">{section.text}</p>
            </section>
          ))}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
