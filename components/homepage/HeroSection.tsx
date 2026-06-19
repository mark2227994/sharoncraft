"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export interface HeroConfig {
  is_active?: boolean
  tagline?: string
  headline_line1?: string
  headline_line2?: string
  headline_line2_italic?: boolean
  subheadline?: string
  cta1_text?: string
  cta1_url?: string
  cta2_text?: string
  cta2_url?: string
  stat1_number?: string
  stat1_label?: string
  stat2_number?: string
  stat2_label?: string
  stat3_number?: string
  stat3_label?: string
  hero_type?: 'image' | 'video' | string
  image_main?: string
  image_main_alt?: string
  image_position?: string
  video_url?: string | null
  video_poster?: string | null
  media_tag?: string
}

interface Props {
  hero?: HeroConfig | null
}

const DEFAULT: Required<Omit<HeroConfig, 'video_url' | 'video_poster' | 'media_tag'>> & {
  video_url: string | null
  video_poster: string | null
  media_tag: string
} = {
  is_active: true,
  tagline: 'EST. 2024 · NAIROBI, KENYA',
  headline_line1: 'Handmade in',
  headline_line2: 'Nairobi',
  headline_line2_italic: true,
  subheadline: 'Jewelry and accessories by Kenyan artisans. Made to order in 5–7 days.',
  cta1_text: 'Shop Now',
  cta1_url: '/shop',
  cta2_text: 'Custom Order',
  cta2_url: '/custom-order',
  stat1_number: '500+',
  stat1_label: 'Pieces crafted',
  stat2_number: '100%',
  stat2_label: 'Handmade',
  stat3_number: '48hr',
  stat3_label: 'Nairobi delivery',
  hero_type: 'image',
  image_main: '/media/site/homepage/hero-beaded-bag.jpg',
  image_main_alt: 'SharonCraft handmade jewelry in Nairobi',
  image_position: 'center',
  video_url: null,
  video_poster: null,
  media_tag: 'Nairobi, Kenya',
}

function isEmpty(value?: string | null) {
  return !value || value.trim().length === 0
}

function resolveAsset(asset?: string | null) {
  if (!asset) return ''
  if (/^(https?:|data:|blob:)/i.test(asset)) return asset
  return asset.startsWith('/') ? asset : `/${asset}`
}

