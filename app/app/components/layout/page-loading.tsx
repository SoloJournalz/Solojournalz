import Logo from "@/app/components/layout/logo";
import Navbar from "@/app/components/layout/navbar";

export default function PageLoading({
  label = "Loading workspace",
  workspace = false,
  showLogo = true,
}: {
  label?: string;
  workspace?: boolean;
  showLogo?: boolean;
}) {
  const loader = (
    <section
      className={
        workspace
          ? "flex min-h-[calc(100vh-72px)] items-center justify-center bg-[var(--background)] text-[var(--text-primary)]"
          : "flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--text-primary)]"
      }
    >
      <div className="flex flex-col items-center px-6 text-center">
        {!workspace && showLogo ? <Logo href="/" centered /> : null}

        <div
          className={
            !workspace && showLogo
              ? "mt-8 h-9 w-9 animate-spin rounded-full border-4 border-[#efeee9] border-t-[var(--accent)]"
              : "h-9 w-9 animate-spin rounded-full border-4 border-[#efeee9] border-t-[var(--accent)]"
          }
        />

        <p className="mt-5 text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </p>
      </div>
    </section>
  );

  if (workspace) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        <Navbar />
        {loader}
      </main>
    );
  }

  return <main>{loader}</main>;
}
