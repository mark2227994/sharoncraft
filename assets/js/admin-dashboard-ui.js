document.addEventListener("DOMContentLoaded", function () {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const formatCurrency = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 });
  const els = {
    sidebar: $("#admin-sidebar"),
    sidebarToggle: $("#admin-sidebar-toggle"),
    mobileMenu: $("#admin-mobile-menu"),
    sidebarLinks: $$("[data-admin-sidebar-target]"),
    tabButtons: $$("[data-admin-tab]"),
    topbarSearch: $("#admin-topbar-search"),
    globalSearch: $("#admin-global-search"),
    tabSearch: $("#admin-tab-search"),
    overlay: $("#admin-overlay"),
    notificationButton: $("#admin-topbar-notifications"),
    notificationBadge: $("#admin-topbar-alert-count"),
    notificationDrawer: $("#admin-notification-drawer"),
    notificationList: $("#admin-notification-list"),
    notificationClose: $("#admin-notification-close"),
    commandButton: $("#admin-command-open"),
    commandHint: $("#admin-command-open kbd"),
    commandPalette: $("#admin-command-palette"),
    commandInput: $("#admin-command-input"),
    commandResults: $("#admin-command-results-list"),
    commandClose: $("#admin-command-close"),
    chartCanvas: $("#admin-dashboard-chart"),
    chartTooltip: $("#admin-dashboard-chart-tooltip"),
    chartInsights: $("#admin-dashboard-chart-insights"),
    chartTotal: $("#admin-dashboard-chart-total"),
    chartCaption: $("#admin-dashboard-chart-caption"),
    chartRangeButtons: $$("[data-dashboard-range]"),
    chartMetricButtons: $$("[data-dashboard-metric]"),
    dashboardOverview: $("#admin-dashboard-overview"),
    settingsShortcuts: $("#admin-settings-shortcuts"),
    recentOrders: $("#admin-dashboard-orders"),
    saveButton: $("#admin-save")
  };
  const tabGroups = {
    products: new Set(["workspace", "catalog", "categories", "visuals", "preview", "assets"]),
    selling: new Set(["orders", "customers", "delivery", "mpesa", "operations", "profit", "bundles"]),
    marketing: new Set(["analytics", "social", "replies"])
  };
  let overlayMode = "";
  let commandItems = [];
  let filteredCommands = [];
  let activeCommandIndex = 0;
  let notificationItems = [];
  let chartState = { range: "weekly", metric: "revenue", points: [], coords: [], hover: -1, raf: 0 };
  const commandShortcutLabel = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent) ? "Cmd K" : "Ctrl K";

  const json = (key, fallback) => {
    try {
      const raw = window.localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : fallback;
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  };
  const storageKey = () => ((window.SharonCraftStorage || {}).storageKey || "sharoncraft-admin-catalog");
  const loadCatalog = () => {
    const fallback =
      (window.SharonCraftDefaultData && Array.isArray(window.SharonCraftDefaultData.products) && window.SharonCraftDefaultData.products) ||
      (window.SharonCraftData && Array.isArray(window.SharonCraftData.products) && window.SharonCraftData.products) ||
      [];
    const saved = json(storageKey(), fallback);
    return Array.isArray(saved) ? saved : fallback;
  };
  const loadOrders = () => {
    const saved = json("sharoncraft-orders", []);
    return Array.isArray(saved) ? saved : [];
  };
  const loadEvents = () => {
    const saved = json("sharoncraft-analytics-events", []);
    return Array.isArray(saved) ? saved : [];
  };
  const n = (value) => Number(value) || 0;
  const d = (value) => {
    const parsed = value ? new Date(value) : new Date();
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  };
  const orderDate = (order) => d(order.updatedAt || order.createdAt || order.date || order.orderDate || "");
  const initials = (value) => {
    const parts = String(value || "SC").trim().split(/\s+/).filter(Boolean).slice(0, 2);
    return parts.length ? parts.map((part) => part[0].toUpperCase()).join("") : "SC";
  };
  const status = (value) => {
    const normalized = String(value || "new").trim().toLowerCase();
    return ["paid", "delivered", "new", "confirmed", "cancelled"].includes(normalized) ? normalized : "new";
  };
  const shortDate = (value) => d(value).toLocaleDateString("en-KE", { day: "numeric", month: "short" });
  const availableStock = (product) => Math.max(0, n(product && product.stockQty) - n(product && product.reservedQty));

  function sidebarTarget(tab) {
    if (tabGroups.products.has(tab)) return "workspace";
    if (tabGroups.selling.has(tab)) return tab === "customers" ? "customers" : "orders";
    if (tabGroups.marketing.has(tab)) return tab === "analytics" ? "analytics" : "settings";
    return "dashboard";
  }

  function setSidebarActive(target) {
    els.sidebarLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.adminSidebarTarget === target));
    
    const groupName = target === "workspace" ? "products" :
                      target === "orders" || target === "customers" ? "selling" :
                      target === "analytics" || target === "settings" ? "marketing" : "none";
                      
    const groups = document.querySelectorAll(".admin-tab-group");
    groups.forEach(g => {
      g.style.display = g.dataset.adminGroup === groupName ? "block" : "none";
    });
    
    const tabBar = document.querySelector(".admin-tab-bar");
    if (tabBar) {
      tabBar.style.display = groupName === "none" ? "none" : "";
    }
  }

  function closeSidebarOnMobile() {
    if (window.innerWidth <= 1024) document.body.classList.remove("admin-sidebar-open");
  }

  function activateTab(tab, options = {}) {
    const button = document.querySelector(`.admin-tab-button[data-admin-tab="${tab}"]`);
    const panel = document.querySelector(`[data-admin-panel="${tab}"]`);
    if (button) button.click();
    requestAnimationFrame(function () {
      if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
      if (options.targetId) {
        const field = document.getElementById(options.targetId);
        if (field) {
          field.value = String(options.value || "");
          field.dispatchEvent(new Event("input", { bubbles: true }));
          field.dispatchEvent(new Event("change", { bubbles: true }));
          field.focus();
        }
      }
    });
  }

  function openOverlay(mode) {
    if (els.notificationDrawer) {
      els.notificationDrawer.classList.remove("is-open");
      els.notificationDrawer.setAttribute("aria-hidden", "true");
    }
    if (els.commandPalette) {
      els.commandPalette.classList.remove("is-open");
      els.commandPalette.setAttribute("aria-hidden", "true");
    }
    overlayMode = mode;
    if (els.overlay) els.overlay.hidden = false;
    document.body.classList.add("admin-modal-open");
  }

  function closeOverlay() {
    overlayMode = "";
    if (els.overlay) els.overlay.hidden = true;
    if (els.notificationDrawer) {
      els.notificationDrawer.classList.remove("is-open");
      els.notificationDrawer.setAttribute("aria-hidden", "true");
    }
    if (els.commandPalette) {
      els.commandPalette.classList.remove("is-open");
      els.commandPalette.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("admin-modal-open");
  }

  function goDashboard() {
    setSidebarActive("dashboard");
    if (els.dashboardOverview) els.dashboardOverview.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goSettings() {
    setSidebarActive("settings");
    if (els.settingsShortcuts) els.settingsShortcuts.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function syncSearch(value) {
    const next = String(value || "");
    if (els.globalSearch) {
      els.globalSearch.value = next;
      els.globalSearch.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (els.tabSearch) {
      els.tabSearch.value = next;
      els.tabSearch.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  if (els.commandHint) els.commandHint.textContent = commandShortcutLabel;
  if (els.commandButton) els.commandButton.setAttribute("aria-label", `Open command palette (${commandShortcutLabel})`);

  function chartSeries(range, orders) {
    const now = new Date();
    const paid = new Set(["paid", "delivered"]);
    const points = [];
    if (range === "monthly") {
      for (let i = 5; i >= 0; i -= 1) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
        const bucket = orders.filter((order) => {
          const date = orderDate(order);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` === key;
        });
        points.push({
          label: month.toLocaleDateString("en-KE", { month: "short" }),
          revenue: bucket.reduce((sum, order) => sum + (paid.has(status(order.status)) ? n(order.orderTotal) : 0), 0),
          orders: bucket.length
        });
      }
    } else {
      for (let i = 6; i >= 0; i -= 1) {
        const day = new Date(now);
        day.setHours(0, 0, 0, 0);
        day.setDate(now.getDate() - i);
        const bucket = orders.filter((order) => orderDate(order).toDateString() === day.toDateString());
        points.push({
          label: day.toLocaleDateString("en-KE", { weekday: "short" }),
          revenue: bucket.reduce((sum, order) => sum + (paid.has(status(order.status)) ? n(order.orderTotal) : 0), 0),
          orders: bucket.length
        });
      }
    }
    return points;
  }

  function drawChart(progress) {
    if (!els.chartCanvas) return;
    const canvas = els.chartCanvas;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(Math.floor(rect.width || canvas.width || 920), 320);
    const height = Math.max(Math.floor(rect.height || canvas.height || 320), 220);
    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    const padding = { top: 22, right: 18, bottom: 34, left: 18 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const baseY = padding.top + chartHeight;
    const key = chartState.metric;
    const maxValue = Math.max(...chartState.points.map((point) => n(point[key])), 1);
    const maxOrders = Math.max(...chartState.points.map((point) => n(point.orders)), 1);
    const stepX = chartState.points.length > 1 ? chartWidth / (chartState.points.length - 1) : chartWidth;
    const accent = key === "orders" ? "#24936d" : "#d96c48";
    const fill = key === "orders" ? "rgba(36, 147, 109, 0.2)" : "rgba(217, 108, 72, 0.26)";

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(95, 74, 61, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i += 1) {
      const y = padding.top + (chartHeight / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    chartState.coords = chartState.points.map((point, index) => {
      const value = n(point[key]) * progress;
      const x = padding.left + stepX * index;
      const y = baseY - (value / maxValue) * chartHeight;
      return { x, y, label: point.label, revenue: n(point.revenue), orders: n(point.orders) };
    });

    const barWidth = Math.max(Math.min(stepX * 0.42, 44), 16);
    chartState.coords.forEach((point, index) => {
      const barHeight = (n(chartState.points[index].orders) / maxOrders) * chartHeight * 0.55;
      const barGradient = ctx.createLinearGradient(0, baseY - barHeight, 0, baseY);
      barGradient.addColorStop(0, key === "orders" ? "rgba(36, 147, 109, 0.28)" : "rgba(242, 201, 76, 0.28)");
      barGradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = barGradient;
      ctx.beginPath();
      ctx.roundRect(point.x - barWidth / 2, baseY - barHeight, barWidth, barHeight, 14);
      ctx.fill();
    });

    const area = ctx.createLinearGradient(0, padding.top, 0, baseY);
    area.addColorStop(0, fill);
    area.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = area;
    ctx.beginPath();
    chartState.coords.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.lineTo(chartState.coords[chartState.coords.length - 1].x, baseY);
    ctx.lineTo(chartState.coords[0].x, baseY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    chartState.coords.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.stroke();

    if (chartState.hover >= 0 && chartState.coords[chartState.hover]) {
      const hover = chartState.coords[chartState.hover];
      ctx.strokeStyle = "rgba(95, 74, 61, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hover.x, padding.top);
      ctx.lineTo(hover.x, baseY);
      ctx.stroke();
    }

    chartState.coords.forEach((point, index) => {
      const hovered = index === chartState.hover;
      ctx.fillStyle = "#fffaf5";
      ctx.beginPath();
      ctx.arc(point.x, point.y, hovered ? 7 : 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = hovered ? 3 : 2;
      ctx.beginPath();
      ctx.arc(point.x, point.y, hovered ? 7 : 5.5, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.fillStyle = "#7a6b5f";
    ctx.font = '700 12px "Nunito", sans-serif';
    ctx.textAlign = "center";
    chartState.coords.forEach((point) => ctx.fillText(point.label, point.x, height - 10));
  }

  function animateChart() {
    const start = performance.now();
    if (chartState.raf) cancelAnimationFrame(chartState.raf);
    const loop = (time) => {
      const raw = Math.min((time - start) / 480, 1);
      const eased = 1 - Math.pow(1 - raw, 3);
      drawChart(eased);
      if (raw < 1) chartState.raf = requestAnimationFrame(loop);
    };
    chartState.raf = requestAnimationFrame(loop);
  }

  function setChartTooltip(index) {
    if (!els.chartTooltip || !chartState.coords[index]) return;
    chartState.hover = index;
    drawChart(1);
    const point = chartState.coords[index];
    const primary = chartState.metric === "revenue" ? formatCurrency.format(point.revenue) : `${point.orders} orders`;
    const secondary = chartState.metric === "revenue" ? `${point.orders} orders` : `${formatCurrency.format(point.revenue)} paid revenue`;
    els.chartTooltip.innerHTML = `<strong>${point.label}</strong><span>${primary}</span><small>${secondary}</small>`;
    els.chartTooltip.style.left = `${point.x}px`;
    els.chartTooltip.style.top = `${point.y}px`;
    els.chartTooltip.hidden = false;
  }

  function hideChartTooltip() {
    chartState.hover = -1;
    if (els.chartTooltip) els.chartTooltip.hidden = true;
    if (chartState.points.length) drawChart(1);
  }

  function renderChart(orders) {
    chartState.points = chartSeries(chartState.range, orders);
    chartState.hover = -1;
    const totalValue = chartState.points.reduce((sum, point) => sum + n(point[chartState.metric]), 0);
    const totalOrders = chartState.points.reduce((sum, point) => sum + n(point.orders), 0);
    if (els.chartTotal) els.chartTotal.textContent = chartState.metric === "revenue" ? formatCurrency.format(totalValue) : `${totalValue} total orders`;
    if (els.chartCaption) {
      els.chartCaption.textContent =
        chartState.metric === "revenue"
          ? chartState.range === "monthly"
            ? `${totalOrders} orders contributed to paid revenue across the last 6 months.`
            : `${totalOrders} orders contributed to paid revenue across the last 7 days.`
          : chartState.range === "monthly"
            ? "Order volume across the last 6 months with revenue context in the tooltip."
            : "Order volume across the last 7 days with revenue context in the tooltip.";
    }
    if (els.chartInsights) {
      const key = chartState.metric;
      const total = chartState.points.reduce((sum, point) => sum + n(point[key]), 0);
      const average = chartState.points.length ? total / chartState.points.length : 0;
      const peak = chartState.points.reduce((best, point) => (n(point[key]) > n(best[key]) ? point : best), chartState.points[0] || { label: "Now", revenue: 0, orders: 0 });
      const insights = [
        chartState.metric === "revenue" ? `Peak ${peak.label}: ${formatCurrency.format(n(peak.revenue))}` : `Peak ${peak.label}: ${n(peak.orders)} orders`,
        chartState.metric === "revenue" ? `Average: ${formatCurrency.format(average)}` : `Average: ${Math.round(average * 10) / 10} orders`,
        chartState.range === "monthly" ? "Window: last 6 months" : "Window: last 7 days"
      ];
      els.chartInsights.innerHTML = insights.map((item) => `<span class="admin-dashboard-chart-insight">${item}</span>`).join("");
    }
    animateChart();
    hideChartTooltip();
  }

  function renderRecentOrders(orders) {
    if (!els.recentOrders) return;
    const items = orders.slice().sort((a, b) => orderDate(b).getTime() - orderDate(a).getTime()).slice(0, 5);
    els.recentOrders.innerHTML = items.length
      ? items.map((order) => `
          <button class="admin-dashboard-order-item" type="button" data-dashboard-order-query="${String(order.orderId || order.id || order.customer || "")}">
            <span class="admin-dashboard-order-avatar">${initials(order.customer || "SC")}</span>
            <span class="admin-dashboard-order-copy">
              <strong>${String(order.customer || "Customer")}</strong>
              <span>${String(order.productName || "SharonCraft order")}</span>
              <small>${shortDate(orderDate(order))}</small>
            </span>
            <span class="admin-dashboard-order-amount">
              <strong>${formatCurrency.format(n(order.orderTotal))}</strong>
              <span class="admin-dashboard-order-status is-${status(order.status)}">${status(order.status)}</span>
            </span>
          </button>
        `).join("")
      : '<div class="admin-dashboard-empty">No recent orders yet. Add or sync orders to see live activity here.</div>';
  }

  function buildNotifications(catalog, orders, events) {
    const items = [];
    orders.filter((order) => ["new", "confirmed"].includes(status(order.status))).slice(0, 4).forEach((order) => {
      const ageHours = Math.max(0, Math.round((Date.now() - orderDate(order).getTime()) / (1000 * 60 * 60)));
      items.push({
        tag: status(order.status) === "new" ? "New Order" : "Confirm",
        className: "is-urgent",
        title: String(order.customer || "Customer order"),
        copy: `${String(order.productName || "Product")} needs follow-up${order.phone ? ` | ${order.phone}` : ""}.`,
        meta: `${String(order.orderId || order.id || "")} | ${shortDate(orderDate(order))}`,
        actionLabel: "Open Orders",
        score: (status(order.status) === "new" ? 120 : 100) + Math.min(ageHours, 24),
        action: () => {
          setSidebarActive("orders");
          activateTab("orders", { targetId: "admin-order-search", value: order.orderId || order.id || order.customer || "" });
        }
      });
    });
    catalog
      .filter((product) => n(product.stockQty) > 0 || n(product.reservedQty) > 0)
      .map((product) => ({ ...product, availableStock: availableStock(product) }))
      .filter((product) => product.availableStock <= 3)
      .sort((a, b) => a.availableStock - b.availableStock)
      .slice(0, 3)
      .forEach((product) => {
        items.push({
          tag: product.availableStock === 0 ? "Out" : "Low Stock",
          className: "is-warn",
          title: String(product.name || "Catalog item"),
          copy: `${product.availableStock} item${product.availableStock === 1 ? "" : "s"} available in tracked stock.`,
          meta: `${formatCurrency.format(n(product.price))} | ${String(product.category || "catalog").replace(/-/g, " ")}`,
          actionLabel: "Open Products",
          score: product.availableStock === 0 ? 95 : 75 - Math.min(product.availableStock, 3),
          action: () => {
            setSidebarActive("workspace");
            activateTab("catalog", { targetId: "admin-product-search", value: product.name || "" });
          }
        });
      });
    const recentEvents = events.filter((event) => Date.now() - d(event && event.timestamp).getTime() <= 1000 * 60 * 60 * 24 * 7);
    const taps = recentEvents.filter((event) => String(event && event.name || "") === "whatsapp_click").length;
    if (recentEvents.length || taps) {
      items.push({
        tag: "Live",
        className: "is-live",
        title: `${taps} WhatsApp taps this week`,
        copy: `${recentEvents.length} storefront activity events were captured in the last 7 days.`,
        meta: "Traffic pulse from the live storefront",
        actionLabel: "Open Analytics",
        score: 30 + Math.min(taps, 20),
        action: () => {
          setSidebarActive("analytics");
          activateTab("analytics");
        }
      });
    }
    return items.length ? items.sort((left, right) => right.score - left.score).slice(0, 6) : [{
      tag: "Clear",
      className: "is-live",
      title: "Nothing urgent right now",
      copy: "Pending orders are clear and no tracked stock items are low.",
      meta: "The drawer will refill as activity comes in.",
      actionLabel: "View Dashboard",
      score: 0,
      action: goDashboard
    }];
  }

  function renderNotifications(catalog, orders, events) {
    if (!els.notificationList) return;
    notificationItems = buildNotifications(catalog, orders, events);
    els.notificationList.innerHTML = notificationItems.map((item, index) => `
      <article class="admin-notification-card">
        <div class="admin-notification-card-head">
          <strong>${item.title}</strong>
          <span class="admin-notification-tag ${item.className}">${item.tag}</span>
        </div>
        <p>${item.copy}</p>
        <small>${item.meta}</small>
        <button class="admin-notification-action" type="button" data-notification-index="${index}">${item.actionLabel}</button>
      </article>
    `).join("");
    if (els.notificationBadge) {
      const actionableCount = notificationItems.filter((item) => item.tag !== "Clear").length;
      els.notificationBadge.textContent = String(Math.min(actionableCount, 99));
      els.notificationBadge.hidden = actionableCount === 0;
    }
  }

  function openNotifications() {
    if (!els.notificationDrawer) return;
    openOverlay("notifications");
    els.notificationDrawer.classList.add("is-open");
    els.notificationDrawer.setAttribute("aria-hidden", "false");
  }

  function command(title, description, tag, action, extra = "") {
    return { title, description, tag, action, haystack: `${title} ${description} ${tag} ${extra}`.toLowerCase(), icon: String(tag || title).slice(0, 2).toUpperCase() };
  }

  function renderCommandResults() {
    if (!els.commandResults) return;
    els.commandResults.innerHTML = filteredCommands.length
      ? filteredCommands.map((item, index) => `
          <button class="admin-command-option ${index === activeCommandIndex ? "is-active" : ""}" type="button" data-command-index="${index}">
            <span class="admin-command-option-icon">${item.icon}</span>
            <span class="admin-command-option-copy">
              <strong>${item.title}</strong>
              <span>${item.description}</span>
            </span>
            <span class="admin-command-option-tag">${item.tag}</span>
          </button>
        `).join("")
      : '<div class="admin-dashboard-empty">No quick action matched that search. Try products, order IDs, customers, analytics, or save.</div>';
  }

  function rebuildCommands(catalog, orders) {
    const staticItems = [
      command("Dashboard Overview", "Return to the premium summary screen", "Home", goDashboard),
      command("Save All Product Changes", "Run the main save action for catalog updates", "Action", () => els.saveButton && els.saveButton.click()),
      command("Open Storefront", "Launch the live customer-facing site in a new tab", "Open", () => window.open("index.html", "_blank", "noopener")),
      command("Phone Preview", "Jump to the mobile storefront preview", "Preview", () => { setSidebarActive("workspace"); activateTab("preview"); }),
      command("Settings Shortcuts", "Open image repair, social, and restore tools", "Settings", goSettings),
      command("Focus Global Search", "Jump into the admin-wide search panel", "Search", () => { goDashboard(); els.globalSearch && els.globalSearch.focus(); }),
      command("Open Notifications", "Review pending orders and low-stock alerts", "Alerts", openNotifications)
    ];
    const tabItems = els.tabButtons.map((button) => command(
      button.querySelector("span") ? button.querySelector("span").textContent.trim() : String(button.dataset.adminTab || "Section"),
      button.querySelector("small") ? button.querySelector("small").textContent.trim() : "Open admin section",
      "Section",
      () => { setSidebarActive(sidebarTarget(button.dataset.adminTab || "")); activateTab(button.dataset.adminTab || ""); },
      button.dataset.adminTab || ""
    ));
    const productItems = catalog.slice(0, 8).map((product) => command(
      String(product.name || "Product"),
      `${String(product.category || "catalog").replace(/-/g, " ")} | ${formatCurrency.format(n(product.price))}`,
      "Product",
      () => { setSidebarActive("workspace"); activateTab("catalog", { targetId: "admin-product-search", value: product.name || "" }); },
      `${product.category || ""} ${product.badge || ""}`
    ));
    const orderItems = orders.slice().sort((a, b) => orderDate(b) - orderDate(a)).slice(0, 8).map((order) => command(
      String(order.orderId || order.id || order.customer || "Order"),
      `${String(order.customer || "Customer")} | ${String(order.productName || "Product")}`,
      "Order",
      () => { setSidebarActive("orders"); activateTab("orders", { targetId: "admin-order-search", value: order.orderId || order.id || order.customer || "" }); },
      `${order.phone || ""} ${order.areaName || ""} ${order.status || ""}`
    ));
    const customerItems = orders
      .slice()
      .sort((a, b) => orderDate(b) - orderDate(a))
      .filter((order, index, list) => {
        const key = String(order.phone || order.customer || "").trim().toLowerCase();
        return key && list.findIndex((item) => String(item.phone || item.customer || "").trim().toLowerCase() === key) === index;
      })
      .slice(0, 6)
      .map((order) => command(
        String(order.customer || order.phone || "Customer"),
        "Customer detail and repeat buyer insights",
        "Customer",
        () => { setSidebarActive("customers"); activateTab("customers", { targetId: "admin-customer-search", value: order.customer || order.phone || "" }); },
        `${order.phone || ""} ${order.productName || ""}`
      ));
    commandItems = staticItems.concat(tabItems, productItems, orderItems, customerItems);
    filterCommands(els.commandInput ? els.commandInput.value : "");
  }

  function filterCommands(query) {
    const needle = String(query || "").trim().toLowerCase();
    filteredCommands = !needle ? commandItems.slice(0, 14) : commandItems.filter((item) => item.haystack.includes(needle)).slice(0, 14);
    activeCommandIndex = Math.min(activeCommandIndex, Math.max(filteredCommands.length - 1, 0));
    renderCommandResults();
  }

  function openCommands() {
    if (!els.commandPalette) return;
    openOverlay("commands");
    els.commandPalette.classList.add("is-open");
    els.commandPalette.setAttribute("aria-hidden", "false");
    if (els.commandInput) {
      els.commandInput.value = "";
      activeCommandIndex = 0;
      filterCommands("");
      els.commandInput.focus();
    }
  }

  function runCommand(index) {
    const item = filteredCommands[index];
    if (!item) return;
    closeOverlay();
    item.action();
    closeSidebarOnMobile();
  }

  function renderDashboard() {
    const catalog = loadCatalog();
    const orders = loadOrders();
    const events = loadEvents();
    renderRecentOrders(orders);
    renderNotifications(catalog, orders, events);
    renderChart(orders);
    rebuildCommands(catalog, orders);
  }

  els.sidebarLinks.forEach((link) => link.addEventListener("click", function () {
    const target = link.dataset.adminSidebarTarget || "dashboard";
    setSidebarActive(target);
    if (target === "dashboard") return void (goDashboard(), closeSidebarOnMobile());
    if (target === "settings") return void (goSettings(), closeSidebarOnMobile());
    activateTab(target);
    closeSidebarOnMobile();
  }));

  if (els.sidebarToggle) els.sidebarToggle.addEventListener("click", function () {
    if (window.innerWidth <= 1024) return void document.body.classList.toggle("admin-sidebar-open");
    document.body.classList.toggle("admin-sidebar-collapsed");
  });
  if (els.mobileMenu) els.mobileMenu.addEventListener("click", function () { document.body.classList.toggle("admin-sidebar-open"); });
  if (els.topbarSearch) els.topbarSearch.addEventListener("input", function () { syncSearch(els.topbarSearch.value); });
  if (els.notificationButton) els.notificationButton.addEventListener("click", openNotifications);
  if (els.notificationClose) els.notificationClose.addEventListener("click", closeOverlay);
  if (els.commandButton) els.commandButton.addEventListener("click", openCommands);
  if (els.commandClose) els.commandClose.addEventListener("click", closeOverlay);
  if (els.overlay) els.overlay.addEventListener("click", closeOverlay);

  if (els.notificationList) els.notificationList.addEventListener("click", function (event) {
    const button = event.target.closest("[data-notification-index]");
    if (!button) return;
    const item = notificationItems[Number(button.dataset.notificationIndex)];
    if (item) {
      closeOverlay();
      item.action();
    }
  });

  if (els.commandInput) {
    els.commandInput.addEventListener("input", function () {
      activeCommandIndex = 0;
      filterCommands(els.commandInput.value);
    });
    els.commandInput.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        activeCommandIndex = Math.min(activeCommandIndex + 1, Math.max(filteredCommands.length - 1, 0));
        renderCommandResults();
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        activeCommandIndex = Math.max(activeCommandIndex - 1, 0);
        renderCommandResults();
      }
      if (event.key === "Enter") {
        event.preventDefault();
        runCommand(activeCommandIndex);
      }
    });
  }

  if (els.commandResults) els.commandResults.addEventListener("click", function (event) {
    const button = event.target.closest("[data-command-index]");
    if (button) runCommand(Number(button.dataset.commandIndex));
  });

  els.chartRangeButtons.forEach((button) => button.addEventListener("click", function () {
    chartState.range = button.dataset.dashboardRange === "monthly" ? "monthly" : "weekly";
    els.chartRangeButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    renderChart(loadOrders());
  }));

  els.chartMetricButtons.forEach((button) => button.addEventListener("click", function () {
    chartState.metric = button.dataset.dashboardMetric === "orders" ? "orders" : "revenue";
    els.chartMetricButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    renderChart(loadOrders());
  }));

  if (els.chartCanvas) {
    els.chartCanvas.addEventListener("mousemove", function (event) {
      const rect = els.chartCanvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      let hit = -1;
      let distance = Number.POSITIVE_INFINITY;
      chartState.coords.forEach((point, index) => {
        const delta = Math.abs(point.x - x);
        if (delta < distance) {
          distance = delta;
          hit = index;
        }
      });
      if (hit >= 0 && distance <= 36) return void setChartTooltip(hit);
      hideChartTooltip();
    });
    els.chartCanvas.addEventListener("mouseleave", hideChartTooltip);
  }

  if (els.recentOrders) els.recentOrders.addEventListener("click", function (event) {
    const button = event.target.closest("[data-dashboard-order-query]");
    if (!button) return;
    setSidebarActive("orders");
    activateTab("orders", { targetId: "admin-order-search", value: button.dataset.dashboardOrderQuery || "" });
  });

  document.addEventListener("click", function (event) {
    const tabButton = event.target.closest("[data-admin-tab]");
    if (tabButton) setSidebarActive(sidebarTarget(tabButton.dataset.adminTab || ""));
  });

  document.addEventListener("click", function (event) {
    if (!els.sidebar || window.innerWidth > 1024) return;
    if (!event.target.closest("#admin-sidebar") && !event.target.closest("#admin-mobile-menu")) closeSidebarOnMobile();
  });

  document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      return overlayMode === "commands" ? closeOverlay() : openCommands();
    }
    if (event.key === "Escape" && overlayMode) closeOverlay();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 1024) document.body.classList.remove("admin-sidebar-open");
    renderChart(loadOrders());
  });

  window.addEventListener("sharoncraft:admin-refresh", renderDashboard);
  renderDashboard();
});
