import Icon from "./icons";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Amara K.",
      location: "USA",
      rating: 5,
      text: "The beadwork is absolutely stunning. Each piece feels authentic and handcrafted. Worth every penny!",
      product: "Maasai Beaded Necklace",
    },
    {
      name: "Sarah M.",
      location: "UK",
      rating: 5,
      text: "Arrived perfectly packaged. The quality is incredible. Supporting artisans has never felt so good.",
      product: "Terracotta Home Decor Set",
    },
    {
      name: "Zainab H.",
      location: "Canada",
      rating: 5,
      text: "These pieces tell a story. Beautiful craftsmanship and fast shipping. Highly recommend!",
      product: "Beaded Earring Collection",
    },
    {
      name: "Jennifer L.",
      location: "Australia",
      rating: 5,
      text: "Every detail is perfect. This is my third purchase and I keep coming back for more.",
      product: "Gift Set Bundle",
    },
  ];

  return (
    <section className="testimonials">
      <div className="testimonials__inner">
        <div className="testimonials__header">
          <p className="overline">What Customers Say</p>
          <h2 className="display-md">Loved by Thousands Worldwide</h2>
          <p className="testimonials__subtitle">
            Join thousands of satisfied customers who've discovered authentic, handcrafted Kenyan beadwork
          </p>
        </div>

        <div className="testimonials__grid">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="testimonials__card">
              <div className="testimonials__header-info">
                <div className="testimonials__stars">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Icon key={i} name="star" size={16} />
                  ))}
                </div>
                <p className="testimonials__product">{testimonial.product}</p>
              </div>
              
              <p className="testimonials__text">"{testimonial.text}"</p>
              
              <div className="testimonials__author">
                <p className="testimonials__name">{testimonial.name}</p>
                <p className="testimonials__location">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="testimonials__stats">
          <div className="testimonials__stat">
            <p className="testimonials__stat-number">4.9★</p>
            <p className="testimonials__stat-label">Average Rating</p>
          </div>
          <div className="testimonials__stat">
            <p className="testimonials__stat-number">2,400+</p>
            <p className="testimonials__stat-label">Happy Customers</p>
          </div>
          <div className="testimonials__stat">
            <p className="testimonials__stat-number">98%</p>
            <p className="testimonials__stat-label">Would Recommend</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .testimonials {
          padding: var(--space-8) var(--gutter);
          background: #f9f6ee;
        }

        .testimonials__inner {
          max-width: var(--max-width);
          margin: 0 auto;
        }

        .testimonials__header {
          text-align: center;
          margin-bottom: var(--space-7);
        }

        .testimonials__subtitle {
          font-size: 1rem;
          color: #666;
          max-width: 550px;
          margin: var(--space-3) auto 0;
          line-height: 1.6;
        }

        .testimonials__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-5);
          margin-bottom: var(--space-8);
        }

        .testimonials__card {
          background: white;
          padding: var(--space-4);
          border-radius: 12px;
          border: 1px solid rgba(192, 77, 41, 0.1);
          transition: all 0.3s ease;
          animation: slideInCard 0.6s ease forwards;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .testimonials__card:nth-child(1) {
          animation-delay: 0.1s;
        }
        .testimonials__card:nth-child(2) {
          animation-delay: 0.2s;
        }
        .testimonials__card:nth-child(3) {
          animation-delay: 0.3s;
        }
        .testimonials__card:nth-child(4) {
          animation-delay: 0.4s;
        }

        .testimonials__card:hover {
          transform: translateY(-6px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          border-color: #C04D29;
        }

        .testimonials__header-info {
          margin-bottom: var(--space-3);
        }

        .testimonials__stars {
          display: flex;
          gap: 4px;
          margin-bottom: var(--space-2);
          color: #C04D29;
        }

        .testimonials__product {
          font-size: 0.875rem;
          font-weight: 600;
          color: #C04D29;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .testimonials__text {
          font-size: 0.9375rem;
          line-height: 1.6;
          color: #333;
          margin: 0 0 var(--space-4) 0;
          font-style: italic;
        }

        .testimonials__author {
          border-top: 1px solid rgba(192, 77, 41, 0.1);
          padding-top: var(--space-3);
        }

        .testimonials__name {
          font-weight: 600;
          color: #2a2a2a;
          margin: 0 0 4px 0;
        }

        .testimonials__location {
          font-size: 0.8125rem;
          color: #999;
          margin: 0;
        }

        .testimonials__stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-4);
          padding: var(--space-5);
          background: linear-gradient(135deg, rgba(192, 77, 41, 0.08) 0%, rgba(212, 165, 116, 0.08) 100%);
          border-radius: 12px;
          text-align: center;
        }

        .testimonials__stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #C04D29;
          margin: 0 0 var(--space-1) 0;
        }

        .testimonials__stat-label {
          font-size: 0.875rem;
          color: #666;
          margin: 0;
        }

        @keyframes slideInCard {
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
          .testimonials {
            padding: var(--space-6) var(--gutter);
          }

          .testimonials__grid {
            grid-template-columns: 1fr;
            gap: var(--space-4);
          }

          .testimonials__stats {
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-3);
            padding: var(--space-4);
          }

          .testimonials__stat-number {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}
