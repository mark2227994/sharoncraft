import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "testimonials.json");

// Default testimonials
const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah",
    location: "London, UK",
    rating: 5,
    quote: "Every bead told a story. The wedding felt like it was handmade just for us.",
    productId: "bridal-set-001",
    approved: true,
    image: "",
  },
  {
    id: 2,
    name: "Amara",
    location: "New York, USA",
    rating: 5,
    quote: "I've bought from SharonCraft three times. The quality and authenticity keep me coming back.",
    productId: "",
    approved: true,
    image: "",
  },
  {
    id: 3,
    name: "James",
    location: "Cape Town, South Africa",
    rating: 5,
    quote: "Supporting artisans while getting beautiful, unique pieces. Perfect.",
    productId: "men-bracelet-001",
    approved: true,
    image: "",
  },
];

function readTestimonials() {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch {}
  return DEFAULT_TESTIMONIALS;
}

function writeTestimonials(testimonials) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(testimonials, null, 2));
  } catch (error) {
    console.error("Error writing testimonials:", error);
    throw new Error("Could not save testimonials");
  }
}

export default function handler(req, res) {
  if (req.method === "GET") {
    const testimonials = readTestimonials();
    return res.status(200).json({ testimonials });
  }

  if (req.method === "POST") {
    try {
      const { testimonials } = req.body;
      if (!Array.isArray(testimonials)) {
        return res.status(400).json({ error: "Invalid testimonials format" });
      }
      writeTestimonials(testimonials);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
