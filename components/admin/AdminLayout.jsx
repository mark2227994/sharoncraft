import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Icon from "../icons";

const navStructure = {
  primary: {
    label: "Sales",
    alwaysExpanded: true,
    items: [
      { href: "/admin", label: "Dashboard", icon: "dashboard" },
      { href: "/admin/products/new", label: "Add Product", icon: "plus" },
      { href: "/admin/products", label: "Products", icon: "package" },
      { href: "/admin/orders", label: "Orders", icon: "mail" },
      { href: "/admin/customers", label: "Customers", icon: "users" },
    ],
  },
  secondary: [
    {
      key: "storytelling",
      label: "Storytelling",
      icon: "heart",
      items: [
        { href: "/admin/hero-slideshow", label: "Hero Slideshow", icon: "edit" },
        { href: "/admin/artisans", label: "Artisans", icon: "heart" },
        { href: "/admin/testimonials", label: "Testimonials", icon: "star" },
        { href: "/admin/homepage-content", label: "Homepage Content", icon: "edit" },
      ],
    },
    {
      key: "analytics",
      label: "Analytics",
      icon: "chart",
      items: [
        { href: "/admin/artisan-impact", label: "Artisan Impact", icon: "chart" },
        { href: "/admin/expenses", label: "Expenses", icon: "dollar" },
      ],
    },
    {
      key: "content",
      label: "Content",
      icon: "edit",
      items: [
        { href: "/admin/page-content", label: "Page Content", icon: "edit" },
        { href: "/admin/articles", label: "Articles", icon: "edit" },
        { href: "/admin/faq", label: "FAQ", icon: "help" },
        { href: "/admin/homepage-sections", label: "Homepage Sections", icon: "edit" },
        { href: "/admin/promotions", label: "Promotions", icon: "star" },
        { href: "/admin/navigation", label: "Navigation", icon: "link" },
      ],
    },
    {
      key: "settings",
      label: "Settings",
      icon: "settings",
      items: [
        { href: "/admin/site-metadata", label: "Site Metadata", icon: "settings" },
        { href: "/admin/email-templates", label: "Email Templates", icon: "envelope" },
        { href: "/admin/footer-content", label: "Footer", icon: "link" },
        { href: "/admin/inventory", label: "Inventory", icon: "box" },
        { href: "/admin/prices", label: "Prices", icon: "tag" },
        { href: "/admin/site-images", label: "Site Images", icon: "eye" },
        { href: "/admin/mpesa", label: "M-Pesa", icon: "mpesa" },
        { href: "/admin/newsletter-subscribers", label: "Newsletter", icon: "envelope" },
      ],
    },
  ],
};

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
  const [expandedSections, setExpandedSections] = useState({});

  // Load expanded sections from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("admin-nav-expanded");
    if (saved) {
      try {
        setExpandedSections(JSON.parse(saved));
      } catch (e) {
        // Default state will be used if parsing fails
      }
    }
  }, []);

  // Save expanded sections to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("admin-nav-expanded", JSON.stringify(expandedSections));
  }, [expandedSections]);

  function toggleSection(sectionKey) {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  }

  const totalSecondaryItems = navStructure.secondary.reduce((sum, sec) => sum + sec.items.length, 0);

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

  function sectionHasActive(section) {
    return section.items.some((item) => isActiveItem(item.href));
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

        {/* PRIMARY SECTION: Sales (Always Expanded) */}
        <div className="admin-nav-section admin-nav-section--primary">
          <div className="admin-nav-section-title">{navStructure.primary.label}</div>
          <div className="admin-nav-section-items">
            {navStructure.primary.items.map((item) => {
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
          </div>
        </div>

        {/* SECONDARY SECTION: Collapsible */}
        <div className="admin-nav-section admin-nav-section--secondary">
          <button
            type="button"
            className="admin-nav-section-toggle"
            onClick={() => toggleSection("more")}
            aria-expanded={expandedSections.more || false}
          >
            <span className="admin-nav-section-toggle-label">
              More ({totalSecondaryItems})
            </span>
            <Icon
              name="chevronD"
              size={18}
              className={`admin-nav-section-toggle-arrow ${expandedSections.more ? "admin-nav-section-toggle-arrow--expanded" : ""}`}
            />
          </button>

          <div className={`admin-nav-section-content ${expandedSections.more ? "admin-nav-section-content--expanded" : ""}`}>
            {navStructure.secondary.map((section) => {
              const isExpanded = expandedSections[section.key];
              const hasActive = sectionHasActive(section);

              return (
                <div key={section.key} className="admin-nav-subsection">
                  <button
                    type="button"
                    className={`admin-nav-subsection-header ${hasActive ? "admin-nav-subsection-header--has-active" : ""}`}
                    onClick={() => toggleSection(section.key)}
                    aria-expanded={isExpanded || false}
                  >
                    <div className="admin-nav-subsection-header-content">
                      <Icon name={section.icon} size={16} />
                      <span>{section.label}</span>
                    </div>
                    <Icon
                      name="chevronD"
                      size={16}
                      className={`admin-nav-subsection-toggle-arrow ${isExpanded ? "admin-nav-subsection-toggle-arrow--expanded" : ""}`}
                    />
                  </button>

                  <div
                    className={`admin-nav-subsection-items ${isExpanded ? "admin-nav-subsection-items--expanded" : ""}`}
                  >
                    {section.items.map((item) => {
                      const isActive = isActiveItem(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`admin-nav-item admin-nav-item--nested ${isActive ? "admin-nav-item--active" : ""}`}
                        >
                          <Icon name={item.icon} size={16} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Orders (Recently Moved Here) */}
        <div className="admin-nav-section admin-nav-section--secondary">
          <div className="admin-nav-section-title" style={{ paddingTop: "0.5rem" }}>Custom</div>
          <Link
            href="/admin/custom-orders"
            className={`admin-nav-item ${isActiveItem("/admin/custom-orders") ? "admin-nav-item--active" : ""}`}
          >
            <Icon name="star" size={18} />
            <span>Custom Orders</span>
          </Link>
        </div>

        {/* Logout */}
        <button type="button" className="admin-nav-item" onClick={handleLogout} style={{ marginTop: "auto" }}>
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

      <style jsx>{`
        .admin-nav-section {
          padding: 0;
        }

        .admin-nav-section--primary {
          border-bottom: 1px solid rgba(192, 77, 41, 0.15);
          padding-bottom: 1rem;
          margin-bottom: 0.5rem;
        }

        .admin-nav-section-title {
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(0, 0, 0, 0.4);
        }

        .admin-nav-section-items {
          display: flex;
          flex-direction: column;
        }

        .admin-nav-section--secondary {
          padding: 0.5rem 0;
        }

        .admin-nav-section-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.7);
          transition: all 0.2s ease;
          user-select: none;
        }

        .admin-nav-section-toggle:hover {
          background: rgba(192, 77, 41, 0.08);
        }

        .admin-nav-section-toggle-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .admin-nav-section-toggle-arrow {
          transition: transform 0.3s ease;
        }

        .admin-nav-section-toggle-arrow--expanded {
          transform: rotate(180deg);
        }

        .admin-nav-section-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .admin-nav-section-content--expanded {
          max-height: 2000px;
        }

        .admin-nav-subsection {
          display: flex;
          flex-direction: column;
        }

        .admin-nav-subsection-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 1rem;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.6);
          transition: all 0.2s ease;
          user-select: none;
          margin: 0.25rem 0.5rem;
          border-radius: 6px;
        }

        .admin-nav-subsection-header:hover {
          background: rgba(192, 77, 41, 0.08);
        }

        .admin-nav-subsection-header--has-active {
          color: #C04D29;
          background: rgba(192, 77, 41, 0.12);
          font-weight: 600;
        }

        .admin-nav-subsection-header-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .admin-nav-subsection-toggle-arrow {
          transition: transform 0.3s ease;
        }

        .admin-nav-subsection-toggle-arrow--expanded {
          transform: rotate(180deg);
        }

        .admin-nav-subsection-items {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .admin-nav-subsection-items--expanded {
          max-height: 1000px;
        }

        .admin-nav-item--nested {
          padding-left: 2.25rem;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}
