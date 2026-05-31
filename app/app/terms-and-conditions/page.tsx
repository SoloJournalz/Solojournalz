import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";
import PublicHero from "@/app/components/public/public-hero";

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
    text: "SoloJournalz currently uses Google sign-in. Workspace access may be limited while the product is in private development.",
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

      <PublicHero
        label="Terms"
        title="Terms of Service"
        description="These simple pre-launch terms govern use of SoloJournalz and related services."
      />

      <section className="mx-auto max-w-4xl px-6 pb-24 md:px-10">
        <div className="space-y-8">
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
