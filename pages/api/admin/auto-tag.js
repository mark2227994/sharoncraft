import { isAuthorizedRequest } from "../../../lib/admin-auth";

/**
 * Auto-tagging logic based on product attributes
 */

const MATERIAL_KEYWORDS = {
  "Glass Beads": ["glass", "bead"],
  Leather: ["leather"],
  Shell: ["shell", "seashell"],
  "Brass/Metal": ["brass", "metal", "gold", "silver", "copper"],
  Ceramic: ["ceramic", "clay"],
  Wood: ["wood", "wooden"],
  "Semi-precious": ["semi-precious", "agate", "quartz", "amethyst", "jasper"],
};

const STYLE_KEYWORDS = {
  Bohemian: ["bohemian", "boho", "ethnic", "tribal"],
  Modern: ["modern", "minimalist", "minimal", "contemporary"],
  Traditional: ["traditional", "maasai", "kenyan", "african"],
  "Statement": ["statement", "bold", "chunky"],
};

const TECHNIQUE_KEYWORDS = {
  "Hand-beaded": ["beaded", "hand-beaded", "beads"],
  Woven: ["woven", "weave"],
  Carved: ["carved", "carving"],
  "Hand-crafted": ["handcrafted", "hand-made", "made by hand"],
};

function extractTags(productName, description, materials) {
  const text = `${productName} ${description || ""} ${materials || ""}`.toLowerCase();
  const tags = new Set();

  // Extract material tags
  Object.entries(MATERIAL_KEYWORDS).forEach(([tag, keywords]) => {
    if (keywords.some((kw) => text.includes(kw))) {
      tags.add(tag);
    }
  });

  // Extract style tags
  Object.entries(STYLE_KEYWORDS).forEach(([tag, keywords]) => {
    if (keywords.some((kw) => text.includes(kw))) {
      tags.add(tag);
    }
  });

  // Extract technique tags
  Object.entries(TECHNIQUE_KEYWORDS).forEach(([tag, keywords]) => {
    if (keywords.some((kw) => text.includes(kw))) {
      tags.add(tag);
    }
  });

  // Add category-based tags
  tags.add("Handmade");
  tags.add("Artisan");

  return Array.from(tags);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth = await isAuthorizedRequest(req);
  if (!auth.authorized) return res.status(401).json({ error: "Unauthorized" });

  const { name, description, materials, category, jewelryType } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Product name required" });
  }

  try {
    const suggestedTags = extractTags(name, description, materials);

    // Add category-specific tags
    if (category === "Jewellery" && jewelryType) {
      const typeTag = jewelryType.charAt(0).toUpperCase() + jewelryType.slice(1);
      if (!suggestedTags.includes(typeTag)) {
        suggestedTags.push(typeTag);
      }
    }

    return res.status(200).json({
      suggestedTags: [...new Set(suggestedTags)].sort(),
      count: suggestedTags.length,
    });
  } catch (error) {
    console.error("Auto-tagging error:", error);
    return res.status(500).json({ error: error.message });
  }
}
