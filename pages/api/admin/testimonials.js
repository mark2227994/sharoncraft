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
    const jsonString = JSON.stringify(testimonials, null, 2);
    fs.writeFileSync(filePath, jsonString);
    console.log(`Successfully wrote ${testimonials.length} testimonials to ${filePath}`);
  } catch (error) {
    console.error("Error writing testimonials to", filePath, ":", error);
    throw new Error("Could not save testimonials: " + error.message);
  }
}

export default function handler(req, res) {
  if (req.method === "GET") {
    try {
      const testimonials = readTestimonials();
      return res.status(200).json({ testimonials });
    } catch (error) {
      console.error("Testimonials GET error:", error);
      return res.status(500).json({ error: "Could not read testimonials" });
    }
  }

  if (req.method === "POST") {
    try {
      const { testimonials: newTestimonials } = req.body;
      
      console.log("Received POST request with testimonials:", JSON.stringify(newTestimonials));
      
      if (!newTestimonials) {
        console.log("Error: No testimonials provided");
        return res.status(400).json({ error: "No testimonials provided" });
      }
      
      if (!Array.isArray(newTestimonials)) {
        console.log("Error: Testimonials is not an array:", typeof newTestimonials);
        return res.status(400).json({ error: "Testimonials must be an array" });
      }

      // Read existing testimonials and append new ones
      const existing = readTestimonials();
      console.log("Existing testimonials count:", existing.length);
      
      const combined = [...existing, ...newTestimonials];
      console.log("Combined testimonials count:", combined.length);
      
      writeTestimonials(combined);
      return res.status(200).json({ success: true, count: combined.length });
    } catch (error) {
      console.error("Testimonials POST error:", error);
      return res.status(500).json({ error: error.message || "Could not save testimonial" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
