import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'navigation.json');

const defaultNavigation = {
  header: [
    { id: 1, label: 'Shop', url: '/shop', order: 1 },
    { id: 2, label: 'Artisans', url: '/artisans', order: 2 },
    { id: 3, label: 'About', url: '/about', order: 3 },
    { id: 4, label: 'Journal', url: '/articles', order: 4 },
    { id: 5, label: 'Custom Orders', url: '/custom-order', order: 5 }
  ],
  footer: [
    {
      section: 'Customer Service',
      items: [
        { label: 'FAQ', url: '/faq' },
        { label: 'Contact', url: '/contact' },
        { label: 'Returns', url: '/returns' }
      ]
    },
    {
      section: 'About',
      items: [
        { label: 'Our Story', url: '/about' },
        { label: 'Artisans', url: '/artisans' },
        { label: 'Careers', url: '/careers' }
      ]
    },
    {
      section: 'Legal',
      items: [
        { label: 'Privacy Policy', url: '/privacy' },
        { label: 'Terms', url: '/terms' },
        { label: 'Shipping', url: '/shipping' }
      ]
    }
  ]
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let data;
      if (fs.existsSync(dataFile)) {
        data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      } else {
        data = defaultNavigation;
      }
      res.status(200).json(data);
    } catch (error) {
      console.error('Error reading navigation:', error);
      res.status(200).json(defaultNavigation);
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
      console.error('Error saving navigation:', error);
      res.status(500).json({ error: 'Failed to save navigation' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
