import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { runCloudflareAiModel } from "../../../lib/cloudflare-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { productName, description, price, materials, category } = req.body;

    if (!productName) {
      return res.status(400).json({ error: "Product name is required" });
    }

    const textModel = "@cf/meta/llama-3.2-3b-instruct";

    const prompt = `You are a social media expert for SharonCraft, a Kenyan artisan brand.
Generate an engaging Instagram caption (1-2 sentences max, around 80-120 characters) for this product:

Product: ${productName}
Price: KES ${price}
Category: ${category}
${description ? `Description: ${description}` : ""}
${materials ? `Materials: ${materials}` : ""}

Requirements:
- Use authentic Kenyan/African words (Uhuru, Malkia, Swahili, Maasai, etc)
- Include a relevant emoji
- Emphasize handmade quality and artisan heritage
- Make it catchy and culturally inspired
- IMPORTANT: Include a hashtag with #SharonCraft (not #sharoncraft)
- End with one call-to-action emoji or text

Return ONLY the caption text, nothing else.`;

    const result = await runCloudflareAiModel(textModel, {
      prompt,
      max_tokens: 150,
    });

    const caption = String(result?.response || "").trim();

    if (!caption) {
      throw new Error("Failed to generate caption");
    }

    return res.status(200).json({
      success: true,
      caption,
      product: productName,
    });
  } catch (error) {
    console.error("Error generating caption:", error);
    return res.status(500).json({ 
      error: "Failed to generate caption", 
      details: error.message 
    });
  }
}
