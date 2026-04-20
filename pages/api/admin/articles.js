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
    body: 'Maasai beadwork is a rich cultural tradition spanning centuries. The intricate patterns and vibrant colors tell stories of heritage, status, and cultural identity within Maasai communities. Each color holds specific meaning - red represents bravery and blood, blue symbolizes energy and sky, green represents land and production, and yellow signifies fertility and hospitality. Today, this ancient art form continues to inspire modern jewelry and home décor pieces that celebrate African heritage while meeting contemporary design standards.',
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
    body: 'Beaded jewelry requires gentle care to maintain its beauty and longevity. Store your pieces in a cool, dry place away from direct sunlight to prevent fading. Avoid exposing beaded jewelry to moisture, perfumes, or harsh chemicals. When cleaning, use a soft, dry cloth to gently wipe the surface. For deeper cleaning, use lukewarm water and mild soap, then pat dry immediately. Avoid soaking or submerging beaded pieces, as this can weaken the threads and affect the materials.',
    relatedProductIds: [],
    readTime: 4,
    published: true,
    createdAt: '2025-01-12',
    updatedAt: '2025-01-12'
  },
  {
    id: 3,
    title: 'Where to buy Kenyan artifacts',
    slug: 'where-to-buy-kenyan-artifacts',
    author: 'Admin',
    category: 'Buying Guide',
    image: '',
    body: 'When shopping for authentic Kenyan artifacts, authenticity is key. Look for pieces that are handmade by local artisans, not mass-produced imports. Authentic artifacts often show signs of individual craftsmanship - slight variations, visible stitching, and organic imperfections. Support local businesses and cooperatives that work directly with artisans. Be wary of extremely low prices, as genuine handmade pieces require time and skill. Prioritize vendors who share the story of the artisans behind each piece.',
    relatedProductIds: [],
    readTime: 5,
    published: true,
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15'
  },
  {
    id: 4,
    title: 'How to choose Maasai jewelry',
    slug: 'how-to-choose-maasai-jewelry',
    author: 'Admin',
    category: 'Style Guide',
    image: '',
    body: 'Choosing Maasai jewelry starts with understanding the occasion and your personal style. For everyday wear, opt for smaller, delicate pieces that add subtle cultural flair to your outfit. For special events, consider statement pieces like elaborate necklaces or intricately beaded bracelets. Think about color coordination with your wardrobe - jewel tones work well with neutral outfits, while earth tones complement colorful clothing. Consider the occasion formality and your outfit balance to select pieces that enhance rather than overpower your look.',
    relatedProductIds: [],
    readTime: 4,
    published: true,
    createdAt: '2025-01-18',
    updatedAt: '2025-01-18'
  },
  {
    id: 5,
    title: 'Best handmade Kenyan gifts',
    slug: 'best-handmade-kenyan-gifts',
    author: 'Admin',
    category: 'Gift Guide',
    image: '',
    body: 'Handmade Kenyan gifts are perfect for any occasion. For weddings, consider gift sets that combine jewelry and décor pieces. Birthday gifts benefit from personalized or custom pieces that reflect the recipient\'s style. For housewarming gifts, beaded home décor items create a memorable statement. Corporate gifts should reflect quality and craftsmanship. When selecting gifts, think about the recipient\'s lifestyle and décor preferences. Handmade gifts carry more thoughtfulness than mass-produced items, making them ideal for people you want to impress.',
    relatedProductIds: [],
    readTime: 4,
    published: true,
    createdAt: '2025-01-20',
    updatedAt: '2025-01-20'
  },
  {
    id: 6,
    title: 'How to style beaded home decor',
    slug: 'how-to-style-beaded-home-decor',
    author: 'Admin',
    category: 'Decor Guide',
    image: '',
    body: 'Styling beaded home décor requires balance and intentionality. Use beaded pieces as a room\'s focal point rather than filling spaces with multiple items. Choose one strong statement piece - a large wall hanging, woven basket, or sculptural element - and build the rest of your décor around it. Pair beaded items with neutral backgrounds to let them shine. Mix textures by combining beaded pieces with smooth fabrics, natural wood, or metal accents. Ensure adequate lighting to showcase the craftsmanship and detail of beaded décor.',
    relatedProductIds: [],
    readTime: 4,
    published: true,
    createdAt: '2025-01-22',
    updatedAt: '2025-01-22'
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
