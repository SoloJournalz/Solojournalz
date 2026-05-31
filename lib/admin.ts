const DEFAULT_ADMIN_EMAILS = ["m.soliman.business@gmail.com"];

function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS;

  if (!raw) return DEFAULT_ADMIN_EMAILS;

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(email?: string | null) {
  if (!email) return false;

  return getAdminEmails().includes(email.toLowerCase());
}
