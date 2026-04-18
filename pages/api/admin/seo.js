import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readSeoSettings, writeSeoSettings } from "../../../lib/business-tools";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    const seo = await readSeoSettings();
    return res.status(200).json(seo);
  }

  if (req.method === "POST") {
    const body = req.body || {};
    await writeSeoSettings(body);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}