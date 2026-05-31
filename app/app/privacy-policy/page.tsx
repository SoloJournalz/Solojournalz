import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";

const sections = [
  {
    title: "1. Information we collect",
    text: "SoloJournalz may collect basic account information from Google sign-in, including your name, email address, and profile identifier. We also store the trading journal data you choose to add, including trades, notes, screenshots, settings, and review inputs.",
  },
  {
    title: "2. How we use information",
    text: "We use this information to provide account access, save your journal, display analytics, manage your plan, improve the product, and support the platform during private development and launch preparation.",
  },
  {
    title: "3. Authentication and payments",
    text: "SoloJournalz currently uses Google sign-in for authentication. Payment and subscription handling is processed through Stripe. SoloJournalz does not directly store full card details.",
  },
  {
    title: "4. Screenshots and uploads",
    text: "If you upload screenshots or other journal-related files, they are used to support your trading review workflow and are associated with your account.",
  },
  {
    title: "5. Data security",
    text: "We take reasonable steps to protect account and journal data, but no online service can guarantee perfect security. You are responsible for protecting your own account access.",
  },
  {
    title: "6. Contact",
    text: "For privacy questions, contact support@solojournalz.com.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <PublicNavbar />

      <section className="mx-auto max-w-4xl px-6 pb-24 pt-20 md:px-10">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--gold)]">
          Legal
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          Privacy Policy
        </h1>

        <p className="mt-6 leading-8 text-[var(--text-secondary)]">
          This is a simple pre-launch privacy policy for SoloJournalz. It explains how account, journal, upload, and payment-related data is handled while the product is being prepared for launch.
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
