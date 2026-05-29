const cardClass =
  "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]";

type SettingsListProps = {
  title: string;
  description: string;
  items: string[];
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (item: string) => void;
  maxItems?: number | null;
  emptyMessage?: string;
};

export default function SettingsList({
  title,
  description,
  items,
  value,
  placeholder,
  onChange,
  onAdd,
  onRemove,
  maxItems,
  emptyMessage = "No items added yet.",
}: SettingsListProps) {
  const isAtLimit = maxItems !== null && maxItems !== undefined && items.length >= maxItems;
  const displayLimit = maxItems === null ? items.length : maxItems;

  return (
    <section className={cardClass}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>
        </div>

        {maxItems !== undefined && (
          <span className="shrink-0 rounded-full bg-[#efeee9] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
            {items.length}/{displayLimit}
          </span>
        )}
      </div>

      <div className="mt-5 flex gap-3">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isAtLimit}
          placeholder={isAtLimit ? "Plan limit reached" : placeholder}
          className="min-w-0 flex-1 rounded-xl border border-[#d8d5cf] bg-[#efeee9] px-4 py-3 text-sm font-semibold outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)] disabled:opacity-60"
        />

        <button
          type="button"
          onClick={onAdd}
          disabled={isAtLimit}
          className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-[var(--border)] bg-[#f8f6f2] px-4 py-5 text-sm font-semibold leading-6 text-[var(--text-secondary)]">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold"
            >
              {item}

              <button
                type="button"
                onClick={() => onRemove(item)}
                className="text-[var(--accent)]"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
