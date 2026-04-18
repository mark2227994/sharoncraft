import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readNewsletterWorkspace, writeNewsletterWorkspace } from "../../../lib/store";

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeSubscriber(input) {
  return {
    id: String(input?.id || createId("sub")).trim(),
    email: String(input?.email || "").trim(),
    name: String(input?.name || "").trim(),
    status: String(input?.status || "active").trim() === "unsubscribed" ? "unsubscribed" : "active",
    joinedAt: String(input?.joinedAt || new Date().toISOString().slice(0, 10)).trim(),
    campaigns: Number(input?.campaigns || 0),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeCampaign(input) {
  return {
    id: String(input?.id || createId("camp")).trim(),
    to: String(input?.to || "all").trim(),
    template: String(input?.template || "").trim(),
    subject: String(input?.subject || "").trim(),
    body: String(input?.body || "").trim(),
    status: String(input?.status || "sent").trim(),
    sentAt: String(input?.sentAt || new Date().toISOString()).trim(),
    updatedAt: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    return res.status(200).json(await readNewsletterWorkspace());
  }

  if (req.method === "POST") {
    const { section, item } = req.body || {};
    if (!section || !item) {
      return res.status(400).json({ error: "section and item required" });
    }

    const workspace = await readNewsletterWorkspace();
    if (section === "subscribers") {
      const normalized = normalizeSubscriber(item);
      const nextSubscribers = [...workspace.subscribers.filter((entry) => entry.id !== normalized.id), normalized];
      await writeNewsletterWorkspace({ ...workspace, subscribers: nextSubscribers });
      return res.status(200).json({ ok: true, item: normalized, subscribers: nextSubscribers, campaigns: workspace.campaigns });
    }

    if (section === "campaigns") {
      const normalized = normalizeCampaign(item);
      const nextCampaigns = [normalized, ...workspace.campaigns.filter((entry) => entry.id !== normalized.id)];
      await writeNewsletterWorkspace({ ...workspace, campaigns: nextCampaigns });
      return res.status(200).json({ ok: true, item: normalized, subscribers: workspace.subscribers, campaigns: nextCampaigns });
    }

    return res.status(400).json({ error: "invalid section" });
  }

  if (req.method === "DELETE") {
    const section = String(req.query?.section || "").trim();
    const id = String(req.query?.id || "").trim();
    if (!section || !id) {
      return res.status(400).json({ error: "section and id required" });
    }

    const workspace = await readNewsletterWorkspace();
    if (section === "subscribers") {
      const nextSubscribers = workspace.subscribers.filter((entry) => entry.id !== id);
      await writeNewsletterWorkspace({ ...workspace, subscribers: nextSubscribers });
      return res.status(200).json({ ok: true, subscribers: nextSubscribers, campaigns: workspace.campaigns });
    }

    if (section === "campaigns") {
      const nextCampaigns = workspace.campaigns.filter((entry) => entry.id !== id);
      await writeNewsletterWorkspace({ ...workspace, campaigns: nextCampaigns });
      return res.status(200).json({ ok: true, subscribers: workspace.subscribers, campaigns: nextCampaigns });
    }

    return res.status(400).json({ error: "invalid section" });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
