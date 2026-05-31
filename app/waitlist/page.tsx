import Link from "next/link";
import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";

export default function WaitlistPage() {
  return (
    <>
      <PublicNavbar />
      <main className="min-h-screen overflow-x-hidden bg-[#f7f7f5] text-black">
        <section className="relative overflow-hidden border-b border-black/10">
          <div className="absolute left-1/2 top-20 h-[520px] w-[520px] max-w-[90vw] -translate-x-1/2 rounded-full bg-[#7f1010]/10 blur-3xl" />

          <div className="relative mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-6xl flex-col items-center justify-center px-6 py-20 text-center sm:px-8 lg:px-10">
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#b8860b] sm:text-sm">
              SoloJournalz
            </p>

            <h1 className="mt-7 max-w-5xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Coming Soon.
            </h1>

            <p className="mt-7 max-w-3xl text-base leading-8 text-[#5f6673] sm:text-lg lg:text-xl">
              SoloJournalz is currently in private production testing. Public access is temporarily closed while we finish the final launch setup.
            </p>

            <div className="mt-10 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-3">
              {["Trade Log", "Storage", "Analytics"].map((item) => (
                <div key={item} className="rounded-2xl border border-black/10 bg-white p-5 text-center text-sm font-black shadow-sm">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/pricing"
                className="rounded-2xl bg-[#7f1010] px-8 py-4 text-base font-bold text-white shadow-xl shadow-red-950/10 transition hover:bg-[#650d0d]"
              >
                View prices
              </Link>

              <Link
                href="/contact"
                className="rounded-2xl border border-black/10 bg-white px-8 py-4 text-base font-bold text-black shadow-sm transition hover:border-[#7f1010]/40 hover:shadow-md"
              >
                Contact Us
              </Link>
            </div>

            <p className="mt-8 max-w-2xl text-sm leading-6 text-[#6b7280]">
              Admin access remains available through Sign In while the public app is locked.
            </p>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
