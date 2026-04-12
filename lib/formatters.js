import { format } from "date-fns";

export function formatKES(value) {
  return `KES ${Number(value || 0).toLocaleString()}`;
}

export function formatShortDate(value) {
  return format(new Date(value), "dd MMM yyyy");
}

export function formatDateTime(value) {
  return format(new Date(value), "dd/MM/yyyy HH:mm");
}

export function maskPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 7) return phone;
  return `${digits.slice(0, 4)}***${digits.slice(-3)}`;
}
