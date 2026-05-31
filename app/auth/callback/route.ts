import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { isWaitlistMode } from "@/lib/site-mode";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    },
  );

  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

  if (sessionError) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  if (isWaitlistMode() && !isAdminUser(user.email)) {
    return NextResponse.redirect(new URL("/?joined=1", requestUrl.origin));
  }

  const { data: planRow } = await supabase
    .from("user_plans")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!planRow) {
    return NextResponse.redirect(new URL("/select-plan", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
