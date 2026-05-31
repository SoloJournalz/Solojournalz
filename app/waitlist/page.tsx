"use client";

import { FormEvent, useState } from "react";
import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";

const tradingTypes = ["Forex", "Crypto", "Stocks"];

export default function WaitlistPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tradingType, setTradingType] = useState("Forex");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, tradingType }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error || "Could not join the waitlist.");
      return;
    }

    setStatus("success");
    setMessage("You're on the waitlist. We'll let you know when SoloJournalz opens.");
    setName("");
    setEmail("");
    setTradingType("Forex");
  };

  return (
    <>
      <PublicNavbar />
      <main className="min-h-screen overflow-x-hidden bg-[#f7f7f5] text-black">
        <section className="relative overflow-hidden border-b border-black/10">
          <div className="absolute left-1/2 top-10 h-[420px] w-[420px] max-w-[90vw] -translate-x-1/2 rounded-full bg-[#7f1010]/10 blur-3xl" />
          <div className="relative mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-24">
            <div className="min-w-0 text-center lg:text-left">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#b8860b] sm:text-sm">
                SoloJournalz
              </p>
              <h1 className="mt-6 text-4xl font-black leading-[1.03] tracking-tight sm:text-5xl lg:text-7xl">
                Built for Disciplined Traders.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-[#5f6673] sm:text-lg lg:text-xl">
                A premium trading journal for logging trades, screenshots, psychology, execution quality, and performance patterns in one focused workspace.
              </p>
              <div className="mt-8 grid gap-3 text-left sm:grid-cols-3 lg:max-w-2xl">
                {["Trade Log", "Storage", "Analytics"].map((item) => (
                  <div key={item} className="rounded-2xl border border-black/10 bg-white p-4 text-sm font-black shadow-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={onSubmit} className="mx-auto w-full max-w-md rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_16px_60px_rgba(0,0,0,0.08)] sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#b8860b]">
                Launching Soon
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                Join the waitlist
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#6b7280]">
                Public access is closed while final production testing is completed.
              </p>

              <label className="mt-7 block text-sm font-bold">Name</label>
              <input className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-4 text-sm font-semibold outline-none focus:border-[#7f1010]" value={name} onChange={(event) => setName(event.target.value)} required />

              <label className="mt-5 block text-sm font-bold">Email</label>
              <input className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-4 text-sm font-semibold outline-none focus:border-[#7f1010]" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

              <label className="mt-5 block text-sm font-bold">Trading Type</label>
              <select className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-4 text-sm font-semibold outline-none focus:border-[#7f1010]" value={tradingType} onChange={(event) => setTradingType(event.target.value)}>
                {tradingTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>

              <button type="submit" disabled={status === "loading"} className="mt-7 w-full rounded-2xl bg-[#7f1010] px-6 py-4 font-black text-white shadow-xl shadow-red-950/10 transition hover:bg-[#650d0d] disabled:cursor-not-allowed disabled:opacity-60">
                {status === "loading" ? "Joining..." : "Join Waitlist"}
              </button>

              {message ? (
                <p className={`mt-4 rounded-2xl p-4 text-sm font-bold ${status === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                  {message}
                </p>
              ) : null}
            </form>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
