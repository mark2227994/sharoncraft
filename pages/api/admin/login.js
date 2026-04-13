import { getAdminSecret, serializeAdminCookie } from "../../../lib/admin-auth";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const password = String(body.password || "");

  if (!password || password !== getAdminSecret()) {
    return res.status(401).json({ error: "Invalid admin password" });
  }

  res.setHeader("Set-Cookie", serializeAdminCookie(password));
  return res.status(200).json({ ok: true });
}
