"use client";

import { useMemo, useState } from "react";

type TradeScreenshot = {
  id: string;
  trade_id: string;
  image_url: string;
  created_at: string;
};

type StorageScreenshotProps = {
  screenshots: TradeScreenshot[];
};

const cardClass =
  "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]";

export default function StorageScreenshot({
  screenshots,
}: StorageScreenshotProps) {
  const [activeScreenshotIndex, setActiveScreenshotIndex] = useState(0);
  const hasScreenshots = screenshots.length > 0;

  const safeActiveIndex = useMemo(() => {
    if (!hasScreenshots) return 0;
    return Math.min(Math.max(activeScreenshotIndex, 0), screenshots.length - 1);
  }, [activeScreenshotIndex, hasScreenshots, screenshots.length]);

  const activeScreenshot = screenshots[safeActiveIndex];
  const canNavigate = screenshots.length > 1;
  const countLabel = hasScreenshots
    ? `${safeActiveIndex + 1}/${screenshots.length}`
    : "0/0";

  const goToPreviousScreenshot = () => {
    if (!canNavigate) return;

    setActiveScreenshotIndex((currentIndex) =>
      currentIndex === 0 ? screenshots.length - 1 : currentIndex - 1,
    );
  };

  const goToNextScreenshot = () => {
    if (!canNavigate) return;

    setActiveScreenshotIndex((currentIndex) =>
      currentIndex === screenshots.length - 1 ? 0 : currentIndex + 1,
    );
  };

  return (
    <section className={cardClass}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Screenshots</h2>

          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
            Saved visual review for this trade.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-[#efeee9] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
          {countLabel}
        </span>
      </div>

      {hasScreenshots && activeScreenshot ? (
        <div className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--border)] bg-[#efeee9] text-sm font-semibold text-[var(--text-secondary)]">
          <a
            href={activeScreenshot.image_url}
            target="_blank"
            rel="noreferrer"
            className="flex h-full w-full items-center justify-center"
            aria-label={`Open screenshot ${safeActiveIndex + 1} in a new tab`}
          >
            <img
              src={activeScreenshot.image_url}
              alt={`Trade screenshot ${safeActiveIndex + 1}`}
              className="h-full w-full rounded-2xl object-contain"
            />
          </a>

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
        </div>
      ) : (
        <div className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--border)] bg-[#efeee9] text-sm font-semibold text-[var(--text-secondary)]">
          <span>No screenshots saved</span>
        </div>
      )}
    </section>
  );
}
