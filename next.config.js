const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https:",
  "connect-src 'self' https://*.supabase.co https://*.supabase.in https://wa.me https://api.whatsapp.com",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

const noindexHeaders = [
  {
    key: "X-Robots-Tag",
    value: "noindex, nofollow",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 82, 84, 85, 90, 96, 100],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
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
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@supabase/supabase-js"],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "sharoncraft.co.ke" }],
        destination: "https://www.sharoncraft.co.ke/:path*",
        permanent: true,
      },
      { source: "/leadership.html", destination: "/#about-story", permanent: true },
      { source: "/archive/leadership.html", destination: "/#about-story", permanent: true },
      { source: "/why-trust-sharoncraft.html", destination: "/#about-story", permanent: true },
      { source: "/founder-playbook.html", destination: "/", permanent: true },
      { source: "/follow-up-playbook.html", destination: "/", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/contact.html", destination: "/custom-order", permanent: true },
      { source: "/marketing.html", destination: "/", permanent: true },
      { source: "/shop.html", destination: "/shop", permanent: true },
      { source: "/journal.html", destination: "/blog", permanent: true },
      { source: "/handmade-kenyan-gifts.html", destination: "/shop/gifted-carry", permanent: true },
      { source: "/gift-sets-kenya.html", destination: "/shop/gifted-carry/gift-sets", permanent: true },
      { source: "/shop/kenya-edit", destination: "/shop/the-kenya-edit", permanent: false },
      { source: "/the-kenya-edit", destination: "/shop/the-kenya-edit", permanent: false },
      { source: "/shop/ready-to-ship", destination: "/shop?filter=ready-to-ship", permanent: true },
      { source: "/african-home-decor-nairobi.html", destination: "/shop/home-living", permanent: true },
      { source: "/kenyan-artifacts.html", destination: "/shop/art-craft", permanent: true },
      {
        source: "/beaded-earrings-kenya.html",
        destination: "/shop/jewellery/earrings",
        permanent: true,
      },
      {
        source: "/maasai-inspired-bracelets-kenya.html",
        destination: "/shop/jewellery/bracelets",
        permanent: true,
      },
      {
        source: "/maasai-jewelry-kenya.html",
        destination: "/shop/jewellery/necklaces",
        permanent: true,
      },
      { source: "/bridal-bead-sets-kenya.html", destination: "/shop/jewellery/sets-collections", permanent: true },
      { source: "/products/:slug.html", destination: "/product/:slug", permanent: true },
      { source: "/product", destination: "/shop", permanent: true },
      // Article page redirects
      { source: "/journal", destination: "/blog", permanent: true },
      { source: "/journal/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/articles/history-of-maasai-beadwork.html", destination: "/blog/history-of-maasai-beadwork", permanent: true },
      { source: "/articles/where-to-buy-kenyan-artifacts.html", destination: "/blog/where-to-buy-kenyan-artifacts", permanent: true },
      { source: "/articles/best-handmade-kenyan-gifts.html", destination: "/blog/best-handmade-kenyan-gifts", permanent: true },
      { source: "/articles/how-to-style-beaded-home-decor.html", destination: "/blog/how-to-style-beaded-home-decor", permanent: true },
      { source: "/articles/how-to-choose-maasai-jewelry.html", destination: "/blog/how-to-choose-maasai-jewelry", permanent: true },
      // Archive page redirects
      { source: "/archive/journal.html", destination: "/blog", permanent: true },
      { source: "/archive/product.html", destination: "/shop", permanent: true },
      { source: "/archive/shop.html", destination: "/shop", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/login",
        headers: noindexHeaders,
      },
      {
        source: "/register",
        headers: noindexHeaders,
      },
      {
        source: "/checkout",
        headers: noindexHeaders,
      },
      {
        source: "/order-confirmation",
        headers: noindexHeaders,
      },
      {
        source: "/track-order",
        headers: noindexHeaders,
      },
      {
        source: "/account/:path*",
        headers: noindexHeaders,
      },
      {
        source: "/wishlist",
        headers: noindexHeaders,
      },
      {
        source: "/admin/:path*",
        headers: noindexHeaders,
      },
      {
        source: "/admin-v2/:path*",
        headers: noindexHeaders,
      },
      {
        source: "/api/:path*",
        headers: noindexHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
