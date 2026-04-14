import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { runCloudflareAiModel, getCloudflareAiConfig } from "../../../lib/cloudflare-ai";
import { normalizeCategory, normalizeJewelryType, slugify } from "../../../lib/products";

const PRODUCT_COPY_SCHEMA = {
  name: "sharoncraft_product_copy",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      suggestedName: { type: "string" },
      slug: { type: "string" },
      category: { type: "string" },
      jewelryType: { type: "string" },
      shortDescription: { type: "string" },
      fullDescription: { type: "string" },
      materials: {
        type: "array",
        items: { type: "string" },
      },
      tags: {
        type: "array",
        items: { type: "string" },
      },
      seoTitle: { type: "string" },
      seoDescription: { type: "string" },
      photographyNotes: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: [
      "suggestedName",
      "slug",
      "category",
      "jewelryType",
      "shortDescription",
      "fullDescription",
      "materials",
      "tags",
      "seoTitle",
      "seoDescription",
      "photographyNotes",
    ],
  },
};

function getOrigin(req) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const protocol = typeof forwardedProto === "string" ? forwardedProto.split(",")[0] : host?.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

function resolveImageUrl(req, src) {
  const value = String(src || "").trim();
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || getOrigin(req);
    return new URL(value, siteUrl).toString();
  }

  return "";
}

function uniqueImageUrls(req, body) {
  const candidates = [body?.image, body?.stylingImage, body?.detailImage];
  const urls = [];
  const seen = new Set();

  for (const candidate of candidates) {
    const absolute = resolveImageUrl(req, candidate);
    if (absolute && !seen.has(absolute)) {
      seen.add(absolute);
      urls.push(absolute);
    }
  }

  return urls.slice(0, 3);
}

async function loadImageInput(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load image: ${url}`);
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const buffer = await response.arrayBuffer();
  const bytes = Array.from(new Uint8Array(buffer));

  return { contentType, bytes };
}

async function describeImage(visionModel, imageInput, index) {
  const result = await runCloudflareAiModel(visionModel, {
    image: imageInput.bytes,
    prompt:
      `Describe this handcrafted product photo for an e-commerce merchandiser. ` +
      `Focus on the item type, materials, colors, silhouette, texture, and whether it looks like a close-up, styled shot, or detail shot. ` +
      `Image number: ${index + 1}.`,
    max_tokens: 220,
  });

  return String(result?.description || "").trim();
}

function buildPrompt(body, imageSummaries) {
  const currentMaterials = Array.isArray(body?.materials)
    ? body.materials
    : String(body?.materials || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return [
    "You write product copy for SharonCraft, a Kenyan artisan brand with a warm, premium, handmade tone.",
    "Do not sound generic, mass-produced, or overhyped.",
    "Prefer concrete observations over invented claims.",
    "If something is uncertain, keep the wording broad instead of hallucinating.",
    "Return valid JSON only.",
    "",
    "Brand direction:",
    "- Focus especially on jewellery when applicable.",
    "- Product titles should be commercially useful, calm, and elegant.",
    "- Descriptions should feel human and curated, not AI-generated.",
    "- Keep shortDescription to 1-2 sentences.",
    "- Keep fullDescription to 2 short paragraphs max.",
    "- tags should be short shopper-facing phrases.",
    "- photographyNotes should suggest stronger next images if needed.",
    "",
    "Known product context:",
    `Current name: ${String(body?.name || "").trim() || "Unknown"}`,
    `Current category: ${String(body?.category || "").trim() || "Unknown"}`,
    `Current jewellery type: ${String(body?.jewelryType || "").trim() || "Unknown"}`,
    `Artisan: ${String(body?.artisan || "").trim() || "Unknown"}`,
    `Artisan location: ${String(body?.artisanLocation || "").trim() || "Unknown"}`,
    `Current materials: ${currentMaterials.join(", ") || "Unknown"}`,
    `Merchant notes: ${String(body?.notes || "").trim() || "None"}`,
    "",
    "Image observations:",
    imageSummaries.length > 0 ? imageSummaries.map((summary, index) => `${index + 1}. ${summary}`).join("\n") : "No images available.",
    "",
    "Choose one of these categories when possible: Jewellery, Home Decor, Gift Sets, Accessories, Bridal & Occasion.",
    "If the item is jewellery, choose one jewelleryType from: necklace, bracelet, earring. Otherwise return an empty string for jewelryType.",
  ].join("\n");
}

function normalizeSuggestions(raw) {
  const suggestedName = String(raw?.suggestedName || "").trim();
  const category = normalizeCategory(raw?.category || "Jewellery");
  const jewelryType = category === "Jewellery" ? normalizeJewelryType(raw?.jewelryType) : "";
  const slug = slugify(raw?.slug || suggestedName);

  return {
    suggestedName,
    slug,
    category,
    jewelryType,
    shortDescription: String(raw?.shortDescription || "").trim(),
    fullDescription: String(raw?.fullDescription || "").trim(),
    materials: Array.isArray(raw?.materials)
      ? raw.materials.map((item) => String(item || "").trim()).filter(Boolean)
      : [],
    tags: Array.isArray(raw?.tags) ? raw.tags.map((item) => String(item || "").trim()).filter(Boolean) : [],
    seoTitle: String(raw?.seoTitle || "").trim(),
    seoDescription: String(raw?.seoDescription || "").trim(),
    photographyNotes: Array.isArray(raw?.photographyNotes)
      ? raw.photographyNotes.map((item) => String(item || "").trim()).filter(Boolean)
      : [],
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

  const { textModel, visionModel } = getCloudflareAiConfig();
  if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
    return res.status(500).json({
      error: "Cloudflare AI is not configured yet. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to your env.",
    });
  }

  try {
    const imageUrls = uniqueImageUrls(req, req.body);
    const imageInputs = await Promise.all(imageUrls.map((url) => loadImageInput(url)));
    const imageSummaries = await Promise.all(
      imageInputs.map((imageInput, index) => describeImage(visionModel, imageInput, index)),
    );

    const prompt = buildPrompt(req.body, imageSummaries);
    const result = await runCloudflareAiModel(textModel, {
      prompt,
      max_tokens: 700,
      temperature: 0.4,
      response_format: {
        type: "json_schema",
        json_schema: PRODUCT_COPY_SCHEMA,
      },
    });

    const rawResponse = result?.response;
    const parsed =
      typeof rawResponse === "string"
        ? JSON.parse(rawResponse)
        : rawResponse && typeof rawResponse === "object"
          ? rawResponse
          : null;

    if (!parsed) {
      throw new Error("Cloudflare AI returned an empty response.");
    }

    return res.status(200).json({
      ok: true,
      suggestions: normalizeSuggestions(parsed),
      imageSummaries,
    });
  } catch (error) {
    return res.status(500).json({
      error: String(error?.message || error || "Could not generate product copy."),
    });
  }
}
