// Shared catalog data for the static storefront.
// The admin panel can overwrite the product catalog in localStorage,
// and the storefront will read that saved catalog on this browser first.
(function () {
  const storageKey = "sharoncraft-admin-catalog";
  const socialSettingsKey = "sharoncraft-social-settings";
  const categoriesSettingsKey = "sharoncraft-category-settings";
  const homeVisualsSettingsKey = "sharoncraft-home-visuals";
  const siteContentSettingsKey = "sharoncraft-site-content";
  const liveCatalogCacheKey = "sharoncraft-live-catalog-cache";
  const liveHomeVisualsCacheKey = "sharoncraft-live-home-visuals-cache";
  const liveSocialSettingsCacheKey = "sharoncraft-live-social-settings-cache";
  const liveSiteContentCacheKey = "sharoncraft-live-site-content-cache";

  const defaultData = {
    site: {
      name: "SharonCraft",
      tagline: "Bright handmade beadwork for gifts, home styling, and joyful African-inspired looks.",
      founderName: "Kelvin Mark",
      founderTitle: "Founder & CEO",
      founderDescription: "Founder and CEO of SharonCraft, leading brand direction, operations, growth, and customer experience.",
      leadDesignerName: "Sharon Ruth",
      leadDesignerTitle: "Lead Designer",
      leadDesignerDescription: "Lead Designer at SharonCraft, guiding the creative direction, color stories, and handcrafted beadwork aesthetic.",
      whatsapp: "254112222572",
      phone: "+254 112 222 572",
      email: "hello@sharoncraft.co.ke",
      location: "Nairobi, Kenya",
      analytics: {
        ga4MeasurementId: "G-B3JW5DJ52P"
      },
      pricing: {
        enabled: true,
        deliveryFee: 200,
        packagingFee: 100,
        multiplier: 2
      },
      promo: "Free Nairobi delivery for orders above KES 3,500 this week.",
      mpesaSteps: [
        "Add your favorite pieces to cart and review them in one calm place.",
        "Use WhatsApp if you want help with delivery, gifting, or custom details.",
        "SharonCraft will guide you through the best available payment option while M-Pesa comes back."
      ],
      socials: [
        { label: "WhatsApp", url: "https://wa.me/254112222572?text=Hello%20SharonCraft%2C%20I%20would%20like%20to%20shop%20your%20beadwork." },
        { label: "Instagram", url: "#" },
        { label: "Facebook", url: "#" },
        { label: "TikTok", url: "#" }
      ],
      testimonials: [
        {
          name: "Mercy, Nairobi",
          quote: "The beaded set looked even better in person, and ordering on WhatsApp was very smooth."
        },
        {
          name: "Ann, Kiambu",
          quote: "I needed a gift quickly and SharonCraft helped me choose fast without confusion."
        },
        {
          name: "Wanjiku, Nairobi",
          quote: "The colors were beautiful, the finishing was neat, and delivery updates were clear."
        }
      ]
    },
    homeVisuals: {
      hero: {
        kicker: "Welcome to SharonCraft",
        title: "Step into handmade color.",
        description:
          "Jewelry, gifts, and home pieces made in Kenya. Browse slowly, ask what you need, and choose what feels right.",
        primaryLabel: "Enter Collection",
        primaryHref: "shop.html",
        secondaryLabel: "Our Story",
        secondaryHref: "about.html",
        image: "assets/images/custom-occasion-beadwork-46mokm-opt.webp",
        imageAlt: "Model wearing SharonCraft occasion beadwork"
      },
      favorite: {
        kicker: "A quiet favorite",
        title: "Kijani Mirror Duo",
        description: "A calm way to bring beadwork into bedrooms, living rooms, and gift corners.",
        image: "assets/images/kenyan-bead-decor-yhip8u-opt.webp",
        imageAlt: "Beaded mirror from SharonCraft",
        productId: "kijani-mirror-duo"
      }
    },
    categories: [
      {
        slug: "necklaces",
        name: "Necklaces",
        description: "Colorful collars and layered statement pieces for daily wear and special days.",
        image: "assets/images/sharoncraft-african-necklace-p1sw79.webp",
        tip: "Statement style",
        accent: "coral"
      },
      {
        slug: "bracelets",
        name: "Bracelets",
        description: "Easy-to-wear beaded bands with bright Kenyan color stories.",
        image: "assets/images/kenya bracelete-opt.webp",
        tip: "Easy gifting",
        accent: "teal"
      },
      {
        slug: "earrings",
        name: "Earrings",
        description: "Light, colorful bead earrings for easy styling, gifting, and everyday shine.",
        image: "assets/images/custom-occasion-beadwork-wap9kh-opt.webp",
        tip: "Easy sparkle",
        accent: "terracotta"
      },
      {
        slug: "home-decor",
        name: "Home Decor",
        description: "Mirrors, table pieces, and wall styling made to warm up your space.",
        image: "assets/images/kenyan-bead-decor-kwwvkk.webp",
        tip: "Warm spaces",
        accent: "ochre"
      },
      {
        slug: "bags-accessories",
        name: "Bags & Accessories",
        description: "Hand-beaded carry pieces and tassel styles with everyday personality.",
        image: "assets/images/handmade-african-souvenir-joswzj.webp",
        tip: "Daily carry",
        accent: "terracotta"
      },
      {
        slug: "gift-sets",
        name: "Gift Sets",
        description: "Matching pieces that make gifting feel thoughtful and easy.",
        image: "assets/images/handmade-kenyan-beadwork-jrpr9r.webp",
        tip: "Ready gifts",
        accent: "teal"
      },
      {
        slug: "bridal-occasion",
        name: "Bridal & Occasion",
        description: "Celebration-ready beadwork for events, brides, and standout moments.",
        image: "assets/images/traditional-bridal-bead-set-knimvb-opt.webp",
        tip: "Event glow",
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
          "assets/images/handmade-kenyan-beadwork-jrpr9r.webp",
          "assets/images/handmade-african-souvenir-joswzj.webp",
          "assets/images/kenyan-bead-decor-hkewyc-opt.webp"
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
          "assets/images/sharoncraft-african-necklace-gilyu6.webp",
          "assets/images/sharoncraft-african-necklace-p1sw79.webp",
          "assets/images/nairobi-artisan-jewelry-36egyo.webp"
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
          "assets/images/sharoncraft-african-necklace-p1sw79.webp",
          "assets/images/sharoncraft-african-necklace-wmwmaf-opt.webp",
          "assets/images/sharoncraft-african-necklace-e8twpi-opt.webp"
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
          "assets/images/kenya bracelete-opt.webp",
          "assets/images/authentic-maasai-bracelet-77ao7w.webp",
          "assets/images/authentic-maasai-bracelet-67j4r9.webp"
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
          "assets/images/authentic-maasai-bracelet-8ei1qd.webp",
          "assets/images/authentic-maasai-bracelet-ptfkru-opt.webp",
          "assets/images/authentic-maasai-bracelet-eb9hav-opt.webp"
        ]
      },
      {
        id: "sunlit-drop-earrings",
        name: "Sunlit Drop Earrings",
        category: "earrings",
        price: 1400,
        badge: "New",
        featured: true,
        newArrival: true,
        shortDescription: "Bright drop earrings with a light feel and a joyful handmade finish.",
        description:
          "The Sunlit Drop Earrings are designed for easy styling, gifting, and day-to-night wear. They bring color without feeling heavy, making them a comfortable first pick for shoppers who want beadwork that is simple and expressive.",
        details: [
          "Lightweight for comfortable wear",
          "Easy to pair with dresses, shirts, and occasion looks",
          "A strong gift option for birthdays and thank-you moments"
        ],
        images: [
          "assets/images/custom-occasion-beadwork-wap9kh-opt.webp",
          "assets/images/nairobi-artisan-jewelry-zocas6-opt.webp",
          "assets/images/nairobi-artisan-jewelry-xfka7l-opt.webp"
        ]
      },
      {
        id: "twiga-statement-earrings",
        name: "Twiga Statement Earrings",
        category: "earrings",
        price: 1850,
        badge: "Best Seller",
        featured: false,
        newArrival: false,
        shortDescription: "Bold beaded earrings with stronger shape, color, and event-ready character.",
        description:
          "These statement earrings are made for clients who want a richer, more visible accessory. The shape stands out in photos and events while still keeping the handmade SharonCraft feel.",
        details: [
          "Statement size with balanced wear",
          "Works beautifully for events, shoots, and gifting",
          "Handmade in Kenya with vibrant bead detail"
        ],
        images: [
          "assets/images/custom-occasion-beadwork-96fk0x-opt.webp",
          "assets/images/nairobi-artisan-jewelry-9e1bft-opt.webp",
          "assets/images/custom-occasion-beadwork-xmia2u-opt.webp"
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
          "assets/images/kenyan-bead-decor-yhip8u-opt.webp",
          "assets/images/kenyan-bead-decor-kwwvkk.webp",
          "assets/images/kenyan-bead-decor-mw9yuq.webp"
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
          "assets/images/kenyan-bead-decor-nxwcav.webp",
          "assets/images/kenyan-bead-decor-hkewyc-opt.webp",
          "assets/images/kenyan-bead-decor-9kag7s-opt.webp"
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
          "assets/images/handmade-african-souvenir-ldj58p-opt.webp",
          "assets/images/handmade-african-souvenir-joswzj.webp",
          "assets/images/handmade-african-souvenir-7dgi8p.webp"
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
          "assets/images/handmade-african-souvenir-brt5k2-opt.webp",
          "assets/images/handmade-african-souvenir-7dgi8p.webp",
          "assets/images/handmade-african-souvenir-b84ai7-opt.webp"
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
          "assets/images/custom-occasion-beadwork-46mokm-opt.webp",
          "assets/images/traditional-bridal-bead-set-knimvb-opt.webp",
          "assets/images/traditional-bridal-bead-set-pner91.webp"
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
          "assets/images/custom-occasion-beadwork-wap9kh-opt.webp",
          "assets/images/traditional-bridal-bead-set-jzgne1.webp",
          "assets/images/sharoncraft-african-necklace-wmwmaf-opt.webp"
        ]
      }
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizePricingSettings(value) {
    const source = value && typeof value === "object" ? value : {};

    return {
      enabled: source.enabled !== false,
      deliveryFee: Math.max(0, Number(source.deliveryFee) || 0),
      packagingFee: Math.max(0, Number(source.packagingFee) || 0),
      multiplier: Math.max(1, Number(source.multiplier) || 1)
    };
  }

  const defaultPricingSettings = normalizePricingSettings(defaultData.site.pricing);

  function hasDefinedNumber(value) {
    return value !== null && value !== "" && typeof value !== "undefined" && Number.isFinite(Number(value));
  }

  function getPricingSettings(siteData) {
    const site = siteData && typeof siteData === "object" ? siteData : {};
    return normalizePricingSettings(site.pricing || defaultPricingSettings);
  }

  function shouldUseFormulaPricing(product) {
    const pricingMode = String(product && product.pricingMode || "").trim().toLowerCase();
    return pricingMode === "formula";
  }

  function calculateWebsitePrice(basePrice, siteData) {
    const settings = getPricingSettings(siteData);
    const normalizedBasePrice = Math.max(0, Number(basePrice) || 0);

    if (!settings.enabled) {
      return Math.round(normalizedBasePrice);
    }

    return Math.round((normalizedBasePrice + settings.deliveryFee + settings.packagingFee) * settings.multiplier);
  }

  function applyPricingToProduct(product, siteData) {
    const source = product && typeof product === "object" ? product : {};
    const useFormulaPricing = shouldUseFormulaPricing(source);
    const rawBasePrice = Number(source.basePrice);
    const fallbackBasePrice = Number(source.price);
    const basePrice = useFormulaPricing
      ? Math.max(0, hasDefinedNumber(source.basePrice) ? rawBasePrice : fallbackBasePrice || 0)
      : null;
    const finalPrice = useFormulaPricing
      ? calculateWebsitePrice(basePrice, siteData)
      : Math.max(0, Number(source.price) || 0);

    return {
      ...source,
      basePrice,
      pricingMode: useFormulaPricing ? "formula" : "manual",
      price: finalPrice
    };
  }

  function normalizeProduct(product) {
    const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    const details = Array.isArray(product.details) ? product.details.filter(Boolean) : [];

    const pricingMode = String(product.pricingMode || "").trim().toLowerCase() === "formula" ? "formula" : "manual";

    return {
      id: product.id,
      name: product.name || "",
      category: product.category || "",
      price: Number(product.price) || 0,
      basePrice: pricingMode === "formula" && hasDefinedNumber(product.basePrice) ? Math.max(0, Number(product.basePrice)) : null,
      pricingMode,
      soldOut: Boolean(product.soldOut),
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
      images: images.length ? images : ["assets/images/custom-occasion-beadwork-46mokm-opt.webp"],
      analytics: product.analytics || null
    };
  }

  function normalizeCategory(category, fallbackCategory) {
    const fallback = fallbackCategory || {};
    const allowedAccents = ["coral", "teal", "ochre", "terracotta"];
    const accent = String(category.accent || fallback.accent || "coral").trim().toLowerCase();

    return {
      slug: String(category.slug || fallback.slug || "").trim(),
      name: String(category.name || fallback.name || "Category").trim() || "Category",
      description: String(category.description || fallback.description || "").trim(),
      image:
        String(category.image || fallback.image || "assets/images/custom-occasion-beadwork-46mokm-opt.webp").trim() ||
        "assets/images/custom-occasion-beadwork-46mokm-opt.webp",
      tip: String(category.tip || category.homeTip || fallback.tip || "").trim(),
      accent: allowedAccents.includes(accent) ? accent : "coral"
    };
  }

  function normalizeHomeVisuals(visuals, fallbackVisuals) {
    const fallback = fallbackVisuals || {};
    const fallbackHero = fallback.hero || {};
    const fallbackFavorite = fallback.favorite || {};
    const hero = visuals && typeof visuals === "object" ? visuals.hero || {} : {};
    const favorite = visuals && typeof visuals === "object" ? visuals.favorite || {} : {};

    return {
      version: String((visuals && visuals.version) || fallback.version || "").trim(),
      hero: {
        kicker: String(hero.kicker || fallbackHero.kicker || "").trim(),
        title: String(hero.title || fallbackHero.title || "").trim(),
        description: String(hero.description || fallbackHero.description || "").trim(),
        primaryLabel: String(hero.primaryLabel || fallbackHero.primaryLabel || "Shop Now").trim() || "Shop Now",
        primaryHref: String(hero.primaryHref || fallbackHero.primaryHref || "shop.html").trim() || "shop.html",
        secondaryLabel: String(hero.secondaryLabel || fallbackHero.secondaryLabel || "Our Story").trim() || "Our Story",
        secondaryHref: String(hero.secondaryHref || fallbackHero.secondaryHref || "about.html").trim() || "about.html",
        image:
          String(hero.image || fallbackHero.image || "assets/images/custom-occasion-beadwork-46mokm-opt.webp").trim() ||
          "assets/images/custom-occasion-beadwork-46mokm-opt.webp",
        imageAlt:
          String(hero.imageAlt || fallbackHero.imageAlt || "SharonCraft welcoming beadwork photo").trim() ||
          "SharonCraft welcoming beadwork photo"
      },
      favorite: {
        kicker: String(favorite.kicker || fallbackFavorite.kicker || "Client Favorite").trim() || "Client Favorite",
        title: String(favorite.title || fallbackFavorite.title || "").trim(),
        description: String(favorite.description || fallbackFavorite.description || "").trim(),
        image:
          String(favorite.image || fallbackFavorite.image || "assets/images/kenyan-bead-decor-yhip8u-opt.webp").trim() ||
          "assets/images/kenyan-bead-decor-yhip8u-opt.webp",
        imageAlt:
          String(favorite.imageAlt || fallbackFavorite.imageAlt || "SharonCraft favorite product photo").trim() ||
          "SharonCraft favorite product photo",
        productId: String(favorite.productId || fallbackFavorite.productId || "").trim()
      }
    };
  }

  function loadSavedProducts() {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map(normalizeProduct);
        }
      }

      const cachedRaw = window.localStorage.getItem(liveCatalogCacheKey);
      if (!cachedRaw) {
        return null;
      }

      const cachedParsed = JSON.parse(cachedRaw);
      if (!Array.isArray(cachedParsed)) {
        return null;
      }

      return cachedParsed.map(normalizeProduct);
    } catch (error) {
      return null;
    }
  }

  function normalizeSavedSocials(rawSocials, defaultSocials) {
    if (!Array.isArray(rawSocials)) {
      return defaultSocials;
    }

    const fallbackMap = new Map(defaultSocials.map((social) => [String(social.label || "").toLowerCase(), social]));
    return rawSocials
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
  }

  function loadSavedSocials(defaultSocials) {
    try {
      const raw = window.localStorage.getItem(socialSettingsKey);
      if (!raw) {
        const cachedRaw = window.localStorage.getItem(liveSocialSettingsCacheKey);
        if (!cachedRaw) {
          return defaultSocials;
        }

        const cachedParsed = JSON.parse(cachedRaw);
        return normalizeSavedSocials(cachedParsed, defaultSocials);
      }

      const parsed = JSON.parse(raw);
      return normalizeSavedSocials(parsed, defaultSocials);
    } catch (error) {
      return defaultSocials;
    }
  }

  function loadSavedPricing(defaultPricing) {
    const fallback = normalizePricingSettings(defaultPricing);

    try {
      const raw = window.localStorage.getItem(siteContentSettingsKey);
      if (!raw) {
        return fallback;
      }

      const parsed = JSON.parse(raw);
      const pricing = parsed && typeof parsed === "object" ? parsed.pricing : null;
      if (!pricing || typeof pricing !== "object") {
        return fallback;
      }

      return normalizePricingSettings({
        ...fallback,
        ...pricing
      });
    } catch (error) {
      return fallback;
    }
  }

  function loadSavedCategories(defaultCategories) {
    try {
      const raw = window.localStorage.getItem(categoriesSettingsKey);
      if (!raw) {
        return defaultCategories;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return defaultCategories;
      }

      const savedMap = new Map(
        parsed
          .map((category) => normalizeCategory(category))
          .filter((category) => category.slug)
          .map((category) => [category.slug, category])
      );

      return defaultCategories.map((category) => normalizeCategory(savedMap.get(category.slug) || category, category));
    } catch (error) {
      return defaultCategories;
    }
  }

  function loadSavedHomeVisuals(defaultHomeVisuals) {
    try {
      const raw = window.localStorage.getItem(homeVisualsSettingsKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          return normalizeHomeVisuals(parsed, defaultHomeVisuals);
        }
      }

      const cachedRaw = window.localStorage.getItem(liveHomeVisualsCacheKey);
      if (!cachedRaw) {
        return defaultHomeVisuals;
      }

      const cachedParsed = JSON.parse(cachedRaw);
      if (!cachedParsed || typeof cachedParsed !== "object") {
        return defaultHomeVisuals;
      }

      return normalizeHomeVisuals(cachedParsed, defaultHomeVisuals);
    } catch (error) {
      return defaultHomeVisuals;
    }
  }

  const savedProducts = loadSavedProducts();
  const data = clone(defaultData);
  const savedCategories = loadSavedCategories(defaultData.categories);
  const savedHomeVisuals = loadSavedHomeVisuals(defaultData.homeVisuals);

  if (savedProducts && savedProducts.length) {
    data.products = savedProducts;
  }

  if (savedCategories && savedCategories.length) {
    data.categories = savedCategories;
  }

  data.homeVisuals = normalizeHomeVisuals(savedHomeVisuals, defaultData.homeVisuals);

  data.site.socials = loadSavedSocials(defaultData.site.socials);
  data.site.pricing = loadSavedPricing(defaultData.site.pricing);
  defaultData.site.pricing = getPricingSettings(defaultData.site);
  data.products = (Array.isArray(data.products) ? data.products : []).map(function (product) {
    return applyPricingToProduct(product, data.site);
  });

  window.SharonCraftDefaultData = defaultData;
  window.SharonCraftStorage = {
    storageKey,
    socialSettingsKey,
    categoriesSettingsKey,
    homeVisualsSettingsKey,
    siteContentSettingsKey,
    liveCatalogCacheKey,
    liveHomeVisualsCacheKey,
    liveSocialSettingsCacheKey,
    liveSiteContentCacheKey
  };
  window.SharonCraftPricing = {
    getPricingSettings,
    calculateWebsitePrice,
    applyPricingToProduct,
    shouldUseFormulaPricing
  };
  window.SharonCraftData = data;
})();
