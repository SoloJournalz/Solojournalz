import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-black">
      <PublicNavbar />

      <section className="mx-auto max-w-5xl px-6 pb-16 pt-20 text-center md:px-10">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#b8860b]">
          Contact
        </p>

        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
          Questions, feedback, or feature ideas?
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#6b7280] md:text-lg">
          Keep it simple. Email us about support, bug reports, product feedback, or anything you want to see improved before launch.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 md:px-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="mailto:support@solojournalz.com" className="rounded-[30px] border border-[var(--border)] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:border-[var(--accent)]/30 hover:shadow-xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#b8860b]">Support</p>
            <h2 className="mt-4 text-xl font-black tracking-tight">support@solojournalz.com</h2>
            <p className="mt-4 text-sm leading-7 text-[#6b7280]">Best for account help, bugs, billing questions, and product support.</p>
          </a>

          <a href="mailto:hello@solojournalz.com" className="rounded-[30px] border border-[var(--border)] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:border-[var(--accent)]/30 hover:shadow-xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#b8860b]">General</p>
            <h2 className="mt-4 text-xl font-black tracking-tight">hello@solojournalz.com</h2>
            <p className="mt-4 text-sm leading-7 text-[#6b7280]">Best for general questions, partnerships, and pre-launch feedback.</p>
          </a>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
