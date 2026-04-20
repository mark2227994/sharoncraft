#!/usr/bin/env node
/**
 * Seed artisans and products into the database
 * Direct write approach - bypasses authentication
 * Run with: node scripts/seed-artisans-products.js
 */

const fs = require('fs');
const path = require('path');

const ARTISANS = [
  {
    id: 1,
    name: "Sharon Kipchoge",
    location: "Nairobi, Kenya",
    craft: "Beaded Jewelry & Accessories",
    image: "",
    story: "Sharon is the founder and lead artisan of SharonCraft. With over 12 years of experience in traditional Kenyan beadwork, she combines ancestral techniques with contemporary design. Every piece carries the spirit of Kenya's rich cultural heritage.",
    quote: "I create not just jewelry, but stories of our people.",
    yearsExperience: "12+",
    specialties: "Beaded earrings, necklaces, bracelets, custom designs",
    whatsapp: "+254712345678",
    featured: true,
    mediaGallery: [],
    href: "/shop",
  },
  {
    id: 2,
    name: "Ken Ochieng",
    location: "Nairobi, Kenya",
    craft: "Home Decor & Accessories",
    image: "",
    story: "Ken specializes in transforming beads into functional art for the home. His expertise in geometric patterns and color combinations brings Kenyan design into modern living spaces. He believes that home decor should tell a story.",
    quote: "Beads are not just ornaments; they are conversations with the past.",
    yearsExperience: "8+",
    specialties: "Home decor, beaded bags, geometric patterns",
    whatsapp: "+254787654321",
    featured: true,
    mediaGallery: [],
    href: "/shop?category=Home%20Decor",
  },
];

