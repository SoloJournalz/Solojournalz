import Logo from "@/app/components/layout/logo";

export default function PageLoading({
  label = "Loading workspace",
}: {
  label?: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--text-primary)]">
      <div className="flex flex-col items-center">
        <Logo href="/" centered />

        <div className="mt-8 h-9 w-9 animate-spin rounded-full border-4 border-[#efeee9] border-t-[var(--accent)]" />

        <p className="mt-5 text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </p>
      </div>
    </main>
  );
}