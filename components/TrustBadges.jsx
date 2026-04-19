import Icon from "./icons";

export default function TrustBadges() {
  const badges = [
    {
      icon: "check",
      title: "100% Handmade",
      description: "Crafted by skilled Kenyan artisans",
    },
    {
      icon: "truck",
      title: "Fast Shipping",
      description: "Delivered within 5-7 business days",
    },
    {
      icon: "package",
      title: "Secure Packaging",
      description: "Protected for safe arrival",
    },
    {
      icon: "leaf",
      title: "Eco-Friendly",
      description: "Sustainable & ethical practices",
    },
  ];

  return (
    <section className="trust-badges">
      <div className="trust-badges__container">
        {badges.map((badge, idx) => (
          <div key={idx} className="trust-badges__item">
            <div className="trust-badges__icon">
              <Icon name={badge.icon} size={32} />
            </div>
            <h3 className="trust-badges__title">{badge.title}</h3>
            <p className="trust-badges__description">{badge.description}</p>
          </div>
        ))}
      </div>

      <style jsx>{`
        .trust-badges {
          background: linear-gradient(135deg, rgba(192, 77, 41, 0.05) 0%, rgba(212, 165, 116, 0.05) 100%);
          padding: var(--space-7) var(--gutter);
          margin: var(--space-8) 0;
        }

        .trust-badges__container {
          max-width: var(--max-width);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-5);
        }

        .trust-badges__item {
          text-align: center;
          padding: var(--space-4);
          border-radius: 8px;
          transition: all 0.3s ease;
          animation: fadeInUp 0.6s ease forwards;
        }

        .trust-badges__item:nth-child(1) {
          animation-delay: 0.1s;
        }
        .trust-badges__item:nth-child(2) {
          animation-delay: 0.2s;
        }
        .trust-badges__item:nth-child(3) {
          animation-delay: 0.3s;
        }
        .trust-badges__item:nth-child(4) {
          animation-delay: 0.4s;
        }

        .trust-badges__item:hover {
          background: rgba(255, 255, 255, 0.6);
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .trust-badges__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: #C04D29;
          color: #f9f6ee;
          border-radius: 50%;
          margin-bottom: var(--space-3);
        }

        .trust-badges__title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 var(--space-1) 0;
          color: #2a2a2a;
        }

        .trust-badges__description {
          font-size: 0.875rem;
          color: #666;
          margin: 0;
          line-height: 1.5;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .trust-badges__container {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-4);
          }

          .trust-badges__item {
            padding: var(--space-3);
          }

          .trust-badges__icon {
            width: 56px;
            height: 56px;
          }

          .trust-badges__title {
            font-size: 0.9375rem;
          }
        }
      `}</style>
    </section>
  );
}
