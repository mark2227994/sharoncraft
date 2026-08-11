import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import SeoHead from "../components/SeoHead";
import {
  BLOG_CATEGORIES,
  fetchPublishedBlogPosts,
  formatBlogDate,
} from "../lib/blog";

const FILTER_TABS = ["all", ...BLOG_CATEGORIES];
const PRIMARY_PATTERN = [
  "row-a-left",
  "row-a-right",
  "row-b-feature",
  "row-b-top",
  "row-b-bottom",
  "row-c-left",
  "row-c-right",
  "row-d-full",
];
const SECONDARY_PATTERN = [
  "row-e-full",
  "row-f-1",
  "row-f-2",
  "row-f-3",
  "row-f-4",
  "row-g-large",
  "row-g-small",
];

function useTypewriter(text, speed = 40, delay = 800) {
  const [displayed, setDisplayed] = useState("");
  const [completed, setCompleted] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return undefined;
    startedRef.current = true;

    let index = 0;
    let intervalId;
    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        if (index < text.length) {
          setDisplayed(text.slice(0, index + 1));
          index += 1;
          return;
        }

        window.clearInterval(intervalId);
        setCompleted(true);
      }, speed);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [delay, speed, text]);

  return { displayed, completed };
}

function formatIssueNumber(value) {
  return String(Math.max(0, value)).padStart(3, "0");
}

function getPatternVariant(index, pattern) {
  return pattern[index % pattern.length];
}

function getPostDateLabel(post) {
  return formatBlogDate(post.published_at);
}

function PostFallback({ post }) {
  return (
    <div className="editorial-post-card__fallback">
      <span className="editorial-post-card__fallback-title" aria-hidden="true">
        {post.title}
      </span>
    </div>
  );
}

function EditorialPostCard({
  post,
  variant,
  index = 0,
  showExcerpt = true,
  onHoverStart,
  onHoverMove,
  onHoverEnd,
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`editorial-post-card cinema-scale delay-${(index % 5) + 1} editorial-post-card--${variant}`}
      onMouseEnter={(event) => onHoverStart?.(event)}
      onMouseMove={(event) => onHoverMove?.(event)}
      onMouseLeave={() => onHoverEnd?.()}
    >
      <article className="editorial-post-card__article">
        <div className="editorial-post-card__media">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="img-zoom"
              style={{ objectFit: "cover", objectPosition: "center top" }}
            />
          ) : (
            <PostFallback post={post} />
          )}
        </div>
        <div className="editorial-post-card__overlay" aria-hidden="true" />
        <div className="editorial-post-card__content">
          <div className="editorial-post-card__top">
            <span className="editorial-post-card__tag">{post.category}</span>
            <span className="editorial-post-card__readtime">{post.read_time} min read</span>
          </div>
          <h3>{post.title}</h3>
          {showExcerpt ? <p>{post.excerpt}</p> : null}
          <div className="editorial-post-card__bottom">
            <span>
              {post.author} · {getPostDateLabel(post)}
            </span>
            <span className="editorial-post-card__arrow" aria-hidden="true">
              →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function NewsletterStrip() {
  return (
    <section className="blog-subscribe">
      <div className="blog-subscribe__bg-letter" aria-hidden="true">
        S
      </div>
      <div className="blog-subscribe__glow" aria-hidden="true" />
      <div className="blog-subscribe__content cinema-reveal">
        <div className="blog-subscribe__eyebrow">
          <span />
          <span>THE JOURNAL NEWSLETTER</span>
          <span />
        </div>
        <h2>
          New stories. Delivered.
          <em> Every week.</em>
        </h2>
        <p>
          Craft stories, artisan spotlights and behind the scenes from Nairobi. No noise. No
          spam.
        </p>
        <form action="/contact" method="get" className="blog-subscribe__form">
          <input type="email" name="email" placeholder="Your email address" />
          <button type="submit">Join List →</button>
        </form>
        <span className="blog-subscribe__note">No spam. Unsubscribe anytime.</span>
      </div>
    </section>
  );
}

