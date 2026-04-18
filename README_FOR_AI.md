# Technical Manifesto for AI Working on SharonCraft Codebase

## Code Standards
**Naming Conventions**  
- Components: PascalCase (e.g., `HeroBanner`, `ProductCard`)  
- Variables/Functions: camelCase (e.g., `siteContent`, `filterProducts`)  
- Folders: Descriptive names (e.g., `components`, `lib`, `public`)  
- File Extensions: `.jsx` for React components, `.css` for styles  

**Folder Structure**  
- `pages/`: Route-specific components (e.g., `pages/index.jsx` for homepage)  
- `components/`: Reusable UI elements (e.g., `components/Nav.jsx`)  
- `lib/`: Utility functions and data (e.g., `lib/products.js`)  
- `public/`: Static assets (e.g., images, manifest files)  

**Architectural Patterns**  
- Next.js Server-Side Rendering (SSR) for SEO  
- React Query for data fetching (`QueryClient` in `_app.jsx`)  
- Context API for state management (`CartProvider`)  

---

## UI Principles  
**Design System**  
- Spacing: Defined via CSS variables (e.g., `--space-6`, `--gutter`)  
- Color Palette: Primary (`#C04D29`), secondary (`#F9F6EE`), neutral tones  
- Typography: Custom styles in `typography.css`  

**Responsive Breakpoints**  
- Mobile: < 600px  
- Tablet: 600px–900px  
- Desktop: > 900px (used in `SeoHead.jsx` media queries)  

---

## Workflow Rules  
1. **Performance First**: Optimize images, lazy-load assets, minimize bundle size.  
2. **Maintain Existing Logic**: Avoid refactoring working code unless explicitly requested.  
3. **Consistency**: Follow naming conventions and folder structure strictly.  
4. **Testing**: Ensure changes pass existing functionality (e.g., SEO, cart flow).  

---

## Project Essence  
**What is SharonCraft?**  
An online marketplace for handmade Kenyan jewelry, gifts, and home decor.  

**Target Audience**  
Customers seeking authentic, culturally significant products with easy WhatsApp ordering.  

**Key Features**  
- Curated artisan collections  
- WhatsApp-based checkout  
- SEO-optimized product pages  

This manifesto ensures AI integrations align with the project’s existing structure, design, and goals.