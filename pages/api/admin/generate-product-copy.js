import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { runCloudflareAiModel, getCloudflareAiConfig } from "../../../lib/cloudflare-ai";
import { normalizeCategory, normalizeJewelryType, slugify } from "../../../lib/products";

const PRODUCT_COPY_FIELDS = [
  "suggestedName",
  "slug",
  "category",
  "jewelryType",
  "suggestedPrice",
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
  const base64 = Buffer.from(buffer).toString("base64");

  return { contentType, base64 };
}

async function describeImage(visionModel, imageInput, index) {
  const result = await runCloudflareAiModel(visionModel, {
    image: [
      {
        url: `data:${imageInput.contentType};base64,${imageInput.base64}`,
      },
    ],
    prompt:
      `Describe this handcrafted product photo for an e-commerce merchandiser. ` +
      `Focus on the item type, materials, colors, silhouette, texture, and whether it looks like a close-up, styled shot, or detail shot. ` +
      `Image number: ${index + 1}.`,
    max_tokens: 220,
  });

  return String(result?.response || result?.description || "").trim();
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
    "You write product copy for SharonCraft, a Kenyan artisan brand celebrating African heritage and handmade authenticity.",
    "Do not sound generic, mass-produced, or overhyped.",
    "Prefer concrete observations over invented claims.",
    "If something is uncertain, keep the wording broad instead of hallucinating.",
    "Return valid JSON only, with no markdown fences and no commentary before or after the object.",
    "",
    "Brand direction:",
    "- Follow the selected admin category path instead of inventing a new one.",
    "- Use Kenyan and African cultural references: Maasai, Swahili, Nairobi, beadwork heritage, African aesthetics.",
    "- Incorporate African words naturally. Use DIFFERENT African word prefixes for similar categories:",
    "  * Swahili/African word examples: Uhuru (freedom), Malkia (queen), Twiga (giraffe), Kijani (green), Jua (sun), Rafiki (friend), Dhahabu (gold), Ndoto (dream), Kambaa (web), Chakula (feast), Asante (thanks), Pamoja (together), Simba (lion), Njeri (dancer), Amara (grace)",
    "  * DO NOT repeat the same African word prefix for all products in the same category",
    "  * Each product should have a unique, meaningful prefix that relates to the design or artisan story",
    "- Product titles should be culturally inspired, meaningful, and accessible (not luxury-priced language).",
    "- **IMPORTANT: Always include the shape/style descriptor in the product name** (e.g., 'Uhuru Pendant Necklace', 'Malkia Drop Earrings', 'Kijani Beaded Bracelet', 'Twiga Statement Necklace', 'Rafiki Hoop Earrings', 'Jua Stud Earrings').",
    "  * For necklaces: include pendant, choker, long, statement, collar, lariat, rope, chain, etc.",
    "  * For earrings: include drop, hoop, stud, chandelier, dangle, huggie, threader, ear-cuff, etc.",
    "  * For bracelets: include bangle, beaded, cuff, stretch, tennis, beaded-rope, wrap, etc.",
    "  * For home decor: include wall hanging, cushion cover, table runner, wall art, mirror, planter, etc.",
    "- Descriptions should celebrate artisan heritage, handmade quality, and community pride—not mass-market selling.",
    "- **Description variety: Use different narrative angles for similar items to avoid repetition:**",
    "  * Some descriptions focus on **cultural meaning/heritage** (e.g., 'Named after Swahili word for...meaning...')",
    "  * Some focus on **wear occasion** (e.g., 'Perfect for everyday confidence' vs 'Ideal for events and celebrations')",
    "  * Some focus on **artisan technique** (e.g., 'Hand-arranged beads showcase traditional craftsmanship')",
    "  * Some focus on **emotional connection** (e.g., 'Brings warmth to any space')",
    "  * Some focus on **material quality** (e.g., 'Features hand-selected Krobo beads')",
    "  * Rotate these angles across similar products to create unique, engaging copy for each item",
    "- Short descriptions (1-2 sentences): Lead with the most distinctive feature or use case",
    "- Full descriptions (2 short paragraphs): Expand with heritage/story, then practical details or styling tips",,
    "  * Earrings: KES 500-1500 (based on complexity and beadwork quality)",
    "  * Necklaces: KES 2000-5000 (based on length, materials, and intricate beadwork)",
    "  * Bracelets: KES 1000-5000 (based on size, beadwork detail, and materials)",
    "  * Home Decor: KES 3000-8000 (based on size and handwork involved)",
    "  * Gift Sets: KES 3000-10000 (bundle value based on included items)",
    "  * Accessories/Bags: KES 2000-6000 (based on size and craftsmanship)",
    "- Adjust pricing within these ranges based on image quality, beadwork complexity, and materials visible.",
    "- Keep shortDescription to 1-2 sentences.",
    "- Keep fullDescription to 2 short paragraphs max.",
    "- tags should be short shopper-facing phrases that reference culture and craft.",
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
    'When determining price: Look at the image quality and beadwork detail shown. Use the price ranges above for the jewelry type. Price higher within the range for intricate/quality work, lower for simpler pieces.',
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
  
  // Parse suggested price - should be a number
  let suggestedPrice = 0;
  if (raw?.suggestedPrice) {
    const priceVal = parseInt(String(raw.suggestedPrice).replace(/[^\d]/g, ""), 10);
    suggestedPrice = isNaN(priceVal) ? 0 : priceVal;
  }

  return {
    suggestedName,
    slug,
    category,
    jewelryType,
    suggestedPrice,
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
    let imageSummaries = [];

    if (imageUrls.length > 0) {
      try {
        const imageInputs = await Promise.all(imageUrls.map((url) => loadImageInput(url)));
        imageSummaries = await Promise.all(
          imageInputs.map((imageInput, index) => describeImage(visionModel, imageInput, index)),
        );
      } catch (imageError) {
        console.warn("Could not load/process images:", imageError.message);
        // Continue without images - use fallback description
      }
    }

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
