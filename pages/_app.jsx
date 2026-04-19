import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import "../styles/globals.css";
import "../styles/typography.css";
import "../styles/components/nav.css";
import "../styles/components/hero.css";
import "../styles/components/product-grid.css";
import "../styles/components/product-card.css";
import "../styles/components/filters.css";
import "../styles/components/footer.css";
import "../styles/components/admin.css";
import "../styles/components/cart-drawer.css";
import "../styles/account-page.css";
import CartDrawer from "../components/CartDrawer";
import MobileBottomNav from "../components/MobileBottomNav";
import WhatsAppFab from "../components/WhatsAppFab";
import StickyMiniCart from "../components/StickyMiniCart";
import { CartProvider } from "../lib/cart-context";

export default function SharonCraftApp({ Component, pageProps }) {
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

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Component {...pageProps} />
        <CartDrawer />
        <StickyMiniCart />
        <WhatsAppFab />
        <MobileBottomNav />
      </CartProvider>
    </QueryClientProvider>
  );
}
