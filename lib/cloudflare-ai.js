const DEFAULT_TEXT_MODEL = "@cf/meta/llama-3.2-3b-instruct";
const DEFAULT_VISION_MODEL = "@cf/llava-hf/llava-1.5-7b-hf";

export function getCloudflareAiConfig() {
  return {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
    apiToken: process.env.CLOUDFLARE_API_TOKEN || "",
    textModel: process.env.CLOUDFLARE_AI_TEXT_MODEL || DEFAULT_TEXT_MODEL,
    visionModel: process.env.CLOUDFLARE_AI_VISION_MODEL || DEFAULT_VISION_MODEL,
  };
}

export function hasCloudflareAiConfig() {
  const { accountId, apiToken } = getCloudflareAiConfig();
  return Boolean(accountId && apiToken);
}

export async function runCloudflareAiModel(model, input) {
  const { accountId, apiToken } = getCloudflareAiConfig();

  if (!accountId || !apiToken) {
    throw new Error("Cloudflare AI is not configured. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.");
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${encodeURIComponent(model)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  let body = null;
  try {
    body = await response.json();
  } catch (_error) {
    body = null;
  }

  if (!response.ok || !body?.success) {
    const message =
      body?.errors?.[0]?.message ||
      body?.result?.error ||
      `Cloudflare AI request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return body.result;
}
