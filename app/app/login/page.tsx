"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/app/components/layout/logo";
import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";
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
      <PublicNavbar />

      <section className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-7 shadow-[0_8px_40px_rgba(0,0,0,0.05)] sm:p-9">
          <div className="flex justify-center">
            <Logo href="/" centered />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm leading-7 text-[var(--text-secondary)]">
              SoloJournalz currently uses Google sign-in for secure account access.
            </p>
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="mt-10 w-full rounded-2xl bg-[var(--accent)] px-6 py-4 font-semibold text-white shadow-[0_10px_25px_rgba(110,17,17,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-hover)]"
          >
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm leading-6 text-[var(--text-secondary)]">
            If you sign in before public access opens, your account will be registered and you will be returned to the public site until the workspace is available.
          </p>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
