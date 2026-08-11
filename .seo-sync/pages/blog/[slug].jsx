import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Footer from "../../components/Footer";
import Nav from "../../components/Nav";
import SeoHead from "../../components/SeoHead";
import {
  buildBlogPostingJsonLd,
  fetchBlogPostBySlug,
  fetchPublishedBlogPosts,
  formatBlogDate,
  getBlogAuthorBio,
  getRelatedBlogPosts,
  renderBlogBlocks,
} from "../../lib/blog";

function MorePostCard({ post, index = 0 }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`blog-post-more-card cinema-scale delay-${(index % 5) + 1}`}
    >
      <article>
        <div className="blog-post-more-card__media">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              sizes="(max-width: 767px) 100vw, 33vw"
              className="img-zoom"
              style={{ objectFit: "cover", objectPosition: "center top" }}
            />
          ) : (
            <div className="blog-post-more-card__fallback" />
          )}
        </div>
        <div className="blog-post-more-card__overlay" aria-hidden="true" />
        <div className="blog-post-more-card__content">
          <span className="blog-post-more-card__category">{post.category}</span>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
        </div>
      </article>
    </Link>
  );
}

export default function BlogPostPage({ post, contentBlocks, relatedPosts }) {
  const [copyState, setCopyState] = useState("Copy");
  const [scrollProgress, setScrollProgress] = useState(0);
  const jsonLd = useMemo(() => buildBlogPostingJsonLd(post), [post]);
  const authorBio = useMemo(() => getBlogAuthorBio(post.author), [post.author]);
  const nextArticlePosts = relatedPosts.slice(0, 2);
  const morePosts = relatedPosts.slice(2);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    document
      .querySelectorAll(".cinema-reveal, .cinema-left, .cinema-right, .cinema-scale")
      .forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [contentBlocks.length, relatedPosts.length]);

  useEffect(() => {
    const updateProgress = () => {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (documentHeight <= 0) {
        setScrollProgress(0);
        return;
      }

      const progress = Math.min(100, Math.max(0, (window.scrollY / documentHeight) * 100));
      setScrollProgress(progress);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharoncraft.co.ke"}/blog/${post.slug}`,
      );
      setCopyState("Copied");
      window.setTimeout(() => setCopyState("Copy"), 1800);
    } catch {
      setCopyState("Failed");
      window.setTimeout(() => setCopyState("Copy"), 1800);
    }
  }

  const ctaIndex = contentBlocks.length > 2 ? Math.ceil(contentBlocks.length / 2) - 1 : 0;

  return (
    <>
      <SeoHead
        title={post.seo_title || post.title}
        description={post.seo_description || post.excerpt}
        path={`/blog/${post.slug}`}
        image={post.cover_image_url || "/logo-og.png"}
        type="article"
        structuredData={[jsonLd]}
        articleMeta={{
          "article:published_time": post.published_at,
          "article:modified_time": post.updated_at || post.published_at,
          "article:author": post.author,
        }}
      />
      <Nav />
      <main className="blog-post-cinema-page film-grain">
        <div className="blog-reading-progress" style={{ width: `${scrollProgress}%` }} />

        <section className="blog-post-cinema-hero">
          {post.cover_image_url ? (
            <div className="blog-post-cinema-hero__media" aria-hidden="true">
              <Image
                src={post.cover_image_url}
                alt=""
                fill
                priority
                sizes="100vw"
                style={{ objectFit: "cover", objectPosition: "center top" }}
              />
            </div>
          ) : (
            <div className="blog-post-cinema-hero__fallback" aria-hidden="true" />
          )}

          <div className="blog-post-cinema-hero__overlay blog-post-cinema-hero__overlay--bottom" />
          <div className="blog-post-cinema-hero__overlay blog-post-cinema-hero__overlay--side" />

          <div className="blog-post-cinema-hero__content">
            <div className="blog-post-cinema-hero__breadcrumb">
              <Link href="/blog">Journal</Link>
              <span>/</span>
              <Link href={`/blog?category=${encodeURIComponent(post.category)}`}>{post.category}</Link>
            </div>

            <div className="blog-post-cinema-hero__meta-row">
              <span className="blog-post-cinema-hero__badge">{post.category}</span>
              <span className="blog-post-cinema-hero__time">{post.read_time} min read</span>
            </div>

            <h1>{post.title}</h1>

            <div className="blog-post-cinema-hero__author">
              <div className="blog-post-cinema-hero__avatar" aria-hidden="true">
                {String(post.author || "S").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <strong>By {post.author}</strong>
                <span>
                  {formatBlogDate(post.published_at)} · {post.read_time} min read
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="blog-post-cinema-body">
          <div className="blog-post-cinema-body__inner">
            {contentBlocks.map((block, index) => (
              <div key={`${post.slug}-block-${index}`}>
                <div
                  className={`blog-post-cinema-body__block cinema-reveal delay-${(index % 5) + 1}`}
                  dangerouslySetInnerHTML={{ __html: block }}
                />
                {index === ctaIndex ? (
                  <div className="blog-post-cinema-cta cinema-reveal">
                    <div>
                      <h2>Discover the collection</h2>
                      <p>Handmade in Nairobi, Kenya</p>
                    </div>
                    <Link href="/shop" className="blog-post-cinema-cta__button">
                      Shop Now →
                    </Link>
                  </div>
                ) : null}
              </div>
            ))}

            <div className="blog-post-cinema-footer">
              {post.tags?.length ? (
                <div className="blog-post-cinema-tags cinema-reveal">
                  {post.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              ) : (
                <div />
              )}

              <div className="blog-post-cinema-share cinema-reveal">
                <span>SHARE</span>
                <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                  Instagram
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Read this on SharonCraft: https://www.sharoncraft.co.ke/blog/${post.slug}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
                <button type="button" onClick={handleCopyLink}>
                  {copyState}
                </button>
              </div>
            </div>

            <div className="blog-post-cinema-author cinema-reveal">
              <div className="blog-post-cinema-author__avatar" aria-hidden="true">
                {String(post.author || "S").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <span className="blog-post-cinema-author__eyebrow">Written by {post.author}</span>
                <h2>{post.author}</h2>
                <p>{authorBio}</p>
              </div>
            </div>
          </div>
        </section>

        {nextArticlePosts.length ? (
          <section className="blog-post-cinema-next">
            {nextArticlePosts[0] ? (
              <Link href={`/blog/${nextArticlePosts[0].slug}`} className="blog-post-cinema-next__card">
                {nextArticlePosts[0].cover_image_url ? (
                  <Image
                    src={nextArticlePosts[0].cover_image_url}
                    alt={nextArticlePosts[0].title}
                    fill
                    sizes="50vw"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="blog-post-cinema-next__fallback" />
                )}
                <div className="blog-post-cinema-next__overlay" aria-hidden="true" />
                <div className="blog-post-cinema-next__content">
                  <span>← Previous</span>
                  <h3>{nextArticlePosts[0].title}</h3>
                </div>
              </Link>
            ) : (
              <div className="blog-post-cinema-next__card blog-post-cinema-next__card--empty" />
            )}

            {nextArticlePosts[1] ? (
              <Link href={`/blog/${nextArticlePosts[1].slug}`} className="blog-post-cinema-next__card">
                {nextArticlePosts[1].cover_image_url ? (
                  <Image
                    src={nextArticlePosts[1].cover_image_url}
                    alt={nextArticlePosts[1].title}
                    fill
                    sizes="50vw"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="blog-post-cinema-next__fallback" />
                )}
                <div className="blog-post-cinema-next__overlay" aria-hidden="true" />
                <div className="blog-post-cinema-next__content blog-post-cinema-next__content--right">
                  <span>Next →</span>
                  <h3>{nextArticlePosts[1].title}</h3>
                </div>
              </Link>
            ) : (
              <div className="blog-post-cinema-next__card blog-post-cinema-next__card--empty" />
            )}
          </section>
        ) : null}

        {morePosts.length ? (
          <section className="blog-post-cinema-more">
            <div className="blog-post-cinema-more__inner">
              <span className="blog-post-cinema-more__eyebrow">MORE FROM THE JOURNAL</span>
              <div className="blog-post-cinema-more__grid">
                {morePosts.map((relatedPost, index) => (
                  <MorePostCard key={relatedPost.id} post={relatedPost} index={index} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />

      <style jsx global>{`
        .blog-post-cinema-page {
          min-height: 100vh;
          background: #080808;
          color: #f5f0eb;
        }

        .blog-reading-progress {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1001;
          height: 2px;
          background: #8b5e3c;
          transition: width 0.1s linear;
        }

        .cinema-reveal {
          opacity: 0;
          transform: translateY(32px);
          transition:
            opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cinema-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .cinema-left {
          opacity: 0;
          transform: translateX(-32px);
          transition:
            opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cinema-left.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .cinema-right {
          opacity: 0;
          transform: translateX(32px);
          transition:
            opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cinema-right.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .cinema-scale {
          opacity: 0;
          transform: scale(0.94);
          transition:
            opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cinema-scale.visible {
          opacity: 1;
          transform: scale(1);
        }

        .delay-1 {
          transition-delay: 100ms;
        }

        .delay-2 {
          transition-delay: 200ms;
        }

        .delay-3 {
          transition-delay: 300ms;
        }

        .delay-4 {
          transition-delay: 400ms;
        }

        .delay-5 {
          transition-delay: 500ms;
        }

        .img-zoom {
          transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .film-grain::before {
          content: "";
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.02;
          animation: grain 8s steps(10) infinite;
          pointer-events: none;
          z-index: 9998;
        }

        .blog-post-cinema-hero {
          position: relative;
          min-height: 500px;
          height: 75vh;
          overflow: hidden;
          background: #080808;
        }

        .blog-post-cinema-hero__media,
        .blog-post-cinema-hero__fallback,
        .blog-post-cinema-hero__overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .blog-post-cinema-hero__media :global(img) {
          filter: contrast(1.1) brightness(0.7) saturate(0.8);
        }

        .blog-post-cinema-hero__fallback {
          background: linear-gradient(145deg, #1a0e08 0%, #0f0f0d 100%);
        }

        .blog-post-cinema-hero__overlay--bottom {
          background: linear-gradient(
            to top,
            rgba(8, 8, 8, 1) 0%,
            rgba(8, 8, 8, 0.3) 50%,
            rgba(8, 8, 8, 0) 100%
          );
        }

        .blog-post-cinema-hero__overlay--side {
          background: linear-gradient(to right, rgba(8, 8, 8, 0.4) 0%, transparent 60%);
        }

        .blog-post-cinema-hero__content {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 2;
          padding: 64px 80px;
        }

        .blog-post-cinema-hero__breadcrumb {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          font-size: 10px;
          letter-spacing: 1.5px;
          color: rgba(245, 240, 235, 0.2);
        }

        .blog-post-cinema-hero__breadcrumb a {
          color: inherit;
          text-decoration: none;
        }

        .blog-post-cinema-hero__breadcrumb a:last-child {
          color: #8b5e3c;
        }

        .blog-post-cinema-hero__meta-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 14px;
        }

        .blog-post-cinema-hero__badge {
          padding: 4px 12px;
          border: 0.5px solid #8b5e3c;
          background: rgba(139, 94, 60, 0.2);
          color: #8b5e3c;
          font-size: 8px;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .blog-post-cinema-hero__time {
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(245, 240, 235, 0.25);
        }

        .blog-post-cinema-hero h1 {
          max-width: 680px;
          margin: 0 0 20px;
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 300;
          line-height: 1.1;
          letter-spacing: -0.5px;
          color: rgba(245, 240, 235, 0.9);
        }

        .blog-post-cinema-hero__author {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .blog-post-cinema-hero__avatar,
        .blog-post-cinema-author__avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #1a0e08;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(245, 240, 235, 0.65);
          flex-shrink: 0;
        }

        .blog-post-cinema-hero__author strong,
        .blog-post-cinema-hero__author span {
          display: block;
        }

        .blog-post-cinema-hero__author strong {
          margin-bottom: 2px;
          font-size: 12px;
          font-weight: 300;
          color: rgba(245, 240, 235, 0.5);
        }

        .blog-post-cinema-hero__author span {
          font-size: 10px;
          color: rgba(245, 240, 235, 0.2);
        }

        .blog-post-cinema-body {
          background: #080808;
          padding: 80px 40px;
        }

        .blog-post-cinema-body__inner {
          max-width: 720px;
          margin: 0 auto;
        }

        .blog-post-cinema-body__block :global(p) {
          margin: 0 0 28px;
          font-size: 16px;
          line-height: 1.95;
          letter-spacing: 0.1px;
          color: rgba(245, 240, 235, 0.6);
        }

        .blog-post-cinema-body__block :global(h2) {
          margin: 64px 0 20px;
          padding-left: 20px;
          border-left: 2px solid #8b5e3c;
          font-size: 26px;
          font-weight: 300;
          letter-spacing: -0.3px;
          color: rgba(245, 240, 235, 0.85);
        }

        .blog-post-cinema-body__block :global(h3) {
          margin: 48px 0 16px;
          font-size: 19px;
          font-weight: 400;
          color: rgba(245, 240, 235, 0.7);
        }

        .blog-post-cinema-body__block :global(blockquote) {
          margin: 48px 0;
          padding: 0 0 0 28px;
          border-left: 2px solid #8b5e3c;
          font-size: 20px;
          line-height: 1.65;
          font-style: italic;
          font-weight: 300;
          color: rgba(245, 240, 235, 0.4);
        }

        .blog-post-cinema-body__block :global(figure) {
          margin: 48px 0;
        }

        .blog-post-cinema-body__block :global(img) {
          display: block;
          width: 100%;
          height: auto;
          background: #0f0f0d;
          border: 0.5px solid rgba(255, 255, 255, 0.06);
        }

        .blog-post-cinema-body__block :global(figcaption) {
          margin-top: 12px;
          text-align: center;
          font-size: 11px;
          line-height: 1.7;
          letter-spacing: 0.4px;
          color: rgba(245, 240, 235, 0.3);
        }

        .blog-post-cinema-body__block :global(ul),
        .blog-post-cinema-body__block :global(ol) {
          margin: 0 0 28px;
          padding-left: 24px;
        }

        .blog-post-cinema-body__block :global(li) {
          position: relative;
          margin-bottom: 8px;
          font-size: 15px;
          line-height: 1.8;
          color: rgba(245, 240, 235, 0.5);
        }

        .blog-post-cinema-body__block :global(a) {
          color: #8b5e3c;
          text-decoration: none;
          border-bottom: 1px solid rgba(139, 94, 60, 0.3);
        }

        .blog-post-cinema-body__block :global(a:hover) {
          border-bottom-color: #8b5e3c;
        }

        .blog-post-cinema-body__block :global(strong) {
          font-weight: 500;
          color: rgba(245, 240, 235, 0.8);
        }

        .blog-post-cinema-body__block :global(code) {
          padding: 2px 8px;
          background: rgba(255, 255, 255, 0.05);
          color: rgba(245, 240, 235, 0.5);
          font-size: 13px;
        }

        .blog-post-cinema-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin: 48px 0;
          padding: 24px 28px;
          border: 0.5px solid rgba(255, 255, 255, 0.06);
          border-left: 2px solid #8b5e3c;
          background: #0f0f0d;
        }

        .blog-post-cinema-cta h2 {
          margin: 0 0 4px;
          font-size: 13px;
          font-weight: 400;
          color: rgba(245, 240, 235, 0.7);
        }

        .blog-post-cinema-cta p {
          margin: 0;
          font-size: 11px;
          color: rgba(245, 240, 235, 0.25);
        }

        .blog-post-cinema-cta__button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 20px;
          border: 0.5px solid rgba(245, 240, 235, 0.2);
          color: rgba(245, 240, 235, 0.5);
          text-decoration: none;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          transition:
            border-color 0.2s ease,
            color 0.2s ease;
        }

        .blog-post-cinema-cta__button:hover {
          border-color: #8b5e3c;
          color: rgba(245, 240, 235, 0.85);
        }

        .blog-post-cinema-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 48px 0;
          border-top: 0.5px solid rgba(255, 255, 255, 0.06);
        }

        .blog-post-cinema-tags,
        .blog-post-cinema-share {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .blog-post-cinema-tags span,
        .blog-post-cinema-share span {
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .blog-post-cinema-tags span:not(:first-child),
        .blog-post-cinema-share a,
        .blog-post-cinema-share button {
          padding: 4px 12px;
          border: 0.5px solid rgba(255, 255, 255, 0.08);
          color: rgba(245, 240, 235, 0.25);
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-decoration: none;
          background: transparent;
          transition:
            border-color 0.2s ease,
            color 0.2s ease;
        }

        .blog-post-cinema-tags span:not(:first-child):hover,
        .blog-post-cinema-share a:hover,
        .blog-post-cinema-share button:hover {
          border-color: #8b5e3c;
          color: #8b5e3c;
        }

        .blog-post-cinema-share button {
          cursor: pointer;
        }

        .blog-post-cinema-author {
          display: flex;
          gap: 20px;
          margin: 40px 0 0;
          padding: 32px;
          border: 0.5px solid rgba(255, 255, 255, 0.06);
          background: #0f0f0d;
        }

        .blog-post-cinema-author__avatar {
          width: 64px;
          height: 64px;
          background: #1a0e08;
        }

        .blog-post-cinema-author__eyebrow {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          text-transform: uppercase;
          color: rgba(245, 240, 235, 0.25);
        }

        .blog-post-cinema-author h2 {
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 300;
          color: rgba(245, 240, 235, 0.85);
        }

        .blog-post-cinema-author p {
          margin: 0;
          font-size: 13px;
          line-height: 1.7;
          color: rgba(245, 240, 235, 0.45);
        }

        .blog-post-cinema-next {
          display: grid;
          grid-template-columns: 1fr 1fr;
          height: 280px;
          border-top: 0.5px solid rgba(255, 255, 255, 0.06);
          background: #0f0f0d;
        }

        .blog-post-cinema-next__card {
          position: relative;
          display: block;
          overflow: hidden;
          color: inherit;
          text-decoration: none;
        }

        .blog-post-cinema-next__card--empty {
          background: #0f0f0d;
        }

        .blog-post-cinema-next__card:hover :global(img) {
          opacity: 0.5;
        }

        .blog-post-cinema-next__card :global(img) {
          opacity: 0.3;
          transition: opacity 0.3s ease;
        }

        .blog-post-cinema-next__fallback {
          position: absolute;
          inset: 0;
          background: linear-gradient(145deg, #1a0e08 0%, #0f0f0d 100%);
        }

        .blog-post-cinema-next__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(8, 8, 8, 0.95) 0%, rgba(8, 8, 8, 0.25) 100%);
          pointer-events: none;
          transition: background 0.3s ease;
        }

        .blog-post-cinema-next__card:hover .blog-post-cinema-next__overlay {
          background: linear-gradient(to top, rgba(8, 8, 8, 0.98) 0%, rgba(8, 8, 8, 0.35) 100%);
        }

        .blog-post-cinema-next__content {
          position: absolute;
          left: 32px;
          right: 32px;
          bottom: 28px;
          z-index: 2;
        }

        .blog-post-cinema-next__content--right {
          text-align: right;
        }

        .blog-post-cinema-next__content span {
          display: block;
          margin-bottom: 10px;
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(245, 240, 235, 0.4);
        }

        .blog-post-cinema-next__content h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 300;
          color: rgba(245, 240, 235, 0.9);
        }

        .blog-post-cinema-more {
          padding: 48px 40px 72px;
          background: #080808;
        }

        .blog-post-cinema-more__inner {
          max-width: 1280px;
          margin: 0 auto;
        }

        .blog-post-cinema-more__eyebrow {
          display: block;
          margin-bottom: 24px;
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(245, 240, 235, 0.2);
        }

        .blog-post-cinema-more__grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 2px;
        }

        .blog-post-more-card {
          position: relative;
          display: block;
          min-height: 320px;
          overflow: hidden;
          background: #0f0f0d;
          text-decoration: none;
          color: inherit;
        }

        .blog-post-more-card__media,
        .blog-post-more-card__fallback,
        .blog-post-more-card__overlay {
          position: absolute;
          inset: 0;
        }

        .blog-post-more-card__fallback {
          background: linear-gradient(145deg, #1a0e08 0%, #0f0f0d 100%);
        }

        .blog-post-more-card__overlay {
          background: linear-gradient(
            to top,
            rgba(8, 8, 8, 0.94) 0%,
            rgba(8, 8, 8, 0.38) 45%,
            rgba(8, 8, 8, 0) 70%
          );
          pointer-events: none;
        }

        .blog-post-more-card__content {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 2;
          padding: 24px;
          pointer-events: none;
        }

        .blog-post-more-card__category {
          display: block;
          margin-bottom: 10px;
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #8b5e3c;
        }

        .blog-post-more-card h3 {
          margin: 0 0 10px;
          font-size: 20px;
          font-weight: 300;
          line-height: 1.2;
          color: rgba(245, 240, 235, 0.9);
        }

        .blog-post-more-card p {
          display: -webkit-box;
          overflow: hidden;
          margin: 0;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          font-size: 12px;
          line-height: 1.7;
          color: rgba(245, 240, 235, 0.35);
        }

        .blog-post-more-card:hover .img-zoom {
          transform: scale(1.04);
        }

        @keyframes grain {
          0%,
          100% {
            transform: translate(0, 0);
          }
          10% {
            transform: translate(-5%, -5%);
          }
          20% {
            transform: translate(-10%, 5%);
          }
          30% {
            transform: translate(5%, -10%);
          }
          40% {
            transform: translate(-5%, 15%);
          }
          50% {
            transform: translate(-10%, 5%);
          }
          60% {
            transform: translate(15%, 0);
          }
          70% {
            transform: translate(0, 10%);
          }
          80% {
            transform: translate(-15%, 0);
          }
          90% {
            transform: translate(10%, 5%);
          }
        }

        @media (max-width: 767px) {
          .film-grain::before {
            display: none;
          }

          .blog-post-cinema-hero {
            height: 60vh;
          }

          .blog-post-cinema-hero__content {
            padding: 40px 20px;
          }

          .blog-post-cinema-hero h1 {
            font-size: 28px;
          }

          .blog-post-cinema-body {
            padding: 40px 20px;
          }

          .blog-post-cinema-body__block :global(p) {
            font-size: 15px;
          }

          .blog-post-cinema-cta {
            flex-direction: column;
            align-items: flex-start;
          }

          .blog-post-cinema-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .blog-post-cinema-author {
            flex-direction: column;
            padding: 24px 20px;
          }

          .blog-post-cinema-next {
            grid-template-columns: 1fr;
            height: auto;
          }

          .blog-post-cinema-next__card {
            min-height: 220px;
          }

          .blog-post-cinema-more {
            padding: 40px 20px 56px;
          }

          .blog-post-cinema-more__grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const post = await fetchBlogPostBySlug(params.slug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  const allPosts = await fetchPublishedBlogPosts();
  const relatedPosts = getRelatedBlogPosts(allPosts, post.slug, post.category, 3);
  const contentBlocks = await renderBlogBlocks(post.content);

  return {
    props: {
      post,
      contentBlocks,
      relatedPosts,
    },
  };
}
