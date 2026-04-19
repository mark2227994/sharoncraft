import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Icon from "../icons";

const navItems = [
  // TIER 1: CORE OPERATIONS (Must Have)
  { section: "Core", tier: 1 },
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/products/new", label: "Add Product", icon: "plus" },
  { href: "/admin/products", label: "Products", icon: "package" },
  { href: "/admin/orders", label: "Orders", icon: "package" },
  
  // TIER 2: STORYTELLING (Artisan-First)
  { section: "Storytelling", tier: 2 },
  { href: "/admin/hero-slideshow", label: "Hero Slideshow", icon: "edit" },
  { href: "/admin/artisans", label: "Artisans", icon: "heart" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "star" },
  { href: "/admin/homepage-content", label: "Homepage Content", icon: "edit" },
  
  // TIER 3: IMPACT & ANALYTICS
  { section: "Impact", tier: 3 },
  { href: "/admin/artisan-impact", label: "Artisan Impact", icon: "chart" },
  
  // TIER 4: CONTENT MANAGEMENT
  { section: "Content", tier: 4 },
  { href: "/admin/page-content", label: "Page Content", icon: "edit" },
  { href: "/admin/articles", label: "Articles", icon: "edit" },
  { href: "/admin/faq", label: "FAQ", icon: "help" },
  { href: "/admin/homepage-sections", label: "Homepage Sections", icon: "edit" },
  { href: "/admin/promotions", label: "Promotions", icon: "star" },
  { href: "/admin/navigation", label: "Navigation", icon: "link" },
  
  // TIER 5: CUSTOMERS & CUSTOM ORDERS
  { section: "Customers", tier: 5 },
  { href: "/admin/custom-orders", label: "Custom Orders", icon: "edit" },
  { href: "/admin/customers", label: "Customers", icon: "users" },
  
  // TIER 6: WEBSITE SETTINGS
  { section: "Website", tier: 6 },
  { href: "/admin/site-metadata", label: "Site Metadata", icon: "settings" },
  { href: "/admin/email-templates", label: "Email Templates", icon: "envelope" },
  { href: "/admin/footer-content", label: "Footer", icon: "link" },
  
  // TIER 7: OPERATIONS
  { section: "Operations", tier: 7 },
  { href: "/admin/inventory", label: "Inventory", icon: "box" },
  { href: "/admin/expenses", label: "Expenses", icon: "dollar" },
  
  // TIER 8: TOOLS & INTEGRATIONS
  { section: "Tools", tier: 8 },
  { href: "/admin/prices", label: "Prices", icon: "tag" },
  { href: "/admin/site-images", label: "Site Images", icon: "eye" },
  { href: "/admin/mpesa", label: "M-Pesa", icon: "mpesa" },
  { href: "/admin/newsletter-subscribers", label: "Newsletter", icon: "envelope" },
];

const STATUS_BY_ROUTE = [
  { match: "/admin/mpesa", status: "read-only", label: "Read-only" },
  { match: "/admin/images", status: "read-only", label: "Read-only" },
  { match: "/admin/login", status: "demo", label: "Demo" },
  { match: "/admin/settings/hero", status: "live", label: "Live" },
  { match: "/admin", status: "live", label: "Live" },
];

function getPageStatus(pathname) {
  const statusEntry = STATUS_BY_ROUTE.find((item) => pathname === item.match || pathname.startsWith(`${item.match}/`));
  if (!statusEntry) {
    return { status: "live", label: "Live" };
  }
  return statusEntry;
}

export default function AdminLayout({ title, action, children }) {
  const router = useRouter();
  const currentId = typeof router.query.id === "string" ? router.query.id : "";
  const [sessionReady, setSessionReady] = useState(false);
  const pageStatus = getPageStatus(router.pathname || "");

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/admin/session", { credentials: "same-origin" });
        if (!response.ok) {
          throw new Error("Session check failed");
        }
        const payload = await response.json();
        if (!payload || !payload.authorized) {
          router.replace("/admin/login");
          return;
        }
        if (isMounted) {
          setSessionReady(true);
        }
      } catch (_error) {
        router.replace("/admin/login");
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  function isActiveItem(href) {
    if (href === "/admin") return router.pathname === "/admin";
    if (href === "/admin/products") {
      return router.pathname === "/admin/products" || (router.pathname === "/admin/products/[id]" && currentId !== "new");
    }
    if (href === "/admin/products/new") {
      return router.pathname === "/admin/products/new" || (router.pathname === "/admin/products/[id]" && currentId === "new");
    }
    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  }

  if (!sessionReady) {
    return (
      <div className="admin-shell">
        <main className="admin-main">
          <p className="admin-note">Checking admin session...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          Sharon<span>Craft</span> Admin
        </div>

        {navItems.map((item) => {
          if (item.section) {
            return (
              <div key={item.section} className="admin-nav-section">
                <span className="admin-nav-section-title">{item.section}</span>
              </div>
            );
          }
          const isActive = isActiveItem(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${isActive ? "admin-nav-item--active" : ""}`}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button type="button" className="admin-nav-item" onClick={handleLogout}>
          <Icon name="logout" size={18} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-page-header">
          <div>
            <p className="overline">Admin workspace</p>
            <h1 className="display-md">{title}</h1>
            <div className="admin-status-row">
              <span className="admin-note" style={{ margin: 0 }}>Mode:</span>
              {["live", "read-only", "demo"].map((status) => (
                <span
                  key={status}
                  className={`admin-status-badge admin-status-badge--${status} ${pageStatus.status === status ? "admin-status-badge--active" : "admin-status-badge--inactive"}`}
                >
                  {status === "read-only" ? "Read-only" : status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              ))}
            </div>
          </div>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}
