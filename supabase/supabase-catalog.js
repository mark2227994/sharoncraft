(function () {
  const defaultConfig = {
    url: "",
    anonKey: "",
    productsTable: "products",
    settingsTable: "site_settings",
    analyticsTable: "analytics_events",
    approvedReviewsSettingKey: "storefront_reviews",
    reviewModerationSettingKey: "storefront_review_moderation",
    ordersTable: "orders",
    orderTrackingTable: "order_tracking",
    storageBucket: "product-images",
    storageFolder: "catalog",
    authStorageKey: "sharoncraft_supabase_auth",
  };

  const normalizeText = (value) => String(value || "").trim();

  const slugify = (value) =>
    normalizeText(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product";

  const normalizeList = (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => normalizeText(item)).filter(Boolean);
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) {
        return [];
      }
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => normalizeText(item)).filter(Boolean);
        }
      } catch (error) {
        return trimmed
          .split(",")
          .map((item) => normalizeText(item))
          .filter(Boolean);
      }
    }
    return [];
  };

  const normalizeObject = (value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value;
    }
    return {};
  };

  const clampRating = (value) => Math.max(1, Math.min(5, Number(value) || 5));

  const normalizeReview = (value) => {
    const source = normalizeObject(value);
    const reviewId = normalizeText(source.id || source.review_id || source.sourceId);
    return {
      id: reviewId || `review-${Date.now().toString(36)}`,
      sourceId: normalizeText(source.sourceId || source.review_id || source.id) || reviewId,
      productId: normalizeText(source.productId || source.product_id),
      productName: normalizeText(source.productName || source.product_name),
      category: normalizeText(source.category),
      author: normalizeText(source.author || source.review_author || source.name) || "SharonCraft client",
      location: normalizeText(source.location || source.review_location) || "Kenya",
      rating: clampRating(source.rating || source.review_rating),
      message: normalizeText(source.message || source.review_message),
      status: normalizeText(source.status || source.review_status || "approved") || "approved",
      createdAt: normalizeText(source.createdAt || source.created_at) || new Date().toISOString(),
      approvedAt: normalizeText(source.approvedAt || source.approved_at),
    };
  };

  const ORDER_STATUSES = ["new", "confirmed", "paid", "delivered", "cancelled"];

  const normalizeOrderStatus = (value) => {
    const normalized = normalizeText(value).toLowerCase();
    return ORDER_STATUSES.includes(normalized) ? normalized : "new";
  };

  const normalizeProfileInput = (profile, fallbackEmail) => {
    const source = normalizeObject(profile);
    return {
      email: normalizeText(source.email || fallbackEmail),
      fullName: normalizeText(source.fullName || source.full_name || source.name),
      phone: normalizeText(source.phone),
      deliveryArea: normalizeText(source.deliveryArea || source.delivery_area || source.location),
    };
  };

  const getConfig = () => ({
    ...defaultConfig,
    ...(window.SUPABASE_CONFIG || {}),
  });

  const isConfigured = () => {
    const config = getConfig();
    return Boolean(window.supabase && config.url && config.anonKey);
  };

  let client = null;
  const getClient = () => {
    if (!isConfigured()) {
      return null;
    }
    if (client) {
      return client;
    }
    const config = getConfig();
    client = window.supabase.createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: config.authStorageKey,
      },
    });
    return client;
  };

  const mapRowToProduct = (row) => ({
    id: normalizeText(row && row.id),
    image: normalizeText(row && row.image),
    name: normalizeText(row && row.name),
    price: Number(row && row.price) || 0,
    material: normalizeText(row && row.material) || "wood",
    story: normalizeText(row && row.story) || "Handmade by SharonCraft artisans.",
    specs: normalizeList(row && row.specs),
    gallery: normalizeList(row && row.gallery),
    soldOut: Boolean(row && row.sold_out),
    spotlightUntil: normalizeText(row && row.spotlight_until),
    spotlightText: normalizeText(row && row.spotlight_text),
    notes: normalizeText(row && row.notes),
    updatedAt: normalizeText(row && row.updated_at),
    newUntil: normalizeText(row && row.new_until),
    sortOrder: Number(row && row.sort_order) || 0,
  });

  const mapProductToRow = (product, index) => ({
    id: normalizeText(product && product.id) || `product-${Date.now().toString(36)}-${index}`,
    image: normalizeText(product && product.image),
    name: normalizeText(product && product.name),
    price: Number(product && product.price) || 0,
    material: normalizeText(product && product.material) || "wood",
    story: normalizeText(product && product.story) || "Handmade by SharonCraft artisans.",
    specs: normalizeList(product && product.specs),
    gallery: normalizeList(product && product.gallery),
    sold_out: Boolean(product && product.soldOut),
    spotlight_until: normalizeText(product && product.spotlightUntil) || null,
    spotlight_text: normalizeText(product && product.spotlightText),
    notes: normalizeText(product && product.notes),
    updated_at: normalizeText(product && product.updatedAt) || new Date().toISOString(),
    new_until: normalizeText(product && product.newUntil) || null,
    sort_order: index,
  });

  const buildAnalyticsPayload = (payload) => {
    const safePayload = normalizeObject(payload);
    const items = Array.isArray(safePayload.items)
      ? safePayload.items
          .filter((item) => item && typeof item === "object")
          .map((item) => ({
            item_id: normalizeText(item.item_id),
            item_name: normalizeText(item.item_name),
            item_category: normalizeText(item.item_category),
            price: Number(item.price) || 0,
            currency: normalizeText(item.currency) || "KES",
            index: Number(item.index) || 0,
            item_list_id: normalizeText(item.item_list_id),
            item_list_name: normalizeText(item.item_list_name)
          }))
      : [];
    const firstItem = items[0] || {};

    return {
      page_type: normalizeText(safePayload.page_type),
      page_path: normalizeText(safePayload.page_path),
      page_title: normalizeText(safePayload.page_title),
      page_location: normalizeText(safePayload.page_location),
      traffic_source: normalizeText(safePayload.traffic_source),
      traffic_medium: normalizeText(safePayload.traffic_medium),
      traffic_campaign: normalizeText(safePayload.traffic_campaign),
      referrer_host: normalizeText(safePayload.referrer_host),
      product_id: normalizeText(safePayload.product_id) || normalizeText(firstItem.item_id),
      product_name: normalizeText(safePayload.product_name) || normalizeText(firstItem.item_name),
      category: normalizeText(safePayload.category) || normalizeText(firstItem.item_category),
      item_list_id: normalizeText(safePayload.item_list_id) || normalizeText(firstItem.item_list_id),
      item_list_name: normalizeText(safePayload.item_list_name) || normalizeText(firstItem.item_list_name),
      button_label: normalizeText(safePayload.button_label),
      destination: normalizeText(safePayload.destination),
      value: Number(safePayload.value) || 0,
      currency: normalizeText(safePayload.currency || firstItem.currency) || "KES",
      visitor_id: normalizeText(safePayload.visitor_id),
      session_id: normalizeText(safePayload.session_id),
      transport_type: normalizeText(safePayload.transport_type),
      review_id: normalizeText(safePayload.review_id),
      review_author: normalizeText(safePayload.review_author),
      review_location: normalizeText(safePayload.review_location),
      review_rating: Number(safePayload.review_rating) || 0,
      review_message: normalizeText(safePayload.review_message),
      review_status: normalizeText(safePayload.review_status),
      items,
    };
  };

  const mapAnalyticsEventToRow = (event) => {
    const payload = buildAnalyticsPayload(event && event.payload);
    return {
      name: normalizeText(event && event.name),
      page_type: payload.page_type,
      page_path: payload.page_path,
      page_title: payload.page_title,
      product_id: payload.product_id,
      product_name: payload.product_name,
      item_list_id: payload.item_list_id,
      item_list_name: payload.item_list_name,
      button_label: payload.button_label,
      destination: payload.destination,
      value: payload.value,
      currency: payload.currency,
      visitor_id: payload.visitor_id,
      session_id: payload.session_id,
      event_payload: payload,
      created_at: normalizeText(event && event.timestamp) || new Date().toISOString(),
    };
  };

  const mapRowToAnalyticsEvent = (row) => {
    const payload = buildAnalyticsPayload(row && row.event_payload);
    return {
      id: row && typeof row.id !== "undefined" ? String(row.id) : "",
      name: normalizeText(row && row.name),
      timestamp: normalizeText(row && row.created_at),
      payload: {
        ...payload,
        page_type: payload.page_type || normalizeText(row && row.page_type),
        page_path: payload.page_path || normalizeText(row && row.page_path),
        page_title: payload.page_title || normalizeText(row && row.page_title),
        traffic_source: payload.traffic_source,
        traffic_medium: payload.traffic_medium,
        traffic_campaign: payload.traffic_campaign,
        referrer_host: payload.referrer_host,
        product_id: payload.product_id || normalizeText(row && row.product_id),
        product_name: payload.product_name || normalizeText(row && row.product_name),
        item_list_id: payload.item_list_id || normalizeText(row && row.item_list_id),
        item_list_name: payload.item_list_name || normalizeText(row && row.item_list_name),
        button_label: payload.button_label || normalizeText(row && row.button_label),
        destination: payload.destination || normalizeText(row && row.destination),
        value: Number(payload.value || row && row.value) || 0,
        currency: payload.currency || normalizeText(row && row.currency) || "KES",
        visitor_id: payload.visitor_id || normalizeText(row && row.visitor_id),
        session_id: payload.session_id || normalizeText(row && row.session_id)
      }
    };
  };

  const mapRowToOrder = (row) => ({
    id: normalizeText(row && row.id),
    orderId: normalizeText(row && row.id),
    customer: normalizeText(row && (row.customer_name || row.customer)),
    phone: normalizeText(row && (row.customer_phone || row.phone)),
    productId: normalizeText(row && (row.product_id || row.productId)),
    productName: normalizeText(row && (row.product_name || row.product)),
    quantity: Math.max(1, Number(row && row.quantity) || 1),
    areaId: normalizeText(row && (row.delivery_area_id || row.area_id || row.areaId)),
    areaName: normalizeText(row && (row.delivery_area || row.area_name || row.area)),
    status: normalizeOrderStatus(row && row.status),
    note: normalizeText(row && (row.note || row.admin_note)),
    totalProfit: Math.max(0, Number(row && (row.total_profit || row.totalProfit)) || 0),
    orderTotal: Math.max(0, Number(row && (row.order_total || row.total || row.price)) || 0),
    createdAt: normalizeText(row && row.created_at),
    updatedAt: normalizeText(row && row.updated_at),
  });

  const mapOrderToAdminRow = (order) => {
    const normalizedId = normalizeText(order && (order.orderId || order.id));
    return {
      id: normalizedId,
      customer_name: normalizeText(order && order.customer),
      customer_phone: normalizeText(order && order.phone),
      product_id: normalizeText(order && order.productId),
      product_name: normalizeText(order && order.productName),
      quantity: Math.max(1, Number(order && order.quantity) || 1),
      delivery_area_id: normalizeText(order && order.areaId),
      delivery_area: normalizeText(order && order.areaName),
      status: normalizeOrderStatus(order && order.status),
      note: normalizeText(order && order.note),
      total_profit: Math.max(0, Number(order && order.totalProfit) || 0),
      order_total: Math.max(0, Number(order && order.orderTotal) || 0),
      created_at: normalizeText(order && order.createdAt) || new Date().toISOString(),
      updated_at: normalizeText(order && order.updatedAt) || new Date().toISOString(),
    };
  };

  const mapOrderToTrackingRow = (order) => {
    const adminRow = mapOrderToAdminRow(order);
    return {
      id: adminRow.id,
      product_name: adminRow.product_name,
      quantity: adminRow.quantity,
      delivery_area: adminRow.delivery_area,
      status: adminRow.status,
      note: adminRow.note,
      order_total: adminRow.order_total,
      created_at: adminRow.created_at,
      updated_at: adminRow.updated_at,
    };
  };

  const fetchProducts = async () => {
    const supabase = getClient();
    if (!supabase) {
      return [];
    }
    const config = getConfig();
    const { data, error } = await supabase
      .from(config.productsTable)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    return Array.isArray(data) ? data.map(mapRowToProduct) : [];
  };

  const fetchOrders = async () => {
    const supabase = getClient();
    if (!supabase) {
      return [];
    }

    await requireUser();

    const config = getConfig();
    const { data, error } = await supabase
      .from(config.ordersTable)
      .select("*")
      .order("created_at", { ascending: false })
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    return Array.isArray(data) ? data.map(mapRowToOrder) : [];
  };

  const fetchPublicOrder = async (orderId) => {
    const supabase = getClient();
    if (!supabase) {
      return null;
    }

    const config = getConfig();
    const normalizedId = normalizeText(orderId);
    if (!normalizedId) {
      return null;
    }

    const { data, error } = await supabase
      .from(config.orderTrackingTable)
      .select("id, product_name, quantity, delivery_area, status, note, order_total, created_at, updated_at")
      .eq("id", normalizedId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapRowToOrder(data) : null;
  };

  const fetchSetting = async (key) => {
    const supabase = getClient();
    if (!supabase) {
      return null;
    }

    const config = getConfig();
    const settingKey = normalizeText(key);
    if (!settingKey) {
      return null;
    }

    const { data, error } = await supabase
      .from(config.settingsTable)
      .select("value")
      .eq("key", settingKey)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data && typeof data.value !== "undefined" ? data.value : null;
  };

  const saveSetting = async (key, value) => {
    const supabase = getClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    await requireUser();

    const config = getConfig();
    const settingKey = normalizeText(key);
    if (!settingKey) {
      throw new Error("Setting key is required.");
    }

    const row = {
      key: settingKey,
      value: value === undefined ? null : value,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from(config.settingsTable)
      .upsert(row, { onConflict: "key" });

    if (error) {
      throw error;
    }

    return row.value;
  };

  const fetchCustomerProfile = async () => {
    const supabase = getClient();
    if (!supabase) {
      return null;
    }

    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    const fallbackProfile = normalizeProfileInput(user.user_metadata, user.email);
    return {
      userId: normalizeText(user.id),
      email: normalizeText(user.email),
      fullName: fallbackProfile.fullName,
      phone: fallbackProfile.phone,
      deliveryArea: fallbackProfile.deliveryArea,
      createdAt: "",
      updatedAt: "",
    };
  };

  const saveCustomerProfile = async (profile) => {
    const supabase = getClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    const user = await requireUser();
    const normalized = normalizeProfileInput(profile, user.email);

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: normalized.fullName,
        phone: normalized.phone,
        delivery_area: normalized.deliveryArea,
      },
    });

    if (authError) {
      throw authError;
    }

    const refreshedUser = await getCurrentUser();
    const nextProfile = normalizeProfileInput(
      refreshedUser && refreshedUser.user_metadata,
      refreshedUser && refreshedUser.email ? refreshedUser.email : user.email
    );

    return {
      userId: normalizeText((refreshedUser && refreshedUser.id) || user.id),
      email: normalizeText((refreshedUser && refreshedUser.email) || user.email),
      fullName: nextProfile.fullName,
      phone: nextProfile.phone,
      deliveryArea: nextProfile.deliveryArea,
      createdAt: "",
      updatedAt: new Date().toISOString(),
    };
  };

  const invokeFunction = async (functionName, body) => {
    const supabase = getClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    const normalizedName = normalizeText(functionName);
    if (!normalizedName) {
      throw new Error("Function name is required.");
    }

    const { data, error } = await supabase.functions.invoke(normalizedName, {
      body: normalizeObject(body),
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const getCurrentUser = async () => {
    const supabase = getClient();
    if (!supabase) {
      return null;
    }
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      if (error.status === 400 || error.message.includes("AuthSessionMissingError") || error.name === "AuthSessionMissingError") {
        return null;
      }
      throw error;
    }
    return data && data.user ? data.user : null;
  };

  const requireUser = async () => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Sign in to Supabase before publishing live products.");
    }
    return user;
  };

  const isAdmin = async () => {
    const supabase = getClient();
    if (!supabase) {
      return false;
    }
    const user = await getCurrentUser();
    if (!user) {
      return false;
    }
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .single();
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    return !!data;
  };

  const startMpesaCheckout = async (payload) => {
    const config = getConfig();
    const response = await invokeFunction(config.mpesaCheckoutFunction, payload);
    return normalizeObject(response);
  };

  const fetchMpesaCheckoutStatus = async (reference) => {
    const config = getConfig();
    const response = await invokeFunction(config.mpesaCheckoutStatusFunction, {
      reference: normalizeText(reference),
    });
    return normalizeObject(response);
  };

  const saveProducts = async (products) => {
    const supabase = getClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    await requireUser();

    const config = getConfig();
    const rows = (Array.isArray(products) ? products : []).map((product, index) => mapProductToRow(product, index));
    const nextIds = new Set(rows.map((row) => row.id));

    const { data: existingRows, error: existingError } = await supabase
      .from(config.productsTable)
      .select("id");

    if (existingError) {
      throw existingError;
    }

    if (rows.length) {
      const { error: upsertError } = await supabase
        .from(config.productsTable)
        .upsert(rows, { onConflict: "id" });

      if (upsertError) {
        throw upsertError;
      }
    }

    const idsToDelete = (existingRows || [])
      .map((row) => normalizeText(row && row.id))
      .filter((id) => id && !nextIds.has(id));

    if (idsToDelete.length) {
      const { error: deleteError } = await supabase
        .from(config.productsTable)
        .delete()
        .in("id", idsToDelete);

      if (deleteError) {
        throw deleteError;
      }
    }

    return rows.map(mapRowToProduct);
  };

  const saveOrders = async (orders) => {
    const supabase = getClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    await requireUser();

    const config = getConfig();
    const adminRows = (Array.isArray(orders) ? orders : [])
      .map(mapOrderToAdminRow)
      .filter((row) => row.id);
    const trackingRows = adminRows.map((row) =>
      mapOrderToTrackingRow({
        id: row.id,
        productName: row.product_name,
        quantity: row.quantity,
        areaName: row.delivery_area,
        status: row.status,
        note: row.note,
        orderTotal: row.order_total,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })
    );

    if (!adminRows.length) {
      return [];
    }

    const { error: orderError } = await supabase
      .from(config.ordersTable)
      .upsert(adminRows, { onConflict: "id" });

    if (orderError) {
      throw orderError;
    }

    const { error: trackingError } = await supabase
      .from(config.orderTrackingTable)
      .upsert(trackingRows, { onConflict: "id" });

    if (trackingError) {
      throw trackingError;
    }

    return adminRows.map(mapRowToOrder);
  };

  const saveOrder = async (order) => {
    const savedOrders = await saveOrders([order]);
    return savedOrders[0] || null;
  };

  const deleteOrder = async (orderId) => {
    const supabase = getClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    await requireUser();

    const config = getConfig();
    const normalizedId = normalizeText(orderId);
    if (!normalizedId) {
      throw new Error("Order ID is required.");
    }

    const { error } = await supabase
      .from(config.ordersTable)
      .delete()
      .eq("id", normalizedId);

    if (error) {
      throw error;
    }
  };

  const clearOrders = async () => {
    const supabase = getClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    await requireUser();

    const config = getConfig();
    const { error } = await supabase
      .from(config.ordersTable)
      .delete()
      .gte("created_at", "1970-01-01T00:00:00.000Z");

    if (error) {
      throw error;
    }
  };

  const saveAnalyticsEvents = async (events) => {
    const supabase = getClient();
    if (!supabase) {
      return [];
    }

    const config = getConfig();
    const rows = (Array.isArray(events) ? events : [])
      .map(mapAnalyticsEventToRow)
      .filter((row) => row.name);

    if (!rows.length) {
      return [];
    }

    const { error } = await supabase
      .from(config.analyticsTable)
      .insert(rows);

    if (error) {
      throw error;
    }

    return rows.map((row) => ({
      name: row.name,
      timestamp: row.created_at,
      payload: buildAnalyticsPayload(row.event_payload)
    }));
  };

  const fetchAnalyticsEvents = async (limit = 200) => {
    const supabase = getClient();
    if (!supabase) {
      return [];
    }

    const config = getConfig();
    const { data, error } = await supabase
      .from(config.analyticsTable)
      .select("id, name, page_type, page_path, page_title, product_id, product_name, item_list_id, item_list_name, button_label, destination, value, currency, visitor_id, session_id, event_payload, created_at")
      .order("created_at", { ascending: false })
      .limit(Math.max(1, Number(limit) || 200));

    if (error) {
      throw error;
    }

    return Array.isArray(data) ? data.map(mapRowToAnalyticsEvent) : [];
  };

  const clearAnalyticsEvents = async () => {
    const supabase = getClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    await requireUser();

    const config = getConfig();
    const { error } = await supabase
      .from(config.analyticsTable)
      .delete()
      .gte("created_at", "1970-01-01T00:00:00.000Z");

    if (error) {
      throw error;
    }
  };

  const fetchApprovedReviews = async () => {
    const config = getConfig();
    const value = await fetchSetting(config.approvedReviewsSettingKey || "storefront_reviews");
    return Array.isArray(value) ? value.map(normalizeReview).filter((review) => review.productId && review.message) : [];
  };

  const saveApprovedReviews = async (reviews) => {
    const config = getConfig();
    const normalized = (Array.isArray(reviews) ? reviews : [])
      .map(normalizeReview)
      .filter((review) => review.productId && review.message);
    return saveSetting(config.approvedReviewsSettingKey || "storefront_reviews", normalized);
  };

  const fetchReviewModeration = async () => {
    const config = getConfig();
    const value = await fetchSetting(config.reviewModerationSettingKey || "storefront_review_moderation");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  };

  const saveReviewModeration = async (moderationMap) => {
    const config = getConfig();
    const nextValue = moderationMap && typeof moderationMap === "object" && !Array.isArray(moderationMap)
      ? moderationMap
      : {};
    return saveSetting(config.reviewModerationSettingKey || "storefront_review_moderation", nextValue);
  };

  const submitProductReview = async (review) => {
    const normalized = normalizeReview(review);

    await saveAnalyticsEvents([{
      name: "review_submission",
      timestamp: normalized.createdAt || new Date().toISOString(),
      payload: {
        page_type: "product",
        page_path: normalized.productId ? `/product.html?id=${encodeURIComponent(normalized.productId)}` : "/product.html",
        product_id: normalized.productId,
        product_name: normalized.productName,
        category: normalized.category,
        review_id: normalized.id,
        review_author: normalized.author,
        review_location: normalized.location,
        review_rating: normalized.rating,
        review_message: normalized.message,
        review_status: normalized.status || "pending",
      }
    }]);

    return normalized;
  };

  const fetchReviewSubmissions = async (limit = 200) => {
    const supabase = getClient();
    if (!supabase) {
      return [];
    }

    const config = getConfig();
    const { data, error } = await supabase
      .from(config.analyticsTable)
      .select("id, name, event_payload, created_at")
      .eq("name", "review_submission")
      .order("created_at", { ascending: false })
      .limit(Math.max(1, Number(limit) || 200));

    if (error) {
      throw error;
    }

    return Array.isArray(data)
      ? data
          .map((row) => {
            const payload = buildAnalyticsPayload(row && row.event_payload);
            return normalizeReview({
              id: normalizeText(row && row.id) || payload.review_id,
              sourceId: payload.review_id || normalizeText(row && row.id),
              productId: payload.product_id,
              productName: payload.product_name,
              category: payload.category,
              author: payload.review_author,
              location: payload.review_location,
              rating: payload.review_rating,
              message: payload.review_message,
              status: payload.review_status || "pending",
              createdAt: normalizeText(row && row.created_at),
            });
          })
          .filter((review) => review.productId && review.message)
      : [];
  };

  const uploadProductImage = async (file) => {
    const supabase = getClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    await requireUser();

    const config = getConfig();
    const rawName = file && file.name ? file.name : "product-image";
    const extensionMatch = rawName.match(/(\.[a-z0-9]+)$/i);
    const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "";
    const baseName = extension ? rawName.slice(0, -extension.length) : rawName;
    const safeName = `${slugify(baseName)}${extension}`;
    const objectPath = `${normalizeText(config.storageFolder) || "catalog"}/${Date.now()}-${safeName}`;

    const { data, error } = await supabase.storage
      .from(config.storageBucket)
      .upload(objectPath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file && file.type ? file.type : undefined,
      });

    if (error) {
      throw error;
    }

    const { data: publicData } = supabase.storage
      .from(config.storageBucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl: publicData && publicData.publicUrl ? publicData.publicUrl : "",
    };
  };

  const signInWithPassword = async (email, password) => {
    const supabase = getClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeText(email),
      password: String(password || ""),
    });
    if (error) {
      throw error;
    }
    return data;
  };

  const signUpWithPassword = async (email, password, profile) => {
    const supabase = getClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }
    const normalizedProfile = normalizeProfileInput(profile, email);
    const metadata = {
      full_name: normalizedProfile.fullName,
      phone: normalizedProfile.phone,
      delivery_area: normalizedProfile.deliveryArea,
    };
    const { data, error } = await supabase.auth.signUp({
      email: normalizeText(email),
      password: String(password || ""),
      options: {
        data: metadata,
      },
    });
    if (error) {
      throw error;
    }

    if (data && data.session && data.user) {
      try {
        await saveCustomerProfile({
          email: normalizeText(data.user.email),
          fullName: normalizedProfile.fullName,
          phone: normalizedProfile.phone,
          deliveryArea: normalizedProfile.deliveryArea,
        });
      } catch (profileError) {
        console.warn("Customer signup succeeded, but profile sync did not complete.", profileError);
      }
    }

    return data;
  };

  const signOut = async () => {
    const supabase = getClient();
    if (!supabase) {
      return;
    }
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      throw error;
    }
  };

  const onAuthStateChange = (callback) => {
    const supabase = getClient();
    if (!supabase) {
      return function noop() {};
    }

    const { data } = supabase.auth.onAuthStateChange(function handleAuthChange(_event, session) {
      callback(session && session.user ? session.user : null);
    });

    return function unsubscribe() {
      if (data && data.subscription) {
        data.subscription.unsubscribe();
      }
    };
  };

  window.SharonCraftCatalog = {
    getConfig,
    isConfigured,
    getClient,
    fetchProducts,
    saveProducts,
    fetchOrders,
    saveOrders,
    saveOrder,
    fetchPublicOrder,
    deleteOrder,
    clearOrders,
    fetchSetting,
    saveSetting,
    fetchCustomerProfile,
    saveCustomerProfile,
    saveAnalyticsEvents,
    fetchAnalyticsEvents,
    clearAnalyticsEvents,
    submitProductReview,
    fetchReviewSubmissions,
    fetchApprovedReviews,
    saveApprovedReviews,
    fetchReviewModeration,
    saveReviewModeration,
    uploadProductImage,
    signInWithPassword,
    signUpWithPassword,
    signOut,
    getCurrentUser,
    isAdmin,
    startMpesaCheckout,
    fetchMpesaCheckoutStatus,
    onAuthStateChange,
  };
}());
