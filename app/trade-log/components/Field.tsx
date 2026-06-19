import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  children: ReactNode;
};

export default function Field({ label, children }: FieldProps) {
  return (
    <label className="grid grid-cols-1 gap-2 sm:grid-cols-[110px_minmax(0,1fr)] sm:items-center">
      <span className="rounded-lg border border-[#d8d5cf] bg-white px-3 py-2 text-[10.5px] font-bold tracking-wide text-[#6b7280]">
        {label}
      </span>

      <div className="min-w-0">{children}</div>
    </label>
  );
}