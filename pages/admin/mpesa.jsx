import { useQuery, useQueryClient } from "@tanstack/react-query";
import Head from "next/head";
import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatDateTime, formatKES, maskPhone } from "../../lib/formatters";

export default function AdminMpesaPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [drawerTxn, setDrawerTxn] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [matching, setMatching] = useState(false);

  const { data: transactions, isLoading: loadingTx } = useQuery({
    queryKey: ["admin-mpesa"],
    queryFn: async () => {
      const response = await fetch("/api/admin/mpesa", { credentials: "same-origin" });
      if (!response.ok) throw new Error("Failed");
      return response.json();
    },
  });

  const { data: dashboard, isLoading: loadingDash } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard", { credentials: "same-origin" });
      if (!response.ok) throw new Error("Failed");
      return response.json();
    },
  });

  const orders = dashboard?.orders ?? [];

  const visible = useMemo(() => {
    if (!transactions) return [];
    if (filter === "open") {
      return transactions.filter((t) => t.status === "Success" && !t.matched_order_id);
    }
    return transactions;
  }, [transactions, filter]);

  async function submitMatch() {
    if (!drawerTxn || !orderId) return;
    setMatching(true);
    const response = await fetch("/api/admin/mpesa/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ transactionId: drawerTxn.id, orderId }),
    });
    setMatching(false);
    if (!response.ok) return;
    setDrawerTxn(null);
    setOrderId("");
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-mpesa"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
    ]);
  }

  function statusPill(t) {
    if (t.status === "Success" && !t.matched_order_id) return "admin-pill admin-pill--unmatched";
    if (t.status === "Success") return "admin-pill admin-pill--completed";
    if (t.status === "Failed") return "admin-pill admin-pill--failed";
    return "admin-pill admin-pill--pending";
  }

  const loading = loadingTx || loadingDash;

  return (
    <>
      <Head>
        <title>M-Pesa — Gallery Admin</title>
      </Head>
      <AdminLayout title="M-Pesa">
        {loading ? <p className="admin-note">Loading…</p> : null}

        {!loading && transactions ? (
          <>
            <div className="mpesa-filter-bar">
              <button
                type="button"
                className={`admin-button ${filter === "all" ? "" : "admin-button--secondary"}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                className={`admin-button ${filter === "open" ? "" : "admin-button--secondary"}`}
                onClick={() => setFilter("open")}
              >
                Unmatched
              </button>
            </div>

            <div className="admin-table-wrap admin-panel">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Receipt</th>
                    <th>Phone</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>When</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((t) => (
                    <tr key={t.id}>
                      <td>{t.mpesa_receipt}</td>
                      <td>{maskPhone(t.phone)}</td>
                      <td>{formatKES(t.amount_kes)}</td>
                      <td>
                        <span className={statusPill(t)}>
                          {t.status === "Success" && !t.matched_order_id ? "Unmatched" : t.status}
                        </span>
                      </td>
                      <td>{formatDateTime(t.timestamp)}</td>
                      <td>
                        {t.status === "Success" && !t.matched_order_id ? (
                          <button type="button" className="admin-link" style={{ border: "none", background: "none" }} onClick={() => setDrawerTxn(t)}>
                            Match
                          </button>
                        ) : (
                          <span className="admin-note">{t.matched_order_id || "—"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-mobile-cards">
              {visible.map((t) => (
                <div key={t.id} className="admin-form-card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                    <strong>{t.mpesa_receipt}</strong>
                    <span className={statusPill(t)}>
                      {t.status === "Success" && !t.matched_order_id ? "Unmatched" : t.status}
                    </span>
                  </div>
                  <p className="admin-note" style={{ marginTop: "8px" }}>
                    {maskPhone(t.phone)}
                  </p>
                  <p style={{ marginTop: "8px", fontWeight: 600 }}>{formatKES(t.amount_kes)}</p>
                  <p className="admin-note" style={{ marginTop: "4px" }}>{formatDateTime(t.timestamp)}</p>
                  {t.status === "Success" && !t.matched_order_id ? (
                    <button
                      type="button"
                      className="admin-button"
                      style={{ marginTop: "12px", width: "100%" }}
                      onClick={() => setDrawerTxn(t)}
                    >
                      Match to order
                    </button>
                  ) : (
                    <p className="admin-note" style={{ marginTop: "8px" }}>
                      Order: {t.matched_order_id || "—"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : null}

        {drawerTxn ? (
          <div className="manual-match-drawer">
            <button
              type="button"
              className="manual-match-drawer__overlay"
              aria-label="Close"
              onClick={() => setDrawerTxn(null)}
            />
            <div className="manual-match-drawer__panel">
              <h2 className="heading-sm" style={{ marginBottom: "16px" }}>
                Match payment
              </h2>
              <p className="admin-note" style={{ marginBottom: "16px" }}>
                {formatKES(drawerTxn.amount_kes)} · {drawerTxn.mpesa_receipt}
              </p>
              <label className="admin-field">
                <span className="admin-note">Order</span>
                <select className="admin-select" value={orderId} onChange={(event) => setOrderId(event.target.value)}>
                  <option value="">Select order…</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} — {o.buyer_name} ({formatKES(o.amount_kes)})
                    </option>
                  ))}
                </select>
              </label>
              <div className="admin-quick-actions">
                <button type="button" className="admin-button" disabled={matching || !orderId} onClick={submitMatch}>
                  {matching ? "Saving…" : "Confirm match"}
                </button>
                <button type="button" className="admin-button admin-button--secondary" onClick={() => setDrawerTxn(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </AdminLayout>
    </>
  );
}
