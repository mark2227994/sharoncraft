import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ArticleCarousel({ limit = 3 }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchArticles() {
      try {
        const response = await fetch(`/api/blog-posts?limit=${limit}`);
        const data = await response.json();

        if (!cancelled && Array.isArray(data)) {
          setArticles(data.slice(0, limit));
        }
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchArticles();

    return () => {
      cancelled = true;
    };
  }, [limit]);

  if (loading) {
    return <div className="article-carousel">Loading stories...</div>;
  }

  if (!articles.length) {
    return null;
  }

  return (
    <section className="article-carousel">
      <div className="article-carousel__inner">
        <h2 className="article-carousel__title">From Our Journal</h2>
        <div className="article-carousel__grid">
          {articles.map((article) => (
            <article key={article.slug} className="article-card">
              <div className="article-card__image">
                {article.cover_image_url ? (
                  <Image
                    src={article.cover_image_url}
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="article-card__image-fallback" />
                )}
              </div>
              <div className="article-card__content">
                <div className="article-card__meta">
                  <span className="article-card__category">{article.category}</span>
                  <span className="article-card__read-time">
                    {article.read_time || article.readTime || 5} min read
                  </span>
                </div>
                <h3 className="article-card__title">
                  <Link href={`/blog/${article.slug}`}>{article.title}</Link>
                </h3>
                <p className="article-card__author">By {article.author}</p>
                <p className="article-card__excerpt">
                  {(article.excerpt || article.body || "").substring(0, 120)}...
                </p>
                <Link href={`/blog/${article.slug}`} className="article-card__link">
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
          position: relative;
          width: 100%;
          height: 200px;
          background: #e0e0e0;
          overflow: hidden;
        }

        .article-card__image-fallback {
          width: 100%;
          height: 100%;
          background: linear-gradient(145deg, #f5f0eb 0%, #eadfcf 100%);
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
          background: #c04d29;
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
          color: #c04d29;
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
          color: #c04d29;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }

        .article-card__link:hover {
          color: #d4a574;
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
