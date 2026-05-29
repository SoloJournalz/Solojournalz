const ADMIN_EMAILS = ["maem.soliman@gmail.com"];

export function isAdminUser(email?: string | null) {
  if (!email) return false;

  return ADMIN_EMAILS.includes(email.toLowerCase());
}
