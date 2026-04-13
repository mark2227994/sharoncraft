import Image from 'next/image'
import Link from 'next/link'

// Product data extracted from old HTML files
const products = [
  {
    id: "uhuru-home-set",
    name: "Uhuru Home Set",
    category: "gift-sets",
    price: 6800,
    badge: "Best Seller",
    featured: true,
    newArrival: false,
    shortDescription: "A bold beaded wall and rungu-inspired decor set for joyful living spaces.",
    description: "This matching decor set brings together clean black fabric, bright beadwork, and a handcrafted ceremonial rod. It is an easy conversation piece for a sitting room, hallway, or gifting moment.",
    details: [
      "Handmade in Kenya",
      "Works well for gifting or home styling",
      "Made to order in 2 to 4 days"
    ],
    images: [
      "assets/images/handmade-kenyan-beadwork-jrpr9r.webp",
      "assets/images/handmade-african-souvenir-joswzj.webp",
      "assets/images/kenyan-bead-decor-hkewyc-opt.webp"
    ],
    heritageStory: "The Uhuru Home Set draws inspiration from Kenya's independence spirit, combining traditional ceremonial elements with modern home decor. Each piece tells a story of cultural pride and contemporary living."
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
    description: "The Sunburst Cascade Necklace is made for women who want a soft statement piece. It sits beautifully over dresses, simple tops, and occasion wear without feeling heavy.",
    details: [
      "Available in white, black, and mixed bead patterns",
      "Lightweight for day-to-night wear",
      "Popular for events and gifting"
    ],
    images: [
      "assets/images/sharoncraft-african-necklace-gilyu6.webp",
      "assets/images/sharoncraft-african-necklace-p1sw79.webp",
      "assets/images/nairobi-artisan-jewelry-36egyo.webp"
    ],
    heritageStory: "Inspired by the sun's journey across the Kenyan savannah, this necklace captures the warmth and light that defines our landscape. The cascading design reflects the flow of traditional Maasai beadwork passed down through generations."
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
    description: "This collar-style necklace is neat, colorful, and easy to style for photos, celebrations, or a bold everyday look. The shape frames the neckline beautifully.",
    details: [
      "Soft collar fit",
      "Strong color contrast with hand-finished detail",
      "Made for simple outfits that need one statement piece"
    ],
    images: [
      "assets/images/sharoncraft-african-necklace-p1sw79.webp",
      "assets/images/sharoncraft-african-necklace-wmwmaf-opt.webp",
      "assets/images/sharoncraft-african-necklace-e8twpi-opt.webp"
    ],
    heritageStory: "Malkia means 'queen' in Swahili. This collar honors the regal women of Kenya who wear their heritage with pride. The sky-blue color represents the endless Kenyan sky that watches over our artisans as they work."
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
    description: "The Kenya Pride Bracelet keeps things simple with familiar national colors and a slim comfortable fit. It works for personal wear, bulk gifting, and team events.",
    details: [
      "Adjustable fit",
      "Great for gifts, clubs, and events",
      "Can be reordered in larger quantities"
    ],
    images: [
      "assets/images/kenya bracelete-opt.webp",
      "assets/images/authentic-maasai-bracelet-77ao7w.webp",
      "assets/images/authentic-maasai-bracelet-67j4r9.webp"
    ],
    heritageStory: "This bracelet carries the colors of our flag - black for our people, red for the blood shed for independence, white for peace, and green for our land. Each bead represents unity and national pride."
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
    description: "This stack combines bright bead colors in a light, happy mix that feels young and expressive. It is perfect for layering or sharing as a gift set.",
    details: [
      "Sold as a colorful stack",
      "Pairs well with plain outfits",
      "Good choice for birthdays and thank-you gifts"
    ],
    images: [
      "assets/images/authentic-maasai-bracelet-8ei1qd.webp",
      "assets/images/authentic-maasai-bracelet-ptfkru-opt.webp",
      "assets/images/authentic-maasai-bracelet-eb9hav-opt.webp"
    ],
    heritageStory: "The rainbow represents the diversity of Kenya's 42+ tribes, each color symbolizing different communities coming together in harmony. This stack celebrates our rich cultural tapestry."
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
    description: "The Sunlit Drop Earrings are designed for easy styling, gifting, and day-to-night wear. They bring color without feeling heavy, making them a comfortable first pick for shoppers who want beadwork that is simple and expressive.",
    details: [
      "Lightweight for comfortable wear",
      "Easy to pair with dresses, shirts, and occasion looks",
      "A strong gift option for birthdays and thank-you moments"
    ],
    images: [
      "assets/images/custom-occasion-beadwork-wap9kh-opt.webp",
      "assets/images/nairobi-artisan-jewelry-zocas6-opt.webp",
      "assets/images/nairobi-artisan-jewelry-xfka7l-opt.webp"
    ],
    heritageStory: "These earrings capture the golden light of Nairobi mornings when artisans begin their work. The drops symbolize the dew on savannah grass, representing new beginnings and fresh opportunities."
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
    description: "These statement earrings are made for clients who want a richer, more visible accessory. The shape stands out in photos and events while still keeping the handmade SharonCraft feel.",
    details: [
      "Statement size with balanced wear",
      "Works beautifully for events, shoots, and gifting",
      "Handmade in Kenya with vibrant bead detail"
    ],
    images: [
      "assets/images/custom-occasion-beadwork-96fk0x-opt.webp",
      "assets/images/nairobi-artisan-jewelry-9e1bft-opt.webp",
      "assets/images/custom-occasion-beadwork-xmia2u-opt.webp"
    ],
    heritageStory: "Twiga means 'giraffe' in Swahili. These earrings honor the gentle giant that roams our savannahs. The bold design reflects the giraffe's graceful strength and unique beauty that stands tall above the rest."
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
    description: "The Kijani Mirror Duo mixes practical mirror use with joyful bead color. The round frame feels warm and modern, making it easy to fit into homes, salons, and gift projects.",
    details: [
      "Two-size look with rich handmade trim",
      "Works in modern or cultural interiors",
      "Dispatch usually within 3 to 5 days"
    ],
    images: [
      "assets/images/kenyan-bead-decor-yhip8u-opt.webp",
      "assets/images/kenyan-bead-decor-kwwvkk.webp",
      "assets/images/kenyan-bead-decor-mw9yuq.webp"
    ],
    heritageStory: "Kijani means 'green' in Swahili, representing the lush landscapes of Kenya. These mirrors reflect not just our faces, but the vibrant colors of our countryside and the skilled hands that create them."
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
    description: "This table set adds color and craft to everyday meals, family lunches, and hosting moments. It is ideal for homes, Airbnbs, and cafes that want a friendly Kenyan touch.",
    details: [
      "Set includes coordinated circular placemats",
      "Easy to style for casual or celebration tables",
      "Popular for housewarming gifts"
    ],
    images: [
      "assets/images/kenyan-bead-decor-nxwcav.webp",
      "assets/images/kenyan-bead-decor-hkewyc-opt.webp",
      "assets/images/kenyan-bead-decor-9kag7s-opt.webp"
    ],
    heritageStory: "These placemats represent the unity found around Kenyan dining tables, where families gather and stories are shared. The circular design symbolizes wholeness and the coming together of different elements in harmony."
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
    description: "This beaded carry bag brings a playful handmade feel to daily errands and weekend looks. The open pattern shows off the beadwork while keeping the style light and airy.",
    details: [
      "Available in several colors",
      "Ideal for light carry use and styling",
      "Pairs well with matching jewelry"
    ],
    images: [
      "assets/images/handmade-african-souvenir-ldj58p-opt.webp",
      "assets/images/handmade-african-souvenir-joswzj.webp",
      "assets/images/handmade-african-souvenir-7dgi8p.webp"
    ],
    heritageStory: "Inspired by traditional Kenyan market baskets, this carry net modernizes the functional bags women have used for generations. It honors the entrepreneurial spirit of Kenyan women who carry their dreams and goods with pride."
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
    description: "The Harvest Fringe Bag is made for shoppers who want a piece that moves beautifully and feels rich in detail. It works well for special outings and bold gifting.",
    details: [
      "Dramatic fringe movement",
      "Multi-tone bead finish",
      "Handmade in small batches"
    ],
    images: [
      "assets/images/handmade-african-souvenir-brt5k2-opt.webp",
      "assets/images/handmade-african-souvenir-7dgi8p.webp",
      "assets/images/handmade-african-souvenir-b84ai7-opt.webp"
    ],
    heritageStory: "This bag celebrates Kenya's agricultural heritage, with its fringe representing swaying fields of maize and wheat. The harvest colors honor the land that feeds our nation and the hands that work it."
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
    description: "Designed for weddings, photoshoots, and special moments, this set brings together layered beadwork, clean yellow detail, and a regal finish that stands out beautifully in person and on camera.",
    details: [
      "Suitable for bridal and occasion styling",
      "Custom color discussions available on WhatsApp",
      "Made with care for special-order clients"
    ],
    images: [
      "assets/images/custom-occasion-beadwork-46mokm-opt.webp",
      "assets/images/traditional-bridal-bead-set-knimvb-opt.webp",
      "assets/images/traditional-bridal-bead-set-pner91.webp"
    ],
    heritageStory: "This royal set draws from traditional Kenyan wedding ceremonies where beadwork signifies status, beauty, and cultural identity. The yellow accents represent prosperity and the golden future that marriage promises."
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
    description: "This matching set is cheerful, light, and easy to gift. It is a good option for birthdays, appreciation gifts, or anyone who loves bold color with simple styling.",
    details: [
      "Includes matching earrings",
      "Comfortable for all-day wear",
      "Gift-ready look with strong color contrast"
    ],
    images: [
      "assets/images/custom-occasion-beadwork-wap9kh-opt.webp",
      "assets/images/traditional-bridal-bead-set-jzgne1.webp",
      "assets/images/sharoncraft-african-necklace-wmwmaf-opt.webp"
    ],
    heritageStory: "The loops in this set represent the cycles of life and the interconnectedness of our community. Each piece tells a story of celebration, friendship, and the joy found in simple, beautiful things."
  }
]

