type PublicSectionProps = {
  eyebrow?: string;
  title: string;
  text: string;
  children?: React.ReactNode;
};

export default function PublicSection({
  eyebrow,
  title,
  text,
  children,
}: PublicSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm md:p-12">
        {eyebrow && (
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#b8860b]">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-5 max-w-4xl text-4xl font-black tracking-tight md:text-5xl">
          {title}
        </h2>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-[#6b7280]">
          {text}
        </p>

        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}
