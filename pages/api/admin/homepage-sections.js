import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'homepage-sections.json');

const defaultSections = [
  { id: 1, name: 'Hero Slideshow', enabled: true, order: 1, type: 'hero' },
  { id: 2, name: 'Featured Products', enabled: true, order: 2, type: 'featured', title: 'Shop Fan Favorites', description: '' },
  { id: 3, name: 'Artisan Stories', enabled: true, order: 3, type: 'artisans', title: 'Meet Our Makers', description: '' },
  { id: 4, name: 'Testimonials', enabled: true, order: 4, type: 'testimonials', title: 'What Our Customers Say', description: '' },
  { id: 5, name: 'Gift Guides', enabled: false, order: 5, type: 'collections', title: 'Perfect Gifts', description: '' },
  { id: 6, name: 'Newsletter', enabled: true, order: 6, type: 'newsletter', title: 'Stay in the Loop', description: 'Get exclusive offers & artisan stories' },
  { id: 7, name: 'Trust Stats', enabled: true, order: 7, type: 'stats', title: 'By The Numbers', description: '' }
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let data;
      if (fs.existsSync(dataFile)) {
        data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      } else {
        data = defaultSections;
      }
      res.status(200).json(data);
    } catch (error) {
      console.error('Error reading homepage sections:', error);
      res.status(200).json(defaultSections);
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
      console.error('Error saving homepage sections:', error);
      res.status(500).json({ error: 'Failed to save homepage sections' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
