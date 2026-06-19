import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  children: ReactNode;
};

export default function Field({ label, children }: FieldProps) {
  return (
    <label className="grid grid-cols-1 gap-1.5 sm:grid-cols-[92px_minmax(0,1fr)] sm:items-center sm:gap-2">
      <span className="rounded-lg border border-[#d8d5cf] bg-white px-3 py-1.5 text-[10px] font-bold tracking-wide text-[#6b7280] sm:py-2 sm:text-[10.5px]">
        {label}
      </span>

      <div className="min-w-0">{children}</div>
    </label>
  );
}
