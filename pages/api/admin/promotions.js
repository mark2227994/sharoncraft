import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'promotions.json');

const defaultPromotions = [
  {
    id: 1,
    title: '20% OFF GIFTS',
    type: 'banner',
    position: 'hero',
    discountCode: 'GIFT20',
    discountPercentage: 20,
    description: 'Perfect for any occasion',
    startDate: '2025-04-15',
    endDate: '2025-04-30',
    cta: 'Shop Gift Sets',
    ctaLink: '/shop?collection=gifts',
    image: '',
    active: true
  },
  {
    id: 2,
    title: 'Free shipping $50+',
    type: 'badge',
    position: 'footer',
    description: 'On all orders over 50',
    active: true
  },
  {
    id: 3,
    title: 'Summer Collection',
    type: 'seasonal',
    collectionId: 'summer-2025',
    description: 'New colors & designs for summer',
    startDate: '2025-05-01',
    endDate: '2025-08-31',
    featured: true,
    active: false
  }
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let data;
      if (fs.existsSync(dataFile)) {
        data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      } else {
        data = defaultPromotions;
      }
      res.status(200).json(data);
    } catch (error) {
      console.error('Error reading promotions:', error);
      res.status(200).json(defaultPromotions);
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
      console.error('Error saving promotions:', error);
      res.status(500).json({ error: 'Failed to save promotions' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
