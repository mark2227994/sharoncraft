import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readDesigners, writeDesigners } from "../../../lib/store";

function createId() {
  return `des_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeDesigner(input) {
  return {
    id: String(input?.id || createId()).trim(),
    name: String(input?.name || "").trim(),
    location: String(input?.location || "").trim(),
    specialty: String(input?.specialty || "").trim(),
    phone: String(input?.phone || "").trim(),
    email: String(input?.email || "").trim(),
    status: String(input?.status || "active").trim() === "paused" ? "paused" : "active",
    totalOrders: Number(input?.totalOrders || 0),
    totalPaid: Number(input?.totalPaid || 0),
    pendingPayment: Number(input?.pendingPayment || 0),
    createdAt: String(input?.createdAt || new Date().toISOString()),
    updatedAt: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    return res.status(200).json(await readDesigners());
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const designers = await readDesigners();
    const normalized = normalizeDesigner(body);
    const nextDesigners = [...designers.filter((entry) => entry.id !== normalized.id), normalized];
    await writeDesigners(nextDesigners);
    return res.status(200).json({ ok: true, designers: nextDesigners, item: normalized });
  }

  if (req.method === "DELETE") {
    const id = String(req.query?.id || "").trim();
    if (!id) return res.status(400).json({ error: "id required" });
    const designers = await readDesigners();
    const nextDesigners = designers.filter((entry) => entry.id !== id);
    await writeDesigners(nextDesigners);
    return res.status(200).json({ ok: true, designers: nextDesigners });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
