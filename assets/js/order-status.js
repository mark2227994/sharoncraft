(function () {
  "use strict";

  var STORAGE_KEY = "sharoncraft-orders";
  var WHATSAPP_NUM = "254112222572";

  var STATUS = {
    new: {
      label: "New",
      step: 0,
      msgClass: "",
      msg: "Your order has been received. SharonCraft will confirm it on WhatsApp shortly, usually within a few hours."
    },
    confirmed: {
      label: "Confirmed",
      step: 1,
      msgClass: "",
      msg: "Your order is confirmed. SharonCraft is preparing your item and will send M-Pesa payment details on WhatsApp soon."
    },
    paid: {
      label: "Paid",
      step: 2,
      msgClass: "teal",
      msg: "Payment received. Your order is being packed and will be dispatched for delivery. Delivery details are on their way to you."
    },
    delivered: {
      label: "Delivered",
      step: 3,
      msgClass: "teal",
      msg: "Your SharonCraft order has been delivered. We hope you love it! Send us a WhatsApp message if you need anything."
    },
    cancelled: {
      label: "Cancelled",
      step: -1,
      msgClass: "grey",
      msg: "This order has been cancelled. Contact SharonCraft on WhatsApp if you think this is a mistake or would like to reorder."
    }
  };

  var STEPS = [
    { key: "new", label: "Received" },
    { key: "confirmed", label: "Confirmed" },
    { key: "paid", label: "Paid" },
    { key: "delivered", label: "Delivered" }
  ];

  var input = document.getElementById("os-input");
  var btn = document.getElementById("os-btn");
  var resultEl = document.getElementById("os-result");

  function esc(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmtDate(value) {
    if (!value) {
      return "";
    }
    try {
      return new Date(value).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch (error) {
      return value;
    }
  }

  function fmtPrice(value) {
    return value != null && value !== "" ? "KES " + Number(value).toLocaleString("en-KE") : "";
  }

  function waLink(text) {
    return "https://wa.me/" + WHATSAPP_NUM + "?text=" + encodeURIComponent(text);
  }

  function getOrders() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (error) {
      return [];
    }
  }

  function findLocal(id) {
    var normalizedId = String(id || "").trim().toLowerCase();
    return getOrders().find(function (order) {
      return (
        String(order.id || "").trim().toLowerCase() === normalizedId ||
        String(order.orderId || "").trim().toLowerCase() === normalizedId
      );
    }) || null;
  }

  function showLoading() {
    resultEl.innerHTML =
      '<div class="os-loading"><div class="os-spinner"></div><span>Looking up your order...</span></div>';
  }

  function showError(title, body) {
    resultEl.innerHTML =
      '<div class="os-state">' +
      '<div class="os-state-ico"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>' +
      "<h3>" + esc(title) + "</h3>" +
      "<p>" + esc(body) + "</p>" +
      '<a class="button button-primary" href="' + waLink("Hello SharonCraft, I need help finding my order.") + '" target="_blank" rel="noreferrer">Chat on WhatsApp</a>' +
      "</div>";
  }

  function launchConfetti(parent) {
    var colours = ["#d85a30", "#1d9e75", "#ba7517", "#f0997b", "#9fe1cb", "#fac775"];
    var wrap = document.createElement("div");
    wrap.className = "os-confetti-wrap";
    wrap.style.position = "relative";

    for (var i = 0; i < 22; i += 1) {
      var piece = document.createElement("div");
      piece.className = "os-piece";
      piece.style.cssText = [
        "left:" + Math.random() * 100 + "%",
        "background:" + colours[i % colours.length],
        "animation-delay:" + Math.random() * 0.6 + "s",
        "animation-duration:" + (1.4 + Math.random() * 0.8) + "s",
        "width:" + (6 + Math.random() * 6) + "px",
        "height:" + (6 + Math.random() * 6) + "px",
        "border-radius:" + (Math.random() > 0.5 ? "50%" : "2px")
      ].join(";");
      wrap.appendChild(piece);
    }

    parent.style.position = "relative";
    parent.style.overflow = "hidden";
    parent.insertBefore(wrap, parent.firstChild);
  }

  function renderOrder(order) {
    var statusKey = String(order.status || "new").toLowerCase();
    var cfg = STATUS[statusKey] || STATUS.new;
    var activeStep = cfg.step;
    var isCancelled = statusKey === "cancelled";
    var isDelivered = statusKey === "delivered";
    var barClass = isDelivered ? "teal" : isCancelled ? "grey" : "";

    var stepsHtml = STEPS.map(function (step, index) {
      var done = !isCancelled && index < activeStep;
      var active = !isCancelled && index === activeStep;
      var className = done ? "done" : active ? "active" : "";
      var icon = done
        ? '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:#fff;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round"><path d="M20 6 9 17l-5-5"/></svg>'
        : String(index + 1);

      return (
        '<div class="os-step ' + className + '">' +
          '<div class="os-sdot">' + icon + "</div>" +
          '<div class="os-sname">' + esc(step.label) + "</div>" +
        "</div>"
      );
    }).join("");

    var product = order.product || order.productName || "";
    var quantity = Math.max(1, Number(order.quantity || order.qty) || 1);
    var customer = order.customer || order.customerName || "";
    var area = order.area || order.areaName || order.deliveryArea || "";
    var total = order.orderTotal != null ? order.orderTotal : order.price != null ? order.price : order.total;
    var note = order.note || order.adminNote || "";
    var createdAt = order.createdAt || order.date || "";
    var updatedAt = order.updatedAt || "";
    var orderId = order.orderId || order.id || "";

    var detailsHtml = "";
    if (product) {
      detailsHtml += '<div class="os-det"><label>Product</label><strong>' + esc(product) + "</strong></div>";
    }
    detailsHtml += '<div class="os-det"><label>Quantity</label><strong>' + esc(String(quantity)) + "</strong></div>";
    if (total != null && total !== "") {
      detailsHtml += '<div class="os-det"><label>Total</label><strong>' + esc(fmtPrice(total)) + "</strong></div>";
    }
    if (customer) {
      detailsHtml += '<div class="os-det"><label>Customer</label><strong>' + esc(customer) + "</strong></div>";
    }
    if (area) {
      detailsHtml += '<div class="os-det"><label>Delivery area</label><strong>' + esc(area) + "</strong></div>";
    }

    var waText = "Hello SharonCraft, I am following up on order " + orderId + (product ? " for " + product : "") + ". Can you give me an update?";

    resultEl.innerHTML =
      '<div class="os-card">' +
        '<div class="os-bar ' + barClass + '"></div>' +
        '<div class="os-body">' +
          '<div class="os-header">' +
            '<div><span class="os-id-lbl">Order ID</span><span class="os-id">' + esc(orderId || "-") + "</span></div>" +
            '<div class="os-date">' +
              (createdAt ? "Placed " + fmtDate(createdAt) : "") +
              (updatedAt ? "<br>Updated " + fmtDate(updatedAt) : "") +
            "</div>" +
          "</div>" +
          '<span class="os-badge b-' + statusKey + '"><span class="os-dot"></span>' + esc(cfg.label) + "</span>" +
          '<div class="os-prog-lbl">Order journey</div>' +
          '<div class="os-steps">' + stepsHtml + "</div>" +
          '<div class="os-msg ' + cfg.msgClass + '">' + esc(cfg.msg) + "</div>" +
          '<div class="os-note' + (note ? " show" : "") + '"><strong>Note from SharonCraft</strong>' + esc(note) + "</div>" +
          '<div class="os-details">' + detailsHtml + "</div>" +
        "</div>" +
        '<div class="os-actions">' +
          '<a class="button button-primary" href="' + waLink(waText) + '" target="_blank" rel="noreferrer">Ask about this order</a>' +
          '<a class="button button-secondary" href="shop.html">Continue shopping</a>' +
        "</div>" +
      "</div>";

    if (isDelivered) {
      launchConfetti(resultEl.querySelector(".os-card"));
    }
  }

  async function lookup(id) {
    var trimmedId = String(id || "").trim();
    if (!trimmedId) {
      showError("Please enter an order ID", "Paste the order ID from your WhatsApp confirmation message above.");
      return;
    }

    showLoading();

    var localOrder = findLocal(trimmedId);
    if (localOrder) {
      renderOrder(localOrder);
      return;
    }

    if (window.SharonCraftCatalog && window.SharonCraftCatalog.isConfigured && window.SharonCraftCatalog.isConfigured()) {
      try {
        if (typeof window.SharonCraftCatalog.fetchPublicOrder === "function") {
          var publicOrder = await window.SharonCraftCatalog.fetchPublicOrder(trimmedId);
          if (publicOrder) {
            renderOrder(publicOrder);
            return;
          }
        } else {
          var supabase = window.SharonCraftCatalog.getClient();
          var response = await supabase.from("order_tracking").select("*").eq("id", trimmedId).maybeSingle();
          if (response.data) {
            renderOrder({
              id: response.data.id,
              productName: response.data.product_name,
              quantity: response.data.quantity,
              areaName: response.data.delivery_area,
              status: response.data.status,
              note: response.data.note,
              orderTotal: response.data.order_total,
              createdAt: response.data.created_at,
              updatedAt: response.data.updated_at
            });
            return;
          }
        }
      } catch (error) {
        console.warn("SC order lookup:", error);
      }
    }

    showError(
      "Order not found",
      'We could not find order "' + trimmedId + '". Double-check the ID from your WhatsApp message, or contact SharonCraft directly.'
    );
  }

  btn.addEventListener("click", function () {
    lookup(input.value);
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      lookup(input.value);
    }
  });

  (function () {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id") || params.get("order") || params.get("orderId");
    if (id) {
      input.value = id;
      setTimeout(function () {
        lookup(id);
      }, 600);
    }
  }());
}());
