# Admin Panel: Sales-Focused Redesign

## Current State
Currently showing 8 navigation sections with 40+ menu items, which is overwhelming when the core focus is **moving inventory and generating revenue**.

## Recommended Redesign

### **PRIMARY NAVIGATION** (Always Visible)
The top 4 items = 80% of daily work:

```
🎯 CORE (Sales Operations)
├─ 📊 Dashboard          [KPI: Weekly profit, pending orders, quick stats]
├─ ➕ Add Product        [CTA button - quick access to wizard form]
├─ 📦 Products           [Manage catalog, adjust prices, restock]
├─ 📧 Orders             [WA + M-Pesa + Custom - all order channels]
└─ 👥 Customers          [Contact history, repeat buyers]
```

### **SECONDARY NAVIGATION** (Hidden Behind "More" Toggle)
Accessed via collapsible section or dropdown:

```
✨ STORYTELLING (Marketing Content)
├─ 🎨 Hero Slideshow
├─ 👨‍🎨 Artisans
├─ ⭐ Testimonials
└─ 📝 Homepage Content

📊 ANALYTICS & IMPACT
├─ 📈 Artisan Impact
└─ 💰 Expenses

📄 CONTENT MANAGEMENT
├─ 📄 Page Content
├─ ✍️ Articles
├─ ❓ FAQ
├─ 🎯 Homepage Sections
├─ 🎁 Promotions
└─ 🔗 Navigation

⚙️ SETTINGS & INTEGRATIONS
├─ 🏷️ Prices
├─ 🖼️ Site Images
├─ 📧 Email Templates
├─ 💬 M-Pesa
├─ 📬 Newsletter
├─ 🔧 Site Metadata
└─ 🦶 Footer
```

---

## Layout Changes

### **Option 1: Collapsible "More" Section** (RECOMMENDED)
```
┌─────────────────────────────┐
│ SharonCraft Admin           │
├─────────────────────────────┤
│ 🎯 CORE                     │
│ • Dashboard                 │
│ • Add Product               │
│ • Products                  │
│ • Orders                    │
│ • Customers                 │
├─────────────────────────────┤
│ ▼ MORE (14 items)           │
│   ✨ Storytelling (4)       │
│   📊 Analytics (2)          │
│   📄 Content (6)            │
│   ⚙️ Settings (8)           │
└─────────────────────────────┘
```

### **Option 2: Tab-based Navigation**
```
[Sales] [Marketing] [Analytics] [Settings]

Sales Tab Shows:
• Dashboard
• Add Product
• Products
• Orders
• Customers
```

### **Option 3: Sidebar Collapse by Default**
```
Primary (Always expanded):
• Dashboard, Add Product, Products, Orders, Customers

Secondary (Collapsed by default, click "Settings" to expand):
• All other sections collapsed under icons
```

---

## Implementation Approach

### **Phase 1: Refactor Navigation Structure**
Modify [components/admin/AdminLayout.jsx](../../components/admin/AdminLayout.jsx):
```javascript
const navItems = [
  // PRIMARY - Always visible
  { section: "Sales", tier: 1, alwaysExpanded: true },
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/products/new", label: "Add Product", icon: "plus" },
  { href: "/admin/products", label: "Products", icon: "package" },
  { href: "/admin/orders", label: "Orders", icon: "mail" },
  { href: "/admin/customers", label: "Customers", icon: "users" },

  // SECONDARY - Hidden by default
  { section: "More", tier: 2, collapsible: true, defaultExpanded: false },
  { section: "Storytelling", tier: 2a, subsection: true },
  // ... all others
];
```

### **Phase 2: Add Sidebar Toggle State**
```javascript
const [sidebarExpanded, setSidebarExpanded] = useState({
  sales: true,        // Always open
  storytelling: false, // Closed by default
  analytics: false,
  content: false,
  settings: false,
});
```

### **Phase 3: Update CSS for Collapsible Sections**
- Section headers have expand/collapse arrow
- Smooth animations when toggling
- Remember preference in localStorage

---

## CSS Styling for "More" Section

```css
.admin-nav-section--primary {
  /* Always visible */
  opacity: 1;
  max-height: none;
  transition: none;
}

.admin-nav-section--secondary {
  /* Toggleable */
  overflow: hidden;
  max-height: 1000px;
  opacity: 1;
  transition: max-height 0.3s ease, opacity 0.3s ease;
}

.admin-nav-section--secondary.collapsed {
  max-height: 0;
  opacity: 0;
  pointer-events: none;
}

.admin-nav-section-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}

.admin-nav-section-toggle:hover {
  background: rgba(192, 77, 41, 0.05);
}

.admin-nav-section-arrow {
  transition: transform 0.3s ease;
}

.admin-nav-section-arrow.expanded {
  transform: rotate(180deg);
}
```

---

## Benefits

✅ **Less Cognitive Load** - Users see only what they need daily  
✅ **Faster Navigation** - 5 core items vs. 40  
✅ **Focus on Revenue** - Dashboard + Orders + Products prominence  
✅ **Admin Tools Hidden** - Settings/marketing don't distract from sales  
✅ **Scalable** - Can add more "More" sections later  
✅ **Pro Users Know Where to Look** - Experienced users find advanced features quickly  

---

## Implementation Checklist

- [ ] Update `navItems` structure with `tier`, `collapsible`, `defaultExpanded` flags
- [ ] Add `sidebarExpanded` state to AdminLayout
- [ ] Render conditional sections based on expanded state
- [ ] Add CSS animations for collapse/expand
- [ ] Save preference to localStorage
- [ ] Test on mobile (sidebar may need different behavior)
- [ ] Update icon system if needed (arrows, chevrons)
- [ ] Test keyboard accessibility (Enter/Space to toggle)

---

## Recommended Implementation: Option 1 (Collapsible "More")
- **Pros**: Clean, simple, user understands "More = Advanced"
- **Cons**: One extra click to access secondary features
- **Best for**: Users who focus on orders/sales primarily

Would you like me to implement this now?
