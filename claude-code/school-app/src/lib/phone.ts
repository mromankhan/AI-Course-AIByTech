/**
 * Parents sign in with a phone number and a PIN. Supabase Auth has no
 * phone+password flow without an SMS provider, so a parent's auth identity is a
 * synthetic email derived from their number. The parent never sees or types it.
 *
 *   +92 300 1234567  ->  p923001234567@parents.classconnect.local
 *
 * The same derivation runs in the provision-parent Edge Function. If you change
 * it here, change it there, or every existing parent is locked out.
 */
export const PARENT_EMAIL_DOMAIN = 'parents.classconnect.local';

/** Digits only, normalised to the 92XXXXXXXXXX form regardless of how it was typed. */
export function normalisePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');

  // 03001234567 -> 923001234567 (local form, the way it is written in Pakistan)
  const national = digits.startsWith('0') ? `92${digits.slice(1)}` : digits;

  // 92 + 10 digits. Anything else is a typo, not a number we can provision.
  if (!/^92\d{10}$/.test(national)) return null;
  return national;
}

export function parentEmail(phone: string): string | null {
  const n = normalisePhone(phone);
  return n && `p${n}@${PARENT_EMAIL_DOMAIN}`;
}

/** 923001234567 -> +92 300 1234567, for display only. */
export function formatPhone(phone: string): string {
  const n = normalisePhone(phone);
  if (!n) return phone;
  return `+${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5)}`;
}
