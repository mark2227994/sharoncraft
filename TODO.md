# Shop Sidebar Accordion Refactor — TODO

## Step 1: Update category data (`data/site.js`)
- [x] Update `shopCategoryTree` to match exact hierarchy from spec
- [x] Remove deep earring nesting (hoop/drop/stud children)
- [x] Remove "Beaded Hair Accessories" from Accessories
- [x] Reorder Gifted Carry subcategories to: Gift Sets, Gift Wrapping, Custom Gift Boxes

## Step 2: Refactor `components/ShopSidebar.jsx`
- [x] Replace `expanded` Set state with single `expandedCategory: string | null`
- [x] Implement accordion toggle (only one parent open at a time)
- [x] Default `expandedCategory` from `activeChain` / URL on load
- [x] Update parent category markup and styling (arrow rotation, active state)
- [x] Update subcategory list markup and styling
- [x] Update section labels (Collection, Availability, Price Range)
- [x] Restyle Availability to plain text flex with underline active state
- [x] Restyle Price Range to match parent link styling
- [x] Restyle Clear All to uppercase whisper link
- [x] Ensure CSS transitions are `0.3s ease` only
- [x] Preserve mobile drawer behavior

## Step 3: Verify `pages/shop.jsx` compatibility
- [x] Confirm state props and callbacks remain compatible
- [x] Fix syntax error (missing ternary closing `)}` after product catalog)

## Step 4: Test
- [x] Build compiles successfully (Next.js 16.2.3 + Turbopack)
- [ ] Desktop: accordion expand/collapse, active states, transitions
- [ ] Mobile: drawer opens/closes, filters apply correctly
- [ ] URL params: `?category=Jewellery` expands Jewellery on load

## Final Status
All code changes complete and building successfully. Manual browser testing recommended for desktop/mobile interaction verification.

