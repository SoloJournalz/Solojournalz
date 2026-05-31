export type SiteMode = "waitlist" | "live";

export function getSiteMode(): SiteMode {
  const mode =
    process.env.SITE_MODE ||
    process.env.NEXT_PUBLIC_SITE_MODE ||
    "live";

  return mode.toLowerCase() === "waitlist" ? "waitlist" : "live";
}

export function isWaitlistMode() {
  return getSiteMode() === "waitlist";
}
