import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <PublicNavbar />

      <section className="mx-auto max-w-4xl px-6 pb-24 pt-20 md:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
          Legal
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          Terms & Conditions
        </h1>

        <p className="mt-6 leading-8 text-[var(--text-secondary)]">
          These terms govern the use of SoloJournalz and related services.
        </p>

        <div className="mt-12 space-y-10">
          <div>
            <h2 className="text-2xl font-black">1. Platform Usage</h2>

            <p className="mt-4 leading-8 text-[var(--text-secondary)]">
              SoloJournalz is provided as a trading journal and review platform
              for educational and organisational purposes only.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black">2. No Financial Advice</h2>

            <p className="mt-4 leading-8 text-[var(--text-secondary)]">
              SoloJournalz does not provide financial, investment, or trading
              advice. All trading decisions remain the responsibility of the
              user.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black">3. User Accounts</h2>

            <p className="mt-4 leading-8 text-[var(--text-secondary)]">
              Users are responsible for maintaining the security of their
              account credentials and activity associated with their account.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black">4. Data & Availability</h2>

            <p className="mt-4 leading-8 text-[var(--text-secondary)]">
              We aim to maintain platform stability and data availability but
              cannot guarantee uninterrupted access at all times.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black">5. Future Payments</h2>

            <p className="mt-4 leading-8 text-[var(--text-secondary)]">
              Paid plans and subscriptions may be introduced in the future.
              Additional billing terms will apply once payment systems are
              active.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black">6. Changes</h2>

            <p className="mt-4 leading-8 text-[var(--text-secondary)]">
              These terms may be updated over time as SoloJournalz evolves.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}