import Link from "next/link";

export default function DevPage() {
  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <h1 className="text-3xl font-bold">SoloJournalz Dev Panel</h1>

      <p className="mt-3 text-white/50">
        Quick links for testing pages without repeating the full auth flow.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Link className="rounded-xl border border-white/10 p-4 hover:bg-white/10" href="/">
          Homepage
        </Link>

        <Link className="rounded-xl border border-white/10 p-4 hover:bg-white/10" href="/login">
          Login
        </Link>

        <Link className="rounded-xl border border-white/10 p-4 hover:bg-white/10" href="/dashboard">
          Dashboard
        </Link>

        <Link className="rounded-xl border border-white/10 p-4 hover:bg-white/10" href="/settings">
          Settings
        </Link>
      </div>
    </main>
  );
}