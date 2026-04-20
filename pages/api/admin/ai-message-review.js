import { isAuthorizedRequest } from '../../../lib/admin-auth';
import { runCloudflareAiModel, getCloudflareAiConfig } from '../../../lib/cloudflare-ai';
import { readCustomers, readOrders, readCustomOrders } from '../../../lib/business-tools';

export default async function handler(req, res) {
  // Security check
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    return handleGenerateOptions(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

async function handleGenerateOptions(req, res) {
  try {
    const { customerId, customerMessage, orderContext } = req.body;

    if (!customerMessage || !customerMessage.trim()) {
      return res.status(400).json({ error: 'Customer message is required' });
    }

    // Build customer context string for AI
    let contextString = 'Customer Message:\n' + customerMessage + '\n\n';

    if (orderContext) {
      contextString += 'Order Context:\n';
      contextString += `- Customer: ${orderContext.customerName || 'Unknown'}\n`;
      contextString += `- Product/Order: ${orderContext.orderDescription || 'N/A'}\n`;
      if (orderContext.orderPrice) {
        contextString += `- Price: KES ${orderContext.orderPrice}\n`;
      }
      if (orderContext.previousMessages) {
        contextString += `- Previous interaction: ${orderContext.previousMessages}\n`;
      }
      contextString += '\n';
    }

    // Generate 3 tone options in parallel
    const tonePrompts = {
      professional: `You are a professional, business-like customer service representative for SharonCraft (Kenyan artisan jewelry and home decor). 
Generate a clear, professional reply to the customer's message. Be direct, helpful, and maintain a business tone.
Keep it concise (2-3 sentences). Do not make up information.

${contextString}
Professional Reply:`,

      friendly: `You are a warm, friendly customer service representative for SharonCraft (Kenyan artisan jewelry and home decor). 
Generate a friendly, personable reply to the customer's message. Show genuine interest, be conversational, and build rapport.
Keep it concise (2-3 sentences). Do not make up information.

${contextString}
Friendly Reply:`,

      casual: `You are a casual, approachable customer service representative for SharonCraft (Kenyan artisan jewelry and home decor). 
Generate a casual, relaxed reply to the customer's message. Be conversational and natural, like chatting with a friend.
Keep it concise (2-3 sentences). Do not make up information.

${contextString}
Casual Reply:`
    };

    // Call AI for each tone
    const config = getCloudflareAiConfig();
    const [professionalResult, friendlyResult, casualResult] = await Promise.all([
      runCloudflareAiModel(config.textModel, { prompt: tonePrompts.professional }),
      runCloudflareAiModel(config.textModel, { prompt: tonePrompts.friendly }),
      runCloudflareAiModel(config.textModel, { prompt: tonePrompts.casual })
    ]);

    // Extract text from responses
    const options = [
      {
        tone: 'Professional',
        text: extractText(professionalResult),
        icon: '💼'
      },
      {
        tone: 'Friendly',
        text: extractText(friendlyResult),
        icon: '👋'
      },
      {
        tone: 'Casual',
        text: extractText(casualResult),
        icon: '😊'
      }
    ];

    return res.status(200).json({ options });
  } catch (error) {
    console.error('AI message generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate message options',
      details: error.message 
    });
  }
}

function extractText(response) {
  if (typeof response === 'string') {
    return response.trim();
  }
  // Cloudflare AI returns response in different formats
  if (response?.response) {
    return response.response.trim();
  }
  if (response?.text) {
    return response.text.trim();
  }
  return String(response).trim();
}
