import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { getCloudflareAiConfig, runCloudflareAiModel } from "../../../lib/cloudflare-ai";
import { readProducts } from "../../../lib/store";

const PACK_FIELDS = [
  "campaignTitle",
  "angle",
  "tiktokHook",
  "tiktokCaption",
  "instagramCaption",
  "facebookCaption",
  "whatsappPromo",
  "cta",
  "hashtags",
  "followUpMessage",
];

function parseModelJson(value) {
  if (!value) return null;
  if (typeof value === "object") return value;

  const raw = String(value).trim();
  if (!raw) return null;

  const withoutFences = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    return JSON.parse(withoutFences);
  } catch {
    const objectMatch = withoutFences.match(/\{[\s\S]*\}/);
    if (!objectMatch) return null;
    try {
      return JSON.parse(objectMatch[0].replace(/[\u201C\u201D]/g, '"').replace(/,\s*([}\]])/g, "$1"));
    } catch {
      return null;
    }
  }
}

function normalizePack(raw, productName) {
  return {
    campaignTitle: String(raw?.campaignTitle || `${productName} launch`).trim(),
    angle: String(raw?.angle || "style").trim(),
    tiktokHook: String(raw?.tiktokHook || "").trim(),
    tiktokCaption: String(raw?.tiktokCaption || "").trim(),
    instagramCaption: String(raw?.instagramCaption || "").trim(),
    facebookCaption: String(raw?.facebookCaption || "").trim(),
    whatsappPromo: String(raw?.whatsappPromo || "").trim(),
    cta: String(raw?.cta || "").trim(),
    hashtags: Array.isArray(raw?.hashtags) ? raw.hashtags.map((item) => String(item || "").trim()).filter(Boolean) : [],
    followUpMessage: String(raw?.followUpMessage || "").trim(),
  };
}

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { textModel } = getCloudflareAiConfig();
  if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
    return res.status(500).json({ error: "Cloudflare AI is not configured yet." });
  }

  const { productId, angle = "style", goal = "sales", notes = "" } = req.body || {};
  if (!productId) {
    return res.status(400).json({ error: "productId required" });
  }

  const products = await readProducts();
  const product = products.find((entry) => entry.id === productId || entry.slug === productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const prompt = [
    "You are a marketing writer for SharonCraft, a Kenyan artisan brand.",
    "Write with a warm, premium, human tone.",
    "Do not sound generic, spammy, or overhyped.",
    "Make the copy practical for TikTok, Instagram, Facebook, and WhatsApp.",
    "Return valid JSON only.",
    `Use exactly these keys: ${PACK_FIELDS.join(", ")}.`,
    'Use an array for "hashtags".',
    "",
    "Product context:",
    `Name: ${product.name}`,
    `Category: ${product.category}`,
    `Jewelry type: ${product.jewelryType || "n/a"}`,
    `Price: KES ${product.price}`,
    `Artisan: ${product.artisan || "SharonCraft"}`,
    `Location: ${product.artisanLocation || "Kenya"}`,
    `Description: ${product.description || product.shortDescription || ""}`,
    `Materials: ${Array.isArray(product.materials) ? product.materials.join(", ") : ""}`,
    `Marketing angle: ${String(angle)}`,
    `Goal: ${String(goal)}`,
    `Merchant notes: ${String(notes || "").trim() || "None"}`,
    "",
    "Channel guidance:",
    "- TikTok hook should be short and scroll-stopping.",
    "- Instagram caption should feel polished and visual.",
    "- Facebook caption should be clear and trust-building.",
    "- WhatsApp promo should feel personal and easy to send.",
    "- Follow-up message should work after someone shows interest but has not yet ordered.",
  ].join("\n");

  try {
    const result = await runCloudflareAiModel(textModel, {
      prompt,
      max_tokens: 850,
      temperature: 0.45,
    });

    const parsed = parseModelJson(result?.response);
    if (!parsed) {
      throw new Error("Cloudflare AI returned text we could not turn into JSON.");
    }

    return res.status(200).json({
      ok: true,
      pack: normalizePack(parsed, product.name),
      product: {
        id: product.id,
        name: product.name,
        category: product.category,
        image: product.image,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: String(error?.message || error || "Could not generate launch pack."),
    });
  }
}