const PRODUCTS = [
  // Earrings (3)
  {
    name: "Uhuru Drop Earrings",
    category: "Earrings",
    jewelryType: "drop-earrings",
    price: 2500,
    materials: "Krobo beads, brass hooks, leather accents",
    description: "Vibrant drop earrings celebrating freedom and cultural pride. These statement earrings feature traditional Krobo beads in bold colors.",
    fullDescription: "Inspired by the Swahili word 'Uhuru' (freedom), these drop earrings celebrate self-expression and cultural pride. Each pair features carefully selected Krobo beads in bold, complementary colors. The brass hooks are nickel-free for sensitive ears.",
    shortDescription: "Bold drop earrings with traditional Krobo beads",
    publishStatus: "published",
    images: [],
    tags: ["Earrings", "Drops", "Krobo Beads", "Kenyan"],
    seoTitle: "Uhuru Drop Earrings - Handmade Kenyan Beaded Jewelry",
    seoDescription: "Traditional Krobo beaded drop earrings celebrating freedom and cultural pride. Handcrafted by Kenyan artisans.",
  },
  {
    name: "Malkia Stud Earrings",
    category: "Earrings",
    jewelryType: "stud-earrings",
    price: 1800,
    materials: "Glass beads, surgical steel posts",
    description: "Elegant stud earrings named after the Swahili word for 'queen'. Perfect for everyday wear with a touch of sophistication.",
    fullDescription: "Named after 'Malkia' (queen in Swahili), these delicate stud earrings bring understated elegance to any look. Handcrafted with precision, each pair features carefully arranged glass beads that catch the light beautifully.",
    shortDescription: "Delicate beaded stud earrings with surgical steel posts",
    publishStatus: "published",
    images: [],
    tags: ["Earrings", "Studs", "Elegant", "Everyday"],
    seoTitle: "Malkia Stud Earrings - Handmade Kenyan Jewelry",
    seoDescription: "Elegant beaded stud earrings handcrafted by Kenyan artisans. Perfect for everyday wear.",
  },
  {
    name: "Twiga Chandelier Earrings",
    category: "Earrings",
    jewelryType: "chandelier-earrings",
    price: 3200,
    materials: "Mixed beads, brass wire, leather",
    description: "Statement chandelier earrings inspired by the graceful Kenyan giraffe. Multiple strands of beads create movement and elegance.",
    fullDescription: "Named after the Swahili word for giraffe, these chandelier earrings showcase multiple strands of beautifully arranged beads. The design captures the graceful, elongated form of Kenya's most iconic animal.",
    shortDescription: "Multi-strand chandelier earrings with mixed beads",
    publishStatus: "published",
    images: [],
    tags: ["Earrings", "Statement", "Chandelier", "Bold"],
    seoTitle: "Twiga Chandelier Earrings - Handcrafted Kenyan Jewelry",
    seoDescription: "Bold statement chandelier earrings with mixed beads. Handcrafted by Kenyan artisans.",
  },

  // Necklaces (3)
  {
    name: "Kijani Heritage Collar",
    category: "Necklaces",
    jewelryType: "collar-necklace",
    price: 5500,
    materials: "Krobo beads, brass findings, beading wire",
    description: "A regal collar necklace in shades of kijani (green), representing growth and renewal. Bold and empowering piece.",
    fullDescription: "This stunning collar necklace features carefully arranged Krobo beads in shades of green (kijani), symbolizing growth, renewal, and the lush landscapes of Kenya. The geometric pattern creates a balanced, sophisticated look.",
    shortDescription: "Green beaded collar necklace with traditional Krobo beads",
    publishStatus: "published",
    images: [],
    tags: ["Necklaces", "Collar", "Statement", "Krobo"],
    seoTitle: "Kijani Heritage Collar - Handmade Kenyan Necklace",
    seoDescription: "Statement collar necklace with Krobo beads in green. Handcrafted by Kenyan artisans.",
  },
  {
    name: "Jua (Sun) Pendant Necklace",
    category: "Necklaces",
    jewelryType: "pendant-necklace",
    price: 4200,
    materials: "Glass beads, brass pendant, adjustable cord",
    description: "Celebrate Kenya's golden sunlight with this radiant pendant necklace. The beaded cord is adjustable for versatility.",
    fullDescription: "This pendant necklace captures the warmth and energy of Kenya's sun (jua). The beaded cord is adjustable, allowing you to wear it at your preferred length. Perfect for layering or wearing alone as a statement piece.",
    shortDescription: "Adjustable pendant necklace with beaded cord",
    publishStatus: "published",
    images: [],
    tags: ["Necklaces", "Pendant", "Adjustable", "Gold"],
    seoTitle: "Jua Pendant Necklace - Adjustable Handmade Jewelry",
    seoDescription: "Adjustable beaded pendant necklace celebrating Kenya's sun. Handcrafted Kenyan jewelry.",
  },
  {
    name: "Rafiki (Friend) Beaded Rope",
    category: "Necklaces",
    jewelryType: "rope-necklace",
    price: 3800,
    materials: "Mixed glass beads, strong beading thread",
    description: "A long, layerable rope necklace celebrating friendship and community. Multiple colors represent unity in diversity.",
    fullDescription: "Named after the Swahili word for 'friend', this long beaded rope necklace celebrates the bonds that connect us. The multi-colored beads represent unity in diversity, a core value of Kenyan culture.",
    shortDescription: "Long layerable rope necklace with mixed beads",
    publishStatus: "published",
    images: [],
    tags: ["Necklaces", "Rope", "Layerable", "Multi-color"],
    seoTitle: "Rafiki Beaded Rope Necklace - Handmade Kenyan Jewelry",
    seoDescription: "Layerable beaded rope necklace celebrating friendship. Handcrafted by Kenyan artisans.",
  },

  // Bracelets (2)
  {
    name: "Dhahabu (Gold) Beaded Bracelet",
    category: "Bracelets",
    jewelryType: "beaded-bracelet",
    price: 2000,
    materials: "Gold-plated beads, elastic cord",
    description: "A luxurious stretch bracelet with gold-toned beads. Simple elegance that works with any outfit.",
    fullDescription: "This stretch bracelet features beautiful gold-plated beads arranged in a timeless pattern. The elastic cord makes it easy to slip on and off while staying secure on the wrist.",
    shortDescription: "Stretch bracelet with gold-toned beads",
    publishStatus: "published",
    images: [],
    tags: ["Bracelets", "Stretch", "Gold", "Everyday"],
    seoTitle: "Dhahabu Beaded Bracelet - Handmade Gold Jewelry",
    seoDescription: "Elegant stretch bracelet with gold-toned beads. Handcrafted Kenyan jewelry.",
  },
  {
    name: "Ndoto (Dream) Bangle Stack",
    category: "Bracelets",
    jewelryType: "bangle-bracelet",
    price: 6000,
    materials: "Brass bangles, beaded spacers",
    description: "A set of three brass bangles with beaded spacers. Stack them for a bold statement or wear individually.",
    fullDescription: "These dream-inspired bangles come as a set of three solid brass pieces decorated with beautiful beaded spacers. Mix and match them with your outfits or wear all three stacked together for a bold, confident look.",
    shortDescription: "Set of 3 brass bangles with beaded spacers",
    publishStatus: "published",
    images: [],
    tags: ["Bracelets", "Bangles", "Set", "Brass"],
    seoTitle: "Ndoto Bangle Stack - Set of 3 Brass Bracelets",
    seoDescription: "Set of three brass bangles with beaded spacers. Handcrafted Kenyan jewelry.",
  },

  // Home Decor (2)
  {
    name: "Kambaa (Web) Wall Hanging",
    category: "Home Decor",
    jewelryType: "wall-decor",
    price: 8500,
    materials: "Beads, natural fibers, wooden frame",
    description: "A striking beaded wall hanging featuring intricate web-like patterns. Brings warmth and culture to any space.",
    fullDescription: "This stunning wall hanging features an intricate geometric pattern inspired by traditional weaving. Each bead is carefully placed to create a complex 'web' of color and pattern that adds depth and cultural richness to your space.",
    shortDescription: "Geometric beaded wall hanging with wooden frame",
    publishStatus: "published",
    images: [],
    tags: ["Home Decor", "Wall Hanging", "Geometric", "Statement"],
    seoTitle: "Kambaa Wall Hanging - Handmade Kenyan Home Decor",
    seoDescription: "Geometric beaded wall hanging bringing Kenyan culture to your home. Handcrafted decor.",
  },
  {
    name: "Chakula (Feast) Table Runner",
    category: "Home Decor",
    jewelryType: "table-decor",
    price: 7200,
    materials: "Beads, fabric base, finishing thread",
    description: "A beautiful beaded table runner perfect for dining. Celebrate meals with Kenyan artistry and craftsmanship.",
    fullDescription: "Named after the Swahili word for 'feast', this beaded table runner brings elegance and cultural pride to your dining table. Each section is beaded individually and sewn onto a durable fabric base.",
    shortDescription: "Beaded fabric table runner for dining",
    publishStatus: "published",
    images: [],
    tags: ["Home Decor", "Table Decor", "Fabric", "Beaded"],
    seoTitle: "Chakula Beaded Table Runner - Handmade Home Decor",
    seoDescription: "Elegant beaded table runner for your dining space. Handcrafted Kenyan home decor.",
  },
];