// Category data
const categories = [
  { slug: "necklaces", name: "Necklaces", accent: "coral" },
  { slug: "bracelets", name: "Bracelets", accent: "teal" },
  { slug: "earrings", name: "Earrings", accent: "terracotta" },
  { slug: "home-decor", name: "Home Decor", accent: "ochre" },
  { slug: "bags-accessories", name: "Bags & Accessories", accent: "terracotta" },
  { slug: "gift-sets", name: "Gift Sets", accent: "teal" },
  { slug: "bridal-occasion", name: "Bridal & Occasion", accent: "coral" }
]

// Savannah Earth color palette
const colors = {
  primary: "#C04D29", // Savannah Earth
  secondary: "#B87333", // Warm Copper
  accent: "#8B5A2B", // Rich Brown
  text: "#2C1810", // Deep Brown
  background: "#F8F4F0", // Warm Cream
  border: "#E6D7CD" // Soft Beige
}

export default function HomePage() {
  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        backgroundColor: colors.primary,
        color: 'white',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'Poppins, sans-serif' }}>
            SharonCraft
          </h1>
          <nav>
            <Link href="/shop" style={{
              color: 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              backgroundColor: colors.secondary,
              fontWeight: '600'
            }}>
              Shop Collection
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          alignItems: 'center'
        }}>
          <div>
            <span style={{
              display: 'inline-block',
              backgroundColor: colors.secondary,
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              Handmade in Kenya
            </span>
            <h1 style={{
              fontSize: '3rem',
              margin: '0 0 1rem 0',
              color: colors.text,
              fontFamily: 'Poppins, sans-serif',
              lineHeight: 1.2
            }}>
              Step into handmade color.
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: colors.text,
              lineHeight: 1.6,
              marginBottom: '2rem'
            }}>
              Jewelry, gifts, and home pieces made in Kenya. Browse slowly, ask what you need, and choose what feels right.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{
                backgroundColor: colors.border,
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                Made in Kenya
              </span>
              <span style={{
                backgroundColor: colors.border,
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                Gift ideas
              </span>
              <span style={{
                backgroundColor: colors.border,
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                Warm help
              </span>
            </div>
          </div>
          <div style={{
            position: 'relative',
            height: '400px',
            backgroundColor: colors.border,
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <Image
              src="/assets/images/custom-occasion-beadwork-46mokm-opt.webp"
              alt="SharonCraft handmade beadwork"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <span style={{
            display: 'inline-block',
            backgroundColor: colors.secondary,
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            Best Place To Start
          </span>
          <h2 style={{
            fontSize: '2.5rem',
            margin: '0 0 1rem 0',
            color: colors.text,
            fontFamily: 'Poppins, sans-serif'
          }}>
            Heritage Stories in Every Piece
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: colors.text,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Each product carries a story of Kenyan heritage, culture, and the skilled hands that create them.
          </p>
        </div>

        {/* Staggered Masonry Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {products.map((product, index) => (
            <article
              key={product.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                transform: `translateY(${Math.sin(index * 0.5) * 20}px)`,
                animation: `float 6s ease-in-out infinite ${index * 0.5}s`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = `translateY(${Math.sin(index * 0.5) * 20}px)`
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Product Image */}
              <div style={{
                position: 'relative',
                height: '250px',
                backgroundColor: colors.border
              }}>
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                {product.badge && (
                  <span style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: colors.primary,
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div style={{ padding: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    backgroundColor: getCategoryColor(product.category),
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {getCategoryName(product.category)}
                  </span>
                  <span style={{
                    color: colors.primary,
                    fontWeight: '700',
                    fontSize: '1.25rem'
                  }}>
                    KES {product.price.toLocaleString()}
                  </span>
                </div>

                <h3 style={{
                  margin: '0.5rem 0',
                  fontSize: '1.25rem',
                  color: colors.text,
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {product.name}
                </h3>

                <p style={{
                  color: colors.text,
                  lineHeight: 1.5,
                  marginBottom: '1rem'
                }}>
                  {product.shortDescription}
                </p>

                {/* Heritage Story */}
                <div style={{
                  backgroundColor: colors.background,
                  padding: '1rem',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${colors.secondary}`,
                  marginBottom: '1rem'
                }}>
                  <h4 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.875rem',
                    color: colors.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Heritage Story
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    color: colors.text,
                    lineHeight: 1.4
                  }}>
                    {product.heritageStory}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  marginBottom: '1rem'
                }}>
                  {product.details.map((detail, detailIndex) => (
                    <span key={detailIndex} style={{
                      backgroundColor: colors.border,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      color: colors.text
                    }}>
                      {detail}
                    </span>
                  ))}
                </div>

                <button style={{
                  width: '100%',
                  backgroundColor: colors.primary,
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.secondary}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}>
                  View Details
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: colors.primary,
        color: 'white',
        padding: '3rem 2rem',
        marginTop: '4rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>SharonCraft</h3>
            <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
              Handmade jewelry, gifts, and home decor from Nairobi with direct WhatsApp support.
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/shop" style={{ color: 'white', textDecoration: 'none' }}>Shop Collection</Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/about" style={{ color: 'white', textDecoration: 'none' }}>Our Story</Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contact</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Support</h4>
            <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>
              WhatsApp: +254 112 222 572<br />
              Email: hello@sharoncraft.co.ke
            </p>
          </div>
        </div>
        <div style={{
          maxWidth: '1200px',
          margin: '2rem auto 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          paddingTop: '2rem',
          textAlign: 'center',
          opacity: 0.8
        }}>
          © 2026 SharonCraft. Handmade with love in Kenya.
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @media (max-width: 768px) {
          h1 { font-size: 2rem; }
          h2 { font-size: 2rem; }
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

// Helper functions
function getCategoryColor(categorySlug) {
  const category = categories.find(cat => cat.slug === categorySlug)
  switch (category?.accent) {
    case 'coral': return colors.primary
    case 'teal': return '#2E8B57'
    case 'ochre': return colors.secondary
    case 'terracotta': return '#CC7357'
    default: return colors.primary
  }
}

function getCategoryName(categorySlug) {
  const category = categories.find(cat => cat.slug === categorySlug)
  return category?.name || 'Product'
}