export default function HeroSection({ hero }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 50)
    return () => window.clearTimeout(timer)
  }, [])

  const config = { ...DEFAULT, ...(hero ?? {}) }
  const active = config.is_active !== false
  const showVideo = config.hero_type === 'video' && !isEmpty(config.video_url)
  const imageSrc = resolveAsset(config.image_main)
  const posterSrc = resolveAsset(config.video_poster || config.image_main)
  const mediaAlt = resolveAsset(config.image_main_alt) || 'SharonCraft handmade jewelry'
  const rawTagline = config.tagline || 'EST. 2024 · NAIROBI, KENYA';
  const cleanTagline = (rawTagline.toLowerCase().includes('handmade') && rawTagline.toLowerCase().includes('nairobi'))
    ? 'EST. 2024 · NAIROBI, KENYA'
    : rawTagline;

  const stats = [
    { number: config.stat1_number, label: config.stat1_label },
    { number: config.stat2_number, label: config.stat2_label },
    { number: config.stat3_number, label: config.stat3_label },
  ].filter((item) => !isEmpty(item.number) && !isEmpty(item.label))

  if (!active) {
    return (
      <section className="hero-fallback" aria-label="SharonCraft homepage hero fallback">
        <div className="hero-fallback__container">
          <h1>SharonCraft</h1>
          <p>Handmade Kenyan jewelry and accessories.</p>
          <Link href="/shop" className="hero-fallback__button">Shop Now</Link>
        </div>
        <style jsx>{`
          .hero-fallback { min-height: 60vh; display:flex; align-items:center; justify-content:center; background:#fff; color:#111 }
          .hero-fallback__container { text-align:center; padding:40px }
          .hero-fallback__button { display:inline-flex; margin-top:24px; padding:0 28px; height:48px; align-items:center; justify-content:center; border-radius:8px; background:#111; color:#fff; text-decoration:none }
        `}</style>
      </section>
    )
  }

  return (
    <section className={`hero-shell ${mounted ? 'is-mounted' : ''}`} aria-label="SharonCraft homepage hero">
      <div className="hero-shell__panel hero-shell__panel--copy">
        <div className="hero-copy">
          <div className="hero-tagline">{cleanTagline}</div>
          <h1 className="hero-headline">
            <span className="hero-headline__line-wrap">
              <span className="hero-headline__line-inner">{config.headline_line1}</span>
            </span>
            <span className="hero-headline__line-wrap">
              <span className={`hero-headline__line-inner ${config.headline_line2_italic ? 'hero-headline__emphasis' : ''}`}>
                {config.headline_line2}
              </span>
            </span>
          </h1>
          <div className="hero-divider" aria-hidden="true" />
          <p className="hero-description">{config.subheadline}</p>
          <div className="hero-actions">
            <Link href={config.cta1_url} className="hero-button hero-button--primary">
              <span>{config.cta1_text}</span>
              <svg className="hero-button__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
            <Link href={config.cta2_url} className="hero-button hero-button--ghost">
              <span>{config.cta2_text}</span>
              <svg className="hero-button__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
          <div className="hero-stats">
            {stats.map((item, index) => (
              <div key={index} className="hero-stat">
                <div className="hero-stat__number">{item.number}</div>
                <div className="hero-stat__label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hero-shell__panel hero-shell__panel--media">
        <div className="hero-media-container">
          <div className="hero-media-frame">
            {/* Fine-line Frame Accents (Desktop) */}
            <div className="hero-media-frame__corner hero-media-frame__corner--top-left max-md:hidden" aria-hidden="true" />
            <div className="hero-media-frame__corner hero-media-frame__corner--top-right max-md:hidden" aria-hidden="true" />
            <div className="hero-media-frame__corner hero-media-frame__corner--bottom-left max-md:hidden" aria-hidden="true" />
            <div className="hero-media-frame__corner hero-media-frame__corner--bottom-right max-md:hidden" aria-hidden="true" />

            <div className="hero-media">
              {showVideo ? (
                <video className="hero-media__content" autoPlay muted loop playsInline poster={posterSrc || undefined}>
                  <source src={resolveAsset(config.video_url)} type="video/mp4" />
                </video>
              ) : (
                <div className="hero-image-wrapper">
                  <Image 
                    src={imageSrc} 
                    alt={mediaAlt} 
                    fill 
                    priority 
                    sizes="(max-width:900px) 100vw, 55vw" 
                    style={{ objectFit: 'cover', objectPosition: config.image_position || 'center' }}
                  />
                </div>
              )}
            </div>
            {config.media_tag ? (
              <div className="hero-media__tag">
                <span className="tag-dot" />
                <span className="tag-text">{config.media_tag}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Desktop Layout & Sizing */
        .hero-shell { 
          display: grid; 
          grid-template-columns: 42% 58%; 
          min-height: 90vh; 
          background: #faf9f6; 
          overflow: visible; /* Allow overlap */
          position: relative;
        }
        
        .hero-shell__panel { 
          position: relative; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-sizing: border-box;
        }
        
        .hero-shell__panel--copy { 
          background: #faf9f6;
          padding: 80px 0px 80px 80px;
          z-index: 5;
        }
        
        .hero-shell__panel--media { 
          background: #faf9f6; 
          padding: 48px;
        }
        
        .hero-copy { 
          max-width: 540px; 
          width: 120%; /* Overlap into the media column */
          position: relative;
          z-index: 10;
        }
        
        /* Typography Elements */
        .hero-tagline { 
          font-family: var(--font-body), sans-serif;
          font-size: 11px; 
          font-weight: 500;
          letter-spacing: 3px; 
          text-transform: uppercase; 
          color: #8b5e3c; 
          margin-bottom: 22px;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .hero-headline { 
          margin: 0; 
          font-family: var(--font-serif), 'Playfair Display', Georgia, serif;
          font-size: clamp(38px, 4.5vw, 60px); 
          line-height: 1.05; 
          color: #1c1c1c; 
          font-weight: 400; 
          letter-spacing: -0.5px;
        }
        
        .hero-headline__line-wrap {
          display: block;
          overflow: hidden;
          margin-bottom: 2px;
        }
        
        .hero-headline__line-inner {
          display: block;
          transform: translateY(100%);
          transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .hero-headline__emphasis { 
          font-family: var(--font-display), 'Cormorant Garamond', Georgia, serif;
          font-style: italic; 
          color: #8b5e3c; 
          font-weight: 300;
        }
        
        .hero-divider { 
          width: 36px; 
          height: 0.5px; 
          background: #8b5e3c; 
          margin: 28px 0; 
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .hero-description { 
          margin: 0 0 36px; 
          color: #5c554e; 
          font-family: var(--font-body), sans-serif;
          font-size: 15px; 
          line-height: 1.8;
          opacity: 0;
          transform: translateY(15px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        /* Actions & Buttons */
        .hero-actions { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 16px; 
          margin-bottom: 48px;
          opacity: 0;
          transform: translateY(15px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        :global(.hero-button) { 
          display: inline-flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 50px; 
          padding: 0 28px; 
          border-radius: 4px; /* Editorial Sharp Corners */
          font-family: var(--font-body), sans-serif;
          font-size: 11px; 
          font-weight: 600;
          letter-spacing: 2.5px; 
          text-transform: uppercase; 
          text-decoration: none; 
          box-sizing: border-box;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          gap: 8px;
        }
        
        :global(.hero-button__arrow) {
          width: 14px;
          height: 14px;
          stroke: currentColor;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        :global(.hero-button--primary) { 
          background: #1c1c1c; 
          color: #fff;
          border: 1px solid #1c1c1c;
          box-shadow: none;
        }
        
        :global(.hero-button--primary:hover) {
          background: #8b5e3c;
          border-color: #8b5e3c;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(139, 94, 60, 0.15);
        }
        
        :global(.hero-button--primary:hover .hero-button__arrow) {
          transform: translateX(4px);
        }
        
        :global(.hero-button--ghost) { 
          border: 1px solid rgba(28, 28, 28, 0.15); 
          color: #1c1c1c; 
          background: transparent; 
        }
        
        :global(.hero-button--ghost:hover) {
          border-color: #1c1c1c;
          background: rgba(28, 28, 28, 0.03);
          transform: translateY(-2px);
        }
        
        :global(.hero-button--ghost:hover .hero-button__arrow) {
          transform: translateX(4px);
        }
        
        /* Stats Section */
        .hero-stats { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 40px;
          opacity: 0;
          transform: translateY(15px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .hero-stat { 
          display: flex; 
          flex-direction: column; 
          gap: 6px; 
        }
        
        .hero-stat__number { 
          font-family: var(--font-serif), 'Playfair Display', Georgia, serif;
          font-size: 22px; 
          font-weight: 300;
          color: #8b5e3c;
          line-height: 1.1;
        }
        
        .hero-stat__label { 
          font-family: var(--font-body), sans-serif;
          font-size: 9px; 
          letter-spacing: 2px; 
          text-transform: uppercase; 
          color: #777; 
        }
        
        /* Media Frame & Gallery Effect */
        .hero-media-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          box-sizing: border-box;
          opacity: 0;
          transform: scale(0.98) translateY(12px);
          transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .hero-media-frame {
          position: relative;
          width: 100%;
          height: 100%;
          aspect-ratio: 4/5;
          max-height: 72vh;
          overflow: hidden;
          border-radius: 4px; /* Editorial Sharp Corners */
          border: 1px solid rgba(139, 94, 60, 0.08);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.04);
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Frame Corner Accents */
        .hero-media-frame__corner {
          position: absolute;
          width: 0;
          height: 0;
          border: 0.5px solid rgba(139, 94, 60, 0.2);
          pointer-events: none;
          z-index: 5;
          animation: drawHeroCorners 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.5s;
        }
        .hero-media-frame__corner--top-left {
          top: 16px;
          left: 16px;
          border-right: none;
          border-bottom: none;
        }
        .hero-media-frame__corner--top-right {
          top: 16px;
          right: 16px;
          border-left: none;
          border-bottom: none;
        }
        .hero-media-frame__corner--bottom-left {
          bottom: 16px;
          left: 16px;
          border-right: none;
          border-top: none;
        }
        .hero-media-frame__corner--bottom-right {
          bottom: 16px;
          right: 16px;
          border-left: none;
          border-top: none;
        }

        @keyframes drawHeroCorners {
          to {
            width: 16px;
            height: 16px;
          }
        }
        
        .hero-media { 
          position: relative; 
          width: 100%; 
          height: 100%; 
          overflow: hidden;
        }
        
        .hero-image-wrapper { 
          position: relative; 
          width: 100%; 
          height: 100%; 
          transition: transform 1.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Ken Burns zoom in effect on mount */
        .is-mounted .hero-image-wrapper {
          animation: kenBurnsZoom 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes kenBurnsZoom {
          0% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        
        .hero-media:hover .hero-image-wrapper {
          transform: scale(1.03);
        }
        
        .hero-media__content { 
          width: 100%; 
          height: 100%; 
          object-fit: cover;
          transition: transform 1.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .hero-media:hover .hero-media__content {
          transform: scale(1.03);
        }
        
        /* Floating Glassmorphic Tag */
        .hero-media__tag { 
          position: absolute; 
          right: 24px; 
          bottom: 24px; 
          background: rgba(255, 255, 255, 0.82); 
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: #111; 
          padding: 10px 18px; 
          font-size: 10px; 
          font-weight: 500;
          letter-spacing: 2px; 
          text-transform: uppercase; 
          border-radius: 999px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 10;
          pointer-events: none;
        }
        
        .tag-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #8b5e3c;
          animation: tag-pulse 2s infinite ease-in-out;
        }
        
        @keyframes tag-pulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.5; }
        }
        
        /* Staggered Mount State Animations */
        .is-mounted .hero-tagline {
          opacity: 1;
          transform: translateY(0);
        }
        
        .is-mounted .hero-headline__line-wrap:nth-child(1) .hero-headline__line-inner {
          transform: translateY(0);
          transition-delay: 150ms;
        }
        
        .is-mounted .hero-headline__line-wrap:nth-child(2) .hero-headline__line-inner {
          transform: translateY(0);
          transition-delay: 280ms;
        }
        
        .is-mounted .hero-divider {
          transform: scaleX(1);
          transition-delay: 400ms;
        }
        
        .is-mounted .hero-description {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 500ms;
        }
        
        .is-mounted .hero-actions {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 600ms;
        }
        
        .is-mounted .hero-stats {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 700ms;
        }
        
        .is-mounted .hero-media-container {
          opacity: 1;
          transform: scale(1) translateY(0);
          transition-delay: 200ms;
        }

        /* Accessibility: Respect Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .hero-tagline,
          .hero-headline__line-inner,
          .hero-divider,
          .hero-description,
          .hero-actions,
          .hero-stats,
          .hero-media-container,
          .hero-image-wrapper,
          .hero-media__content,
          :global(.hero-button) {
            transition: none !important;
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
          .tag-dot {
            animation: none !important;
          }
        }
        
        /* Responsive Overrides (Mobile & Tablet) */
        @media (max-width: 900px) {
          .hero-shell { 
            grid-template-columns: 1fr; 
            min-height: auto; 
            margin-top: 52px; /* Push hero below mobile nav */
            display: block;
            background: #faf9f6 !important;
            overflow: visible !important;
          }
          
          .hero-shell__panel--media { 
            order: -1; 
            padding: 0 !important; /* Edge-to-edge bleed on mobile */
            background: #faf9f6;
          }
          
          .hero-media-container {
            padding: 0;
            opacity: 0;
            transform: translateY(15px);
          }
          
          .hero-media-frame {
            aspect-ratio: 3/4; /* Vertical crop */
            height: auto;
            max-height: 52vh;
            border-radius: 0px !important; /* Sharp mobile edges */
            border: none !important;
            box-shadow: none !important;
            width: 100vw;
          }
          
          .hero-shell__panel--copy { 
            padding: 36px 20px 56px 20px;
            background: #faf9f6;
          }
          
          .hero-copy {
            max-width: 100%;
            width: 100% !important;
            margin: 0 !important;
          }
          
          .hero-tagline {
            font-size: 9px;
            letter-spacing: 3px;
            font-weight: 600;
            margin-bottom: 12px;
          }
          
          .hero-headline {
            font-size: clamp(32px, 8vw, 44px);
          }
          
          .hero-divider { 
            display: none !important; /* Hide divider line on mobile */
          }
          
          .hero-description {
            margin-bottom: 28px;
            font-size: 14.5px;
            line-height: 1.7;
          }
          
          .hero-actions { 
            flex-direction: row; 
            gap: 12px;
            margin-bottom: 0px;
            width: 100%;
          }
          
          :global(.hero-button) {
            flex: 1;
            min-height: 48px;
            padding: 0 16px;
            font-size: 10px;
            border-radius: 4px !important; /* Clean rectangular corners */
          }
          
          .hero-stats { 
            display: none !important; /* Hide stats on mobile hero for cleaner layout */
          }
          
          .hero-media__tag { 
            right: 16px; 
            bottom: 16px; 
            padding: 8px 14px;
            font-size: 9px;
          }
        }
      `}</style>
    </section>
  )
}
