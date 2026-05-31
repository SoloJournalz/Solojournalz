"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/app/components/layout/logo";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: planRow } = await supabase
        .from("user_plans")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      router.replace(planRow ? "/dashboard" : "/select-plan");
    };

    checkUser();

    const handlePageShow = () => {
      checkUser();
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [router]);

  const signInWithGoogle = async () => {
    const siteUrl = window.location.origin;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
      },
    });
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1600px] items-center px-10">
          <Logo href="/" />
        </div>
      </header>

      <section className="flex min-h-[calc(100vh-72px)] items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 shadow-[0_8px_40px_rgba(0,0,0,0.05)]">
          <div className="flex justify-center">
            <Logo href="/" centered />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Sign in with Google to continue.
            </p>
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="mt-10 w-full rounded-2xl bg-[var(--accent)] px-6 py-4 font-semibold text-white shadow-[0_10px_25px_rgba(110,17,17,0.18)] transition hover:bg-[var(--accent-hover)]"
          >
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Secure authentication powered by Google
          </p>
        </div>
      </section>
    </main>
  );
}
