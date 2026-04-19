import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'articles.json');

const defaultArticles = [
  {
    id: 1,
    title: 'History of Maasai Beadwork',
    slug: 'history-of-maasai-beadwork',
    author: 'Nafula',
    category: 'Culture',
    image: '',
    body: 'Maasai beadwork is a rich cultural tradition spanning centuries...',
    relatedProductIds: [],
    readTime: 5,
    published: true,
    createdAt: '2025-01-10',
    updatedAt: '2025-01-10'
  },
  {
    id: 2,
    title: 'How to Care for Beaded Jewelry',
    slug: 'how-to-care-for-beaded-jewelry',
    author: 'Admin',
    category: 'Care',
    image: '',
    body: 'Beaded jewelry requires gentle care to maintain its beauty...',
    relatedProductIds: [],
    readTime: 4,
    published: true,
    createdAt: '2025-01-12',
    updatedAt: '2025-01-12'
  }
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let data;
      if (fs.existsSync(dataFile)) {
        data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      } else {
        data = defaultArticles;
      }
      res.status(200).json(data);
    } catch (error) {
      console.error('Error reading articles:', error);
      res.status(200).json(defaultArticles);
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
      console.error('Error saving articles:', error);
      res.status(500).json({ error: 'Failed to save articles' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
