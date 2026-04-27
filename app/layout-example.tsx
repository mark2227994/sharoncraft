// Main app layout - update to use Supabase for hero slides

import { fetchVisibleHeroSlides, fetchAnnouncement } from '@/lib/supabase/public';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch dynamic data server-side
  const heroSlides = await fetchVisibleHeroSlides();
  const announcement = await fetchAnnouncement();

  return (
    <html>
      <head>
        {/* Add your head content */}
      </head>
      <body>
        {/* Announcement bar */}
        {announcement && (
          <div
            className="bg-black text-white text-center py-2 text-xs"
            style={{ letterSpacing: '1px' }}
          >
            {announcement.text}
          </div>
        )}

        {/* Navigation */}
        {/* Use your Nav component */}

        {/* Hero Section - pass slides as props to client component */}
        <HeroSlideshow slides={heroSlides} />

        {/* Main content */}
        {children}

        {/* Footer */}
        {/* Use your Footer component */}
      </body>
    </html>
  );
}

// Client component for slideshow
'use client';

import { useState, useEffect } from 'react';

function HeroSlideshow({ slides }: { slides: any[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % (slides.length || 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <div className="relative w-full h-96 overflow-hidden">
      <img
        src={slide.image_url}
        alt={slide.headline}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center">
        <h1 className="text-white text-4xl font-bold mb-4">{slide.headline}</h1>
        {slide.subtitle && (
          <p className="text-white text-lg mb-6">{slide.subtitle}</p>
        )}
        {slide.button_text && (
          <a
            href={slide.button_link}
            className="bg-white text-black px-6 py-2 text-sm font-bold"
          >
            {slide.button_text}
          </a>
        )}
      </div>
    </div>
  );
}
