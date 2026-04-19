import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "hero-slides.json");

// Default slides
const DEFAULT_SLIDES = [
  {
    id: 1,
    type: "artisan",
    image: "/media/site/homepage/design.jpg",
    title: "Nafula's Vision",
    subtitle: "Ceremonial Beadwork",
    description: "15+ years of crafting bold, ceremonial pieces",
    duration: 6,
    cta: "Meet Nafula",
    ctaLink: "/artisans/nafula",
  },
  {
    id: 2,
    type: "discount",
    image: "/media/site/homepage/ai-home-hero-decor-card.jpg",
    title: "20% Off",
    subtitle: "Gift Collections",
    description: "This week only",
    duration: 5,
    cta: "Shop Gift Sets",
    ctaLink: "/shop?category=gifts",
  },
  {
    id: 3,
    type: "product",
    image: "/media/site/homepage/design.jpg",
    title: "Featured: Wedding Jewelry",
    subtitle: "Bridal Beadwork",
    description: "From Achieng's collection",
    price: "$129",
    duration: 7,
    cta: "View Collection",
    ctaLink: "/shop?category=wedding",
  },
  {
    id: 4,
    type: "testimonial",
    image: "/media/site/homepage/design.jpg",
    title: "Sarah's Wedding",
    subtitle: '"Every bead told a story"',
    description: "London, UK",
    duration: 6,
    cta: "Read Reviews",
    ctaLink: "/reviews",
  },
  {
    id: 5,
    type: "bundle",
    image: "/media/site/homepage/design.jpg",
    title: "Bundle & Save",
    subtitle: "3-Piece Collection",
    description: "Get 3 pieces for $129",
    duration: 5,
    cta: "Shop Bundles",
    ctaLink: "/shop?category=bundles",
  },
  {
    id: 6,
    type: "brand",
    image: "/media/site/homepage/design.jpg",
    title: "SharonCraft",
    subtitle: "47 Artisans. 40+ Hours. One Piece.",
    description: "Handmade in Kenya",
    duration: 6,
    cta: "Our Story",
    ctaLink: "/about",
  },
  {
    id: 7,
    type: "artisan",
    image: "/media/site/homepage/design.jpg",
    title: "Muthoni's Wisdom",
    subtitle: '"I never want a piece to look repeated"',
    description: "18+ years perfecting her craft",
    duration: 7,
    cta: "Explore Home Decor",
    ctaLink: "/shop?category=home-decor",
  },
  {
    id: 8,
    type: "shipping",
    image: "/media/site/homepage/design.jpg",
    title: "Free Shipping",
    subtitle: "On orders over $50",
    description: "Worldwide delivery",
    duration: 5,
    cta: "Shop Now",
    ctaLink: "/shop",
  },
];

function readSlides() {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch {}
  return DEFAULT_SLIDES;
}

function writeSlides(slides) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(slides, null, 2));
  } catch (error) {
    console.error("Error writing slides:", error);
    throw new Error("Could not save slides");
  }
}

export default function handler(req, res) {
  if (req.method === "GET") {
    const slides = readSlides();
    return res.status(200).json({ slides });
  }

  if (req.method === "POST") {
    try {
      const { slides } = req.body;
      if (!Array.isArray(slides)) {
        return res.status(400).json({ error: "Invalid slides format" });
      }
      writeSlides(slides);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
