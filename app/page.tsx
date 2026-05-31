import Link from "next/link";
import { redirect } from "next/navigation";
import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";

const cards = [
  {
    title: "Track trades",
    text: "Log entries, screenshots, notes, execution context, and trade outcomes without clutter.",
  },
  {
    title: "Review performance",
    text: "See the patterns behind your setups, trading environments, behaviour, and consistency.",
  },
  {
    title: "Build discipline",
    text: "Create a calmer review habit that helps you trade with more structure and less noise.",
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ code?: string | string[]; next?: string | string[] }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const code = Array.isArray(params?.code) ? params?.code[0] : params?.code;

  // Safety net for OAuth providers that return the code to / instead of /auth/callback.
  if (code) {
    redirect(`/auth/callback?code=${encodeURIComponent(code)}&next=/dashboard`);
  }

  return (
    <>
      <PublicNavbar />

      <main className="min-h-screen overflow-x-hidden bg-[#f7f7f5] text-black">
        <section className="relative overflow-hidden border-b border-black/10">
          <div className="absolute left-1/2 top-12 h-[460px] w-[460px] max-w-[90vw] -translate-x-1/2 rounded-full bg-[#7f1010]/10 blur-3xl" />
          <div className="absolute right-[-120px] top-40 hidden h-[320px] w-[320px] rounded-full bg-[#d4af37]/10 blur-3xl md:block" />

          <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-10">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#b8860b] sm:text-sm">
              SoloJournalz
            </p>

            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.03] tracking-tight sm:text-5xl lg:text-7xl">
              SoloJournalz is coming soon.
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[#5f6673] sm:text-lg lg:text-xl">
              A disciplined trading journal built for serious traders.
            </p>

            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-[#6b7280] sm:text-base">
              Private development is currently in progress while we finish production testing, responsive polish, and launch preparation.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="rounded-2xl bg-[#7f1010] px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-red-950/10 transition hover:-translate-y-0.5 hover:bg-[#650d0d] sm:px-8 sm:py-4"
              >
                Sign In
              </Link>
              <Link
                href="/pricing"
                className="rounded-2xl border border-black/10 bg-white px-6 py-3.5 text-sm font-black text-black shadow-sm transition hover:-translate-y-0.5 hover:border-[#7f1010]/35 hover:shadow-lg sm:px-8 sm:py-4"
              >
                View Prices
              </Link>
            </div>

            <div className="mt-12 grid w-full gap-4 text-left sm:grid-cols-3">
              {cards.map((card) => (
                <article
                  key={card.title}
                  className="group rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#7f1010]/30 hover:shadow-xl sm:p-6"
                >
                  <div className="mb-5 h-2 w-12 rounded-full bg-[#7f1010]/20 transition group-hover:w-16 group-hover:bg-[#7f1010]" />
                  <h2 className="text-lg font-black tracking-tight">{card.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[#6b7280]">{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
