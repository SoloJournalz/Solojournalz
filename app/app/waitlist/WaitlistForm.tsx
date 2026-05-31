"use client";

import { FormEvent, useState } from "react";

const tradingTypes = ["Forex", "Crypto", "Stocks"];

export default function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tradingType, setTradingType] = useState("Forex");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submitWaitlist = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, trading_type: tradingType }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.error || "Could not join the waitlist.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm font-bold leading-6 text-green-800">
        You are on the waitlist. We will email you when access opens.
      </div>
    );
  }

  return (
    <form onSubmit={submitWaitlist} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-[#6b7280]">
          Name
        </span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-4 text-sm font-bold outline-none transition focus:border-[#7f1010]/40 focus:bg-white"
          placeholder="Your name"
        />
      </label>

      <label className="block">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-[#6b7280]">
          Email
        </span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-4 text-sm font-bold outline-none transition focus:border-[#7f1010]/40 focus:bg-white"
          placeholder="you@example.com"
        />
      </label>

      <label className="block">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-[#6b7280]">
          Trading type
        </span>
        <select
          value={tradingType}
          onChange={(event) => setTradingType(event.target.value)}
          className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-4 text-sm font-bold outline-none transition focus:border-[#7f1010]/40 focus:bg-white"
        >
          {tradingTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-[#7f1010] px-6 py-4 text-sm font-black text-white shadow-lg shadow-red-950/10 transition hover:bg-[#650d0d] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Joining..." : "Join waitlist"}
      </button>
    </form>
  );
}
