import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";
import PublicHero from "@/app/components/public/public-hero";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <PublicNavbar />

      <PublicHero
        label="Contact"
        title="Questions, feedback, or feature ideas?"
        description="Keep it simple. Email us about support, bug reports, product feedback, or anything you want to see improved before launch."
      />

      <section className="mx-auto max-w-4xl px-6 pb-24 md:px-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="mailto:support@solojournalz.com" className="rounded-[30px] border border-[var(--border)] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:border-[var(--accent)]/30 hover:shadow-xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--gold)]">Support</p>
            <h2 className="mt-4 text-xl font-black tracking-tight">support@solojournalz.com</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">Best for account help, bugs, billing questions, and product support.</p>
          </a>

          <a href="mailto:hello@solojournalz.com" className="rounded-[30px] border border-[var(--border)] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:border-[var(--accent)]/30 hover:shadow-xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--gold)]">General</p>
            <h2 className="mt-4 text-xl font-black tracking-tight">hello@solojournalz.com</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">Best for general questions, partnerships, and pre-launch feedback.</p>
          </a>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