export default function BlogPage({ posts, activeCategory }) {
  const { displayed, completed } = useTypewriter("Stories from\nNairobi.");
  const [showCursor, setShowCursor] = useState(true);
  const [issueCounter, setIssueCounter] = useState(0);
  const [scrollCounter, setScrollCounter] = useState(0);
  const [spotlight, setSpotlight] = useState({ x: -500, y: -500 });
  const [readCursor, setReadCursor] = useState({ visible: false, x: 0, y: 0 });
  const [isDesktopCursor, setIsDesktopCursor] = useState(false);

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
  }, [posts]);

  useEffect(() => {
    if (!completed) return undefined;

    const timeoutId = window.setTimeout(() => setShowCursor(false), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [completed]);

  useEffect(() => {
    const totalPosts = posts.length;
    let frame = 0;
    const timer = window.setInterval(() => {
      frame += 1;
      const value = Math.min(totalPosts, frame);
      setIssueCounter(value);
      setScrollCounter(value);
      if (value >= totalPosts) {
        window.clearInterval(timer);
      }
    }, 90);

    return () => window.clearInterval(timer);
  }, [posts.length]);

  useEffect(() => {
    const updateViewportMode = () => setIsDesktopCursor(window.innerWidth > 1024);
    updateViewportMode();
    window.addEventListener("resize", updateViewportMode, { passive: true });
    return () => window.removeEventListener("resize", updateViewportMode);
  }, []);

  useEffect(() => {
    const handleMouse = (event) => {
      setSpotlight({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") return posts;
    return posts.filter(
      (post) => String(post.category).toLowerCase() === String(activeCategory).toLowerCase(),
    );
  }, [activeCategory, posts]);

  const featuredPost = filteredPosts[0] || null;
  const regularPosts = filteredPosts.slice(1);
  const primaryPosts = regularPosts.slice(0, 8);
  const secondaryPosts = regularPosts.slice(8);
  const filmStripPosts = filteredPosts.slice(0, 5);

  const handleCardEnter = (event) => {
    if (!isDesktopCursor) return;
    setReadCursor({
      visible: true,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleCardMove = (event) => {
    if (!isDesktopCursor) return;
    setReadCursor({
      visible: true,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleCardLeave = () => {
    if (!isDesktopCursor) return;
    setReadCursor((current) => ({ ...current, visible: false }));
  };

  const hrefForTab = (tab) =>
    tab === "all"
      ? "/blog"
      : {
          pathname: "/blog",
          query: { category: tab },
        };

  const heroLines = displayed.split("\n");

  return (
    <>
      <SeoHead
        title="Stories from Nairobi"
        description="Craft, culture and the people behind every piece. Read SharonCraft stories, care guides, styling notes and gifting ideas."
        path={activeCategory === "all" ? "/blog" : `/blog?category=${encodeURIComponent(activeCategory)}`}
        image={featuredPost?.cover_image_url || "/logo-og.png"}
      />
      <Nav />
      <main className="blog-cinema-page film-grain">
        <div
          id="cursor-spotlight"
          aria-hidden="true"
          style={{
            left: `${spotlight.x}px`,
            top: `${spotlight.y}px`,
          }}
        />
        {isDesktopCursor ? (
          <div
            className={`blog-read-cursor ${readCursor.visible ? "blog-read-cursor--visible" : ""}`}
            aria-hidden="true"
            style={{
              left: `${readCursor.x}px`,
              top: `${readCursor.y}px`,
            }}
          >
            READ
          </div>
        ) : null}

        <section className="blog-cinema-hero">
          <div className="blog-cinema-hero__gradient" aria-hidden="true" />
          <div className="blog-cinema-hero__warm" aria-hidden="true" />
          {featuredPost?.cover_image_url ? (
            <div className="blog-cinema-hero__image" aria-hidden="true">
              <div className="blog-cinema-hero__image-blend" />
              <Image
                src={featuredPost.cover_image_url}
                alt=""
                fill
                priority
                sizes="45vw"
                style={{ objectFit: "cover", filter: "grayscale(0.3) contrast(1.1)" }}
              />
            </div>
          ) : null}
          <div className="blog-cinema-hero__scanlines" aria-hidden="true" />
          <div className="blog-cinema-hero__perforations" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>

          <div className="blog-cinema-hero__topline">
            <span>SHARONCRAFT</span>
            <span className="blog-cinema-hero__topline-divider" />
            <span className="blog-cinema-hero__topline-accent">JOURNAL</span>
          </div>

          <div className="blog-cinema-hero__issue">ISSUE NO. {formatIssueNumber(issueCounter)}</div>

          <div className="blog-cinema-hero__content">
            <h1>
              {heroLines.map((line, index) => (
                <span
                  key={`${line}-${index}`}
                  className={index === 1 ? "blog-cinema-hero__headline-accent" : ""}
                >
                  {line || "\u00A0"}
                </span>
              ))}
              {showCursor ? <span className="blog-cinema-hero__cursor" aria-hidden="true" /> : null}
            </h1>
            <p>Craft. Culture. The people behind every piece.</p>
          </div>

          <div className="blog-cinema-hero__scroll">
            <span>{formatIssueNumber(scrollCounter)}</span>
            <div className="blog-cinema-hero__scroll-line" />
            <small>SCROLL</small>
          </div>
        </section>

        {featuredPost ? (
          <section className="blog-cover-story">
            <div className="blog-cover-story__media cinema-left">
              {featuredPost.cover_image_url ? (
                <Image
                  src={featuredPost.cover_image_url}
                  alt={featuredPost.title}
                  fill
                  priority
                  sizes="(max-width: 767px) 100vw, 50vw"
                  className="img-zoom"
                  style={{ objectFit: "cover", objectPosition: "center top" }}
                />
              ) : (
                <PostFallback post={featuredPost} />
              )}
              <div className="blog-cover-story__media-grade" aria-hidden="true" />
              <div className="blog-cover-story__corners" aria-hidden="true">
                <span className="blog-cover-story__corner blog-cover-story__corner--tl" />
                <span className="blog-cover-story__corner blog-cover-story__corner--tr" />
                <span className="blog-cover-story__corner blog-cover-story__corner--bl" />
                <span className="blog-cover-story__corner blog-cover-story__corner--br" />
              </div>
              <span className="blog-cover-story__media-tag">{featuredPost.category}</span>
            </div>

            <div className="blog-cover-story__content">
              <div>
                <span className="blog-cover-story__eyebrow cinema-reveal">COVER STORY</span>
                <span className="blog-cover-story__issue cinema-reveal delay-1">
                  ISSUE {formatIssueNumber(filteredPosts.length)} · {featuredPost.category}
                </span>
                <h2 className="cinema-reveal delay-2">{featuredPost.title}</h2>
                <div className="blog-cover-story__divider cinema-reveal delay-2" />
                <p className="cinema-reveal delay-3">{featuredPost.excerpt}</p>
              </div>

              <div className="blog-cover-story__footer">
                <div className="blog-cover-story__meta cinema-reveal delay-4">
                  <div className="blog-cover-story__avatar" aria-hidden="true">
                    {String(featuredPost.author || "S").slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <strong>{featuredPost.author}</strong>
                    <span>
                      By {featuredPost.author} · {getPostDateLabel(featuredPost)} ·{" "}
                      {featuredPost.read_time} min read
                    </span>
                  </div>
                </div>

                <Link href={`/blog/${featuredPost.slug}`} className="blog-cover-story__cta cinema-reveal delay-5">
                  <span>READ THE STORY</span>
                  <span className="blog-cover-story__cta-line" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <section className="blog-cinema-filters">
          <div className="blog-cinema-filters__label">FILTER</div>
          <div className="blog-cinema-filters__tabs">
            {FILTER_TABS.map((tab) => {
              const isActive = tab.toLowerCase() === String(activeCategory).toLowerCase();
              return (
                <Link
                  key={tab}
                  href={hrefForTab(tab)}
                  className={`blog-cinema-filters__tab ${isActive ? "blog-cinema-filters__tab--active" : ""}`}
                >
                  {tab === "all" ? "ALL" : tab.toUpperCase()}
                </Link>
              );
            })}
          </div>
          <div className="blog-cinema-filters__count">{filteredPosts.length} STORIES</div>
        </section>

        <section className="blog-editorial-section">
          {primaryPosts.length ? (
            <div className="blog-editorial-grid blog-editorial-grid--primary">
              {primaryPosts.map((post, index) => (
                <EditorialPostCard
                  key={post.id}
                  post={post}
                  variant={getPatternVariant(index, PRIMARY_PATTERN)}
                  index={index}
                  showExcerpt={["row-a-left", "row-a-right", "row-b-feature", "row-d-full"].includes(
                    getPatternVariant(index, PRIMARY_PATTERN),
                  )}
                  onHoverStart={handleCardEnter}
                  onHoverMove={handleCardMove}
                  onHoverEnd={handleCardLeave}
                />
              ))}
            </div>
          ) : featuredPost ? null : (
            <div className="blog-editorial-empty cinema-reveal">
              <span>NO STORIES FOUND</span>
              <h2>This category is quiet for now.</h2>
              <p>Try another filter or come back soon for the next issue from Nairobi.</p>
            </div>
          )}
        </section>

        <section className="blog-interlude">
          <div className="blog-interlude__quote cinema-left">
            <span className="blog-interlude__mark">“</span>
            <p>
              Every bead tells a story. Every piece carries a name. Every purchase is a choice to
              value what is made by hand.
            </p>
            <small>— Kelvin Mark, Founder</small>
          </div>

          <div className="blog-interlude__strip cinema-right">
            <div className="blog-interlude__frames">
              {filmStripPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="blog-interlude__frame">
                  <span className="blog-interlude__perforation" aria-hidden="true">
                    <i />
                    <i />
                  </span>
                  <div className="blog-interlude__frame-image">
                    {post.cover_image_url ? (
                      <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        fill
                        sizes="280px"
                        style={{ objectFit: "cover", filter: "grayscale(0.5)", opacity: 0.8 }}
                      />
                    ) : (
                      <PostFallback post={post} />
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <span className="blog-interlude__handle">@sharoncraft</span>
          </div>
        </section>

        {secondaryPosts.length ? (
          <section className="blog-editorial-section blog-editorial-section--secondary">
            <div className="blog-editorial-grid blog-editorial-grid--secondary">
              {secondaryPosts.map((post, index) => (
                <EditorialPostCard
                  key={post.id}
                  post={post}
                  variant={getPatternVariant(index, SECONDARY_PATTERN)}
                  index={index}
                  showExcerpt={["row-e-full", "row-g-large"].includes(
                    getPatternVariant(index, SECONDARY_PATTERN),
                  )}
                  onHoverStart={handleCardEnter}
                  onHoverMove={handleCardMove}
                  onHoverEnd={handleCardLeave}
                />
              ))}
            </div>
          </section>
        ) : null}

        <NewsletterStrip />
      </main>
      <Footer />

      <style jsx global>{`
        .blog-cinema-page {
          position: relative;
          min-height: 100vh;
          background: #080808;
          color: #f5f0eb;
          overflow: hidden;
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

        .img-zoom {
          transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
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

        #cursor-spotlight {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 94, 60, 0.06) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 0;
          transition:
            left 0.1s ease,
            top 0.1s ease;
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

        .blog-read-cursor {
          position: fixed;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(139, 94, 60, 0.15);
          border: 1px solid rgba(139, 94, 60, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(245, 240, 235, 0.6);
          transform: translate(-50%, -50%) scale(0.84);
          opacity: 0;
          pointer-events: none;
          z-index: 1000;
          transition:
            opacity 0.18s ease,
            transform 0.18s ease;
        }

        .blog-read-cursor--visible {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }

        .blog-cinema-hero {
          position: relative;
          min-height: 640px;
          height: 100vh;
          background: #080808;
          overflow: hidden;
          border-bottom: 0.5px solid rgba(255, 255, 255, 0.06);
        }

        .blog-cinema-hero__gradient,
        .blog-cinema-hero__warm,
        .blog-cinema-hero__scanlines {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .blog-cinema-hero__gradient {
          background: radial-gradient(ellipse 80% 60% at 50% 60%, #1a0e08 0%, #080808 70%);
        }

        .blog-cinema-hero__warm {
          background: radial-gradient(
            ellipse 40% 60% at 15% 50%,
            rgba(139, 94, 60, 0.12) 0%,
            transparent 70%
          );
        }

        .blog-cinema-hero__image {
          position: absolute;
          top: 0;
          right: 0;
          width: 45%;
          height: 100%;
          overflow: hidden;
          opacity: 0.15;
        }

        .blog-cinema-hero__image-blend {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 200px;
          background: linear-gradient(to right, #080808 0%, transparent 100%);
          z-index: 1;
          pointer-events: none;
        }

        .blog-cinema-hero__scanlines {
          background-image: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.008) 2px,
            rgba(255, 255, 255, 0.008) 4px
          );
        }

        .blog-cinema-hero__perforations {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          display: flex;
          justify-content: space-between;
          padding: 0 40px;
          z-index: 2;
        }

        .blog-cinema-hero__perforations span {
          width: 32px;
          height: 6px;
          background: rgba(245, 240, 235, 0.04);
        }

        .blog-cinema-hero__topline,
        .blog-cinema-hero__issue,
        .blog-cinema-hero__scroll,
        .blog-cinema-hero__content {
          position: absolute;
          z-index: 2;
        }

        .blog-cinema-hero__topline {
          top: 40px;
          left: 80px;
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 9px;
          letter-spacing: 6px;
          text-transform: uppercase;
          color: rgba(245, 240, 235, 0.25);
        }

        .blog-cinema-hero__topline-divider {
          width: 32px;
          height: 1px;
          background: rgba(245, 240, 235, 0.15);
        }

        .blog-cinema-hero__topline-accent {
          color: #8b5e3c;
        }

        .blog-cinema-hero__issue {
          top: 40px;
          right: 80px;
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(245, 240, 235, 0.15);
          font-variant-numeric: tabular-nums;
        }

        .blog-cinema-hero__content {
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          max-width: 760px;
          padding: 0 80px 80px;
        }

        .blog-cinema-hero__content h1 {
          display: flex;
          flex-direction: column;
          min-height: 160px;
          margin: 0 0 20px;
          font-size: clamp(40px, 6vw, 72px);
          font-weight: 300;
          color: rgba(245, 240, 235, 0.9);
          line-height: 1.05;
          letter-spacing: -1px;
          white-space: pre-wrap;
        }

        .blog-cinema-hero__headline-accent {
          font-style: italic;
          color: #8b5e3c;
        }

        .blog-cinema-hero__cursor {
          display: inline-block;
          width: 2px;
          height: 0.9em;
          margin-left: 10px;
          background: #8b5e3c;
          animation: blink 1s infinite;
          vertical-align: middle;
        }

        .blog-cinema-hero__content p {
          max-width: 420px;
          margin: 0;
          font-size: 14px;
          line-height: 1.8;
          color: rgba(245, 240, 235, 0.3);
          animation: heroFadeUp 1s ease 1.8s both;
        }

        .blog-cinema-hero__scroll {
          right: 80px;
          bottom: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          animation: heroFadeUp 0.8s ease 2.2s both;
        }

        .blog-cinema-hero__scroll span {
          font-size: 11px;
          letter-spacing: 2px;
          color: rgba(245, 240, 235, 0.2);
          font-variant-numeric: tabular-nums;
        }

        .blog-cinema-hero__scroll-line {
          position: relative;
          width: 1px;
          height: 48px;
          overflow: hidden;
          background: rgba(245, 240, 235, 0.1);
        }

        .blog-cinema-hero__scroll-line::after {
          content: "";
          display: block;
          width: 100%;
          height: 40%;
          background: #8b5e3c;
          animation: scanDown 2s ease infinite;
        }

        .blog-cinema-hero__scroll small {
          font-size: 8px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(245, 240, 235, 0.15);
          writing-mode: vertical-rl;
        }

        .blog-cover-story {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 600px;
          border-top: 0.5px solid rgba(255, 255, 255, 0.06);
          background: #080808;
        }

        .blog-cover-story__media {
          position: relative;
          min-height: 600px;
          overflow: hidden;
          background: #0f0f0d;
        }

        .blog-cover-story__media-grade {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(8, 8, 8, 0) 40%, rgba(8, 8, 8, 0.4) 100%);
          mix-blend-mode: multiply;
          pointer-events: none;
        }

        .blog-cover-story__corners {
          position: absolute;
          inset: 20px;
          pointer-events: none;
          z-index: 2;
        }

        .blog-cover-story__corner {
          position: absolute;
          width: 20px;
          height: 20px;
          opacity: 0.4;
        }

        .blog-cover-story__corner::before,
        .blog-cover-story__corner::after {
          content: "";
          position: absolute;
          background: rgba(245, 240, 235, 0.3);
        }

        .blog-cover-story__corner::before {
          width: 20px;
          height: 1px;
          top: 0;
          left: 0;
        }

        .blog-cover-story__corner::after {
          width: 1px;
          height: 20px;
          top: 0;
          left: 0;
        }

        .blog-cover-story__corner--tr {
          top: 0;
          right: 0;
          transform: rotate(90deg);
        }

        .blog-cover-story__corner--tl {
          top: 0;
          left: 0;
        }

        .blog-cover-story__corner--bl {
          bottom: 0;
          left: 0;
          transform: rotate(-90deg);
        }

        .blog-cover-story__corner--br {
          right: 0;
          bottom: 0;
          transform: rotate(180deg);
        }

        .blog-cover-story__media-tag {
          position: absolute;
          left: 24px;
          bottom: 24px;
          z-index: 2;
          padding: 6px 14px;
          background: rgba(8, 8, 8, 0.6);
          font-size: 9px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(245, 240, 235, 0.6);
          backdrop-filter: blur(8px);
        }

        .blog-cover-story__content {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 64px 56px;
          background: #080808;
        }

        .blog-cover-story__eyebrow,
        .blog-cover-story__issue {
          display: block;
          text-transform: uppercase;
        }

        .blog-cover-story__eyebrow {
          margin-bottom: 20px;
          font-size: 9px;
          letter-spacing: 6px;
          color: rgba(245, 240, 235, 0.2);
        }

        .blog-cover-story__issue {
          margin-bottom: 32px;
          font-size: 9px;
          letter-spacing: 3px;
          color: #8b5e3c;
        }

        .blog-cover-story__content h2 {
          margin: 0 0 20px;
          font-size: clamp(26px, 3.5vw, 42px);
          font-weight: 300;
          line-height: 1.2;
          letter-spacing: -0.5px;
          color: rgba(245, 240, 235, 0.9);
        }

        .blog-cover-story__divider {
          width: 48px;
          height: 1px;
          margin-bottom: 20px;
          background: #8b5e3c;
          animation: lineExpand 0.8s ease;
        }

        .blog-cover-story__content p {
          max-width: 400px;
          margin: 0;
          font-size: 14px;
          line-height: 1.9;
          color: rgba(245, 240, 235, 0.4);
        }

        .blog-cover-story__footer {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .blog-cover-story__meta {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .blog-cover-story__avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 0.5px solid rgba(245, 240, 235, 0.1);
          background: #1a0e08;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: rgba(245, 240, 235, 0.6);
          overflow: hidden;
          flex-shrink: 0;
        }

        .blog-cover-story__meta strong,
        .blog-cover-story__meta span {
          display: block;
        }

        .blog-cover-story__meta strong {
          margin-bottom: 4px;
          font-size: 12px;
          font-weight: 300;
          color: rgba(245, 240, 235, 0.6);
        }

        .blog-cover-story__meta span {
          font-size: 10px;
          letter-spacing: 1px;
          color: rgba(245, 240, 235, 0.2);
        }

        .blog-cover-story__cta {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          width: fit-content;
          padding-bottom: 2px;
          border-bottom: 1px solid rgba(245, 240, 235, 0.15);
          color: rgba(245, 240, 235, 0.5);
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          text-decoration: none;
          transition:
            border-bottom-color 0.3s ease,
            color 0.3s ease;
        }

        .blog-cover-story__cta-line {
          width: 0;
          height: 1px;
          background: #8b5e3c;
          transition: width 0.3s ease;
        }

        .blog-cover-story__cta:hover {
          border-bottom-color: #8b5e3c;
          color: rgba(245, 240, 235, 0.9);
        }

        .blog-cover-story__cta:hover .blog-cover-story__cta-line {
          width: 32px;
        }

        .blog-cinema-filters {
          display: flex;
          align-items: center;
          height: 52px;
          padding: 0 80px;
          overflow-x: auto;
          border-top: 0.5px solid rgba(255, 255, 255, 0.06);
          border-bottom: 0.5px solid rgba(255, 255, 255, 0.06);
          background: #080808;
          scrollbar-width: none;
        }

        .blog-cinema-filters::-webkit-scrollbar {
          display: none;
        }

        .blog-cinema-filters__label,
        .blog-cinema-filters__count {
          flex-shrink: 0;
          font-size: 9px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(245, 240, 235, 0.15);
        }

        .blog-cinema-filters__label {
          padding-right: 24px;
          margin-right: 24px;
          border-right: 0.5px solid rgba(255, 255, 255, 0.06);
        }

        .blog-cinema-filters__tabs {
          display: flex;
          align-items: center;
          min-width: max-content;
        }

        .blog-cinema-filters__tab {
          position: relative;
          display: flex;
          align-items: center;
          height: 52px;
          padding: 0 20px;
          border-right: 0.5px solid rgba(255, 255, 255, 0.04);
          color: rgba(245, 240, 235, 0.2);
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          text-decoration: none;
          white-space: nowrap;
          transition: color 0.2s ease;
        }

        .blog-cinema-filters__tab:hover {
          color: rgba(245, 240, 235, 0.5);
        }

        .blog-cinema-filters__tab--active {
          color: rgba(245, 240, 235, 0.85);
        }

        .blog-cinema-filters__tab--active::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 1.5px;
          background: #8b5e3c;
          animation: filterActivate 0.3s ease;
        }

        .blog-cinema-filters__count {
          margin-left: auto;
          padding-left: 24px;
          border-left: 0.5px solid rgba(255, 255, 255, 0.06);
        }

        .blog-editorial-section {
          padding: 80px;
          background: #080808;
        }

        .blog-editorial-section--secondary {
          padding-top: 0;
        }

        .blog-editorial-grid {
          display: grid;
          gap: 2px;
        }

        .blog-editorial-grid--primary {
          grid-template-columns: repeat(12, minmax(0, 1fr));
          grid-auto-rows: minmax(120px, auto);
        }

        .blog-editorial-grid--secondary {
          grid-template-columns: repeat(12, minmax(0, 1fr));
          grid-auto-rows: minmax(120px, auto);
        }

        .editorial-post-card {
          position: relative;
          display: block;
          overflow: hidden;
          background: #0f0f0d;
          text-decoration: none;
          color: inherit;
          cursor: none;
        }

        .editorial-post-card__article,
        .editorial-post-card__media,
        .editorial-post-card__fallback {
          position: absolute;
          inset: 0;
        }

        .editorial-post-card__media {
          overflow: hidden;
          background: #0f0f0d;
        }

        .editorial-post-card__fallback {
          background: linear-gradient(145deg, #1a0e08 0%, #3d1f0d 50%, rgba(139, 94, 60, 0.3) 100%);
        }

        .editorial-post-card__fallback-title {
          position: absolute;
          inset: 12% auto auto -6%;
          width: 120%;
          font-size: clamp(48px, 6vw, 80px);
          line-height: 0.9;
          font-weight: 300;
          letter-spacing: -2px;
          color: rgba(245, 240, 235, 0.03);
          text-transform: uppercase;
          word-break: break-word;
        }

        .editorial-post-card__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(8, 8, 8, 0.92) 0%,
            rgba(8, 8, 8, 0.4) 40%,
            rgba(8, 8, 8, 0) 65%
          );
          pointer-events: none;
          transition: opacity 0.4s ease;
        }

        .editorial-post-card__content {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2;
          padding: 24px 28px 28px;
          pointer-events: none;
        }

        .editorial-post-card__top,
        .editorial-post-card__bottom {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .editorial-post-card__top {
          margin-bottom: 12px;
        }

        .editorial-post-card__tag,
        .editorial-post-card__readtime {
          font-size: 8px;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .editorial-post-card__tag {
          padding: 3px 10px;
          background: rgba(139, 94, 60, 0.15);
          color: #8b5e3c;
        }

        .editorial-post-card__readtime {
          color: rgba(245, 240, 235, 0.25);
        }

        .editorial-post-card h3 {
          margin: 0 0 12px;
          font-weight: 300;
          line-height: 1.2;
          letter-spacing: -0.2px;
          color: rgba(245, 240, 235, 0.9);
        }

        .editorial-post-card p {
          display: -webkit-box;
          margin: 0 0 14px;
          overflow: hidden;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          font-size: 12px;
          line-height: 1.7;
          color: rgba(245, 240, 235, 0.35);
        }

        .editorial-post-card__bottom span {
          font-size: 10px;
          letter-spacing: 1px;
          color: rgba(245, 240, 235, 0.2);
        }

        .editorial-post-card__arrow {
          font-size: 14px !important;
          color: rgba(245, 240, 235, 0);
          transition:
            color 0.3s ease,
            transform 0.3s ease;
        }

        .editorial-post-card:hover .img-zoom {
          transform: scale(1.04);
        }

        .editorial-post-card:hover .editorial-post-card__overlay {
          opacity: 1;
          background: linear-gradient(
            to top,
            rgba(8, 8, 8, 0.98) 0%,
            rgba(8, 8, 8, 0.55) 42%,
            rgba(8, 8, 8, 0.08) 68%
          );
        }

        .editorial-post-card:hover .editorial-post-card__arrow {
          color: rgba(245, 240, 235, 0.7);
          transform: translateX(4px);
        }

        .editorial-post-card--row-a-left,
        .editorial-post-card--row-a-right,
        .editorial-post-card--row-c-left,
        .editorial-post-card--row-c-right {
          min-height: min(56vw, 520px);
        }

        .editorial-post-card--row-a-left {
          grid-column: 1 / span 6;
          grid-row: span 1;
        }

        .editorial-post-card--row-a-right {
          grid-column: 7 / span 6;
          grid-row: span 1;
        }

        .editorial-post-card--row-b-feature {
          grid-column: 1 / span 5;
          grid-row: span 2;
          min-height: 600px;
        }

        .editorial-post-card--row-b-top {
          grid-column: 6 / span 7;
          grid-row: span 1;
          min-height: 290px;
        }

        .editorial-post-card--row-b-bottom {
          grid-column: 6 / span 7;
          grid-row: span 1;
          min-height: 290px;
        }

        .editorial-post-card--row-c-left {
          grid-column: 1 / span 6;
          min-height: min(56vw, 520px);
        }

        .editorial-post-card--row-c-right {
          grid-column: 7 / span 6;
          min-height: min(56vw, 520px);
        }

        .editorial-post-card--row-d-full {
          grid-column: 1 / -1;
          min-height: 360px;
        }

        .editorial-post-card--row-e-full {
          grid-column: 1 / -1;
          min-height: min(40vw, 400px);
        }

        .editorial-post-card--row-f-1,
        .editorial-post-card--row-f-2,
        .editorial-post-card--row-f-3,
        .editorial-post-card--row-f-4 {
          min-height: 320px;
        }

        .editorial-post-card--row-f-1 {
          grid-column: 1 / span 3;
        }

        .editorial-post-card--row-f-2 {
          grid-column: 4 / span 3;
        }

        .editorial-post-card--row-f-3 {
          grid-column: 7 / span 3;
        }

        .editorial-post-card--row-f-4 {
          grid-column: 10 / span 3;
        }

        .editorial-post-card--row-g-large {
          grid-column: 1 / span 7;
          min-height: 480px;
        }

        .editorial-post-card--row-g-small {
          grid-column: 8 / span 5;
          min-height: 480px;
        }

        .editorial-post-card--row-a-left h3,
        .editorial-post-card--row-a-right h3,
        .editorial-post-card--row-c-left h3,
        .editorial-post-card--row-c-right h3 {
          font-size: 20px;
        }

        .editorial-post-card--row-b-feature h3 {
          font-size: 24px;
        }

        .editorial-post-card--row-b-top h3,
        .editorial-post-card--row-b-bottom h3,
        .editorial-post-card--row-f-1 h3,
        .editorial-post-card--row-f-2 h3,
        .editorial-post-card--row-f-3 h3,
        .editorial-post-card--row-f-4 h3,
        .editorial-post-card--row-g-small h3 {
          font-size: 16px;
        }

        .editorial-post-card--row-d-full h3,
        .editorial-post-card--row-e-full h3,
        .editorial-post-card--row-g-large h3 {
          font-size: 28px;
        }

        .blog-interlude {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 80px;
          padding: 64px 80px;
          border-top: 0.5px solid rgba(255, 255, 255, 0.06);
          border-bottom: 0.5px solid rgba(255, 255, 255, 0.06);
          background: #080808;
        }

        .blog-interlude__quote {
          max-width: 540px;
        }

        .blog-interlude__mark {
          display: block;
          margin-bottom: 24px;
          font-size: 120px;
          font-weight: 300;
          line-height: 0;
          color: rgba(139, 94, 60, 0.12);
        }

        .blog-interlude__quote p {
          margin: 0;
          font-size: 22px;
          line-height: 1.65;
          letter-spacing: 0.2px;
          font-style: italic;
          font-weight: 300;
          color: rgba(245, 240, 235, 0.6);
        }

        .blog-interlude__quote small {
          display: block;
          margin-top: 20px;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(245, 240, 235, 0.2);
        }

        .blog-interlude__strip {
          width: 280px;
        }

        .blog-interlude__frames {
          border-bottom: 0.5px solid rgba(255, 255, 255, 0.06);
        }

        .blog-interlude__frame {
          position: relative;
          display: block;
          height: 64px;
          overflow: hidden;
          border-top: 0.5px solid rgba(255, 255, 255, 0.06);
          background: #0f0f0d;
          text-decoration: none;
        }

        .blog-interlude__perforation {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 14px;
          border-right: 0.5px solid rgba(255, 255, 255, 0.04);
          background: rgba(255, 255, 255, 0.04);
          z-index: 2;
          pointer-events: none;
        }

        .blog-interlude__perforation i {
          position: absolute;
          left: 3px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
        }

        .blog-interlude__perforation i:first-child {
          top: 8px;
        }

        .blog-interlude__perforation i:last-child {
          bottom: 8px;
        }

        .blog-interlude__frame-image {
          position: absolute;
          inset: 0;
          left: 14px;
          overflow: hidden;
        }

        .blog-interlude__frame:hover :global(img) {
          filter: grayscale(0);
        }

        .blog-interlude__handle {
          display: block;
          margin-top: 12px;
          text-align: center;
          font-size: 9px;
          letter-spacing: 3px;
          color: rgba(245, 240, 235, 0.15);
        }

        .blog-subscribe {
          position: relative;
          overflow: hidden;
          padding: 96px 80px;
          border-top: 0.5px solid rgba(255, 255, 255, 0.06);
          background: #0f0f0d;
        }

        .blog-subscribe__bg-letter {
          position: absolute;
          right: -40px;
          bottom: -80px;
          font-size: 400px;
          font-weight: 300;
          line-height: 1;
          font-style: italic;
          color: rgba(245, 240, 235, 0.015);
          pointer-events: none;
          user-select: none;
        }

        .blog-subscribe__glow {
          position: absolute;
          left: -100px;
          top: 50%;
          width: 400px;
          height: 400px;
          transform: translateY(-50%);
          background: radial-gradient(circle, rgba(139, 94, 60, 0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .blog-subscribe__content {
          position: relative;
          z-index: 1;
          max-width: 600px;
        }

        .blog-subscribe__eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          font-size: 9px;
          letter-spacing: 6px;
          text-transform: uppercase;
          color: rgba(245, 240, 235, 0.15);
        }

        .blog-subscribe__eyebrow span:first-child,
        .blog-subscribe__eyebrow span:last-child {
          width: 24px;
          height: 1px;
          background: #8b5e3c;
        }

        .blog-subscribe__content h2 {
          margin: 0 0 14px;
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 300;
          line-height: 1.15;
          letter-spacing: -0.5px;
          color: rgba(245, 240, 235, 0.85);
        }

        .blog-subscribe__content h2 em {
          color: #8b5e3c;
          font-style: italic;
        }

        .blog-subscribe__content p {
          max-width: 400px;
          margin: 0 0 40px;
          font-size: 14px;
          line-height: 1.8;
          color: rgba(245, 240, 235, 0.3);
        }

        .blog-subscribe__form {
          display: flex;
          gap: 0;
          padding-bottom: 4px;
          border-bottom: 0.5px solid rgba(245, 240, 235, 0.15);
        }

        .blog-subscribe__form input {
          flex: 1;
          padding: 8px 0;
          border: none;
          outline: none;
          background: transparent;
          color: rgba(245, 240, 235, 0.85);
          font-size: 15px;
          font-weight: 300;
        }

        .blog-subscribe__form input::placeholder {
          color: rgba(245, 240, 235, 0.2);
        }

        .blog-subscribe__form button {
          padding: 8px 0 8px 20px;
          border: none;
          background: transparent;
          color: rgba(245, 240, 235, 0.4);
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .blog-subscribe__form button:hover {
          color: #8b5e3c;
        }

        .blog-subscribe__note {
          display: block;
          margin-top: 16px;
          font-size: 10px;
          letter-spacing: 1px;
          color: rgba(245, 240, 235, 0.15);
        }

        .blog-editorial-empty {
          padding: 80px 24px;
          border: 0.5px solid rgba(255, 255, 255, 0.06);
          background: #0f0f0d;
          text-align: center;
        }

        .blog-editorial-empty span {
          display: block;
          margin-bottom: 12px;
          font-size: 9px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(245, 240, 235, 0.2);
        }

        .blog-editorial-empty h2 {
          margin: 0 0 10px;
          font-size: 28px;
          font-weight: 300;
          color: rgba(245, 240, 235, 0.85);
        }

        .blog-editorial-empty p {
          margin: 0;
          font-size: 14px;
          line-height: 1.8;
          color: rgba(245, 240, 235, 0.35);
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

        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        @keyframes heroFadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes lineExpand {
          from {
            width: 0;
          }
          to {
            width: 48px;
          }
        }

        @keyframes scanDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(350%);
          }
        }

        @keyframes filterActivate {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        @media (max-width: 1024px) {
          .editorial-post-card {
            cursor: pointer;
          }
        }

        @media (max-width: 767px) {
          #cursor-spotlight,
          .blog-read-cursor,
          .film-grain::before {
            display: none;
          }

          .blog-cinema-hero {
            min-height: 600px;
            height: 100svh;
          }

          .blog-cinema-hero__image {
            width: 100%;
            opacity: 0.08;
          }

          .blog-cinema-hero__topline {
            top: 28px;
            left: 24px;
            right: 24px;
            gap: 12px;
          }

          .blog-cinema-hero__issue {
            top: auto;
            right: 24px;
            bottom: 156px;
          }

          .blog-cinema-hero__content {
            padding: 0 24px 48px;
          }

          .blog-cinema-hero__content h1 {
            min-height: 110px;
            font-size: 36px;
          }

          .blog-cinema-hero__scroll {
            display: none;
          }

          .blog-cover-story {
            grid-template-columns: 1fr;
          }

          .blog-cover-story__media {
            min-height: 70vw;
          }

          .blog-cover-story__content {
            padding: 28px 20px;
          }

          .blog-cinema-filters {
            height: auto;
            padding: 0 20px;
          }

          .blog-cinema-filters__label,
          .blog-cinema-filters__count {
            display: none;
          }

          .blog-cinema-filters__tab {
            height: 48px;
            padding: 0 16px;
          }

          .blog-editorial-section,
          .blog-interlude,
          .blog-subscribe {
            padding-left: 24px;
            padding-right: 24px;
          }

          .blog-editorial-grid--primary,
          .blog-editorial-grid--secondary {
            grid-template-columns: 1fr;
          }

          .editorial-post-card[class*="editorial-post-card--"] {
            grid-column: auto;
            min-height: 64vw;
          }

          .editorial-post-card__content {
            padding: 20px;
          }

          .editorial-post-card h3,
          .editorial-post-card--row-b-feature h3,
          .editorial-post-card--row-d-full h3,
          .editorial-post-card--row-e-full h3,
          .editorial-post-card--row-g-large h3,
          .editorial-post-card--row-g-small h3 {
            font-size: 22px;
          }

          .blog-interlude {
            flex-direction: column;
            gap: 24px;
          }

          .blog-interlude__quote p {
            font-size: 18px;
          }

          .blog-interlude__strip {
            display: none;
          }

          .blog-subscribe {
            padding-top: 64px;
            padding-bottom: 64px;
          }

          .blog-subscribe__content h2 {
            font-size: 28px;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps({ query }) {
  const posts = await fetchPublishedBlogPosts();
  const requestedCategory = typeof query.category === "string" ? query.category : "all";
  const activeCategory = FILTER_TABS.some(
    (tab) => tab.toLowerCase() === requestedCategory.toLowerCase(),
  )
    ? requestedCategory
    : "all";

  return {
    props: {
      posts,
      activeCategory,
    },
  };
}
