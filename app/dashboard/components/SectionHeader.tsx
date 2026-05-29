import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export default function SectionHeader({ eyebrow, title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
            {eyebrow}
          </p>
        ) : null}

        <h3 className="mt-1 text-xl font-semibold tracking-tight">{title}</h3>

        {subtitle ? (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            {subtitle}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
