import "../styles/components/product-page.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
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
import "../components/ui/ProductCard.css";
import "../styles/components/shop-page.css";
import "../styles/components/filters.css";
import "../styles/components/footer.css";
import "../styles/components/admin.css";
import "../styles/components/cart-drawer.css";
import "../styles/account-page.css";
import { Cormorant_Garamond, DM_Sans, Playfair_Display } from "next/font/google";
import CartDrawer from "../components/CartDrawer";
import Nav, { NavMountProvider } from "../components/Nav";
import WhatsAppFab from "../components/WhatsAppFab";
import SharonCraftLogo from "../components/ui/SharonCraftLogo";
import { CartProvider } from "../lib/cart-context";
import { ToastProvider } from "../lib/toast-context";
import Head from "next/head";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-body",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

export default function SharonCraftApp({ Component, pageProps }) {
  const router = useRouter();
  const [showCurtain, setShowCurtain] = useState(false);
  const [curtainFadeOut, setCurtainFadeOut] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAdmin = window.location.pathname.startsWith("/admin");
      const isFirstLoad = !sessionStorage.getItem("sc_landing_shown");
      if (isFirstLoad && !isAdmin) {
        setShowCurtain(true);
        const fadeTimer = setTimeout(() => {
          setCurtainFadeOut(true);
          sessionStorage.setItem("sc_landing_shown", "true");
        }, 1800);

        const unmountTimer = setTimeout(() => {
          setShowCurtain(false);
        }, 3000);

        return () => {
          clearTimeout(fadeTimer);
          clearTimeout(unmountTimer);
        };
      }
    }
  }, []);

  useEffect(() => {
    if (showCurtain) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showCurtain]);

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

  useEffect(() => {
    NProgress.configure({ showSpinner: false, minimum: 0.1, speed: 400 });

    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router]);

  return (
    <div className={`${dmSans.variable} ${cormorant.variable} ${playfair.variable} sc-font-scope`}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <CartProvider>
            <NavMountProvider suppressPageNavMounts={shouldRenderGlobalNav}>
              {shouldRenderGlobalNav ? <Nav globalMount /> : null}
              <div id="main-content" className={routeShellClassName}>
                <Component {...pageProps} />
              </div>
              <CartDrawer />
              {isHomePage ? null : <WhatsAppFab />}

              {showCurtain && (
                <div className={`sc-curtain-loader ${curtainFadeOut ? 'sc-curtain-loader--exit' : ''}`}>
                  <div className="sc-curtain-loader__logo-wrap">
                    <SharonCraftLogo variant="monogram" light={true} width="120" height="177" />
                  </div>
                </div>
              )}

              <style jsx global>{`
                .sc-font-scope {
                  --font-price: var(--font-display);
                  font-family: var(--font-body);
                }
                #nprogress .bar {
                  background: #8B5E3C !important;
                  height: 3px !important;
                }
                #nprogress .peg {
                  box-shadow: 0 0 10px #8B5E3C, 0 0 5px #8B5E3C !important;
                }

                .sc-curtain-loader {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background-color: #FCFAF7;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 99999;
                  transform: translateY(0);
                  transition: transform 1.2s cubic-bezier(0.85, 0, 0.15, 1);
                }

                .sc-curtain-loader--exit {
                  transform: translateY(-100%);
                }

                .sc-curtain-loader__logo-wrap {
                  opacity: 0;
                  transform: scale(0.95);
                  animation: logoReveal 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }

                @keyframes logoReveal {
                  0% {
                    opacity: 0;
                    transform: scale(0.95);
                  }
                  100% {
                    opacity: 1;
                    transform: scale(1);
                  }
                }

                .sc-curtain-loader .logo-beads circle {
                  opacity: 0;
                  transform: scale(0);
                  transform-origin: center;
                  animation: beadGrow 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }

                @keyframes beadGrow {
                  0% {
                    opacity: 0;
                    transform: scale(0);
                  }
                  100% {
                    opacity: 1;
                    transform: scale(1);
                  }
                }

                .sc-curtain-loader .logo-letters path {
                  opacity: 0;
                  transform: translateY(6px);
                  animation: letterFade 0.8s cubic-bezier(0.25, 1, 0.5, 1) 0.1s forwards;
                }

                @keyframes letterFade {
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }

                ${Array.from({ length: 80 })
                  .map((_, i) => `.sc-curtain-loader .logo-beads circle:nth-child(${i + 1}) { animation-delay: ${0.15 + i * 0.012}s; }`)
                  .join("\n")}
              `}</style>
            </NavMountProvider>
          </CartProvider>
        </ToastProvider>
      </QueryClientProvider>
    </div>
  );
}
