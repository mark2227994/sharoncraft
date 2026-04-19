import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'footer-content.json');

const defaultFooterContent = {
  column1: {
    title: 'SharonCraft',
    bio: 'Connecting hands with hearts. 47 Kenyan artisans crafting stories into every piece.',
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/sharoncraft' },
      { platform: 'tiktok', url: 'https://tiktok.com/@sharoncraft' },
      { platform: 'facebook', url: 'https://facebook.com/sharoncraft' }
    ],
    newsletter: {
      title: 'Subscribe',
      placeholder: 'Enter your email',
      buttonText: 'Join'
    }
  },
  column2: {
    title: 'Customer Service',
    links: [
      { label: 'FAQ', url: '/faq' },
      { label: 'Contact', url: '/contact' },
      { label: 'Shipping', url: '/shipping' },
      { label: 'Returns', url: '/returns' }
    ]
  },
  column3: {
    title: 'About',
    links: [
      { label: 'Our Story', url: '/about' },
      { label: 'Artisans', url: '/artisans' },
      { label: 'Journal', url: '/articles' },
      { label: 'Careers', url: '/careers' }
    ]
  },
  column4: {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms & Conditions', url: '/terms' },
      { label: 'Shipping Policy', url: '/shipping' },
      { label: 'Return Policy', url: '/returns' }
    ]
  },
  bottom: {
    copyright: '© 2025 SharonCraft. All rights reserved.',
    paymentMethods: ['Visa', 'Mastercard', 'M-Pesa', 'Apple Pay'],
    trustBadges: ['Handmade', 'Fair Trade', 'Secure']
  }
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let data;
      if (fs.existsSync(dataFile)) {
        data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      } else {
        data = defaultFooterContent;
      }
      res.status(200).json(data);
    } catch (error) {
      console.error('Error reading footer content:', error);
      res.status(200).json(defaultFooterContent);
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
      console.error('Error saving footer content:', error);
      res.status(500).json({ error: 'Failed to save footer content' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
