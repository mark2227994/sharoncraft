import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { runCloudflareAiModel, getCloudflareAiConfig } from "../../../lib/cloudflare-ai";
import { normalizeCategory, normalizeJewelryType, slugify } from "../../../lib/products";

const PRODUCT_COPY_FIELDS = [
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
];

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
  const lockedCategory = normalizeCategory(body?.category || "Jewellery");
  const lockedJewelryType = lockedCategory === "Jewellery" ? normalizeJewelryType(body?.jewelryType || "") : "";
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
    "Return valid JSON only, with no markdown fences and no commentary before or after the object.",
    "",
    "Brand direction:",
    "- Follow the selected admin category path instead of inventing a new one.",
    "- Product titles should be commercially useful, calm, and elegant.",
    "- Descriptions should feel human and curated, not AI-generated.",
    "- Keep shortDescription to 1-2 sentences.",
    "- Keep fullDescription to 2 short paragraphs max.",
    "- tags should be short shopper-facing phrases.",
    "- photographyNotes should suggest stronger next images if needed.",
    "",
    "Known product context:",
    `Current name: ${String(body?.name || "").trim() || "Unknown"}`,
    `Selected category path: ${lockedCategory}`,
    `Selected jewellery type path: ${lockedJewelryType || "Not applicable"}`,
    `Artisan: ${String(body?.artisan || "").trim() || "Unknown"}`,
    `Artisan location: ${String(body?.artisanLocation || "").trim() || "Unknown"}`,
    `Current materials: ${currentMaterials.join(", ") || "Unknown"}`,
    `Merchant notes: ${String(body?.notes || "").trim() || "None"}`,
    "",
    "Image observations:",
    imageSummaries.length > 0 ? imageSummaries.map((summary, index) => `${index + 1}. ${summary}`).join("\n") : "No images available.",
    "",
    `category must be exactly "${lockedCategory}". Do not suggest any other category.`,
    lockedCategory === "Jewellery"
      ? lockedJewelryType
        ? `jewelryType must be exactly "${lockedJewelryType}". Do not suggest another jewellery type.`
        : 'If category is "Jewellery", choose one jewelryType from: necklace, bracelet, earring.'
      : 'Because category is not "Jewellery", jewelryType must be an empty string.',
    `Return a single JSON object with exactly these keys: ${PRODUCT_COPY_FIELDS.join(", ")}.`,
    'Use arrays for "materials", "tags", and "photographyNotes".',
    'If you are unsure, return an empty string or an empty array instead of adding explanation text.',
  ].join("\n");
}

function parseModelJson(value) {
  if (!value) return null;
  if (typeof value === "object") return value;

  const raw = String(value).trim();
  if (!raw) return null;

  const withoutFences = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();

  try {
    return JSON.parse(withoutFences);
  } catch (_error) {
    const objectMatch = withoutFences.match(/\{[\s\S]*\}/);
    if (!objectMatch) {
      return null;
    }

    try {
      return JSON.parse(objectMatch[0]);
    } catch (_secondError) {
      const repaired = objectMatch[0]
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/,\s*([}\]])/g, "$1");

      try {
        return JSON.parse(repaired);
      } catch (_thirdError) {
        return null;
      }
    }
  }
}

async function repairJsonWithModel(textModel, rawResponse) {
  const repairPrompt = [
    "Turn the following text into one valid JSON object only.",
    `Use exactly these keys: ${PRODUCT_COPY_FIELDS.join(", ")}.`,
    'Use arrays for "materials", "tags", and "photographyNotes".',
    "Do not include markdown fences.",
    "",
    rawResponse,
  ].join("\n");

  const result = await runCloudflareAiModel(textModel, {
    prompt: repairPrompt,
    max_tokens: 700,
    temperature: 0.1,
  });

  return parseModelJson(result?.response);
}

function normalizeSuggestions(raw, body) {
  const suggestedName = String(raw?.suggestedName || "").trim();
  const category = normalizeCategory(body?.category || raw?.category || "Jewellery");
  const jewelryType = category === "Jewellery" ? normalizeJewelryType(body?.jewelryType || raw?.jewelryType) : "";
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
    });

    let parsed = parseModelJson(result?.response);

    if (!parsed && result?.response) {
      parsed = await repairJsonWithModel(textModel, result.response);
    }

    if (!parsed) {
      throw new Error("Cloudflare AI returned text we could not turn into JSON.");
    }

    return res.status(200).json({
      ok: true,
      suggestions: normalizeSuggestions(parsed, req.body),
      imageSummaries,
    });
  } catch (error) {
    return res.status(500).json({
      error: String(error?.message || error || "Could not generate product copy."),
    });
  }
}
