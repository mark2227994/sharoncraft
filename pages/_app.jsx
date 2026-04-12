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
      </CartProvider>
    </QueryClientProvider>
  );
}
