// Shared catalog data for the static storefront.
// The admin panel can overwrite the product catalog in localStorage,
// and the storefront will read that saved catalog on this browser first.
(function () {
  const storageKey = "sharoncraft-admin-catalog";
  const socialSettingsKey = "sharoncraft-social-settings";

  const defaultData = {
    site: {
      name: "SharonCraft",
      tagline: "Bright handmade beadwork for gifts, home styling, and joyful African-inspired looks.",
      whatsapp: "254112222572",
      phone: "+254 112 222 572",
      email: "hello@sharoncraft.co.ke",
      location: "Nairobi, Kenya",
      promo: "Free Nairobi delivery for orders above KES 3,500 this week.",
      mpesaSteps: [
        "Choose your product and confirm the total on WhatsApp.",
        "Send payment to the SharonCraft M-Pesa number after confirmation.",
        "Share the M-Pesa message so your order can be packed and dispatched."
      ],
      socials: [
        { label: "WhatsApp", url: "https://wa.me/254112222572?text=Hello%20SharonCraft%2C%20I%20would%20like%20to%20shop%20your%20beadwork." },
        { label: "Instagram", url: "#" },
        { label: "Facebook", url: "#" },
        { label: "TikTok", url: "#" }
      ]
    },
    categories: [
      {
        slug: "necklaces",
        name: "Necklaces",
        description: "Colorful collars and layered statement pieces for daily wear and special days.",
        image: "assets/images/IMG-20260304-WA0001.jpg",
        accent: "coral"
      },
      {
        slug: "bracelets",
        name: "Bracelets",
        description: "Easy-to-wear beaded bands with bright Kenyan color stories.",
        image: "assets/images/WhatsApp Image 2026-03-21 at 14.22.49.jpeg",
        accent: "teal"
      },
      {
        slug: "home-decor",
        name: "Home Decor",
        description: "Mirrors, table pieces, and wall styling made to warm up your space.",
        image: "assets/images/IMG-20260214-WA0005.jpg",
        accent: "ochre"
      },
      {
        slug: "bags-accessories",
        name: "Bags & Accessories",
        description: "Hand-beaded carry pieces and tassel styles with everyday personality.",
        image: "assets/images/IMG_20250606_113910.jpg",
        accent: "terracotta"
      },
      {
        slug: "gift-sets",
        name: "Gift Sets",
        description: "Matching pieces that make gifting feel thoughtful and easy.",
        image: "assets/images/IMG-20260317-WA0003.jpg",
        accent: "teal"
      },
      {
        slug: "bridal-occasion",
        name: "Bridal & Occasion",
        description: "Celebration-ready beadwork for events, brides, and standout moments.",
        image: "assets/images/IMG-20260226-WA0005.jpg",
        accent: "coral"
      }
    ],
    products: [
      {
        id: "uhuru-home-set",
        name: "Uhuru Home Set",
        category: "gift-sets",
        price: 6800,
        badge: "Best Seller",
        featured: true,
        newArrival: false,
        shortDescription: "A bold beaded wall and rungu-inspired decor set for joyful living spaces.",
        description:
          "This matching decor set brings together clean black fabric, bright beadwork, and a handcrafted ceremonial rod. It is an easy conversation piece for a sitting room, hallway, or gifting moment.",
        details: [
          "Handmade in Kenya",
          "Works well for gifting or home styling",
          "Made to order in 2 to 4 days"
        ],
        images: [
          "assets/images/IMG-20260317-WA0003.jpg",
          "assets/images/IMG_20250712_135532.jpg",
          "assets/images/IMG-20260226-WA0005.jpg"
        ]
      },
      {
        id: "sunburst-cascade-necklace",
        name: "Sunburst Cascade Necklace",
        category: "necklaces",
        price: 3200,
        badge: "New",
        featured: true,
        newArrival: true,
        shortDescription: "Long beaded strands with a rich drape and a polished cultural look.",
        description:
          "The Sunburst Cascade Necklace is made for women who want a soft statement piece. It sits beautifully over dresses, simple tops, and occasion wear without feeling heavy.",
        details: [
          "Available in white, black, and mixed bead patterns",
          "Lightweight for day-to-night wear",
          "Popular for events and gifting"
        ],
        images: [
          "assets/images/IMG_20260116_135153.jpg",
          "assets/images/IMG_20260116_135140.jpg",
          "assets/images/IMG_20260116_135132.jpg"
        ]
      },
      {
        id: "malkia-collar",
        name: "Malkia Collar",
        category: "necklaces",
        price: 2900,
        badge: "New",
        featured: false,
        newArrival: true,
        shortDescription: "A bright sky-blue collar with diamond details for a clean standout finish.",
        description:
          "This collar-style necklace is neat, colorful, and easy to style for photos, celebrations, or a bold everyday look. The shape frames the neckline beautifully.",
        details: [
          "Soft collar fit",
          "Strong color contrast with hand-finished detail",
          "Made for simple outfits that need one statement piece"
        ],
        images: [
          "assets/images/IMG-20260304-WA0001.jpg",
          "assets/images/IMG-20260221-WA0003.jpg",
          "assets/images/IMG_20230923_150524.jpg"
        ]
      },
      {
        id: "kenya-pride-bracelet",
        name: "Kenya Pride Bracelet",
        category: "bracelets",
        price: 900,
        badge: "Best Seller",
        featured: true,
        newArrival: false,
        shortDescription: "A simple flag-inspired bracelet that is easy to wear and easy to gift.",
        description:
          "The Kenya Pride Bracelet keeps things simple with familiar national colors and a slim comfortable fit. It works for personal wear, bulk gifting, and team events.",
        details: [
          "Adjustable fit",
          "Great for gifts, clubs, and events",
          "Can be reordered in larger quantities"
        ],
        images: [
          "assets/images/WhatsApp Image 2026-03-21 at 14.22.49.jpeg",
          "assets/images/IMG-20260305-WA0001.jpg",
          "assets/images/IMG_20250610_114035.jpg"
        ]
      },
      {
        id: "rainbow-loop-stack",
        name: "Rainbow Loop Stack",
        category: "bracelets",
        price: 1800,
        badge: "New",
        featured: false,
        newArrival: true,
        shortDescription: "A cheerful stack of colorful bead loops for playful daily styling.",
        description:
          "This stack combines bright bead colors in a light, happy mix that feels young and expressive. It is perfect for layering or sharing as a gift set.",
        details: [
          "Sold as a colorful stack",
          "Pairs well with plain outfits",
          "Good choice for birthdays and thank-you gifts"
        ],
        images: [
          "assets/images/IMG_20240316_151041.jpg",
          "assets/images/WhatsApp Image 2026-03-21 at 14.21.15.jpeg",
          "assets/images/IMG_20230923_150542.jpg"
        ]
      },
      {
        id: "kijani-mirror-duo",
        name: "Kijani Mirror Duo",
        category: "home-decor",
        price: 7400,
        badge: "Best Seller",
        featured: true,
        newArrival: false,
        shortDescription: "Round beaded mirrors that brighten bedrooms, hallways, and dressing spaces.",
        description:
          "The Kijani Mirror Duo mixes practical mirror use with joyful bead color. The round frame feels warm and modern, making it easy to fit into homes, salons, and gift projects.",
        details: [
          "Two-size look with rich handmade trim",
          "Works in modern or cultural interiors",
          "Dispatch usually within 3 to 5 days"
        ],
        images: [
          "assets/images/IMG-20260214-WA0006.jpg",
          "assets/images/IMG-20260214-WA0005.jpg",
          "assets/images/IMG-20260214-WA0007.jpg"
        ]
      },
      {
        id: "unity-table-placemats",
        name: "Unity Table Placemats",
        category: "home-decor",
        price: 5200,
        badge: "New",
        featured: false,
        newArrival: true,
        shortDescription: "Bright round placemats that make a dining table feel welcoming and alive.",
        description:
          "This table set adds color and craft to everyday meals, family lunches, and hosting moments. It is ideal for homes, Airbnbs, and cafes that want a friendly Kenyan touch.",
        details: [
          "Set includes coordinated circular placemats",
          "Easy to style for casual or celebration tables",
          "Popular for housewarming gifts"
        ],
        images: [
          "assets/images/IMG-20260214-WA0004.jpg",
          "assets/images/IMG_20250712_135532.jpg",
          "assets/images/IMG_20260116_135153.jpg"
        ]
      },
      {
        id: "beaded-carry-net",
        name: "Beaded Carry Net",
        category: "bags-accessories",
        price: 3600,
        badge: "New",
        featured: false,
        newArrival: true,
        shortDescription: "Open-weave beaded carry bags in bright colors for market days and casual style.",
        description:
          "This beaded carry bag brings a playful handmade feel to daily errands and weekend looks. The open pattern shows off the beadwork while keeping the style light and airy.",
        details: [
          "Available in several colors",
          "Ideal for light carry use and styling",
          "Pairs well with matching jewelry"
        ],
        images: [
          "assets/images/IMG_20250606_113904.jpg",
          "assets/images/IMG_20250606_113910.jpg",
          "assets/images/IMG_20250606_113919.jpg"
        ]
      },
      {
        id: "harvest-fringe-bag",
        name: "Harvest Fringe Bag",
        category: "bags-accessories",
        price: 4100,
        badge: "Best Seller",
        featured: false,
        newArrival: false,
        shortDescription: "A fringe-style beaded bag with movement, color, and a strong artisan finish.",
        description:
          "The Harvest Fringe Bag is made for shoppers who want a piece that moves beautifully and feels rich in detail. It works well for special outings and bold gifting.",
        details: [
          "Dramatic fringe movement",
          "Multi-tone bead finish",
          "Handmade in small batches"
        ],
        images: [
          "assets/images/IMG_20250606_113933.jpg",
          "assets/images/IMG_20250606_113919.jpg",
          "assets/images/IMG_20250606_113948.jpg"
        ]
      },
      {
        id: "royal-occasion-set",
        name: "Royal Occasion Set",
        category: "bridal-occasion",
        price: 9500,
        badge: "Best Seller",
        featured: true,
        newArrival: false,
        shortDescription: "A rich ceremonial bead set for brides, shoots, and unforgettable celebration looks.",
        description:
          "Designed for weddings, photoshoots, and special moments, this set brings together layered beadwork, clean yellow detail, and a regal finish that stands out beautifully in person and on camera.",
        details: [
          "Suitable for bridal and occasion styling",
          "Custom color discussions available on WhatsApp",
          "Made with care for special-order clients"
        ],
        images: [
          "assets/images/IMG-20260226-WA0005.jpg",
          "assets/images/IMG-20260317-WA0003.jpg",
          "assets/images/IMG_20250712_135532.jpg"
        ]
      },
      {
        id: "color-loop-jewelry-set",
        name: "Color Loop Jewelry Set",
        category: "gift-sets",
        price: 3400,
        badge: "New",
        featured: false,
        newArrival: true,
        shortDescription: "A matched necklace and earrings set with fresh bright loops and a clean finish.",
        description:
          "This matching set is cheerful, light, and easy to gift. It is a good option for birthdays, appreciation gifts, or anyone who loves bold color with simple styling.",
        details: [
          "Includes matching earrings",
          "Comfortable for all-day wear",
          "Gift-ready look with strong color contrast"
        ],
        images: [
          "assets/images/IMG-20260221-WA0000.jpg",
          "assets/images/IMG-20260221-WA0003.jpg",
          "assets/images/WhatsApp Image 2026-03-21 at 14.21.15.jpeg"
        ]
      }
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeProduct(product) {
    const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    const details = Array.isArray(product.details) ? product.details.filter(Boolean) : [];

    return {
      id: product.id,
      name: product.name || "",
      category: product.category || "",
      price: Number(product.price) || 0,
      momPrice: Number(product.momPrice) || 0,
      deliveryCharge: Number(product.deliveryCharge) || 0,
      deliveryCost: Number(product.deliveryCost) || 0,
      source: product.source || "mom-kiosk",
      stockQty: Number(product.stockQty) || 0,
      reservedQty: Number(product.reservedQty) || 0,
      badge: product.badge || "",
      featured: Boolean(product.featured),
      newArrival: Boolean(product.newArrival),
      shortDescription: product.shortDescription || product.description || "",
      description: product.description || product.shortDescription || "",
      details,
      images: images.length ? images : ["assets/images/IMG-20260226-WA0005.jpg"],
      analytics: product.analytics || null
    };
  }

  function loadSavedProducts() {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return null;
      }

      return parsed.map(normalizeProduct);
    } catch (error) {
      return null;
    }
  }

  function loadSavedSocials(defaultSocials) {
    try {
      const raw = window.localStorage.getItem(socialSettingsKey);
      if (!raw) {
        return defaultSocials;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return defaultSocials;
      }

      const fallbackMap = new Map(defaultSocials.map((social) => [String(social.label || "").toLowerCase(), social]));
      return parsed
        .map((social) => {
          const label = String(social.label || "").trim();
          if (!label) {
            return null;
          }

          const fallback = fallbackMap.get(label.toLowerCase()) || {};
          return {
            label,
            url: String(social.url || fallback.url || "#").trim() || "#"
          };
        })
        .filter(Boolean);
    } catch (error) {
      return defaultSocials;
    }
  }

  const savedProducts = loadSavedProducts();
  const data = clone(defaultData);

  if (savedProducts && savedProducts.length) {
    data.products = savedProducts;
  }

  data.site.socials = loadSavedSocials(defaultData.site.socials);

  window.SharonCraftDefaultData = defaultData;
  window.SharonCraftStorage = { storageKey, socialSettingsKey };
  window.SharonCraftData = data;
})();
