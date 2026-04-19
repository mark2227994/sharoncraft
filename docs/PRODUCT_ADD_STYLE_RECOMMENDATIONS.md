/**
 * PRODUCT ADD TOOL - MODERN STYLE RECOMMENDATIONS
 * Modernizing the product creation experience for SharonCraft admin
 * 
 * Current issues:
 * - Traditional form feels dense and overwhelming
 * - Multiple sections scattered across page
 * - Image management is separate concern
 * - No clear visual feedback on progress
 * 
 * Recommended improvements:
 */

// ============================================================================
// STYLE 1: WIZARD-CARD STEPPER (RECOMMENDED)
// ============================================================================
// A horizontal stepper with card-based sections that feel like progress

export const WizardCardStyle = `
/* Hero intro card */
.product-wizard-intro {
  position: relative;
  overflow: hidden;
  padding: 2.5rem 2rem;
  margin-bottom: 2rem;
  border-radius: 20px;
  background: linear-gradient(135deg, 
    rgba(192, 77, 41, 0.08) 0%,
    rgba(31, 143, 128, 0.05) 100%
  );
  border: 1px solid rgba(192, 77, 41, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
}

.product-wizard-intro::before {
  content: '';
  position: absolute;
  top: -40%;
  right: -10%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(242, 201, 76, 0.15), transparent 70%);
  pointer-events: none;
}

/* Stepper header */
.product-wizard-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 2.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.product-wizard-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  min-width: 140px;
  position: relative;
}

.product-wizard-step::after {
  content: '';
  position: absolute;
  top: 32px;
  left: 100%;
  width: 32px;
  height: 2px;
  background: linear-gradient(90deg, 
    var(--border-default),
    transparent
  );
}

.product-wizard-step:last-child::after {
  display: none;
}

.product-wizard-step.active::after {
  background: linear-gradient(90deg, 
    #C04D29,
    rgba(192, 77, 41, 0.4)
  );
}

.product-wizard-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--border-default);
  background: white;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.product-wizard-step.active .product-wizard-circle {
  border-color: #C04D29;
  background: linear-gradient(135deg, rgba(192, 77, 41, 0.12), rgba(192, 77, 41, 0.04));
  color: #C04D29;
  box-shadow: 0 0 12px rgba(192, 77, 41, 0.2);
}

.product-wizard-step.completed .product-wizard-circle {
  border-color: #4CAF50;
  background: #4CAF50;
  color: white;
}

.product-wizard-label {
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  color: var(--text-muted);
  transition: color 0.3s ease;
}

.product-wizard-step.active .product-wizard-label {
  color: #C04D29;
  font-weight: 700;
}

/* Card sections */
.product-card-section {
  position: relative;
  overflow: hidden;
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 16px;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.9),
    rgba(255, 249, 236, 0.95)
  );
  border: 1px solid var(--border-default);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  animation: slideInUp 0.4s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.product-card-section.hidden {
  display: none;
}

/* Section header with icon */
.product-section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-default);
}

.product-section-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(192, 77, 41, 0.15), rgba(212, 165, 116, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #C04D29;
}

.product-section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.product-section-hint {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

/* Field organization */
.product-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.product-form-field {
  display: grid;
  gap: 0.6rem;
}

.product-form-field label {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.product-form-field.required label::after {
  content: '*';
  color: #C04D29;
  font-weight: 700;
}

.product-form-field input,
.product-form-field select,
.product-form-field textarea {
  width: 100%;
  padding: 0.875rem;
  border: 1.5px solid var(--border-default);
  border-radius: 10px;
  background: white;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.product-form-field input:focus,
.product-form-field select:focus,
.product-form-field textarea:focus {
  outline: none;
  border-color: #C04D29;
  box-shadow: 0 0 0 3px rgba(192, 77, 41, 0.1);
  background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(255, 249, 236, 0.5));
}

.product-form-field textarea {
  min-height: 120px;
  resize: vertical;
}

.product-form-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.4rem;
  line-height: 1.4;
}

.product-form-hint strong {
  color: var(--text-primary);
  font-weight: 600;
}

/* Action buttons */
.product-form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-default);
}

.product-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.product-btn--primary {
  background: linear-gradient(135deg, #C04D29, #a8400e);
  color: white;
  box-shadow: 0 4px 12px rgba(192, 77, 41, 0.25);
}

.product-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(192, 77, 41, 0.35);
}

.product-btn--secondary {
  background: white;
  color: var(--text-primary);
  border: 1.5px solid var(--border-default);
}

.product-btn--secondary:hover {
  border-color: #C04D29;
  background: linear-gradient(135deg, rgba(192, 77, 41, 0.05), transparent);
}

.product-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

/* Image upload with preview */
.product-image-upload {
  border: 2px dashed var(--border-default);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, 
    rgba(192, 77, 41, 0.02),
    rgba(31, 143, 128, 0.02)
  );
}

.product-image-upload:hover {
  border-color: #C04D29;
  background: linear-gradient(135deg, 
    rgba(192, 77, 41, 0.08),
    rgba(31, 143, 128, 0.04)
  );
}

.product-image-upload.active {
  border-color: #C04D29;
}

.product-image-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.product-image-thumb {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  aspect-ratio: 1;
  background: var(--border-default);
}

.product-image-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image-thumb-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.product-image-thumb:hover .product-image-thumb-remove {
  opacity: 1;
}

/* Success message */
.product-success-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05));
  border: 1.5px solid rgba(76, 175, 80, 0.3);
  color: #2e7d32;
  margin-bottom: 2rem;
  animation: slideInDown 0.4s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .product-wizard-step {
    min-width: 110px;
  }

  .product-card-section {
    padding: 1.5rem;
  }

  .product-form-grid {
    grid-template-columns: 1fr;
  }

  .product-form-actions {
    flex-direction: column-reverse;
  }

  .product-btn {
    width: 100%;
  }
}
`;

