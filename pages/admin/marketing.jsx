import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import AdminLayout from "../../components/admin/AdminLayout";

const PLATFORM_OPTIONS = ["TikTok", "Instagram", "Facebook", "WhatsApp"];
const CONTENT_TYPE_OPTIONS = ["New Drop", "Bridal", "Gift Ready", "Behind the Scenes", "Styling Video", "Best Seller"];
const CAMPAIGN_STATUS_OPTIONS = ["draft", "scheduled", "posted", "boosting", "finished"];
const LEAD_STATUS_OPTIONS = ["new lead", "asked price", "wants custom color", "bridal inquiry", "ready to order", "follow up later", "converted"];

async function fetchMarketingStudio() {
  const response = await fetch("/api/admin/marketing", { credentials: "same-origin" });
  if (!response.ok) throw new Error("Could not load Marketing Studio");
  return response.json();
}

async function saveMarketingItem(payload) {
  const response = await fetch("/api/admin/marketing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || "Could not save this item.");
  }
  return response.json();
}

async function deleteMarketingItem(section, id) {
  const response = await fetch(`/api/admin/marketing?section=${encodeURIComponent(section)}&id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  if (!response.ok) throw new Error("Could not delete item.");
  return response.json();
}

async function generateLaunchPack(payload) {
  const response = await fetch("/api/admin/generate-marketing-pack", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error || "Could not generate launch pack.");
  }
  return body;
}

function CompactStat({ label, value, note, attention = false }) {
  return (
    <article className="admin-stat-card">
      <p className="admin-stat-card__label">{label}</p>
      <p className={`admin-stat-card__value ${attention ? "admin-stat-card__value--terracotta" : ""}`}>{value}</p>
      <p className="admin-stat-card__delta">{note}</p>
    </article>
  );
}

function SnippetCard({ title, text }) {
  return (
    <div className="marketing-pack__snippet">
      <p className="caption marketing-pack__label">{title}</p>
      <p className="body-sm">{text || "Nothing generated yet."}</p>
    </div>
  );
}

function formatCurrency(value) {
  return `KES ${Number(value || 0).toLocaleString()}`;
}

function splitTags(value) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function AdminMarketingPage() {
  const queryClient = useQueryClient();
  const [angle, setAngle] = useState("style");
  const [goal, setGoal] = useState("sales");
  const [notes, setNotes] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [campaignForm, setCampaignForm] = useState({
    title: "",
    platform: "Instagram",
    status: "draft",
    cta: "",
  });
  const [plannerForm, setPlannerForm] = useState({
    title: "",
    platform: "TikTok",
    contentType: "New Drop",
    scheduledFor: "",
    status: "planned",
  });
  const [leadForm, setLeadForm] = useState({
    name: "",
    source: "WhatsApp",
    phone: "",
    interest: "",
    status: "new lead",
    tags: "",
    note: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-marketing"],
    queryFn: fetchMarketingStudio,
  });

  const saveMutation = useMutation({
    mutationFn: saveMarketingItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-marketing"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ section, id }) => deleteMarketingItem(section, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-marketing"] }),
  });

  const generateMutation = useMutation({
    mutationFn: generateLaunchPack,
  });

  const products = data?.products || [];
  const studio = data?.studio || { campaigns: [], planner: [], leads: [], abandonedCheckouts: [] };
  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId || product.slug === selectedProductId) || null,
    [products, selectedProductId],
  );

  const generatedPack = generateMutation.data?.pack || null;
  const plannerItems = studio.planner || [];
  const campaigns = studio.campaigns || [];
  const leads = studio.leads || [];
  const abandonedCheckouts = studio.abandonedCheckouts || [];

  const plannerUpcoming = plannerItems.filter((item) => item.status !== "posted").length;
  const activeCampaigns = campaigns.filter((item) => ["draft", "scheduled", "boosting"].includes(item.status)).length;
  const warmLeads = leads.filter((item) => ["ready to order", "bridal inquiry", "asked price"].includes(item.status)).length;
  const openAbandoned = abandonedCheckouts.filter((item) => item.status !== "converted").length;

  async function handleSaveCampaign() {
    const resolvedTitle = campaignForm.title.trim() || generatedPack?.campaignTitle || selectedProduct?.name || "";
    if (!resolvedTitle) return;

    await saveMutation.mutateAsync({
      section: "campaigns",
      item: {
        title: resolvedTitle,
        platform: campaignForm.platform,
        status: campaignForm.status,
        cta: campaignForm.cta.trim() || generatedPack?.cta || "",
        productId: selectedProduct?.id || "",
        generatedPack,
      },
    });

    setCampaignForm((current) => ({ ...current, title: "", cta: "" }));
  }

  async function handleSavePlanner() {
    if (!plannerForm.title.trim()) return;

    await saveMutation.mutateAsync({
      section: "planner",
      item: {
        title: plannerForm.title.trim(),
        platform: plannerForm.platform,
        contentType: plannerForm.contentType,
        scheduledFor: plannerForm.scheduledFor,
        status: plannerForm.status,
      },
    });

    setPlannerForm((current) => ({ ...current, title: "", scheduledFor: "" }));
  }

  async function handleSaveLead() {
    if (!leadForm.name.trim()) return;

    await saveMutation.mutateAsync({
      section: "leads",
      item: {
        name: leadForm.name.trim(),
        source: leadForm.source,
        phone: leadForm.phone.trim(),
        interest: leadForm.interest.trim(),
        status: leadForm.status,
        tags: splitTags(leadForm.tags),
        note: leadForm.note.trim(),
      },
    });

    setLeadForm({
      name: "",
      source: "WhatsApp",
      phone: "",
      interest: "",
      status: "new lead",
      tags: "",
      note: "",
    });
  }

  async function handleConvertAbandoned(entry) {
    await saveMutation.mutateAsync({
      section: "leads",
      item: {
        name: entry.name || "Checkout lead",
        source: "Checkout",
        phone: entry.phone || "",
        interest: (entry.items || []).map((item) => item.name).filter(Boolean).join(", "),
        status: "follow up later",
        tags: ["abandoned-checkout", "checkout-intent"],
        note: entry.area ? `Delivery area: ${entry.area}` : "",
      },
    });

    await saveMutation.mutateAsync({
      section: "abandonedCheckouts",
      item: {
        ...entry,
        status: "converted",
      },
    });
  }

  return (
    <AdminLayout title="Marketing Studio">
      <section className="admin-stats-grid" style={{ marginBottom: "var(--space-5)" }}>
        <CompactStat label="Active Campaigns" value={activeCampaigns} note="Drafts, scheduled, and boosting" />
        <CompactStat label="Upcoming Posts" value={plannerUpcoming} note="Content still waiting to go live" />
        <CompactStat label="Warm Leads" value={warmLeads} note="People most likely to convert next" attention={warmLeads > 0} />
        <CompactStat label="Abandoned Checkouts" value={openAbandoned} note="Started checkout but did not finish" attention={openAbandoned > 0} />
      </section>

      {isLoading ? <p className="admin-note">Loading Marketing Studio...</p> : null}

      <section className="marketing-grid">
        <div className="admin-panel marketing-panel">
          <p className="overline marketing-panel__eyebrow">Launch Pack Generator</p>
          <h2 className="heading-md marketing-panel__title">Generate one campaign pack from a product</h2>
          <p className="body-sm marketing-panel__intro">
            Pick one product, choose an angle, and get ready-to-use copy for TikTok, Instagram, Facebook, and WhatsApp.
          </p>

          <div className="admin-grid-2">
            <label className="admin-field">
              <span>Product</span>
              <select
                className="admin-select"
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
              >
                <option value="">Choose product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>Angle</span>
              <select className="admin-select" value={angle} onChange={(event) => setAngle(event.target.value)}>
                <option value="style">Style angle</option>
                <option value="gift">Gift angle</option>
                <option value="culture">Culture and craft angle</option>
                <option value="bridal">Bridal angle</option>
              </select>
            </label>
          </div>
          <div className="admin-panel marketing-panel">
            <p className="overline marketing-panel__eyebrow">Leads</p>
            <h2 className="heading-md marketing-panel__title">Track interested buyers simply</h2>
            <div className="admin-grid-2">
              <label className="admin-field">
                <span>Name</span>
                <input
                  className="admin-input"
                  value={leadForm.name}
                  onChange={(event) => setLeadForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Customer name"
                />
              </label>
              <label className="admin-field">
                <span>Source</span>
                <select
                  className="admin-select"
                  value={leadForm.source}
                  onChange={(event) => setLeadForm((current) => ({ ...current, source: event.target.value }))}
                >
                  {[...PLATFORM_OPTIONS, "Checkout", "Facebook DM", "Instagram DM"].map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="admin-grid-2">
              <label className="admin-field">
                <span>Phone / handle</span>
                <input
                  className="admin-input"
                  value={leadForm.phone}
                  onChange={(event) => setLeadForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="0712... or @username"
                />
              </label>
              <label className="admin-field">
                <span>Status</span>
                <select
                  className="admin-select"
                  value={leadForm.status}
                  onChange={(event) => setLeadForm((current) => ({ ...current, status: event.target.value }))}
                >
                  {LEAD_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="admin-field">
              <span>Interest</span>
              <input
                className="admin-input"
                value={leadForm.interest}
                onChange={(event) => setLeadForm((current) => ({ ...current, interest: event.target.value }))}
                placeholder="Blue bridal set, custom necklace, gift order..."
              />
            </label>
            <label className="admin-field">
              <span>Customer tags / segments</span>
              <input
                className="admin-input"
                value={leadForm.tags}
                onChange={(event) => setLeadForm((current) => ({ ...current, tags: event.target.value }))}
                placeholder="bridal, repeat buyer, gift, custom order"
              />
            </label>
            <label className="admin-field">
              <span>Note</span>
              <textarea
                className="admin-textarea"
                rows={3}
                value={leadForm.note}
                onChange={(event) => setLeadForm((current) => ({ ...current, note: event.target.value }))}
                placeholder="Asked price, wants delivery Friday, likes red and gold beads..."
              />
            </label>
            <button type="button" className="admin-button" onClick={handleSaveLead} disabled={saveMutation.isPending}>
              Save Lead
            </button>

            <div className="marketing-list">
              {leads.length === 0 ? <p className="admin-note">No leads saved yet.</p> : null}
              {leads.map((lead) => (
                <div key={lead.id} className="marketing-list__item marketing-list__item--stack">
                  <div>
                    <p className="heading-sm">{lead.name}</p>
                    <p className="caption">
                      {lead.source} - {lead.status}
                    </p>
                    <p className="body-sm">{lead.interest || "No interest note yet."}</p>
                    {lead.phone ? <p className="caption">{lead.phone}</p> : null}
                    {lead.tags?.length ? (
                      <div className="marketing-tag-row">
                        {lead.tags.map((tag) => (
                          <span key={tag} className="marketing-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {lead.note ? <p className="caption marketing-note">{lead.note}</p> : null}
                  </div>
                  <button
                    type="button"
                    className="admin-button admin-button--secondary"
                    onClick={() => deleteMutation.mutate({ section: "leads", id: lead.id })}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-panel marketing-panel">
            <p className="overline marketing-panel__eyebrow">Abandoned Checkout</p>
            <h2 className="heading-md marketing-panel__title">Follow up before interest goes cold</h2>
            <p className="body-sm marketing-panel__intro">
              Customers appear here as soon as they start typing at checkout. Save them as leads if you want to follow
              up on WhatsApp or Instagram later.
            </p>

            <div className="marketing-list">
              {abandonedCheckouts.length === 0 ? <p className="admin-note">No checkout leads yet.</p> : null}
              {abandonedCheckouts.map((entry) => (
                <div key={entry.id} className="marketing-list__item marketing-list__item--stack">
                  <div style={{ width: "100%" }}>
                    <div className="marketing-abandoned__top">
                      <div>
                        <p className="heading-sm">{entry.name || "Unnamed checkout"}</p>
                        <p className="caption">
                          {entry.phone || "No phone yet"} - {entry.area || "No area yet"}
                        </p>
                      </div>
                      <span className={`admin-pill ${entry.status === "converted" ? "admin-pill--paid" : "admin-pill--pending"}`}>
                        {entry.status === "converted" ? "Converted" : "Open"}
                      </span>
                    </div>

                    <p className="body-sm marketing-abandoned__items">
                      {(entry.items || []).map((item) => `${item.name} x ${item.quantity}`).join(", ") || "No items yet."}
                    </p>
                    <p className="caption">Estimated total: {formatCurrency(entry.total || entry.subtotal)}</p>
                  </div>

                  <div className="marketing-inline-actions">
                    {entry.status !== "converted" ? (
                      <button
                        type="button"
                        className="admin-button"
                        onClick={() => handleConvertAbandoned(entry)}
                        disabled={saveMutation.isPending}
                      >
                        Save as Lead
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="admin-button admin-button--secondary"
                      onClick={() => deleteMutation.mutate({ section: "abandonedCheckouts", id: entry.id })}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="admin-panel marketing-panel" style={{ marginTop: "var(--space-5)" }}>
        <p className="overline marketing-panel__eyebrow">Campaigns</p>
        <h2 className="heading-md marketing-panel__title">See what is live, scheduled, or still in draft</h2>
        <div className="admin-quick-actions" style={{ marginTop: 0, marginBottom: "var(--space-3)" }}>
          <Link href="/admin/offers" className="admin-button admin-button--secondary">
            Open Offers Manager
          </Link>
        </div>
        <div className="marketing-list">
          {campaigns.length === 0 ? <p className="admin-note">No campaigns saved yet.</p> : null}
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="marketing-campaign-card">
              <div className="marketing-campaign-card__top">
                <div>
                  <p className="heading-sm">{campaign.title}</p>
                  <p className="caption">
                    {campaign.platform} - {campaign.status}
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-button admin-button--secondary"
                  onClick={() => deleteMutation.mutate({ section: "campaigns", id: campaign.id })}
                >
                  Remove
                </button>
              </div>
              {campaign.generatedPack?.instagramCaption ? (
                <p className="body-sm">{campaign.generatedPack.instagramCaption}</p>
              ) : (
                <p className="body-sm">{campaign.cta || "Campaign saved without generated pack."}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <style jsx>{`
        .marketing-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(340px, 0.95fr);
          gap: var(--space-5);
        }
        .marketing-side-stack {
          display: grid;
          gap: var(--space-5);
        }
        .marketing-panel {
          padding: var(--space-5);
        }
        .marketing-panel__eyebrow {
          color: var(--color-ochre);
          margin-bottom: 8px;
        }
        .marketing-panel__title {
          margin-bottom: 10px;
        }
        .marketing-panel__intro {
          margin-bottom: var(--space-4);
          color: var(--text-secondary);
        }
        .marketing-product-chip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          margin-top: var(--space-4);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          background: var(--bg-card-alt);
        }
        .marketing-product-chip img {
          width: 64px;
          height: 64px;
          object-fit: cover;
          border-radius: var(--radius-md);
        }
        .marketing-tip-card {
          margin-top: var(--space-5);
          padding: var(--space-4);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          background: var(--bg-card-alt);
        }
        .marketing-pack {
          display: grid;
          gap: var(--space-4);
          margin-top: var(--space-5);
        }
        .marketing-pack__headline {
          display: flex;
          justify-content: space-between;
          gap: var(--space-3);
          align-items: flex-start;
        }
        .marketing-pack__grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--space-3);
        }
        .marketing-pack__snippet {
          padding: var(--space-4);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          background: var(--bg-card-alt);
        }
        .marketing-pack__label {
          margin-bottom: 8px;
        }
        .marketing-pack__save {
          padding-top: var(--space-3);
          border-top: 1px solid var(--border-default);
        }
        .marketing-list {
          display: grid;
          gap: var(--space-3);
          margin-top: var(--space-4);
        }
        .marketing-list__item,
        .marketing-campaign-card {
          display: flex;
          justify-content: space-between;
          gap: var(--space-3);
          align-items: flex-start;
          padding: var(--space-4);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          background: var(--bg-card-alt);
        }
        .marketing-list__item--stack {
          align-items: flex-start;
        }
        .marketing-campaign-card {
          flex-direction: column;
        }
        .marketing-campaign-card__top,
        .marketing-abandoned__top,
        .marketing-inline-actions {
          width: 100%;
          display: flex;
          justify-content: space-between;
          gap: var(--space-3);
          align-items: flex-start;
        }
        .marketing-tag-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 10px;
        }
        .marketing-tag {
          padding: 3px 10px;
          border-radius: var(--radius-pill);
          background: rgba(74, 82, 64, 0.08);
          border: 1px solid rgba(74, 82, 64, 0.18);
          color: var(--color-moss);
          font-size: 0.75rem;
          font-weight: 500;
        }
        .marketing-note {
          margin-top: 10px;
        }
        .marketing-abandoned__items {
          margin: 10px 0 8px;
        }
        @media (max-width: 1100px) {
          .marketing-grid,
          .marketing-pack__grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 767px) {
          .marketing-product-chip,
          .marketing-pack__headline,
          .marketing-list__item,
          .marketing-campaign-card__top,
          .marketing-abandoned__top,
          .marketing-inline-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
