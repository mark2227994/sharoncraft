import "../styles/components/product-page.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/router";
import "../styles/globals.css";
import "../styles/typography.css";
import "../styles/components/nav.css";
import "../styles/components/hero.css";
import "../assets/css/hero-slideshow.css";
import "../assets/css/collections-section.css";
import "../assets/css/custom-orders-card.css";
import "../assets/css/payment-methods.css";
import "../assets/css/artisan-section.css";
import "../assets/css/curated-section-luxury.css";
import "../assets/css/shop-luxury-minimal.css";
import "../styles/components/product-grid.css";
import "../styles/components/product-card.css";
import "../styles/components/shop-page.css";
import "../styles/components/filters.css";
import "../styles/components/footer.css";
import "../styles/components/admin.css";
import "../styles/components/cart-drawer.css";
import "../styles/account-page.css";
import CartDrawer from "../components/CartDrawer";
import Nav, { NavMountProvider } from "../components/Nav";
import WhatsAppFab from "../components/WhatsAppFab";
import StickyMiniCart from "../components/StickyMiniCart";
import { CartProvider } from "../lib/cart-context";

export default function SharonCraftApp({ Component, pageProps }) {
  const router = useRouter();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 30_000,
          },
        },
      }),
  );

  const isHomePage = router.pathname === "/";
  const shouldRenderGlobalNav = !router.pathname.startsWith("/admin");
  const routeShellClassName = shouldRenderGlobalNav
    ? `site-route-shell${isHomePage ? " site-route-shell--home" : ""}`
    : undefined;

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <NavMountProvider suppressPageNavMounts={shouldRenderGlobalNav}>
          {shouldRenderGlobalNav ? <Nav globalMount /> : null}
          <div id="main-content" className={routeShellClassName}>
            <Component {...pageProps} />
          </div>
          <CartDrawer />
          <StickyMiniCart />
          <WhatsAppFab />
        </NavMountProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}
