/** @type {import('next').NextConfig} */

const nextConfig = {
  compress: true,
  poweredByHeader: false,
  output: "standalone",
  serverExternalPackages: ["fs/promises"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "sharoncraft.co.ke" }],
        destination: "https://www.sharoncraft.co.ke/:path*",
        permanent: true,
      },
      { source: "/admin", destination: "/admin-v2", permanent: false },
      { source: "/admin/login", destination: "/admin-v2/login", permanent: false },
      { source: "/login", destination: "/", permanent: false },
      { source: "/register", destination: "/", permanent: false },
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/leadership.html", destination: "/about", permanent: true },
      { source: "/archive/leadership.html", destination: "/about", permanent: true },
      { source: "/why-trust-sharoncraft.html", destination: "/about", permanent: true },
      { source: "/founder-playbook.html", destination: "/about", permanent: true },
      { source: "/follow-up-playbook.html", destination: "/about", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      { source: "/marketing.html", destination: "/blog", permanent: true },
      { source: "/shop.html", destination: "/shop", permanent: true },
      { source: "/journal.html", destination: "/blog", permanent: true },
      { source: "/faq.html", destination: "/faq", permanent: true },
      { source: "/returns.html", destination: "/shipping", permanent: true },
      { source: "/privacy.html", destination: "/privacy", permanent: true },
      { source: "/terms.html", destination: "/terms", permanent: true },
      { source: "/handmade-kenyan-gifts.html", destination: "/shop/gifted-carry", permanent: true },
      { source: "/gift-sets-kenya.html", destination: "/shop/gifted-carry/gift-sets", permanent: true },
      { source: "/african-home-decor-nairobi.html", destination: "/shop/home-living", permanent: true },
      { source: "/kenyan-artifacts.html", destination: "/shop/art-craft", permanent: true },
      { source: "/beaded-earrings-kenya.html", destination: "/shop/jewellery/earrings", permanent: true },
      { source: "/maasai-inspired-bracelets-kenya.html", destination: "/shop/jewellery/bracelets", permanent: true },
      { source: "/maasai-jewelry-kenya.html", destination: "/shop/jewellery/necklaces", permanent: true },
      { source: "/bridal-bead-sets-kenya.html", destination: "/shop/jewellery/sets-collections", permanent: true },
      { source: "/products/:slug.html", destination: "/product/:slug", permanent: true },
      { source: "/product", destination: "/shop", permanent: true },
      { source: "/journal", destination: "/blog", permanent: true },
      { source: "/journal/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/articles/:slug.html", destination: "/blog/:slug", permanent: true },
      { source: "/archive/journal.html", destination: "/blog", permanent: true },
      { source: "/archive/product.html", destination: "/shop", permanent: true },
      { source: "/archive/shop.html", destination: "/shop", permanent: true },
      { source: "/archive/about.html", destination: "/about", permanent: true },
      { source: "/archive/contact.html", destination: "/contact", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
