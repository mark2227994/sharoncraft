export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "sharoncraft.co.ke@gmail.com";

export const CONTACT_PHONE_DISPLAY =
  process.env.NEXT_PUBLIC_CONTACT_PHONE_DISPLAY || "+254 112 222 572";

export const CONTACT_PHONE_E164 =
  process.env.NEXT_PUBLIC_CONTACT_PHONE_E164 || "+254112222572";

export const CONTACT_WHATSAPP =
  process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || "254112222572";

export const CONTACT_LOCATION =
  process.env.NEXT_PUBLIC_CONTACT_LOCATION || "Nairobi, Kenya";

export function normalizeWhatsAppNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return CONTACT_WHATSAPP;
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}

export function buildWhatsAppUrl(number = CONTACT_WHATSAPP, message = "") {
  const normalizedNumber = normalizeWhatsAppNumber(number);
  if (!message) return `https://wa.me/${normalizedNumber}`;
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}
