"use client";

import { useEffect, useRef, useState } from "react";
import type { ClipboardEvent, ChangeEvent } from "react";

import type { ScreenshotPhase } from "@/types/trade";

type ScreenshotRecord = {
  id: string;
  image_url: string;
  phase?: ScreenshotPhase | null;
};

type TradeScreenshotCaptureProps = {
  title: string;
  helper: string;
  phase: ScreenshotPhase;
  screenshot?: ScreenshotRecord;
  locked?: boolean;
  lockedMessage?: string;
  saving?: boolean;
  onUpload: (file: File, phase: ScreenshotPhase) => Promise<void> | void;
  onDelete: (phase: ScreenshotPhase) => Promise<void> | void;
};

const dataUrlToFile = async (dataUrl: string, filename: string) => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  return new File([blob], filename, { type: blob.type || "image/jpeg" });
};

export default function TradeScreenshotCapture({
  title,
  helper,
  phase,
  screenshot,
  locked = false,
  lockedMessage = "Upgrade to unlock this screenshot.",
  saving = false,
  onUpload,
  onDelete,
}: TradeScreenshotCaptureProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const updateDevice = () => {
      setIsDesktop(window.matchMedia("(min-width: 768px)").matches);
    };

    updateDevice();
    window.addEventListener("resize", updateDevice);

    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const uploadFile = async (file: File) => {
    if (locked || saving) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));

    await onUpload(file, phase);
    setPreviewUrl(null);
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    await uploadFile(file);
  };

  const handleCaptureScreen = async () => {
    if (locked || saving) return;

    if (!navigator.mediaDevices?.getDisplayMedia) {
      alert("Screen capture is not supported in this browser. Please upload or paste a screenshot instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not capture screenshot.");

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach((track) => track.stop());

      const file = await dataUrlToFile(
        canvas.toDataURL("image/jpeg", 0.9),
        `${phase.toLowerCase()}-capture.jpg`,
      );

      await uploadFile(file);
    } catch (error) {
      if (error instanceof Error && error.name === "NotAllowedError") return;
      alert(error instanceof Error ? error.message : "Screenshot capture failed.");
    }
  };

  const handlePaste = async (event: ClipboardEvent<HTMLDivElement>) => {
    if (locked || saving) return;

    const items = Array.from(event.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith("image/"));
    const file = imageItem?.getAsFile();

    if (!file) return;

    event.preventDefault();
    await uploadFile(file);
  };

  const displayImage = previewUrl || screenshot?.image_url;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          <p className="mt-1 max-w-2xl text-sm font-medium text-[var(--text-secondary)]">
            {locked ? lockedMessage : helper}
          </p>
        </div>

        {locked ? (
          <span className="w-fit rounded-full bg-[#efeee9] px-3 py-1 text-xs font-black text-[var(--accent)]">
            Expert
          </span>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      <div
        tabIndex={locked ? -1 : 0}
        onPaste={handlePaste}
        className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--border)] bg-white text-center text-sm font-semibold text-[var(--text-secondary)] outline-none transition focus:ring-2 focus:ring-[var(--accent)]/20 sm:min-h-[340px] lg:min-h-[460px]"
      >
        {displayImage ? (
          <a
            href={displayImage}
            target="_blank"
            rel="noreferrer"
            className="flex h-full min-h-[280px] w-full items-center justify-center sm:min-h-[340px] lg:min-h-[460px]"
          >
            <img
              src={displayImage}
              alt={title}
              className="h-full max-h-[560px] w-full rounded-2xl object-contain"
            />
          </a>
        ) : (
          <div className="max-w-md px-6">
            <p>
              {locked
                ? lockedMessage
                : isDesktop
                  ? "Capture, upload, or paste a screenshot here."
                  : "Upload a screenshot from your photos or files."}
            </p>
            {!locked ? (
              <p className="mt-2 text-xs font-medium text-[var(--text-secondary)]">
                {isDesktop
                  ? "Desktop users can capture screen, upload, or paste a snip."
                  : "Mobile users can upload screenshots only."}
              </p>
            ) : null}
          </div>
        )}
      </div>

      {!locked ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            {isDesktop ? (
              <button
                type="button"
                disabled={saving}
                onClick={handleCaptureScreen}
                className="rounded-2xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(110,17,17,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(110,17,17,0.24)] disabled:opacity-60"
              >
                Capture Screen
              </button>
            ) : null}

            <button
              type="button"
              disabled={saving}
              onClick={() => inputRef.current?.click()}
              className="rounded-2xl bg-[#efeee9] px-5 py-2.5 text-sm font-bold text-[var(--text-secondary)] transition hover:-translate-y-0.5 hover:text-[var(--accent)] disabled:opacity-60"
            >
              Upload Screenshot
            </button>
          </div>

          {screenshot ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => onDelete(phase)}
              className="rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-[var(--accent)] shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:bg-[var(--accent)] hover:text-white disabled:opacity-60"
            >
              Delete Screenshot
            </button>
          ) : (
            <span className="hidden text-xs font-semibold text-[var(--text-secondary)] sm:block">
              Paste supported with Ctrl/⌘ + V
            </span>
          )}
        </div>
      ) : null}
    </section>
  );
}
