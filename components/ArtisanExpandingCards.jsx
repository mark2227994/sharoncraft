export default function ArtisanExpandingCards({ artisans }) {
  if (!artisans || artisans.length === 0) return null;

  return (
    <section className="artisan-section">
      <div className="artisan-header">
        <div className="artisan-section-label">The Makers</div>
        <h2 className="artisan-title">
          <strong>Kenyan Hands.</strong>
          Global Hearts.
        </h2>
      </div>

      <div className="artisan-cards">
        {artisans.map((artisan, index) => (
          <div key={index} className="artisan-card">
            {artisan.image && (
              <img
                src={artisan.image}
                alt={artisan.name}
                loading="lazy"
                onerror="this.style.background='#1A0E06'"
              />
            )}
            <div className="artisan-info">
              <div className="artisan-name">{artisan.name}</div>
              <div className="artisan-role">{artisan.craft} · {artisan.location}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
