export default function QuickStatsBar() {
  const stats = [
    { label: "500+", sublabel: "Handmade Pieces" },
    { label: "1000+", sublabel: "Happy Customers" },
    { label: "5–10", sublabel: "Day Delivery" },
    { label: "100%", sublabel: "Authentic" },
  ];

  return (
    <section className="quick-stats-bar">
      <div className="quick-stats-container">
        {stats.map((stat, idx) => (
          <div key={idx} className="quick-stat-item">
            <div className="quick-stat-content">
              <div className="quick-stat-label">{stat.label}</div>
              <div className="quick-stat-sublabel">{stat.sublabel}</div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        /* =========================
           Stats bar shell
           ========================= */
        .quick-stats-bar {
          background: #fff;
          padding: 32px 0;
          margin: 0;
          border-top: 1px solid #f0f0f0;
          border-bottom: 1px solid #f0f0f0;
        }

        /* =========================
           Stats layout
           ========================= */
        .quick-stats-container {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 var(--gutter);
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          align-items: center;
        }

        .quick-stat-item {
          position: relative;
          display: flex;
          justify-content: center;
          padding: 0 20px;
          text-align: center;
        }

        .quick-stat-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .quick-stat-item:not(:last-child)::after {
          content: "";
          position: absolute;
          top: 50%;
          right: 0;
          width: 1px;
          height: 24px;
          background: #e8e8e8;
          transform: translateY(-50%);
        }

        .quick-stat-label {
          font-size: 22px;
          font-weight: 300;
          letter-spacing: 1px;
          color: #1c1c1c;
          line-height: 1;
        }

        .quick-stat-sublabel {
          margin-top: 4px;
          font-size: 10px;
          font-weight: 400;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 2.5px;
          line-height: 1.2;
        }

        /* =========================
           Responsive layout
           ========================= */
        @media (max-width: 768px) {
          /* Mobile stats grid */
          .quick-stats-bar {
            padding: 24px 0;
          }

          .quick-stats-container {
            grid-template-columns: repeat(2, 1fr);
            row-gap: 0;
          }

          .quick-stat-item {
            padding: 0 14px;
          }

          .quick-stat-item:nth-child(-n + 2) {
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 20px;
          }

          .quick-stat-item:nth-child(n + 3) {
            padding-top: 20px;
          }

          .quick-stat-item:nth-child(2)::after,
          .quick-stat-item:nth-child(4)::after {
            display: none;
          }

          .quick-stat-label {
            font-size: 20px;
          }

          .quick-stat-sublabel {
            font-size: 9px;
            letter-spacing: 2px;
          }
        }
      `}</style>
    </section>
  );
}
