import Link from "next/link";
import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";

export default function UnsupportedDevicePage() {
  return (
    <>
      <PublicNavbar />
      <main className="flex min-h-[calc(100vh-96px)] items-center justify-center bg-[#f7f7f5] px-4 py-16 text-black sm:px-6">
        <section className="w-full max-w-2xl rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-[0_16px_60px_rgba(0,0,0,0.08)] sm:p-12">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-[#b8860b]">
            SoloJournalz
          </p>
          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
            Use a larger screen to continue
          </h1>
          <p className="mt-6 text-base leading-8 text-[#5f6673] sm:text-lg">
            SoloJournalz is built as a focused trading workspace for laptops, desktops, and tablets.
          </p>
          <p className="mt-3 text-base leading-8 text-[#5f6673] sm:text-lg">
            Please continue on a laptop, desktop, or tablet to sign in and use the app.
          </p>
          <Link href="/" className="mt-8 inline-flex rounded-2xl bg-[#7f1010] px-7 py-4 font-black text-white shadow-xl shadow-red-950/10 transition hover:bg-[#650d0d]">
            Back to homepage
          </Link>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
