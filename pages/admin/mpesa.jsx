import { useMemo, useState } from "react";
import { format } from "date-fns";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatDateTime, formatKES, maskPhone } from "../../lib/formatters";
import { readMpesaTransactions, readOrders } from "../../lib/store";

function exportCSV(transactions) {
  const headers = ["Receipt", "Phone", "Amount (KES)", "Order Ref", "Status", "Date"];
  const rows = transactions.map((t) => [
    t.mpesa_receipt,
    t.phone,
    t.amount_kes,
    t.order_ref,
    t.status,
    format(new Date(t.timestamp), "dd/MM/yyyy HH:mm"),
  ]);
  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mpesa-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MpesaPage({ transactions, orders }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [drawerTransaction, setDrawerTransaction] = useState(null);

  const filtered = useMemo(() => {
    const next = transactions.filter((transaction) => {
      const date = new Date(transaction.timestamp);
      const matchesFrom = fromDate ? date >= new Date(fromDate) : true;
      const matchesTo = toDate ? date <= new Date(`${toDate}T23:59:59`) : true;
      const matchesStatus = status === "All" ? true : transaction.status === status;
      const searchTarget = `${transaction.mpesa_receipt} ${transaction.phone}`.toLowerCase();
      const matchesSearch = search ? searchTarget.includes(search.toLowerCase()) : true;
      return matchesFrom && matchesTo && matchesStatus && matchesSearch;
    });

    if (sortBy === "amount-asc") return next.slice().sort((a, b) => a.amount_kes - b.amount_kes);
    if (sortBy === "amount-desc") return next.slice().sort((a, b) => b.amount_kes - a.amount_kes);
    if (sortBy === "date-asc") return next.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    return next.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [fromDate, search, sortBy, status, toDate, transactions]);

  const summary = useMemo(() => {
    const success = filtered.filter((transaction) => transaction.status === "Success");
    const failed = filtered.filter((transaction) => transaction.status === "Failed" || !transaction.matched_order_id);
    return {
      total: success.reduce((sum, transaction) => sum + Number(transaction.amount_kes || 0), 0),
      successCount: success.length,
      failedCount: failed.length,
    };
  }, [filtered]);

  async function matchTransaction(orderId) {
    await fetch("/api/admin/mpesa/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId: drawerTransaction.id, orderId }),
    });
    window.location.reload();
  }

  return (
    <AdminLayout
      title="M-Pesa Transaction Tracker"
      action={
        <button type="button" className="admin-button" onClick={() => exportCSV(filtered)}>
          Export CSV
        </button>
      }
    >
      <section className="mpesa-filter-bar">
        <input className="admin-input" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        <input className="admin-input" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        <select className="admin-select" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option>All</option>
          <option>Success</option>
          <option>Failed</option>
        </select>
        <input
          className="admin-input"
          placeholder="Search receipt or phone"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select className="admin-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Highest amount</option>
          <option value="amount-asc">Lowest amount</option>
        </select>
      </section>

      <section className="mpesa-summary-grid">
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Total Received This Month</p>
          <p className="admin-stat-card__value">{formatKES(summary.total)}</p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Successful Transactions</p>
          <p className="admin-stat-card__value">{summary.successCount}</p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Failed / Unmatched</p>
          <p className="admin-stat-card__value admin-stat-card__value--terracotta">{summary.failedCount}</p>
        </article>
      </section>

      <section className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Receipt</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Order Ref</th>
              <th>Status</th>
              <th>Date</th>
              <th>Matched Order</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.mpesa_receipt}</td>
                <td>{maskPhone(transaction.phone)}</td>
                <td>{formatKES(transaction.amount_kes)}</td>
                <td>{transaction.order_ref}</td>
                <td>
                  <span className={`admin-pill ${transaction.status === "Success" ? "admin-pill--completed" : "admin-pill--failed"}`}>
                    {transaction.status}
                  </span>
                </td>
                <td>{formatDateTime(transaction.timestamp)}</td>
                <td>
                  {transaction.matched_order_id ? (
                    transaction.matched_order_id
                  ) : (
                    <>
                      <span className="admin-pill admin-pill--unmatched">Unmatched</span>{" "}
                      <button type="button" style={{ color: "var(--color-terracotta)" }} onClick={() => setDrawerTransaction(transaction)}>
                        Match Manually →
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {drawerTransaction ? (
        <div className="manual-match-drawer">
          <button type="button" className="manual-match-drawer__overlay" onClick={() => setDrawerTransaction(null)} />
          <div className="manual-match-drawer__panel">
            <p className="overline">Manual match</p>
            <h2 className="display-md" style={{ marginBottom: "16px" }}>
              Link {drawerTransaction.mpesa_receipt}
            </h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {orders.map((order) => (
                <button key={order.id} type="button" className="admin-button admin-button--secondary" onClick={() => matchTransaction(order.id)}>
                  {order.id} · {order.product_name}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  const [transactions, orders] = await Promise.all([readMpesaTransactions(), readOrders()]);
  return { props: { transactions, orders } };
}
