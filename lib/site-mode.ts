export type SiteMode = "testing" | "live";

export function getSiteMode(): SiteMode {
  const mode = (
    process.env.NEXT_PUBLIC_SITE_MODE ||
    process.env.SITE_MODE ||
    "live"
  ).toLowerCase();

  if (mode === "testing" || mode === "test") {
    return "testing";
  }

  return "live";
}

export function isTestingMode() {
  return getSiteMode() === "testing";
}