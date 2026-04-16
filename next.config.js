/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/leadership.html", destination: "/#about-story", permanent: true },
      { source: "/archive/leadership.html", destination: "/#about-story", permanent: true },
      { source: "/why-trust-sharoncraft.html", destination: "/#about-story", permanent: true },
      { source: "/founder-playbook.html", destination: "/", permanent: true },
      { source: "/follow-up-playbook.html", destination: "/", permanent: true },
      { source: "/about.html", destination: "/#about-story", permanent: true },
      { source: "/contact.html", destination: "/custom-order", permanent: true },
      { source: "/marketing.html", destination: "/", permanent: true },
      { source: "/shop.html", destination: "/shop", permanent: true },
      { source: "/journal.html", destination: "/", permanent: true },
      { source: "/handmade-kenyan-gifts.html", destination: "/shop?category=Gift%20Sets", permanent: true },
      { source: "/gift-sets-kenya.html", destination: "/shop?category=Gift%20Sets", permanent: true },
      { source: "/african-home-decor-nairobi.html", destination: "/shop?category=Home%20Decor", permanent: true },
      { source: "/kenyan-artifacts.html", destination: "/shop?category=Home%20Decor", permanent: true },
      {
        source: "/beaded-earrings-kenya.html",
        destination: "/shop?category=Jewellery&jewelryType=earring",
        permanent: true,
      },
      {
        source: "/maasai-inspired-bracelets-kenya.html",
        destination: "/shop?category=Jewellery&jewelryType=bracelet",
        permanent: true,
      },
      {
        source: "/maasai-jewelry-kenya.html",
        destination: "/shop?category=Jewellery&jewelryType=necklace",
        permanent: true,
      },
      { source: "/bridal-bead-sets-kenya.html", destination: "/shop?category=Bridal%20%26%20Occasion", permanent: true },
      { source: "/products/:slug.html", destination: "/product/:slug", permanent: true },
    ];
  },
};

module.exports = nextConfig;
