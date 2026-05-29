import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <PublicNavbar />

      <section className="mx-auto max-w-4xl px-6 pb-24 pt-20 md:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
          Legal
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          Privacy Policy
        </h1>

        <p className="mt-6 leading-8 text-[var(--text-secondary)]">
          This policy explains how SoloJournalz handles user data and account
          information.
        </p>

        <div className="mt-12 space-y-10">
          <div>
            <h2 className="text-2xl font-black">1. Information We Collect</h2>

            <p className="mt-4 leading-8 text-[var(--text-secondary)]">
              SoloJournalz may collect account information, trade journal data,
              and usage information necessary to operate the platform.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black">2. How Data Is Used</h2>

            <p className="mt-4 leading-8 text-[var(--text-secondary)]">
              Data is used to provide journaling functionality, account access,
              platform improvements, and future feature development.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black">3. Data Security</h2>

            <p className="mt-4 leading-8 text-[var(--text-secondary)]">
              Reasonable steps are taken to protect account and journal data,
              though no system can guarantee absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black">4. Third-Party Services</h2>

            <p className="mt-4 leading-8 text-[var(--text-secondary)]">
              SoloJournalz may use trusted third-party services such as hosting,
              authentication, analytics, or payment providers.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black">5. Future Updates</h2>

            <p className="mt-4 leading-8 text-[var(--text-secondary)]">
              This privacy policy may change over time as the platform evolves
              and additional services are introduced.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}