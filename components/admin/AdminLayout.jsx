import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Icon from "../icons";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/orders", label: "💬 Orders", icon: "package" },
  { href: "/admin/products", label: "Products", icon: "package" },
  { href: "/admin/products/new", label: "Add Product", icon: "plus" },
  { href: "/admin/product-story", label: "Stories", icon: "edit" },
  { href: "/admin/site-images", label: "Site Content", icon: "edit" },
  { href: "/admin/mpesa", label: "M-Pesa", icon: "mpesa" },
];

export default function AdminLayout({ title, action, children }) {
  const router = useRouter();
  const currentId = typeof router.query.id === "string" ? router.query.id : "";
  const [sessionReady, setSessionReady] = useState(false);

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
          </div>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}
