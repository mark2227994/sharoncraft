import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readAdminContentField, writeAdminContentField } from "../../../lib/admin-content";

const defaultTemplates = [
  {
    id: 1,
    name: 'Order Confirmation',
    type: 'order',
    subject: 'Order Confirmed: {{orderId}}',
    body: 'Thank you {{customerName}}! Your order has been confirmed.\n\nOrder ID: {{orderId}}\nTotal: {{totalAmount}}\nEstimated Delivery: {{deliveryDate}}\n\nTrack your order: {{trackingLink}}',
    variables: ['customerName', 'orderId', 'totalAmount', 'deliveryDate', 'trackingLink']
  },
  {
    id: 2,
    name: 'Shipping Notification',
    type: 'shipping',
    subject: 'Your Order is on the way!',
    body: 'Hi {{customerName}}, your order {{orderId}} has shipped!\n\nTracking Number: {{trackingNumber}}\nCarrier: {{carrier}}\n\nTrack: {{trackingUrl}}',
    variables: ['customerName', 'orderId', 'trackingNumber', 'carrier', 'trackingUrl']
  },
  {
    id: 3,
    name: 'Testimonial Request',
    type: 'review',
    subject: 'How was your {{productName}}?',
    body: 'Hi {{customerName}}, we hope you\'ve loved your {{productName}} from {{artisanName}}!\n\nWould you share your experience? Your review helps other customers AND supports our artisans.\n\nLeave Review: {{reviewLink}}',
    variables: ['customerName', 'productName', 'artisanName', 'reviewLink']
  },
  {
    id: 4,
    name: 'Newsletter Template',
    type: 'newsletter',
    subject: 'What\'s New at SharonCraft',
    body: 'Hi {{subscriberName}},\n\n{{featuredProducts}}\n\n{{artisanSpotlight}}\n\n{{newsletter}}\n\nUnsubscribe: {{unsubscribeLink}}',
    variables: ['subscriberName', 'featuredProducts', 'artisanSpotlight', 'newsletter', 'unsubscribeLink']
  }
];

export default async function handler(req, res) {
  if (req.method === "GET") {
    const data = await readAdminContentField("emailTemplates", defaultTemplates);
    return res.status(200).json(Array.isArray(data) ? data : defaultTemplates);
  }

  if (req.method === "POST") {
    if (!isAuthorizedRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const payload = Array.isArray(req.body) ? req.body : defaultTemplates;
      await writeAdminContentField("emailTemplates", payload);
      return res.status(200).json({ success: true, data: payload });
    } catch (error) {
      console.error("Error saving email templates:", error);
      return res.status(500).json({ error: "Failed to save email templates" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
