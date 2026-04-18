import { useQuery } from "@tanstack/react-query";
import AdminLayout from "../../components/admin/AdminLayout";

function StatusPill({ ok, label }) {
  return (
    <span className={`admin-pill ${ok ? "admin-pill--completed" : "admin-pill--failed"}`}>
      {label}
    </span>
  );
}

async function fetchHealth() {
  const response = await fetch("/api/admin/health", { credentials: "same-origin" });
  if (!response.ok) throw new Error("Could not load health status");
  return response.json();
}

export default function AdminHealthPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-health"],
    queryFn: fetchHealth,
  });

  const targets = data?.targets || {};

  return (
    <AdminLayout
      title="Storage Health"
      action={
        <button type="button" className="admin-button" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Checking..." : "Run Check"}
        </button>
      }
    >
      {isLoading ? <p className="admin-note">Running storage checks...</p> : null}
      {error ? <p className="admin-form-error">{String(error?.message || "Could not run health checks")}</p> : null}
      {data ? (
        <>
          <p className="admin-note" style={{ marginBottom: "var(--space-4)" }}>
            Last checked: {new Date(data.checkedAt).toLocaleString("en-KE")}
          </p>
          <section className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Connected</th>
                  <th>Read</th>
                  <th>Write</th>
                  <th>Configured</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Supabase table</td>
                  <td><StatusPill ok={Boolean(targets.supabaseTable?.connected)} label={targets.supabaseTable?.connected ? "OK" : "Fail"} /></td>
                  <td><StatusPill ok={Boolean(targets.supabaseTable?.canRead)} label={targets.supabaseTable?.canRead ? "OK" : "No"} /></td>
                  <td><StatusPill ok={Boolean(targets.supabaseTable?.canWrite)} label={targets.supabaseTable?.canWrite ? "OK" : "No"} /></td>
                  <td>-</td>
                  <td>{targets.supabaseTable?.error || "site_settings table access looks good"}</td>
                </tr>
                <tr>
                  <td>Supabase storage</td>
                  <td><StatusPill ok={Boolean(targets.supabaseStorage?.connected)} label={targets.supabaseStorage?.connected ? "OK" : "Fail"} /></td>
                  <td><StatusPill ok={Boolean(targets.supabaseStorage?.canRead)} label={targets.supabaseStorage?.canRead ? "OK" : "No"} /></td>
                  <td>-</td>
                  <td>-</td>
                  <td>{targets.supabaseStorage?.error || "product-images bucket reachable"}</td>
                </tr>
                <tr>
                  <td>Vercel Blob</td>
                  <td><StatusPill ok={Boolean(targets.blob?.connected)} label={targets.blob?.connected ? "OK" : "Fail"} /></td>
                  <td><StatusPill ok={Boolean(targets.blob?.canRead)} label={targets.blob?.canRead ? "OK" : "No"} /></td>
                  <td>-</td>
                  <td><StatusPill ok={Boolean(targets.blob?.configured)} label={targets.blob?.configured ? "Yes" : "No"} /></td>
                  <td>{targets.blob?.error || "Blob token and read path look good"}</td>
                </tr>
                <tr>
                  <td>Local fallback</td>
                  <td><StatusPill ok={Boolean(targets.localFallback?.connected)} label={targets.localFallback?.connected ? "OK" : "Fail"} /></td>
                  <td>-</td>
                  <td><StatusPill ok={Boolean(targets.localFallback?.canWrite)} label={targets.localFallback?.canWrite ? "OK" : "No"} /></td>
                  <td>-</td>
                  <td>{targets.localFallback?.error || "data/store write fallback works in this environment"}</td>
                </tr>
              </tbody>
            </table>
          </section>
        </>
      ) : null}
    </AdminLayout>
  );
}
