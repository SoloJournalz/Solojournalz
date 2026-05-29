import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <PublicNavbar />

      <section className="mx-auto max-w-5xl px-6 pb-16 pt-20 text-center md:px-10">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--gold)]">
          Contact
        </p>

        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
          Questions, feedback, or feature ideas?
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
          Reach out about support, product feedback, or features you would like
          to see inside SoloJournalz.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 md:px-10">
        <div className="rounded-[30px] border border-[var(--border)] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--gold)]">
            Contact
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-tight">
            Email us
          </h2>

          <p className="mt-5 leading-8 text-[var(--text-secondary)]">
            For support, feedback, bug reports, or feature suggestions, contact
            us by email and we'll get back to you as soon as possible.
          </p>

          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-6 py-5">
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              support@yourdomain.com
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}