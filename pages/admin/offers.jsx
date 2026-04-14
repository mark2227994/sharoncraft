import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../../components/admin/AdminLayout";
import { categoryOptions } from "../../data/site";
import { getJewelryTypeLabel, jewelryTypeOptions } from "../../lib/products";

const OFFER_TYPE_OPTIONS = [
  { value: "seasonal", label: "Seasonal" },
  { value: "weekly", label: "Weekly" },
  { value: "bundle", label: "Bundle" },
  { value: "private-whatsapp", label: "Private WhatsApp" },
];

const DISCOUNT_TYPE_OPTIONS = [
  { value: "percentage", label: "Percentage off" },
  { value: "fixed", label: "Fixed amount off" },
  { value: "bundle-price", label: "Bundle price" },
  { value: "free-delivery", label: "Free delivery" },
  { value: "none", label: "No discount, spotlight only" },
];

const APPLY_TO_OPTIONS = [
  { value: "product", label: "Specific product" },
  { value: "category", label: "Category" },
  { value: "jewelryType", label: "Jewellery type" },
  { value: "sitewide", label: "Whole shop" },
];

const OFFER_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
];

const SEASON_PRESETS = [
  { label: "Black Friday", badge: "Limited Offer", type: "seasonal" },
  { label: "Christmas Gift Edit", badge: "Gift Ready", type: "seasonal" },
  { label: "Easter Colour Edit", badge: "Holiday Pick", type: "seasonal" },
  { label: "Bridal Season Picks", badge: "Bridal Pick", type: "seasonal" },
  { label: "Weekly Jewellery Spotlight", badge: "This Week", type: "weekly" },
];

const categories = categoryOptions.filter((category) => category !== "All");

