import type { ClipboardEvent } from "react";

type ScreenshotDraft = {
  id?: string;
  imageUrl: string;
  isNew: boolean;
};

type ScreenshotPanelProps = {
  screenshots: ScreenshotDraft[];
  activeScreenshotIndex: number;
  maxScreenshots?: number | null;
  onPaste: (event: ClipboardEvent<HTMLDivElement>) => void;
  onCapture: () => void;
  onDelete: () => void;
  onSelect?: (index: number) => void;
};

export default function ScreenshotPanel({
  screenshots,
  activeScreenshotIndex,
  maxScreenshots = 1,
  onPaste,
  onCapture,
  onDelete,
  onSelect,
}: ScreenshotPanelProps) {
  const hasScreenshot = screenshots.length > 0;
  const safeActiveIndex = hasScreenshot
    ? Math.min(Math.max(activeScreenshotIndex, 0), screenshots.length - 1)
    : 0;
  const activeScreenshot = screenshots[safeActiveIndex];
  const canAddMore = maxScreenshots === null || screenshots.length < maxScreenshots;

  // Expert/unlimited plans still show a clean count like 1/2, 2/2, 3/3.
  // The limit grows with the number of uploaded screenshots instead of showing "Unlimited".
  const displayLimit = maxScreenshots === null ? Math.max(screenshots.length, 1) : maxScreenshots;
  const limitLabel = `${hasScreenshot ? safeActiveIndex + 1 : 0}/${displayLimit}`;

  const canNavigate = screenshots.length > 1;

  const goToPreviousScreenshot = () => {
    if (!canNavigate) return;

    const previousIndex =
      safeActiveIndex === 0 ? screenshots.length - 1 : safeActiveIndex - 1;

    onSelect?.(previousIndex);
  };

  const goToNextScreenshot = () => {
    if (!canNavigate) return;

    const nextIndex =
      safeActiveIndex === screenshots.length - 1 ? 0 : safeActiveIndex + 1;

    onSelect?.(nextIndex);
  };

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Screenshots</h2>

          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
            Paste, capture, or upload screenshots for this trade.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-[#efeee9] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
          {limitLabel}
        </span>
      </div>

      <div
        tabIndex={0}
        onPaste={onPaste}
        className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--border)] bg-[#efeee9] text-sm font-semibold text-[var(--text-secondary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
      >
        {hasScreenshot && activeScreenshot ? (
          <img
            src={activeScreenshot.imageUrl}
            alt={`Trade screenshot ${safeActiveIndex + 1}`}
            className="h-full w-full rounded-2xl object-contain"
          />
        ) : (
          <span>Click + to capture, or paste a snip with Ctrl + V</span>
        )}

        {canNavigate && (
          <>
            <button
              type="button"
              onClick={goToPreviousScreenshot}
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-bold text-[var(--accent)] shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition hover:scale-105"
              aria-label="Previous screenshot"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={goToNextScreenshot}
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-bold text-[var(--accent)] shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition hover:scale-105"
              aria-label="Next screenshot"
            >
              ›
            </button>
          </>
        )}

        {hasScreenshot && (
          <button
            type="button"
            onClick={onDelete}
            className="absolute bottom-4 right-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-[var(--accent)] shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
          >
            Delete
          </button>
        )}

        {canAddMore && (
          <button
            type="button"
            onClick={onCapture}
            className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)] text-2xl font-semibold text-white shadow-[0_10px_25px_rgba(110,17,17,0.2)]"
            aria-label="Add screenshot"
          >
            +
          </button>
        )}
      </div>

      {!canAddMore && maxScreenshots !== null && (
        <p className="mt-3 text-xs font-medium text-[var(--text-secondary)]">
          Your current plan allows {maxScreenshots} screenshot{maxScreenshots === 1 ? "" : "s"} per trade.
        </p>
      )}
    </section>
  );
}
