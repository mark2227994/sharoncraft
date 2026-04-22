export function getAdminSecret() {
  return String(process.env.ADMIN_SECRET_KEY || "").trim();
}

export function hasAdminSecret() {
  return Boolean(getAdminSecret());
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
  const secret = getAdminSecret();
  if (!secret) return false;

  const cookie = req.headers.cookie || "";
  const tokenPair = cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("admin_token="));

  const token = tokenPair ? decodeURIComponent(tokenPair.split("=")[1] || "") : "";
  return token === secret;
}