async function fetchOffers() {
  const response = await fetch("/api/admin/offers", { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error("Could not load offers");
  }
  return response.json();
}

async function saveOffer(item) {
  const response = await fetch("/api/admin/offers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ item }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error || "Could not save offer");
  }
  return body;
}

async function deleteOffer(id) {
  const response = await fetch(`/api/admin/offers?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  if (!response.ok) {
    throw new Error("Could not delete offer");
  }
  return response.json();
}

function OfferStat({ label, value, note, attention = false }) {
  return (
    <article className="admin-stat-card">
      <p className="admin-stat-card__label">{label}</p>
      <p className={`admin-stat-card__value ${attention ? "admin-stat-card__value--terracotta" : ""}`}>{value}</p>
      <p className="admin-stat-card__delta">{note}</p>
    </article>
  );
}

function getOfferTargetLabel(offer, products) {
  if (offer.appliesTo === "sitewide") {
    return "Whole shop";
  }

  if (offer.appliesTo === "category") {
    return offer.category || "Category";
  }

  if (offer.appliesTo === "jewelryType") {
    return offer.jewelryType ? getJewelryTypeLabel(offer.jewelryType) : "Jewellery type";
  }

  if (offer.appliesTo === "product") {
    const product = products.find((entry) => entry.id === offer.productId);
    return product?.name || "Selected product";
  }

  return "Offer target";
}

function getOfferValueLabel(offer) {
  if (offer.discountType === "percentage") {
    return `${offer.discountValue || 0}% off`;
  }
  if (offer.discountType === "fixed") {
    return `KES ${Number(offer.discountValue || 0).toLocaleString()} off`;
  }
  if (offer.discountType === "bundle-price") {
    return `Bundle at KES ${Number(offer.discountValue || 0).toLocaleString()}`;
  }
  if (offer.discountType === "free-delivery") {
    return "Free delivery";
  }
  return "Spotlight only";
}

export default function AdminOffersPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    offerType: "seasonal",
    startDate: "",
    endDate: "",
    discountType: "percentage",
    discountValue: "",
    appliesTo: "product",
    productId: "",
    category: "Jewellery",
    jewelryType: "necklace",
    badge: "",
    status: "draft",
    whatsappCopy: "",
    instagramCopy: "",
    facebookCopy: "",
    note: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: fetchOffers,
  });

  const saveMutation = useMutation({
    mutationFn: saveOffer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-offers"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOffer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-offers"] }),
  });

  const offers = data?.offers || [];
  const products = data?.products || [];

  const activeOffers = useMemo(() => offers.filter((offer) => offer.status === "active").length, [offers]);
  const seasonalOffers = useMemo(() => offers.filter((offer) => offer.offerType === "seasonal").length, [offers]);
  const whatsappOffers = useMemo(() => offers.filter((offer) => offer.offerType === "private-whatsapp").length, [offers]);

  const showProductSelect = form.appliesTo === "product";
  const showCategorySelect = form.appliesTo === "category";
  const showJewelryTypeSelect = form.appliesTo === "jewelryType";
  const showDiscountValue = form.discountType === "percentage" || form.discountType === "fixed" || form.discountType === "bundle-price";

  async function handleSave() {
    if (!form.title.trim()) return;

    await saveMutation.mutateAsync({
      ...form,
      title: form.title.trim(),
      badge: form.badge.trim(),
      discountValue: showDiscountValue ? Number(form.discountValue || 0) : 0,
      whatsappCopy: form.whatsappCopy.trim(),
      instagramCopy: form.instagramCopy.trim(),
      facebookCopy: form.facebookCopy.trim(),
      note: form.note.trim(),
    });

    setForm({
      title: "",
      offerType: "seasonal",
      startDate: "",
      endDate: "",
      discountType: "percentage",
      discountValue: "",
      appliesTo: "product",
      productId: "",
      category: "Jewellery",
      jewelryType: "necklace",
      badge: "",
      status: "draft",
      whatsappCopy: "",
      instagramCopy: "",
      facebookCopy: "",
      note: "",
    });
  }

  function applyPreset(preset) {
    setForm((current) => ({
      ...current,
      title: preset.label,
      offerType: preset.type,
      badge: preset.badge,
      status: current.status || "draft",
    }));
  }

  return (
    <AdminLayout title="Offers">
      <section className="admin-stats-grid" style={{ marginBottom: "var(--space-5)" }}>
        <OfferStat label="Active Offers" value={activeOffers} note="Offers currently live on your side" />
        <OfferStat label="Seasonal Offers" value={seasonalOffers} note="Holiday and seasonal campaigns" />
        <OfferStat label="Private WhatsApp" value={whatsappOffers} note="Offers meant for direct follow-up" attention={whatsappOffers > 0} />
      </section>

      <section className="admin-panel" style={{ marginBottom: "var(--space-5)" }}>
        <p className="overline" style={{ color: "var(--color-ochre)", marginBottom: "8px" }}>
          Quick Presets
        </p>
        <p className="body-sm" style={{ color: "var(--text-secondary)", marginBottom: "var(--space-3)" }}>
          Start from a familiar seasonal campaign, then adjust the details to match your products.
        </p>
        <div className="admin-quick-actions" style={{ marginTop: 0 }}>
          {SEASON_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="admin-button admin-button--secondary"
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      <section className="offers-grid">
        <div className="admin-panel offers-panel">
          <p className="overline" style={{ color: "var(--color-ochre)", marginBottom: "8px" }}>
            Offers Manager
          </p>
          <h2 className="heading-md" style={{ marginBottom: "10px" }}>
            Create clean seasonal and weekly offers
          </h2>
          <p className="body-sm" style={{ color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
            Keep your promotions curated. Use this for Christmas, Easter, Black Friday, bridal season, weekly spotlight,
            and private WhatsApp offers without making the brand feel noisy.
          </p>

          <div className="admin-grid-2">
            <label className="admin-field">
              <span>Offer title</span>
              <input
                className="admin-input"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Christmas Gift Edit"
              />
            </label>
            <label className="admin-field">
              <span>Offer type</span>
              <select
                className="admin-select"
                value={form.offerType}
                onChange={(event) => setForm((current) => ({ ...current, offerType: event.target.value }))}
              >
                {OFFER_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="admin-grid-2">
            <label className="admin-field">
              <span>Start date</span>
              <input
                type="date"
                className="admin-input"
                value={form.startDate}
                onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>End date</span>
              <input
                type="date"
                className="admin-input"
                value={form.endDate}
                onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
              />
            </label>
          </div>

          <div className="admin-grid-2">
            <label className="admin-field">
              <span>Discount type</span>
              <select
                className="admin-select"
                value={form.discountType}
                onChange={(event) => setForm((current) => ({ ...current, discountType: event.target.value }))}
              >
                {DISCOUNT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {showDiscountValue ? (
              <label className="admin-field">
                <span>{form.discountType === "percentage" ? "Discount value (%)" : "Discount value"}</span>
                <input
                  type="number"
                  min="0"
                  className="admin-input"
                  value={form.discountValue}
                  onChange={(event) => setForm((current) => ({ ...current, discountValue: event.target.value }))}
                  placeholder={form.discountType === "percentage" ? "15" : "2500"}
                />
              </label>
            ) : (
              <label className="admin-field">
                <span>Offer effect</span>
                <input className="admin-input" value="No extra value needed" readOnly />
              </label>
            )}
          </div>

          <div className="admin-grid-2">
            <label className="admin-field">
              <span>Applies to</span>
              <select
                className="admin-select"
                value={form.appliesTo}
                onChange={(event) => setForm((current) => ({ ...current, appliesTo: event.target.value }))}
              >
                {APPLY_TO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>Status</span>
              <select
                className="admin-select"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                {OFFER_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {showProductSelect ? (
            <label className="admin-field">
              <span>Product</span>
              <select
                className="admin-select"
                value={form.productId}
                onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}
              >
                <option value="">Choose product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {showCategorySelect ? (
            <label className="admin-field">
              <span>Category</span>
              <select
                className="admin-select"
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {showJewelryTypeSelect ? (
            <label className="admin-field">
              <span>Jewellery type</span>
              <select
                className="admin-select"
                value={form.jewelryType}
                onChange={(event) => setForm((current) => ({ ...current, jewelryType: event.target.value }))}
              >
                {jewelryTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {getJewelryTypeLabel(type)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="admin-grid-2">
            <label className="admin-field">
              <span>Offer badge</span>
              <input
                className="admin-input"
                value={form.badge}
                onChange={(event) => setForm((current) => ({ ...current, badge: event.target.value }))}
                placeholder="Holiday Pick, This Week, Gift Ready..."
              />
            </label>
            <label className="admin-field">
              <span>Admin note</span>
              <input
                className="admin-input"
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                placeholder="Use for repeat buyers, bridal season, Nairobi delivery..."
              />
            </label>
          </div>

          <label className="admin-field">
            <span>WhatsApp copy</span>
            <textarea
              className="admin-textarea"
              rows={3}
              value={form.whatsappCopy}
              onChange={(event) => setForm((current) => ({ ...current, whatsappCopy: event.target.value }))}
              placeholder="Short, personal offer text for direct messages or status."
            />
          </label>

          <div className="admin-grid-2">
            <label className="admin-field">
              <span>Instagram copy</span>
              <textarea
                className="admin-textarea"
                rows={4}
                value={form.instagramCopy}
                onChange={(event) => setForm((current) => ({ ...current, instagramCopy: event.target.value }))}
                placeholder="Caption for posts or reels."
              />
            </label>
            <label className="admin-field">
              <span>Facebook copy</span>
              <textarea
                className="admin-textarea"
                rows={4}
                value={form.facebookCopy}
                onChange={(event) => setForm((current) => ({ ...current, facebookCopy: event.target.value }))}
                placeholder="Trust-building caption for Facebook."
              />
            </label>
          </div>

          <button type="button" className="admin-button" onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save Offer"}
          </button>
          {saveMutation.error ? <p className="admin-form-error">{saveMutation.error.message}</p> : null}
        </div>

        <div className="admin-panel offers-panel">
          <p className="overline" style={{ color: "var(--color-ochre)", marginBottom: "8px" }}>
            Saved Offers
          </p>
          <h2 className="heading-md" style={{ marginBottom: "10px" }}>
            Keep your promotions tidy and easy to scan
          </h2>

          {isLoading ? <p className="admin-note">Loading offers...</p> : null}
          {!isLoading && offers.length === 0 ? (
            <p className="admin-note">No offers saved yet. Start with a preset above or create one from scratch.</p>
          ) : null}

          <div className="offers-list">
            {offers
              .slice()
              .sort((left, right) => String(right.updatedAt || "").localeCompare(String(left.updatedAt || "")))
              .map((offer) => (
                <article key={offer.id} className="offer-card">
                  <div className="offer-card__top">
                    <div>
                      <p className="heading-sm">{offer.title}</p>
                      <p className="caption">
                        {offer.offerType} · {getOfferTargetLabel(offer, products)} · {getOfferValueLabel(offer)}
                      </p>
                    </div>
                    <span
                      className={`admin-pill ${
                        offer.status === "active"
                          ? "admin-pill--completed"
                          : offer.status === "expired"
                            ? "admin-pill--failed"
                            : "admin-pill--pending"
                      }`}
                    >
                      {offer.status}
                    </span>
                  </div>

                  <div className="offer-card__meta">
                    <span>{offer.startDate || "No start date"}</span>
                    <span>{offer.endDate || "No end date"}</span>
                    <span>{offer.badge || "No badge"}</span>
                  </div>

                  {offer.note ? <p className="body-sm">{offer.note}</p> : null}

                  <div className="offer-card__copy">
                    {offer.whatsappCopy ? (
                      <div className="offer-card__snippet">
                        <p className="caption">WhatsApp</p>
                        <p className="body-sm">{offer.whatsappCopy}</p>
                      </div>
                    ) : null}
                    {offer.instagramCopy ? (
                      <div className="offer-card__snippet">
                        <p className="caption">Instagram</p>
                        <p className="body-sm">{offer.instagramCopy}</p>
                      </div>
                    ) : null}
                    {offer.facebookCopy ? (
                      <div className="offer-card__snippet">
                        <p className="caption">Facebook</p>
                        <p className="body-sm">{offer.facebookCopy}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="admin-quick-actions" style={{ marginTop: "var(--space-3)" }}>
                    <button
                      type="button"
                      className="admin-button admin-button--secondary"
                      onClick={() => deleteMutation.mutate(offer.id)}
                      disabled={deleteMutation.isPending}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .offers-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.95fr);
          gap: var(--space-5);
        }
        .offers-panel {
          padding: var(--space-5);
        }
        .offers-list {
          display: grid;
          gap: var(--space-3);
          margin-top: var(--space-4);
        }
        .offer-card {
          padding: var(--space-4);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          background: var(--bg-card-alt);
        }
        .offer-card__top {
          display: flex;
          justify-content: space-between;
          gap: var(--space-3);
          align-items: flex-start;
          margin-bottom: var(--space-3);
        }
        .offer-card__meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
          color: var(--text-muted);
          font-size: 0.8125rem;
        }
        .offer-card__copy {
          display: grid;
          gap: var(--space-3);
        }
        .offer-card__snippet {
          padding: var(--space-3);
          border: 1px solid rgba(28, 18, 9, 0.08);
          border-radius: var(--radius-md);
          background: var(--color-white);
        }
        @media (max-width: 1100px) {
          .offers-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 767px) {
          .offer-card__top {
            flex-direction: column;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
