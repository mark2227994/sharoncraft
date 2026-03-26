// Mobile-specific UX enhancements
(function () {
  const isMobile = () => window.innerWidth <= 540;

  // Enhanced mobile menu behavior - auto-close on link click
  function setupMobileMenuClosing() {
    if (!isMobile()) return;

    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.site-nav');
    const navLinks = document.querySelectorAll('.site-nav a');

    if (!nav || !navToggle) return;

    // Close menu when clicking links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
        if (nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }

  // Collapsible filters on mobile shop page
  function setupCollapsibleFilters() {
    if (!isMobile()) return;

    const filterCard = document.querySelector('.filter-card');
    if (!filterCard) return;

    const filterGrid = document.querySelector('.filter-grid');
    if (!filterGrid) return;

    // Create collapsible header
    const header = document.createElement('button');
    header.className = 'filter-toggle';
    header.innerHTML = `
      <span>Filters & Sort</span>
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
    header.type = 'button';
    header.style.cssText = `
      width: 100%;
      padding: 0.75rem;
      margin: -0.85rem -0.85rem 0;
      border: none;
      background: rgba(217, 108, 72, 0.08);
      color: var(--deep-brown);
      border-radius: 16px 16px 0 0;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      font-size: 0.95rem;
      transition: all 0.2s;
    `;

    filterCard.insertBefore(header, filterGrid);

    // Toggle filter visibility
    let isOpen = true;
    header.addEventListener('click', () => {
      isOpen = !isOpen;
      filterGrid.style.display = isOpen ? 'flex' : 'none';
      header.querySelector('svg').style.transform = isOpen ? 'rotate(0)' : 'rotate(-180deg)';
      header.style.borderRadius = isOpen ? '16px 16px 0 0' : '16px';
      filterCard.style.borderRadius = isOpen ? 'var(--radius-lg)' : 'var(--radius-lg)';
    });
  }

  // Enhance touch feedback on buttons
  function setupTouchFeedback() {
    if (!isMobile()) return;

    const buttons = document.querySelectorAll('button, .button, a');
    buttons.forEach(btn => {
      btn.addEventListener('touchstart', () => {
        btn.style.opacity = '0.7';
      });

      btn.addEventListener('touchend', () => {
        btn.style.opacity = '1';
      });
    });
  }

  // Prevent zoom on input focus (mobile best practice)
  function preventInputZoom() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.style.fontSize = '16px'; // Prevents iOS zoom on focus
    });
  }

  // Smooth scroll for anchor links
  function setupSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Pull-to-refresh for product lists
  function setupPullToRefresh() {
    if (!isMobile()) return;

    const productGrids = document.querySelectorAll('.product-grid');
    productGrids.forEach(grid => {
      let startY = 0;
      let isRefreshing = false;

      grid.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
      });

      grid.addEventListener('touchmove', (e) => {
        if (isRefreshing || window.scrollY > 10) return;
        
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        if (diff > 80) {
          isRefreshing = true;
          // Trigger refresh
          window.location.reload();
        }
      });
    });
  }

  // Toast notification system for mobile feedback
  function setupToastNotifications() {
    // Create toast container
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      z-index: 1000;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);

    // Global toast function
    window.showToast = (message, type = 'info', duration = 3000) => {
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      toast.style.cssText = `
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 14px;
        font-weight: 500;
        pointer-events: auto;
        animation: toastSlideIn 0.3s ease-out;
      `;

      toastContainer.appendChild(toast);

      // Auto remove
      setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    };

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes toastSlideIn {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes toastSlideOut {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  window.addEventListener('resize', () => {
    const newBreakpoint = isMobile() ? 'mobile' : 'desktop';
    if (newBreakpoint !== currentBreakpoint) {
      currentBreakpoint = newBreakpoint;
      // Re-setup mobile features if needed
      if (newBreakpoint === 'mobile') {
        setupMobileMenuClosing();
        setupCollapsibleFilters();
        setupTouchFeedback();
      }
    }
  });

  // Quick view modal for products
  function setupQuickView() {
    if (!isMobile()) return;

    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent navigation if it's a quick view trigger
        if (e.target.closest('.product-card-link')) return;
        
        e.preventDefault();
        
        const productData = {
          image: card.querySelector('img')?.src,
          name: card.querySelector('.product-name')?.textContent,
          price: card.querySelector('.product-price')?.textContent,
          story: card.querySelector('.product-story')?.textContent
        };

        showQuickViewModal(productData);
      });
    });

    function showQuickViewModal(data) {
      const modal = document.createElement('div');
      modal.className = 'quick-view-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: fadeIn 0.3s ease-out;
      `;

      modal.innerHTML = `
        <div style="
          background: white;
          border-radius: 16px;
          max-width: 90vw;
          max-height: 80vh;
          overflow: auto;
          position: relative;
        ">
          <button class="modal-close" style="
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            z-index: 1;
          ">×</button>
          <img src="${data.image}" alt="${data.name}" style="width: 100%; height: auto; border-radius: 16px 16px 0 0;">
          <div style="padding: 16px;">
            <h3 style="margin: 0 0 8px 0; color: var(--deep-brown);">${data.name}</h3>
            <p style="color: var(--accent); font-weight: bold; margin: 0 0 12px 0;">${data.price}</p>
            <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.4;">${data.story}</p>
          </div>
        </div>
      `;

      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-close')) {
          modal.style.animation = 'fadeOut 0.3s ease-in';
          setTimeout(() => modal.remove(), 300);
        }
      });

      document.body.appendChild(modal);
    }

    // Add fade animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize all mobile features
  function init() {
    if (!isMobile()) return;

    setupMobileMenuClosing();
    setupCollapsibleFilters();
    setupTouchFeedback();
    preventInputZoom();
    setupSmoothScroll();
    setupImageOptimization();
    setupPullToRefresh();
    setupToastNotifications();
    setupQuickView();
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.MobileUX = {
    isMobile,
    init
  };
})();
