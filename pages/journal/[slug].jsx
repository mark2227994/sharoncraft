import { useState, useEffect } from 'react';
import Link from 'next/link';
import Footer from '../../components/Footer';
import Nav from '../../components/Nav';
import SeoHead from '../../components/SeoHead';

export default function ArticlePage({ article }) {
  const [notFound, setNotFound] = useState(!article);

  if (notFound) {
    return (
      <>
        <SeoHead
          title="Article Not Found | SharonCraft"
          description="The article you're looking for doesn't exist."
          path="/journal"
        />
        <Nav />
        <main className="article-page article-page--not-found">
          <div className="container">
            <h1>Article Not Found</h1>
            <p>Sorry, the article you're looking for doesn't exist.</p>
            <Link href="/journal" className="button button--primary">
              Back to Journal
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SeoHead
        title={`${article.title} | SharonCraft Journal`}
        description={article.body.substring(0, 160)}
        path={`/journal/${article.slug}`}
        image={article.image || '/apple-touch-icon.png'}
      />
      <Nav />
      <main className="article-page">
        {/* Hero Section */}
        <section className="article-page__hero">
          <div className="container">
            <Link href="/journal" className="article-page__back-link">
              ← Back to Journal
            </Link>
            <div className="article-page__header">
              <span className="article-page__category">{article.category}</span>
              <h1 className="article-page__title">{article.title}</h1>
              <div className="article-page__meta">
                <span className="article-page__author">By {article.author}</span>
                <span className="article-page__divider">•</span>
                <span className="article-page__date">
                  {new Date(article.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="article-page__divider">•</span>
                <span className="article-page__read-time">{article.readTime} min read</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {article.image && (
          <section className="article-page__featured-image">
            <img src={article.image} alt={article.title} />
          </section>
        )}

        {/* Article Content */}
        <section className="article-page__content">
          <div className="container container--narrow">
            <div className="article-body">
              {article.body.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="article-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Related Products */}
            {article.relatedProductIds && article.relatedProductIds.length > 0 && (
              <div className="article-page__related">
                <h3>Featured Products</h3>
                <p>Check out these handpicked pieces featured in this article.</p>
                <Link href={`/shop?ids=${article.relatedProductIds.join(',')}`} className="button button--primary">
                  View Products
                </Link>
              </div>
            )}

            {/* CTA */}
            <div className="article-page__cta">
              <h3>Ready to explore our collection?</h3>
              <p>Discover handmade Kenyan beadwork inspired by the traditions featured in this article.</p>
              <Link href="/shop" className="button button--primary">
                Shop Now
              </Link>
            </div>
          </div>
        </section>

        {/* Back to Journal */}
        <section className="article-page__footer">
          <div className="container">
            <Link href="/journal" className="button button--secondary">
              ← Back to All Guides
            </Link>
          </div>
        </section>
      </main>
      <Footer />

      <style jsx>{`
        .article-page {
          min-height: 100vh;
        }

        .article-page--not-found {
          padding: 80px 0;
          text-align: center;
        }

        .article-page--not-found .container {
          max-width: 600px;
        }

        .article-page--not-found h1 {
          font-size: 32px;
          margin-bottom: 16px;
          color: #0f0f0f;
        }

        .article-page--not-found p {
          color: #666;
          margin-bottom: 32px;
          font-size: 16px;
        }

        .article-page__hero {
          background: linear-gradient(135deg, #f9f6ee 0%, #faf7f2 100%);
          padding: 60px 0 40px 0;
        }

        .article-page__back-link {
          color: #C04D29;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          display: inline-block;
          margin-bottom: 32px;
          transition: all 0.2s;
        }

        .article-page__back-link:hover {
          transform: translateX(-4px);
        }

        .article-page__header {
          max-width: 900px;
        }

        .article-page__category {
          display: inline-block;
          background: #C04D29;
          color: white;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }

        .article-page__title {
          font-size: 44px;
          font-weight: 700;
          line-height: 1.3;
          color: #0f0f0f;
          margin-bottom: 16px;
        }

        .article-page__meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #666;
          flex-wrap: wrap;
        }

        .article-page__author {
          font-weight: 600;
        }

        .article-page__divider {
          opacity: 0.5;
        }

        .article-page__featured-image {
          background: #f5f5f5;
          padding: 40px 0;
          text-align: center;
        }

        .article-page__featured-image img {
          max-width: 100%;
          max-height: 500px;
          border-radius: 8px;
        }

        .article-page__content {
          padding: 60px 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .container--narrow {
          max-width: 800px;
        }

        .article-body {
          font-size: 16px;
          line-height: 1.8;
          color: #333;
        }

        .article-paragraph {
          margin-bottom: 24px;
        }

        .article-paragraph:first-child {
          font-size: 18px;
          color: #0f0f0f;
          font-weight: 500;
        }

        .article-page__related {
          background: #f9f6ee;
          padding: 40px;
          border-radius: 8px;
          margin-top: 60px;
          text-align: center;
        }

        .article-page__related h3 {
          color: #0f0f0f;
          font-size: 24px;
          margin-bottom: 8px;
        }

        .article-page__related p {
          color: #666;
          margin-bottom: 24px;
        }

        .article-page__cta {
          background: white;
          border: 2px solid #C04D29;
          padding: 40px;
          border-radius: 8px;
          margin-top: 60px;
          text-align: center;
        }

        .article-page__cta h3 {
          color: #0f0f0f;
          font-size: 24px;
          margin-bottom: 8px;
        }

        .article-page__cta p {
          color: #666;
          margin-bottom: 24px;
        }

        .article-page__footer {
          padding: 40px 0;
          text-align: center;
        }

        .button {
          display: inline-block;
          padding: 12px 24px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .button--primary {
          background: #C04D29;
          color: white;
        }

        .button--primary:hover {
          background: #a63f1f;
        }

        .button--secondary {
          background: transparent;
          color: #C04D29;
          border: 2px solid #C04D29;
        }

        .button--secondary:hover {
          background: #C04D29;
          color: white;
        }

        @media (max-width: 768px) {
          .article-page__hero {
            padding: 40px 0 24px 0;
          }

          .article-page__title {
            font-size: 28px;
          }

          .article-page__content {
            padding: 40px 0;
          }

          .article-body {
            font-size: 14px;
          }

          .article-page__related,
          .article-page__cta {
            padding: 24px;
            margin-top: 40px;
          }

          .article-page__related h3,
          .article-page__cta h3 {
            font-size: 18px;
          }
        }
      `}</style>
    </>
  );
}

export async function getStaticProps({ params }) {
  try {
    // Fetch all articles
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/articles`
    ).catch(() => null);

    if (!response || !response.ok) {
      return {
        notFound: true,
        revalidate: 60
      };
    }

    const articles = await response.json();
    const article = articles.find(a => a.slug === params.slug && a.published);

    if (!article) {
      return {
        notFound: true,
        revalidate: 60
      };
    }

    return {
      props: { article },
      revalidate: 3600 // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return {
      notFound: true,
      revalidate: 60
    };
  }
}

export async function getStaticPaths() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/articles`
    ).catch(() => null);

    if (!response || !response.ok) {
      return {
        paths: [],
        fallback: 'blocking'
      };
    }

    const articles = await response.json();
    const paths = articles
      .filter(a => a.published)
      .map(article => ({
        params: { slug: article.slug }
      }));

    return {
      paths,
      fallback: 'blocking'
    };
  } catch (error) {
    console.error('Error fetching article paths:', error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
}