async function seedData() {
  console.log('🌱 Starting to seed artisans and products...\n');

  // 1. Save artisans to site-images JSON
  console.log('📝 Seeding artisans...');
  try {
    const siteImagesPath = path.join(__dirname, '../data/site-images.json');
    let siteImages = {};
    
    // Read existing site-images if it exists
    if (fs.existsSync(siteImagesPath)) {
      try {
        siteImages = JSON.parse(fs.readFileSync(siteImagesPath, 'utf8'));
      } catch (e) {
        siteImages = {};
      }
    }
    
    // Add artisan stories
    siteImages.artisanStories = JSON.stringify(ARTISANS);
    
    // Write back
    fs.writeFileSync(siteImagesPath, JSON.stringify(siteImages, null, 2));
    console.log('✅ Artisans created: Sharon & Ken\n');
  } catch (error) {
    console.error('❌ Error seeding artisans:', error.message);
    return;
  }

  // 2. Save products to local JSON
  console.log('📦 Seeding 10 products...');
  try {
    const productsPath = path.join(__dirname, '../data/store/products.json');
    
    // Ensure directory exists
    const dir = path.dirname(productsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Add IDs and timestamps
    const productsWithIds = PRODUCTS.map((p, i) => ({
      ...p,
      id: `prod_${Date.now()}_${i}`,
      slug: p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    fs.writeFileSync(productsPath, JSON.stringify(productsWithIds, null, 2));
    
    PRODUCTS.forEach((p, i) => {
      console.log(`  ✅ ${i + 1}. ${p.name}`);
    });
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    return;
  }

  console.log('\n✨ Seeding complete!');
  console.log('- 2 artisans created (Sharon & Ken)');
  console.log('- 10 products added (3 earrings, 3 necklaces, 2 bracelets, 2 home decor)');
  console.log('\nNext steps:');
  console.log('1. Go to /admin/artisans to add images for Sharon & Ken');
  console.log('2. Go to /admin/products to add images for products');
  console.log('3. Go to /admin/social-media to generate captions');
}

seedData().catch(console.error);
