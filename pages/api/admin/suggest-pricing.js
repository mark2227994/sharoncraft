import { runCloudflareAiModel, getCloudflareAiConfig, hasCloudflareAiConfig } from "../../../lib/cloudflare-ai";
import { isAuthorizedRequest } from "../../../lib/admin-auth";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!hasCloudflareAiConfig()) {
    return res.status(400).json({ error: "Cloudflare AI is not configured" });
  }

  const { name, description, materials, jewelryType, category } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: "Product name and description are required" });
  }

  try {
    const prompt = `You are a pricing expert for handmade Kenyan jewelry and crafts.
    
Based on the following product details, suggest a realistic price range in Kenyan Shillings (KES):

Product Name: ${name}
Category: ${category || "General"}
Type: ${jewelryType || "Crafted item"}
Materials: ${materials || "Various handmade materials"}
Description: ${description}

Consider:
- Material costs and rarity
- Handmade craftsmanship premium (15-30% markup)
- Market rates for similar products
- Labor investment
- Target market (local vs international customers)

Provide your response in this exact JSON format:
{
  "recommendedPrice": <number in KES>,
  "minPrice": <number in KES>,
  "maxPrice": <number in KES>,
  "reasoning": "<brief explanation>"
}`;

    const result = await runCloudflareAiModel("@cf/meta/llama-3.2-3b-instruct", {
      prompt,
      max_tokens: 300,
    });

    // Extract text from result
    const responseText = result?.response || result || "";
    
    // Try to parse JSON from response
    let pricing = null;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        pricing = JSON.parse(jsonMatch[0]);
      } catch (_e) {
        // If JSON parsing fails, extract numbers manually
        const priceMatch = responseText.match(/recommendedPrice["\']?\s*:\s*(\d+)/);
        const minMatch = responseText.match(/minPrice["\']?\s*:\s*(\d+)/);
        const maxMatch = responseText.match(/maxPrice["\']?\s*:\s*(\d+)/);
        
        if (priceMatch) {
          pricing = {
            recommendedPrice: parseInt(priceMatch[1], 10),
            minPrice: minMatch ? parseInt(minMatch[1], 10) : parseInt(priceMatch[1], 10) * 0.8,
            maxPrice: maxMatch ? parseInt(maxMatch[1], 10) : parseInt(priceMatch[1], 10) * 1.2,
            reasoning: "Based on market analysis of handmade Kenyan crafts",
          };
        }
      }
    }

    if (!pricing || !pricing.recommendedPrice) {
      return res.status(500).json({ 
        error: "Could not generate pricing suggestion",
        details: "AI response parsing failed"
      });
    }

    return res.status(200).json({
      success: true,
      pricing,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to generate pricing",
      details: error.message,
    });
  }
}
