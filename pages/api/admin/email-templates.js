import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'email-templates.json');

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

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let data;
      if (fs.existsSync(dataFile)) {
        data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      } else {
        data = defaultTemplates;
      }
      res.status(200).json(data);
    } catch (error) {
      console.error('Error reading email templates:', error);
      res.status(200).json(defaultTemplates);
    }
  } else if (req.method === 'POST') {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(dataFile, JSON.stringify(req.body, null, 2));
      res.status(200).json({ success: true, data: req.body });
    } catch (error) {
      console.error('Error saving email templates:', error);
      res.status(500).json({ error: 'Failed to save email templates' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
