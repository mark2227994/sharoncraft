import AdminLayout from "../../../components/admin/AdminLayout";

export default function HeroSettingsPage() {
  return (
    <AdminLayout title="Homepage Banner">
      <section className="admin-form-card">
        <p className="body-base" style={{ marginBottom: "16px" }}>
          This space is ready for hero copy and image management. For now, the homepage banner uses the new artisan-gallery art direction and local media assets added during the redesign.
        </p>
        <p className="admin-note">Next extension: persist hero title, subtitle, CTA labels, and image path via `site_settings`.</p>
      </section>
    </AdminLayout>
  );
}
