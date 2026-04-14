import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const studio = data?.studio || { campaigns: [], planner: [], leads: [] };
  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId || product.slug === selectedProductId) || null,
    [products, selectedProductId],
  );

  const generatedPack = generateMutation.data?.pack || null;
  const plannerItems = studio.planner || [];
  const campaigns = studio.campaigns || [];
  const leads = studio.leads || [];

  const plannerUpcoming = plannerItems.filter((item) => item.status !== "posted").length;
  const activeCampaigns = campaigns.filter((item) => ["draft", "scheduled", "boosting"].includes(item.status)).length;
  const warmLeads = leads.filter((item) => ["ready to order", "bridal inquiry", "asked price"].includes(item.status)).length;

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
        note: leadForm.note.trim(),
      },
    });
    setLeadForm({
      name: "",
      source: "WhatsApp",
      phone: "",
      interest: "",
      status: "new lead",
      note: "",
    });
  }

  return (
    <AdminLayout title="Marketing Studio">
      <section className="admin-stats-grid" style={{ marginBottom: "var(--space-5)" }}>
        <CompactStat label="Active Campaigns" value={activeCampaigns} note="Drafts, scheduled, and boosting" />
        <CompactStat label="Upcoming Posts" value={plannerUpcoming} note="Content still waiting to go live" />
        <CompactStat label="Warm Leads" value={warmLeads} note="People most likely to convert next" attention={warmLeads > 0} />
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

          <div className="admin-grid-2">
            <label className="admin-field">
              <span>Goal</span>
              <select className="admin-select" value={goal} onChange={(event) => setGoal(event.target.value)}>
                <option value="sales">Drive sales</option>
                <option value="awareness">Build awareness</option>
                <option value="whatsapp">Push WhatsApp inquiries</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Notes</span>
              <input
                className="admin-input"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Bride request, gift season, Nairobi delivery, custom colors..."
              />
            </label>
          </div>

          <div className="admin-quick-actions" style={{ marginTop: 0 }}>
            <button
              type="button"
              className="admin-button"
              disabled={!selectedProductId || generateMutation.isPending}
              onClick={() =>
                generateMutation.mutate({
                  productId: selectedProductId,
                  angle,
                  goal,
                  notes,
                })
              }
            >
              {generateMutation.isPending ? "Generating..." : "Generate Launch Pack"}
            </button>
          </div>

          {generateMutation.error ? <p className="admin-form-error">{generateMutation.error.message}</p> : null}

          {selectedProduct ? (
            <div className="marketing-product-chip">
              <div>
                <p className="caption marketing-pack__label">Selected product</p>
                <p className="body-sm">
                  {selectedProduct.name} · {selectedProduct.category}
                </p>
              </div>
              {selectedProduct.image ? <img src={selectedProduct.image} alt={selectedProduct.name} /> : null}
            </div>
          ) : null}

          {generatedPack ? (
            <div className="marketing-pack">
              <div className="marketing-pack__headline">
                <div>
                  <p className="overline">Generated launch pack</p>
                  <h3 className="heading-md">{generatedPack.campaignTitle}</h3>
                </div>
                <span className="admin-pill admin-pill--pending">{generatedPack.angle || angle}</span>
              </div>

              <div className="marketing-pack__grid">
                <SnippetCard title="TikTok hook" text={generatedPack.tiktokHook} />
                <SnippetCard title="CTA" text={generatedPack.cta} />
                <SnippetCard title="TikTok caption" text={generatedPack.tiktokCaption} />
                <SnippetCard title="Instagram caption" text={generatedPack.instagramCaption} />
                <SnippetCard title="Facebook caption" text={generatedPack.facebookCaption} />
                <SnippetCard title="WhatsApp promo" text={generatedPack.whatsappPromo} />
                <SnippetCard title="Follow-up message" text={generatedPack.followUpMessage} />
                <SnippetCard title="Hashtags" text={(generatedPack.hashtags || []).join(" ")} />
              </div>

              <div className="marketing-pack__save">
                <div className="admin-grid-2">
                  <label className="admin-field">
                    <span>Campaign title</span>
                    <input
                      className="admin-input"
                      value={campaignForm.title}
                      onChange={(event) => setCampaignForm((current) => ({ ...current, title: event.target.value }))}
                      placeholder={generatedPack.campaignTitle}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Platform</span>
                    <select
                      className="admin-select"
                      value={campaignForm.platform}
                      onChange={(event) => setCampaignForm((current) => ({ ...current, platform: event.target.value }))}
                    >
                      {PLATFORM_OPTIONS.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="admin-grid-2">
                  <label className="admin-field">
                    <span>Status</span>
                    <select
                      className="admin-select"
                      value={campaignForm.status}
                      onChange={(event) => setCampaignForm((current) => ({ ...current, status: event.target.value }))}
                    >
                      {CAMPAIGN_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field">
                    <span>CTA</span>
                    <input
                      className="admin-input"
                      value={campaignForm.cta}
                      onChange={(event) => setCampaignForm((current) => ({ ...current, cta: event.target.value }))}
                      placeholder={generatedPack.cta}
                    />
                  </label>
                </div>
                <button type="button" className="admin-button" onClick={handleSaveCampaign} disabled={saveMutation.isPending}>
                  Save as Campaign
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="marketing-side-stack">
          <div className="admin-panel marketing-panel">
            <p className="overline marketing-panel__eyebrow">Planner</p>
            <h2 className="heading-md marketing-panel__title">Keep your next posts visible</h2>
            <div className="admin-grid-2">
              <label className="admin-field">
                <span>Post title</span>
                <input
                  className="admin-input"
                  value={plannerForm.title}
                  onChange={(event) => setPlannerForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Bridal bead set reel"
                />
              </label>
              <label className="admin-field">
                <span>Platform</span>
                <select
                  className="admin-select"
                  value={plannerForm.platform}
                  onChange={(event) => setPlannerForm((current) => ({ ...current, platform: event.target.value }))}
                >
                  {PLATFORM_OPTIONS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="admin-grid-2">
              <label className="admin-field">
                <span>Content type</span>
                <select
                  className="admin-select"
                  value={plannerForm.contentType}
                  onChange={(event) => setPlannerForm((current) => ({ ...current, contentType: event.target.value }))}
                >
                  {CONTENT_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-field">
                <span>Date</span>
                <input
                  type="date"
                  className="admin-input"
                  value={plannerForm.scheduledFor}
                  onChange={(event) => setPlannerForm((current) => ({ ...current, scheduledFor: event.target.value }))}
                />
              </label>
            </div>
            <button type="button" className="admin-button" onClick={handleSavePlanner} disabled={saveMutation.isPending}>
              Save Planner Item
            </button>

            <div className="marketing-list">
              {plannerItems.length === 0 ? <p className="admin-note">No planned posts yet.</p> : null}
              {plannerItems.map((item) => (
                <div key={item.id} className="marketing-list__item">
                  <div>
                    <p className="heading-sm">{item.title}</p>
                    <p className="caption">
                      {item.platform} · {item.contentType} · {item.scheduledFor || "No date yet"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="admin-button admin-button--secondary"
                    onClick={() => deleteMutation.mutate({ section: "planner", id: item.id })}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
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
                  {PLATFORM_OPTIONS.map((platform) => (
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
                      {lead.source} · {lead.status}
                    </p>
                    <p className="body-sm">{lead.interest || "No interest note yet."}</p>
                    {lead.phone ? <p className="caption">{lead.phone}</p> : null}
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
        </div>
      </section>

      <section className="admin-panel marketing-panel" style={{ marginTop: "var(--space-5)" }}>
        <p className="overline marketing-panel__eyebrow">Campaigns</p>
        <h2 className="heading-md marketing-panel__title">See what is live, scheduled, or still in draft</h2>
        <div className="marketing-list">
          {campaigns.length === 0 ? <p className="admin-note">No campaigns saved yet.</p> : null}
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="marketing-campaign-card">
              <div className="marketing-campaign-card__top">
                <div>
                  <p className="heading-sm">{campaign.title}</p>
                  <p className="caption">
                    {campaign.platform} · {campaign.status}
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
          align-items: center;
        }
        .marketing-campaign-card {
          flex-direction: column;
        }
        .marketing-campaign-card__top {
          width: 100%;
          display: flex;
          justify-content: space-between;
          gap: var(--space-3);
          align-items: flex-start;
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
          .marketing-campaign-card__top {
            flex-direction: column;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
