export function isPhoneUserAgent(userAgent: string | null | undefined) {
  const ua = (userAgent || "").toLowerCase();

  const isIpad =
    ua.includes("ipad") ||
    (ua.includes("macintosh") && ua.includes("mobile") && ua.includes("safari"));

  if (isIpad) return false;

  const isIphone = ua.includes("iphone") || ua.includes("ipod");
  const isAndroidPhone = ua.includes("android") && ua.includes("mobile");

  return isIphone || isAndroidPhone;
}