// ============================================================================
// STYLE 2: TIMELINE SIDEBAR (ALTERNATIVE)
// ============================================================================
// Left sidebar with timeline, right side content area

export const TimelineSidebarStyle = `
.product-wrapper {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  min-height: 100vh;
}

.product-timeline {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.product-timeline-item {
  position: relative;
  padding-left: 2rem;
  margin-bottom: 2rem;
}

.product-timeline-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: -2rem;
  width: 2px;
  background: var(--border-default);
}

.product-timeline-item:last-child::before {
  bottom: 0;
}

.product-timeline-dot {
  position: absolute;
  left: -0.75rem;
  top: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--border-default);
  cursor: pointer;
  transition: all 0.3s ease;
}

.product-timeline-item.active .product-timeline-dot {
  width: 2rem;
  height: 2rem;
  left: -1rem;
  border-color: #C04D29;
  background: #C04D29;
  box-shadow: 0 0 12px rgba(192, 77, 41, 0.3);
}

.product-timeline-item.completed .product-timeline-dot {
  background: #4CAF50;
  border-color: #4CAF50;
}

.product-timeline-label {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-muted);
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-timeline-item.active .product-timeline-label {
  color: #C04D29;
  font-weight: 700;
}

.product-content {
  min-width: 0;
}

@media (max-width: 1024px) {
  .product-wrapper {
    grid-template-columns: 1fr;
  }

  .product-timeline {
    position: relative;
    top: auto;
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
  }

  .product-timeline-item {
    padding-left: 0;
    margin-bottom: 0;
    min-width: 140px;
  }

  .product-timeline-item::before {
    display: none;
  }
}
`;

// ============================================================================
// STYLE 3: EXPANDABLE SECTIONS (SIMPLE)
// ============================================================================
// Like an accordion - clean, minimal

export const ExpandableSectionsStyle = `
.product-accordion {
  display: grid;
  gap: 1.25rem;
}

.product-accordion-item {
  border-radius: 14px;
  border: 1.5px solid var(--border-default);
  background: white;
  overflow: hidden;
  transition: all 0.3s ease;
}

.product-accordion-item:hover {
  border-color: rgba(192, 77, 41, 0.3);
}

.product-accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.9),
    rgba(255, 249, 236, 0.95)
  );
  transition: background 0.3s ease;
}

.product-accordion-header:hover {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.98),
    rgba(255, 249, 236, 1)
  );
}

.product-accordion-item.expanded .product-accordion-header {
  background: linear-gradient(135deg,
    rgba(192, 77, 41, 0.08),
    rgba(192, 77, 41, 0.04)
  );
  border-color: #C04D29;
}

.product-accordion-toggle {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(192, 77, 41, 0.1);
  border: none;
  color: #C04D29;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-accordion-item.expanded .product-accordion-toggle {
  background: #C04D29;
  color: white;
  transform: rotate(180deg);
}

.product-accordion-content {
  padding: 1.5rem;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  border-top: 1.5px solid var(--border-default);
}

.product-accordion-item.expanded .product-accordion-content {
  max-height: 2000px;
}
`;

// ============================================================================
// KEY RECOMMENDATIONS
// ============================================================================
/*
1. **WIZARD-CARD STYLE** (MOST RECOMMENDED)
   ✓ Feels like progress (completion visual)
   ✓ Less overwhelming than traditional form
   ✓ Clear step-by-step flow
   ✓ Beautiful animations
   ✓ Works great for new users

2. **TIMELINE SIDEBAR**
   ✓ Best for power users who know what they're doing
   ✓ Can jump to any step
   ✓ Responsive converts to horizontal
   ✓ Professional appearance

3. **EXPANDABLE SECTIONS**
   ✓ Simple implementation
   ✓ Minimal code changes needed
   ✓ Good for quick edits
   ✓ Less "wow factor"

SUGGESTED IMPLEMENTATION APPROACH:
- Use Style #1 (Wizard-Card) for the new product flow
- Keep Style #3 (Expandable) as fallback/mobile
- Add smooth transitions between steps
- Include progress indicators
- Show helpful hints on each step
- Persist form state (don't lose data on refresh)

COLOR SCHEME (existing):
- Primary: #C04D29 (terracotta)
- Secondary: #D4A574 (sand)
- Success: #4CAF50 (moss)
- Accent: #1ABC9C (teal)
- Background: #f9f6ee (cream)
- Text: #1a1a1a (ink)

UI COMPONENTS TO ADD:
- Step indicator badges (1, 2, 3, 4...)
- Progress bar showing completion %
- "Back" and "Next" navigation
- Autosave indicator
- Field validation messages
- Image drag-drop upload
- Bulk action buttons

FLOW RECOMMENDATION:
Step 1: Basic Info (name, slug, category, type)
Step 2: Images (gallery upload, arrangement)
Step 3: Description (details, materials, dimensions)
Step 4: Pricing & Inventory (price, stock, artisan)
Step 5: Advanced (SEO, relations, special flags)
Step 6: Review (preview before save)
*/
