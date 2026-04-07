document.addEventListener("DOMContentLoaded", async function () {
  const $ = function (id) { return document.getElementById(id); };
  const authView = $("marketing-auth");
  const appView = $("marketing-app");
  const authStatus = $("marketing-auth-status");
  const appStatus = $("marketing-app-status");
  const productSearch = $("marketing-product-search");
  const productPicks = $("marketing-product-picks");
  const summaryWrap = $("marketing-summary");
  const planWrap = $("marketing-plan");
  const productImage = $("marketing-product-image");
  const productKicker = $("marketing-product-kicker");
  const productName = $("marketing-product-name");
  const productStory = $("marketing-product-story");
  const anglePicker = $("marketing-angle-picker");
  const angleNote = $("marketing-angle-note");
  const instagramCopy = $("marketing-copy-instagram");
  const whatsappCopy = $("marketing-copy-whatsapp");
  const statusCopy = $("marketing-copy-status");
  const linkCopy = $("marketing-copy-link");
  const videoHook = $("marketing-video-hook");
  const videoCaption = $("marketing-video-caption");
  const videoShots = $("marketing-video-shots");
  const videoOverlay = $("marketing-video-overlay");
  const videoVoiceover = $("marketing-video-voiceover");
  const videoCta = $("marketing-video-cta");
  const pushWrap = $("marketing-push-today");
  const needsWrap = $("marketing-opportunities");
  const ordersWrap = $("marketing-orders");
  const topProductsWrap = $("marketing-top-products");
  const topPagesWrap = $("marketing-top-pages");
  const refreshProductsButton = $("marketing-refresh-products");
  const refreshOrdersButton = $("marketing-refresh-orders");
  const refreshAnalyticsButton = $("marketing-refresh-analytics");
  const loginForm = $("marketing-login-form");
  const emailInput = $("marketing-email");
  const passwordInput = $("marketing-password");
  const signOutButton = $("marketing-sign-out");
  const liveChip = $("marketing-live-chip");
  const rangeButtons = Array.from(document.querySelectorAll("[data-marketing-range]"));
  const catalogApi = window.SharonCraftCatalog || null;
  const userController = window.SharonCraftUserController || null;
  let products = [];
  let orders = [];
  let events = [];
  let selectedId = "";
  let currentAngle = "gift";
  let currentRange = "7d";
  let currentUser = null;

  function t(v) { return String(v || "").trim(); }
  function h(v) { return String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
  function short(v, n) { v = t(v); return !v || v.length <= n ? v : v.slice(0, Math.max(0, n - 3)).trim() + "..."; }
  function slug(v) { return t(v).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "product"; }
  function money(v) { return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(Number(v) || 0); }
  function ago(v) { const ts = Date.parse(v || ""); if (!Number.isFinite(ts)) return "Recently"; const m = Math.max(0, Math.round((Date.now() - ts) / 60000)); if (m < 1) return "Just now"; if (m < 60) return `${m}m ago`; const h2 = Math.round(m / 60); if (h2 < 24) return `${h2}h ago`; return `${Math.round(h2 / 24)}d ago`; }
  function status(target, msg, tone) { if (!target) return; target.textContent = msg; target.dataset.tone = tone || "info"; }
  async function copy(text, msg) {
    text = t(text);
    if (!text) return status(appStatus, "There is nothing ready to copy yet.", "warning");
    if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(text);
    else { const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "absolute"; ta.style.left = "-9999px"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
    status(appStatus, msg || "Copied.", "success");
  }
  function url(path) { return new URL(t(path) || "/", window.location.origin).href; }
  function waNumber(phone) { const digits = t(phone).replace(/\D+/g, ""); const fallback = t(window.SharonCraftData && window.SharonCraftData.site && window.SharonCraftData.site.whatsapp); if (!digits) return fallback; return /^0\d{9}$/.test(digits) ? `254${digits.slice(1)}` : digits; }
  function waLink(phone, msg) { return `https://wa.me/${encodeURIComponent(waNumber(phone))}?text=${encodeURIComponent(t(msg))}`; }
  function categoryName(product) { const slugValue = t(product && product.notes).split("|")[0]; const list = window.SharonCraftData && Array.isArray(window.SharonCraftData.categories) ? window.SharonCraftData.categories : []; const match = list.find(function (c) { return t(c.slug) === slugValue; }); return match ? t(match.name) : "Handmade"; }
  function focus(product) { const slugValue = t(product && product.notes).split("|")[0]; if (slugValue === "gift-sets" || slugValue === "bridal-occasion") return "gifting and occasions"; if (slugValue === "home-decor") return "warm homes and styling"; if (slugValue === "bags-accessories") return "personal style and everyday carrying"; return "daily styling and gifting"; }
  function shareUrl(product) { return url(`/products/${slug(t(product && (product.id || product.name)))}.html`); }
  function angleLabel(angle) {
    const labels = { gift: "Gift", style: "Style", decor: "Decor", custom: "Custom", founder: "Founder Story" };
    return labels[t(angle).toLowerCase()] || "Gift";
  }
  function angleGuide(product, angle) {
    const name = t(product && product.name) || "this SharonCraft piece";
    const story = short(t(product && product.story), 105) || "Handmade in Kenya with a warm, gift-friendly feel.";
    const why = focus(product);
    const price = Number(product && product.price) > 0 ? money(product.price) : "Ask for price";
    const guides = {
      gift: {
        note: "Gift is the easiest default when you want a simple, buyer-friendly post.",
        productLine: `${name} is an easy SharonCraft gift pick for people who want something handmade and meaningful.`,
        instagram: `${name} is gift-ready at SharonCraft for ${price}. ${story} A warm pick for birthdays, thank-yous, and special occasions.`,
        whatsapp: `Hi, ${name} is a lovely handmade gift option from SharonCraft for ${price}. ${story}`,
        status: `${name}\n${price}\nGift-ready handmade pick\nOrder on WhatsApp`,
        hook: "POV: you found a handmade Kenyan gift that actually feels thoughtful",
        caption: `${name} makes gifting feel easier. ${story} ${price}. Message on WhatsApp to order.`,
        shots: ["Gift-ready flat lay", "Close detail shot", "Hand holding the piece", "Final reveal with packaging"].join("\n"),
        overlay: ["Gift-ready", name, price, "Handmade in Kenya"].join("\n"),
        voiceover: `${name} is one of those pieces that makes gifting feel personal without being complicated. ${story}`,
        cta: "Who would you gift this to? Message on WhatsApp to order."
      },
      style: {
        note: "Style works best when you want the post to feel wearable, trendy, and personal.",
        productLine: `${name} is the easy style-led push when you want people to imagine it in their own look.`,
        instagram: `${name} is ready to style at SharonCraft for ${price}. ${story} A strong pick for personal style, standout details, and everyday confidence.`,
        whatsapp: `Hi, ${name} is available at SharonCraft for ${price}. ${story} It is a beautiful way to add handmade detail to your personal style.`,
        status: `${name}\n${price}\nStyle it with your look\nHandmade in Kenya`,
        hook: "This is the handmade detail that changes the whole outfit",
        caption: `${name} brings handmade Kenyan detail into your look. ${story} ${price}. Message on WhatsApp to order.`,
        shots: ["Full outfit or wide shot", "Close detail shot", "Wear shot", "Final mirror or movement shot"].join("\n"),
        overlay: ["Style it your way", name, price, "Order on WhatsApp"].join("\n"),
        voiceover: `${name} is an easy way to make an outfit feel more intentional. ${story}`,
        cta: "Would you wear this with a casual look or a dressed-up one?"
      },
      decor: {
        note: "Decor is best when you want to sell the feeling of a warm, creative home or gift corner.",
        productLine: `${name} is the angle to use when you want people to picture handmade warmth in a room, shelf, or gifting corner.`,
        instagram: `${name} adds handmade warmth to a space at SharonCraft for ${price}. ${story} A simple way to make a room feel more personal and creative.`,
        whatsapp: `Hi, ${name} is available at SharonCraft for ${price}. ${story} It is a lovely way to bring handmade Kenyan warmth into a space.`,
        status: `${name}\n${price}\nWarm up your space\nHandmade in Kenya`,
        hook: "A small handmade detail can change the whole space",
        caption: `${name} adds a handmade Kenyan touch to the room. ${story} ${price}. Message on WhatsApp to order.`,
        shots: ["Wide room shot", "Shelf or table styling shot", "Close detail shot", "Final space reveal"].join("\n"),
        overlay: ["Decor with meaning", name, price, "Handmade in Kenya"].join("\n"),
        voiceover: `${name} is the kind of handmade detail that makes a space feel warmer and more personal. ${story}`,
        cta: "Would this fit your home, office, or a gift corner best?"
      },
      custom: {
        note: "Custom is strongest when someone may need a color change, a personalized gift, or help choosing.",
        productLine: `${name} is a good custom-order angle when you want to invite conversation instead of only showing a finished piece.`,
        instagram: `${name} is available at SharonCraft for ${price}. ${story} If you want a custom feel, you can ask about colors, gifting, or the best fit on WhatsApp.`,
        whatsapp: `Hi, ${name} is available at SharonCraft for ${price}. ${story} If you want help with colors, gifting, or a custom feel, message on WhatsApp and we will guide you.`,
        status: `${name}\n${price}\nAsk about custom options\nWhatsApp for help`,
        hook: "You do not always have to buy it exactly as you see it",
        caption: `${name} is available now, and SharonCraft can help with color, gifting, and custom-fit questions on WhatsApp. ${price}.`,
        shots: ["Main product shot", "Close color/detail shot", "Hands showing texture", "Text prompt to ask for custom help"].join("\n"),
        overlay: ["Need custom help?", name, price, "Ask on WhatsApp"].join("\n"),
        voiceover: `${name} already looks beautiful, but SharonCraft can also help you choose the right feel, color direction, or gifting setup. ${story}`,
        cta: "Need help choosing or customizing? Message on WhatsApp."
      },
      founder: {
        note: "Founder story is best when you want more trust, personality, and brand connection around the product.",
        productLine: `${name} is a good founder-led angle when you want the post to feel more personal and brand-driven.`,
        instagram: `${name} is one of the handmade pieces SharonCraft is proud to share for ${price}. Led by founder and CEO Kelvin Mark, the brand keeps handmade Kenyan craft close to the customer. ${story}`,
        whatsapp: `Hi, ${name} is available at SharonCraft for ${price}. Led by founder and CEO Kelvin Mark, SharonCraft focuses on handmade Kenyan pieces with direct support on WhatsApp. ${story}`,
        status: `${name}\n${price}\nFounder-led handmade brand\nSharonCraft`,
        hook: "Built with the same founder-led care SharonCraft is known for",
        caption: `${name} comes from a founder-led handmade brand built by Kelvin Mark. ${story} ${price}. Message on WhatsApp to order.`,
        shots: ["Hero product shot", "Close detail shot", "Handmade process or hands shot", "Final product with brand mark"].join("\n"),
        overlay: ["Founder-led", name, price, "Handmade in Kenya"].join("\n"),
        voiceover: `${name} reflects the founder-led feel of SharonCraft, where handmade Kenyan pieces are shared with direct support and care. ${story}`,
        cta: "Want a handmade piece from a founder-led Kenyan brand? Message on WhatsApp."
      }
    };
    return guides[t(angle).toLowerCase()] || guides.gift;
  }
  function draft(product, angle) {
    const name = t(product && product.name);
    const link = shareUrl(product);
    const guide = angleGuide(product, angle || currentAngle);
    return {
      instagram: `${guide.instagram} View it here: ${link}`,
      whatsapp: `${guide.whatsapp} Direct link: ${link}`,
      status: `${guide.status}\n${link}`,
      link
    };
  }
  function videoDraft(product, angle) {
    const guide = angleGuide(product, angle || currentAngle);
    return {
      hook: guide.hook,
      caption: guide.caption,
      shots: guide.shots,
      overlay: guide.overlay,
      voiceover: guide.voiceover,
      cta: guide.cta
    };
  }
  function orderMsg(order, type) {
    const customer = t(order && order.customer) || "there";
    const item = t(order && order.productName) || "your SharonCraft item";
    const area = t(order && order.areaName) || "your area";
    if (type === "dispatch") return `Hello ${customer}, your SharonCraft order for ${item} is moving forward well. We are preparing dispatch and will keep you updated on delivery to ${area}.`;
    if (type === "review") return `Hello ${customer}, thank you again for ordering ${item} from SharonCraft. We hope you love it. If you can, please send a short review or a photo when you have a moment.`;
    if (type === "payment") return `Hello ${customer}, thank you for choosing SharonCraft. ${item} is ready to confirm for delivery to ${area}. Reply here when you are ready and we will guide you through payment and next steps.`;
    return `Hello ${customer}, just checking in from SharonCraft about ${item}. If you still want it, I can help with delivery, payment, or choosing the best option for you.`;
  }
  function recent(days) { const cutoff = Date.now() - days * 24 * 60 * 60 * 1000; return events.filter(function (e) { const ts = Date.parse(e && e.timestamp); return Number.isFinite(ts) && ts >= cutoff; }); }
  function filteredEvents() { const map = { "7d": 7, "30d": 30, "90d": 90 }; return recent(map[currentRange] || 7); }
  function eventProduct(e) { const p = e && e.payload ? e.payload : {}; return t(p.product_name); }
  function eventPage(e) { const p = e && e.payload ? e.payload : {}; return t(p.page_title) || t(p.page_path) || "Storefront page"; }
  function productByName(name) { name = t(name).toLowerCase(); return products.find(function (p) { return t(p.name).toLowerCase() === name; }) || null; }
  function activityMap(list) { const map = new Map(); (list || []).forEach(function (e) { const name = eventProduct(e); if (!name) return; const cur = map.get(name) || { score: 0, chats: 0 }; cur.score += 1; if (t(e.name).toLowerCase().includes("whatsapp")) cur.chats += 1; if (t(e.name).toLowerCase() === "add_to_cart") cur.score += 3; map.set(name, cur); }); return map; }
  function topProduct() { const ranked = Array.from(activityMap(recent(7)).entries()).map(function (entry) { return { product: productByName(entry[0]), score: entry[1].score }; }).sort(function (a, b) { return b.score - a.score; }); return (ranked[0] && ranked[0].product) || products.find(function (p) { return !p.soldOut; }) || products[0] || null; }
  function needsAttention() { const ranked = Array.from(activityMap(recent(30)).entries()).map(function (entry) { return { product: productByName(entry[0]), chats: entry[1].chats, score: entry[1].score }; }).filter(function (item) { return item.product && item.score >= 2 && item.chats === 0; }).sort(function (a, b) { return b.score - a.score; }); return ranked[0] ? ranked[0].product : null; }
  function todayOffer() { const product = topProduct(); const promo = t(window.SharonCraftData && window.SharonCraftData.site && window.SharonCraftData.site.promo); return product ? `${t(product.name)} is one of the best products to push today at SharonCraft. ${promo || "Handmade in Kenya and easy to order on WhatsApp."} View it here: ${shareUrl(product)}` : (promo || "Handmade SharonCraft pieces are available now. Message on WhatsApp for help choosing the right piece."); }
  function warmFollowUp() { const pending = orders.find(function (o) { return ["new", "confirmed"].includes(t(o.status)); }); return pending ? orderMsg(pending, "followup") : "Hello, just checking in from SharonCraft. If you still want help choosing a gift, decor piece, or handmade accessory, I can guide you quickly on WhatsApp."; }
  function selectedProduct() { return products.find(function (p) { return t(p.id) === selectedId; }) || topProduct(); }

  function renderSummary() {
    const replies = orders.filter(function (o) { return ["new", "confirmed"].includes(t(o.status)); }).length;
    const ordersToday = orders.filter(function (o) { const ts = Date.parse(o && o.createdAt); return Number.isFinite(ts) && ts >= Date.now() - 24 * 60 * 60 * 1000; }).length;
    const taps = recent(7).filter(function (e) { return t(e.name).toLowerCase().includes("whatsapp"); }).length;
    const product = topProduct();
    summaryWrap.innerHTML = [
      { label: "Reply Today", value: String(replies) },
      { label: "Push Today", value: short(t(product && product.name) || "Choose a product", 24) },
      { label: "Orders 24h", value: String(ordersToday) },
      { label: "WhatsApp Taps 7d", value: String(taps) }
    ].map(function (item) { return `<article><span>${h(item.label)}</span><strong>${h(item.value)}</strong></article>`; }).join("");
  }

  function renderPlan() {
    const product = topProduct();
    const pending = orders.find(function (o) { return ["new", "confirmed"].includes(t(o.status)); });
    planWrap.innerHTML = [
      { title: "1. Post One Product", text: product ? `Use ${t(product.name)} as your one main post today.` : "Pick one product and use it as your one main post today." },
      { title: "2. Share One Link", text: "Copy the WhatsApp pitch or the status line and share it without overthinking." },
      { title: "3. Follow Up", text: pending ? `Reply to ${t(pending.customer) || "your waiting lead"} before posting again.` : "Send one warm follow-up before ending today's marketing session." }
    ].map(function (item) { return `<article><strong>${h(item.title)}</strong><p>${h(item.text)}</p></article>`; }).join("");
  }

  function renderPicks() {
    const q = t(productSearch && productSearch.value).toLowerCase();
    const list = products.filter(function (p) { return !q || t(p.name).toLowerCase().includes(q) || categoryName(p).toLowerCase().includes(q); }).slice(0, 8);
    productPicks.innerHTML = list.length ? list.map(function (p) {
      const active = t(p.id) === t(selectedId) ? " is-active" : "";
      return `<button class="marketing-product-pill${active}" type="button" data-product-pick="${h(t(p.id))}"><strong>${h(t(p.name))}</strong><span>${h(categoryName(p))} - ${h(money(p.price))}</span></button>`;
    }).join("") : '<div class="marketing-empty">No products match that search yet.</div>';
  }

  function renderSelected() {
    const product = selectedProduct();
    if (!product) return;
    selectedId = t(product.id);
    const guide = angleGuide(product, currentAngle);
    const text = draft(product, currentAngle);
    const video = videoDraft(product, currentAngle);
    productKicker.textContent = `${categoryName(product)} - ${money(product.price)} - ${angleLabel(currentAngle)} angle`;
    productName.textContent = t(product.name);
    productStory.textContent = guide.productLine;
    productImage.src = t(product.image) || "assets/images/custom-occasion-beadwork-46mokm-opt.webp";
    productImage.alt = t(product.name) || "Selected SharonCraft product";
    if (angleNote) angleNote.textContent = guide.note;
    if (anglePicker) Array.from(anglePicker.querySelectorAll("[data-marketing-angle]")).forEach(function (button) { button.classList.toggle("is-active", t(button.dataset.marketingAngle) === currentAngle); });
    instagramCopy.value = text.instagram;
    whatsappCopy.value = text.whatsapp;
    statusCopy.value = text.status;
    linkCopy.value = text.link;
    if (videoHook) videoHook.value = video.hook;
    if (videoCaption) videoCaption.value = video.caption;
    if (videoShots) videoShots.value = video.shots;
    if (videoOverlay) videoOverlay.value = video.overlay;
    if (videoVoiceover) videoVoiceover.value = video.voiceover;
    if (videoCta) videoCta.value = video.cta;
    renderPicks();
  }

  function renderPush() {
    const product = topProduct();
    pushWrap.innerHTML = product ? `<article class="marketing-opportunity-card"><div class="marketing-copy-head"><strong>${h(t(product.name))}</strong><button class="button button-secondary" type="button" data-quick-copy="push">Copy Post</button></div><p>${h("This is the easiest product to push today because it already has the strongest interest signal.")}</p><span>${h(`Direct link: ${shareUrl(product)}`)}</span></article>` : '<div class="marketing-empty">No products are ready to suggest yet.</div>';
  }

  function renderNeeds() {
    const pending = orders.find(function (o) { return ["new", "confirmed"].includes(t(o.status)); });
    const weak = needsAttention();
    const cards = [`<article class="marketing-opportunity-card"><div class="marketing-copy-head"><strong>Offer To Post</strong><button class="button button-secondary" type="button" data-quick-copy="offer">Copy Offer</button></div><p>${h("Use one simple offer today instead of many messages.")}</p><span>${h(short(todayOffer(), 92))}</span></article>`];
    if (pending) cards.push(`<article class="marketing-opportunity-card"><div class="marketing-copy-head"><strong>Follow Up Next</strong><button class="button button-secondary" type="button" data-quick-copy="followup">Copy Reply</button></div><p>${h(`${t(pending.customer) || "A waiting customer"} is still waiting on ${t(pending.productName) || "a SharonCraft item"}.`)}</p></article>`);
    if (weak) cards.push(`<article class="marketing-opportunity-card"><div class="marketing-copy-head"><strong>Fix This Product</strong><button class="button button-secondary" type="button" data-product-focus="${h(t(weak.id))}">Open Here</button></div><p>${h(t(weak.name))}</p><span>${h("People are seeing it, but it is not getting enough WhatsApp interest yet.")}</span></article>`);
    needsWrap.innerHTML = cards.join("");
  }

  function renderOrders() {
    const list = orders.filter(function (o) { return ["new", "confirmed", "paid"].includes(t(o.status)); }).slice(0, 8);
    ordersWrap.innerHTML = list.length ? list.map(function (o, i) {
      const s = t(o.status) || "new";
      const kind = s === "paid" ? "dispatch" : "payment";
      const label = s === "paid" ? "Copy Dispatch Update" : "Copy Payment Reply";
      return `<article class="marketing-order-item"><div class="marketing-order-row-top"><strong>${h(t(o.customer) || "Unknown customer")}</strong><span class="marketing-order-status">${h(s)}</span></div><div class="marketing-order-meta">${h(t(o.productName) || "Product")} - ${h(money(o.orderTotal))}</div><div class="marketing-order-meta">${h(t(o.phone) || "No phone")} - ${h(ago(o.createdAt))}</div><div class="marketing-order-actions"><button class="button button-secondary" type="button" data-order-copy="${h(kind)}" data-order-index="${h(String(i))}">${h(label)}</button><button class="button button-secondary" type="button" data-order-copy="followup" data-order-index="${h(String(i))}">Copy Warm Follow-up</button><button class="button button-secondary" type="button" data-order-whatsapp="${h(String(i))}">Open WhatsApp</button></div></article>`;
    }).join("") : '<div class="marketing-empty">No recent orders need follow-up right now.</div>';
  }

  function renderSignals() {
    const list = filteredEvents();
    const pMap = new Map();
    const pageMap = new Map();
    list.forEach(function (e) { const p = eventProduct(e); const page = eventPage(e); if (p) pMap.set(p, (pMap.get(p) || 0) + 1); if (page) pageMap.set(page, (pageMap.get(page) || 0) + 1); });
    topProductsWrap.innerHTML = Array.from(pMap.entries()).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5).map(function (item) { return `<article class="marketing-rank-item"><span>Product</span><strong>${h(item[0])}</strong><span>${h(String(item[1]))} signals</span></article>`; }).join("") || '<div class="marketing-empty">No product activity in this range yet.</div>';
    topPagesWrap.innerHTML = Array.from(pageMap.entries()).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5).map(function (item) { return `<article class="marketing-rank-item"><span>Page</span><strong>${h(item[0])}</strong><span>${h(String(item[1]))} visits</span></article>`; }).join("") || '<div class="marketing-empty">No page visits in this range yet.</div>';
  }

  function renderAll() {
    renderSummary();
    renderPlan();
    renderPicks();
    renderSelected();
    renderPush();
    renderNeeds();
    renderOrders();
    renderSignals();
  }

  async function loadProducts(showStatus) { products = await catalogApi.fetchProducts(); if (!selectedId) { const p = topProduct(); selectedId = t(p && p.id); } renderAll(); if (showStatus !== false) status(appStatus, "Live products refreshed.", "success"); }
  async function loadOrders(showStatus) { orders = await catalogApi.fetchOrders(); renderAll(); if (showStatus !== false) status(appStatus, "Live orders refreshed.", "success"); }
  async function loadAnalytics(showStatus) { events = await catalogApi.fetchAnalyticsEvents(200); renderAll(); if (showStatus !== false) status(appStatus, "Live analytics refreshed.", "success"); }

  async function enterApp(user) {
    currentUser = user;
    authView.hidden = true;
    appView.hidden = false;
    $("marketing-user-copy").textContent = t(user && user.email) || "Signed in as admin";
    liveChip.textContent = "Live Supabase";
    await loadProducts(false);
    await loadOrders(false);
    await loadAnalytics(false);
    status(appStatus, "Marketing desk ready. Products, orders, and live activity are synced.", "success");
  }

  async function checkSession() {
    if (!catalogApi || typeof catalogApi.isConfigured !== "function" || !catalogApi.isConfigured()) return status(authStatus, "Supabase is not configured on this site yet.", "error");
    const user = await catalogApi.getCurrentUser();
    if (!user) return status(authStatus, "Sign in with your admin account to open the marketing workspace.", "info");
    const isAdmin = typeof catalogApi.isAdmin === "function" ? await catalogApi.isAdmin() : false;
    if (!isAdmin) { await catalogApi.signOut(); return status(authStatus, "This account is not on the admin list.", "error"); }
    await enterApp(user);
  }

  if (loginForm) loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    try {
      status(authStatus, "Signing in...", "info");
      await userController.signIn(emailInput.value, passwordInput.value);
      const user = await catalogApi.getCurrentUser();
      await enterApp(user);
    } catch (error) {
      status(authStatus, error && error.message ? error.message : "Sign-in failed.", "error");
    }
  });

  if (signOutButton) signOutButton.addEventListener("click", async function () {
    try { await userController.signOut(); } catch (error) {}
    currentUser = null;
    appView.hidden = true;
    authView.hidden = false;
    status(authStatus, "Signed out. Sign in again to reopen the marketing desk.", "info");
  });

  if (productSearch) productSearch.addEventListener("input", renderPicks);
  if (productPicks) productPicks.addEventListener("click", function (event) { const button = event.target.closest("[data-product-pick]"); if (!button) return; selectedId = t(button.dataset.productPick); renderSelected(); renderPush(); });
  if (anglePicker) anglePicker.addEventListener("click", function (event) { const button = event.target.closest("[data-marketing-angle]"); if (!button) return; currentAngle = t(button.dataset.marketingAngle) || "gift"; renderSelected(); renderPush(); });
  rangeButtons.forEach(function (button) { button.addEventListener("click", function () { currentRange = button.dataset.marketingRange; rangeButtons.forEach(function (item) { item.classList.toggle("is-active", item === button); }); renderSummary(); renderPush(); renderNeeds(); renderSignals(); }); });
  if (refreshProductsButton) refreshProductsButton.addEventListener("click", async function () { try { await loadProducts(); } catch (error) { status(appStatus, "Could not refresh products right now.", "error"); } });
  if (refreshOrdersButton) refreshOrdersButton.addEventListener("click", async function () { try { await loadOrders(); } catch (error) { status(appStatus, "Could not refresh orders right now.", "error"); } });
  if (refreshAnalyticsButton) refreshAnalyticsButton.addEventListener("click", async function () { try { await loadAnalytics(); } catch (error) { status(appStatus, "Could not refresh analytics right now.", "error"); } });

  if (appView) appView.addEventListener("click", function (event) {
    const product = selectedProduct();
    const postDraft = draft(product || {}, currentAngle);
    const quickCopy = event.target.closest("[data-quick-copy]");
    if (quickCopy) {
      const top = topProduct();
      const text = quickCopy.dataset.quickCopy === "offer" ? todayOffer() : quickCopy.dataset.quickCopy === "followup" ? warmFollowUp() : draft(top || {}, currentAngle).instagram;
      return copy(text, `${quickCopy.textContent.trim()} copied.`);
    }
    const copyButton = event.target.closest("[data-marketing-copy]");
    if (copyButton) {
      const text = copyButton.dataset.marketingCopy === "instagram" ? postDraft.instagram : copyButton.dataset.marketingCopy === "whatsapp" ? postDraft.whatsapp : copyButton.dataset.marketingCopy === "status" ? postDraft.status : postDraft.link;
      return copy(text, `${copyButton.textContent.trim()} copied.`);
    }
    const videoCopyButton = event.target.closest("[data-video-copy]");
    if (videoCopyButton) {
      const text = videoDraft(product || {}, currentAngle);
      const value = videoCopyButton.dataset.videoCopy === "hook"
        ? text.hook
        : videoCopyButton.dataset.videoCopy === "caption"
          ? text.caption
          : videoCopyButton.dataset.videoCopy === "shots"
            ? text.shots
            : videoCopyButton.dataset.videoCopy === "overlay"
              ? text.overlay
              : videoCopyButton.dataset.videoCopy === "voiceover"
                ? text.voiceover
                : text.cta;
      return copy(value, `${videoCopyButton.textContent.trim()} copied.`);
    }
    const quickLink = event.target.closest("[data-quick-link]");
    if (quickLink) return window.open(url(quickLink.dataset.quickLink === "gifts" ? "handmade-kenyan-gifts.html" : "shop.html"), "_blank", "noopener,noreferrer");
    const focusButton = event.target.closest("[data-product-focus]");
    if (focusButton) { selectedId = t(focusButton.dataset.productFocus); renderSelected(); return window.scrollTo({ top: 0, behavior: "smooth" }); }
    const priority = orders.filter(function (o) { return ["new", "confirmed", "paid"].includes(t(o.status)); }).slice(0, 8);
    const orderCopy = event.target.closest("[data-order-copy]");
    if (orderCopy) return copy(orderMsg(priority[Number(orderCopy.dataset.orderIndex)], orderCopy.dataset.orderCopy), `${orderCopy.textContent.trim()} copied.`);
    const orderWa = event.target.closest("[data-order-whatsapp]");
    if (orderWa) return window.open(waLink(priority[Number(orderWa.dataset.orderWhatsapp)] && priority[Number(orderWa.dataset.orderWhatsapp)].phone, orderMsg(priority[Number(orderWa.dataset.orderWhatsapp)], "followup")), "_blank", "noopener,noreferrer");
  });

  if (catalogApi && typeof catalogApi.onAuthStateChange === "function") {
    catalogApi.onAuthStateChange(function (user) {
      if (!user && currentUser) {
        currentUser = null;
        appView.hidden = true;
        authView.hidden = false;
        status(authStatus, "Signed out. Sign in again to reopen the marketing desk.", "info");
      }
    });
  }

  await checkSession();
});
