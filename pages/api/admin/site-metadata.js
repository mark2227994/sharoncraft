import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'site-metadata.json');

const defaultMetadata = {
  branding: {
    siteTitle: 'SharonCraft',
    siteDescription: 'Handmade Kenyan jewelry, gifts, and home decor. Direct from artisans.',
    tagline: 'No shortcuts. Just hands. Just heart.',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico'
  },
  colors: {
    primary: '#C04D29',
    secondary: '#D4A574',
    accent: '#0f0f0f',
    background: '#f9f6ee'
  },
  social: {
    instagram: 'https://instagram.com/sharoncraft',
    tiktok: 'https://tiktok.com/@sharoncraft',
    whatsapp: '+254700000000',
    facebook: 'https://facebook.com/sharoncraft',
    twitter: 'https://twitter.com/sharoncraft'
  },
  contact: {
    supportEmail: 'support@sharoncraft.com',
    businessEmail: 'hello@sharoncraft.com',
    whatsappNumber: '+254700000000',
    address: 'Nairobi, Kenya',
    businessHours: 'Monday-Friday: 9AM-6PM EAT',
    phone: '+254 700 000 000'
  },
  seo: {
    googleAnalyticsId: '',
    sitemapUrl: '/sitemap.xml',
    robotsRules: 'User-agent: *\nAllow: /'
  }
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let data;
      if (fs.existsSync(dataFile)) {
        data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      } else {
        data = defaultMetadata;
      }
      res.status(200).json(data);
    } catch (error) {
      console.error('Error reading site metadata:', error);
      res.status(200).json(defaultMetadata);
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
      console.error('Error saving site metadata:', error);
      res.status(500).json({ error: 'Failed to save site metadata' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
