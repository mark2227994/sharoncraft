import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'page-content.json');

const defaultPageContent = {
  about: {
    title: 'About SharonCraft',
    heroSubtitle: 'Connecting hands with hearts',
    heroDescription: '47 Kenyan artisans crafting stories into every piece. No shortcuts. Just hands. Just heart.',
    sections: [
      {
        id: 1,
        title: 'Our Founder\'s Story',
        content: 'Sharon started this journey to amplify artisan voices...',
        image: ''
      },
      {
        id: 2,
        title: 'Why Handmade?',
        content: 'In a world of mass production, handmade means intention...',
        image: ''
      }
    ],
    impactStats: {
      artisanCount: 47,
      piecesCreated: 15240,
      kesToArtisans: '₹45.2M'
    }
  },
  faq: {
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about SharonCraft'
  },
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: '2025-01-15',
    content: 'Your privacy is important to us...'
  },
  terms: {
    title: 'Terms & Conditions',
    lastUpdated: '2025-01-15',
    content: 'By purchasing from SharonCraft...'
  },
  shipping: {
    title: 'Shipping Information',
    content: 'We ship worldwide. Standard shipping takes 7-14 business days...',
    shippingRates: [
      { region: 'Kenya', cost: 'Free', deliveryTime: '2-3 days' },
      { region: 'East Africa', cost: '₹500', deliveryTime: '5-7 days' },
      { region: 'Worldwide', cost: '₹1,500', deliveryTime: '10-21 days' }
    ]
  },
  contact: {
    title: 'Contact Us',
    email: 'hello@sharoncraft.com',
    phone: '+254 XXX XXX XXX',
    whatsapp: '+254 XXX XXX XXX',
    address: 'Nairobi, Kenya',
    hours: 'Monday-Friday: 9AM-6PM EAT'
  }
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let data;
      if (fs.existsSync(dataFile)) {
        data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      } else {
        data = defaultPageContent;
      }
      res.status(200).json(data);
    } catch (error) {
      console.error('Error reading page content:', error);
      res.status(200).json(defaultPageContent);
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
      console.error('Error saving page content:', error);
      res.status(500).json({ error: 'Failed to save page content' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
