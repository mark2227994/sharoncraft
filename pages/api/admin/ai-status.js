import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { getCloudflareAiConfig, hasCloudflareAiConfig } from "../../../lib/cloudflare-ai";

export default function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const config = getCloudflareAiConfig();

  return res.status(200).json({
    configured: hasCloudflareAiConfig(),
    textModel: config.textModel,
    visionModel: config.visionModel,
  });
}
