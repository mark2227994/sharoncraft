(function () {
  const defaultConfig = {
    url: "",
    anonKey: "",
    productsTable: "products",
    settingsTable: "site_settings",
    analyticsTable: "analytics_events",
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

  const getCurrentUser = async () => {
    const supabase = getClient();
    if (!supabase) {
      return null;
    }
    const { data, error } = await supabase.auth.getUser();
    if (error) {
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
    const metadata = profile && typeof profile === "object"
      ? profile
      : {};
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
    fetchSetting,
    saveSetting,
    saveAnalyticsEvents,
    fetchAnalyticsEvents,
    clearAnalyticsEvents,
    uploadProductImage,
    signInWithPassword,
    signUpWithPassword,
    signOut,
    getCurrentUser,
    isAdmin,
    onAuthStateChange,
  };
}());
