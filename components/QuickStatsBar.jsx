import Icon from "./icons";

export default function QuickStatsBar() {
  const stats = [
    { icon: "star", label: "500+", sublabel: "Handmade Pieces" },
    { icon: "heart", label: "1000+", sublabel: "Happy Customers" },
    { icon: "truck", label: "5-10", sublabel: "Days Ship" },
    { icon: "check", label: "100%", sublabel: "Authentic" },
  ];

  return (
    <section className="quick-stats-bar">
      <div className="quick-stats-container">
        {stats.map((stat, idx) => (
          <div key={idx} className="quick-stat-item">
            <div className="quick-stat-icon">
              <Icon name={stat.icon} size={24} />
            </div>
            <div className="quick-stat-content">
              <div className="quick-stat-label">{stat.label}</div>
              <div className="quick-stat-sublabel">{stat.sublabel}</div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .quick-stats-bar {
          background: linear-gradient(135deg, rgba(192, 77, 41, 0.05) 0%, rgba(212, 165, 116, 0.05) 100%);
          padding: var(--space-4) var(--gutter);
          margin: 0;
          border-top: 1px solid rgba(192, 77, 41, 0.1);
          border-bottom: 1px solid rgba(192, 77, 41, 0.1);
        }

        .quick-stats-container {
          max-width: var(--max-width);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: var(--space-4);
        }

        .quick-stat-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2);
          border-radius: 8px;
          transition: all var(--transition-base);
        }

        .quick-stat-item:hover {
          background: rgba(255, 255, 255, 0.6);
        }

        .quick-stat-icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #C04D29 0%, #D4A574 100%);
          color: var(--color-white);
          border-radius: 50%;
          font-size: 24px;
        }

        .quick-stat-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .quick-stat-label {
          font-size: 1.125rem;
          font-weight: 700;
          color: #C04D29;
          line-height: 1;
        }

        .quick-stat-sublabel {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          line-height: 1.2;
        }

        @media (max-width: 767px) {
          .quick-stats-bar {
            padding: var(--space-3) var(--gutter);
          }

          .quick-stats-container {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-3);
          }

          .quick-stat-item {
            gap: var(--space-2);
            padding: var(--space-2);
          }

          .quick-stat-icon {
            width: 40px;
            height: 40px;
          }

          .quick-stat-label {
            font-size: 1rem;
          }

          .quick-stat-sublabel {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </section>
  );
}
