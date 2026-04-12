import Link from "next/link";
import { useRouter } from "next/router";
import Icon from "../icons";

const navItems = [
  { href: "/admin", label: "Home", icon: "dashboard" },
  { href: "/admin/site-images", label: "Look", icon: "eye" },
  { href: "/admin/products", label: "Stock", icon: "package" },
  { href: "/admin/products/new", label: "Add", icon: "plus" },
  { href: "/admin/product-story", label: "Stories", icon: "edit" },
  { href: "/admin/mpesa", label: "M-Pesa", icon: "mpesa" },
];

function isNavActive(href, router) {
  const route = router.pathname;
  const { id } = router.query;
  if (href === "/admin") return route === "/admin";
  if (href === "/admin/products") return route === "/admin/products" || (route === "/admin/products/[id]" && id && id !== "new");
  if (href === "/admin/products/new") return route === "/admin/products/[id]" && id === "new";
  return route === href;
}

export default function AdminLayout({ title, action, children }) {
  const router = useRouter();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          Gallery<span>Admin</span>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin">
          {navItems.map((item) => {
            const active = isNavActive(item.href, router);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${active ? "admin-nav-item--active" : ""}`}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <Link href="/shop" className="admin-nav-item">
            <Icon name="arrowR" size={18} />
            <span>Shop</span>
          </Link>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-page-header">
          <div>
            <p className="overline admin-page-header__eyebrow">Kenyan Artisan Gallery</p>
            <h1 className="display-md admin-page-header__title">{title}</h1>
          </div>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}
