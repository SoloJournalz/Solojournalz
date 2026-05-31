import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const allowedTradingTypes = new Set(["Forex", "Crypto", "Stocks"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const tradingType = String(body?.tradingType || "").trim();

  if (!name || !email || !tradingType) {
    return NextResponse.json(
      { error: "Please complete all fields." },
      { status: 400 },
    );
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (!allowedTradingTypes.has(tradingType)) {
    return NextResponse.json(
      { error: "Please choose a valid trading type." },
      { status: 400 },
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  const { error } = await supabase.from("waitlist_submissions").insert({
    name,
    email,
    trading_type: tradingType,
  });

  if (error?.code === "23505") {
    return NextResponse.json(
      { error: "This email is already on the waitlist." },
      { status: 409 },
    );
  }

  if (error) {
    return NextResponse.json(
      { error: "Could not join the waitlist. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
