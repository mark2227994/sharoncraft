import { useState } from "react";

export default function ArtisanFilter({ products, onFilterChange }) {
  const [selectedArtisan, setSelectedArtisan] = useState("");

  // Get unique artisans from products
  const artisans = [...new Set(products.map((p) => p.artisan).filter(Boolean))].sort();
  const artisanCounts = {};
  artisans.forEach((artisan) => {
    artisanCounts[artisan] = products.filter((p) => p.artisan === artisan).length;
  });

  function handleChange(e) {
    const value = e.target.value;
    setSelectedArtisan(value);
    onFilterChange(value);
  }

  return (
    <div className="admin-panel" style={{ marginBottom: "16px" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 0 }}>
        <span className="body-sm" style={{ fontWeight: "bold" }}>🎨 Filter by Artisan:</span>
        <select
          value={selectedArtisan}
          onChange={handleChange}
          style={{
            padding: "6px 8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontSize: "0.9rem",
            minWidth: "200px",
          }}
        >
          <option value="">All Artisans ({products.length})</option>
          {artisans.map((artisan) => (
            <option key={artisan} value={artisan}>
              {artisan} ({artisanCounts[artisan]})
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
