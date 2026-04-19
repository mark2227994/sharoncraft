import { useState, useEffect } from "react";
import Link from "next/link";

export default function ArticleCarousel({ limit = 3 }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      const res = await fetch("/api/admin/articles");
      const data = await res.json();
      if (Array.isArray(data)) {
        const published = data.filter(a => a.published).slice(0, limit);
        setArticles(published);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="article-carousel">Loading articles...</div>;
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="article-carousel">
      <div className="article-carousel__inner">
        <h2 className="article-carousel__title">From Our Journal</h2>
        <div className="article-carousel__grid">
          {articles.map((article) => (
            <article key={article.slug} className="article-card">
              {article.image && (
                <div className="article-card__image">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
              <div className="article-card__content">
                <div className="article-card__meta">
                  <span className="article-card__category">{article.category}</span>
                  <span className="article-card__read-time">{article.readTime} min read</span>
                </div>
                <h3 className="article-card__title">
                  <Link href={`/journal/${article.slug}`}>
                    {article.title}
                  </Link>
                </h3>
                <p className="article-card__author">By {article.author}</p>
                <p className="article-card__excerpt">
                  {article.body.substring(0, 120)}...
                </p>
                <Link href={`/journal/${article.slug}`} className="article-card__link">
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style jsx>{`
        .article-carousel {
          padding: var(--space-7) var(--gutter);
          background: #f9f6ee;
        }

        .article-carousel__inner {
          max-width: var(--max-width);
          margin: 0 auto;
        }

        .article-carousel__title {
          font-size: var(--font-size-h3);
          font-weight: 700;
          text-align: center;
          margin: 0 0 var(--space-6) 0;
          color: #1a1a1a;
        }

        .article-carousel__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-5);
        }

        .article-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .article-card:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
          transform: translateY(-4px);
        }

        .article-card__image {
          width: 100%;
          height: 200px;
          background: #e0e0e0;
          overflow: hidden;
        }

        .article-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .article-card__content {
          padding: var(--space-4);
        }

        .article-card__meta {
          display: flex;
          gap: var(--space-2);
          margin-bottom: var(--space-2);
          font-size: 0.85rem;
        }

        .article-card__category {
          display: inline-block;
          background: #C04D29;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
        }

        .article-card__read-time {
          color: #666;
          display: flex;
          align-items: center;
        }

        .article-card__title {
          margin: var(--space-2) 0;
          font-size: 1.15rem;
          font-weight: 700;
          line-height: 1.4;
        }

        .article-card__title a {
          color: #1a1a1a;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .article-card__title a:hover {
          color: #C04D29;
        }

        .article-card__author {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
          font-weight: 500;
        }

        .article-card__excerpt {
          margin: var(--space-2) 0 var(--space-3) 0;
          font-size: 0.95rem;
          color: #666;
          line-height: 1.5;
        }

        .article-card__link {
          display: inline-block;
          color: #C04D29;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }

        .article-card__link:hover {
          color: #D4A574;
        }

        @media (max-width: 640px) {
          .article-carousel__grid {
            grid-template-columns: 1fr;
          }

          .article-carousel__title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}
