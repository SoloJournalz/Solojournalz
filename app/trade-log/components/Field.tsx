import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  children: ReactNode;
};

export default function Field({ label, children }: FieldProps) {
  return (
    <label className="grid grid-cols-[82px_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[90px_minmax(0,1fr)]">
      <span className="rounded-lg border border-[#d8d5cf] bg-white px-2.5 py-2 text-[10px] font-bold tracking-wide text-[#6b7280] sm:px-3 sm:text-[10.5px]">
        {label}
      </span>

      <div className="min-w-0">{children}</div>
    </label>
  );
}
