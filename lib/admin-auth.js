import { DEMO_ADMIN_SECRET } from "./constants";

export function getAdminSecret() {
  return process.env.ADMIN_SECRET_KEY || DEMO_ADMIN_SECRET;
}

export function serializeAdminCookie(value, maxAge = 60 * 60 * 8) {
  return [
    `admin_token=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ].join("; ");
}

export function clearAdminCookie() {
  return "admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
}

export function isAuthorizedRequest(req) {
  const cookie = req.headers.cookie || "";
  const tokenPair = cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("admin_token="));

  const token = tokenPair ? decodeURIComponent(tokenPair.split("=")[1] || "") : "";
  return token === getAdminSecret();
}
