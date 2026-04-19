import Link from "next/link";
import { useRouter } from "next/router";
import Icon from "./icons";

export default function AccountNav({ isMobile = false, onClose }) {
  const router = useRouter();

  const isActive = (path) => {
    return router.asPath.startsWith(path);
  };

  const navItems = [
    { href: "/account", label: "Dashboard", icon: "user" },
    { href: "/account/profile", label: "Profile", icon: "settings" },
    { href: "/account/orders", label: "Orders", icon: "package" },
    { href: "/account/wishlist", label: "Wishlist", icon: "heart" },
  ];

  return (
    <nav className="account-nav">
      <div className="account-nav__header">
        <h2 className="account-nav__title">Account</h2>
        {isMobile && (
          <button className="account-nav__close" onClick={onClose} aria-label="Close menu">
            <Icon name="close" size={24} />
          </button>
        )}
      </div>

      <ul className="account-nav__list">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`account-nav__link ${isActive(item.href) ? "account-nav__link--active" : ""}`}
              onClick={onClose}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="account-nav__divider"></div>

      <button
        className="account-nav__logout"
        onClick={async () => {
          try {
            await fetch("/api/auth/logout", { method: "DELETE" });
            router.push("/login");
          } catch (error) {
            console.error("Logout error:", error);
          }
        }}
      >
        <Icon name="logout" size={18} />
        <span>Logout</span>
      </button>
    </nav>
  );
}
