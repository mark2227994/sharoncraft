(function () {
  const defaultConfig = {
    url: "",
    anonKey: "",
    productsTable: "products",
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
    uploadProductImage,
    signInWithPassword,
    signUpWithPassword,
    signOut,
    getCurrentUser,
    onAuthStateChange,
  };
}());
