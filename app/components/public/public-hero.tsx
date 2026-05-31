import type { ReactNode } from "react";

type PublicHeroProps = {
  label: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export default function PublicHero({ label, title, description, children }: PublicHeroProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-14 pt-20 text-center md:px-10 md:pb-16 md:pt-24">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--gold)]">
        {label}
      </p>

      <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
        {title}
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
        {description}
      </p>

      {children ? <div className="mt-10">{children}</div> : null}
    </section>
  );
}
