'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface HeroSlide {
  id: string;
  headline: string;
  subtitle: string;
  image_url: string;
  display_order: number;
  is_visible: boolean;
}

export default function MediaPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  async function fetchSlides() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order');

      if (error) {
        console.error('Error fetching slides:', error);
        return;
      }

      setSlides(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function saveSlide(id?: string) {
    const slideData = {
      headline: formData.title,
      subtitle: formData.subtitle,
      image_url: formData.image_url,
    };

    const { error } = id
      ? await supabase.from('hero_slides').update(slideData).eq('id', id)
      : await supabase.from('hero_slides').insert([slideData]);

    if (!error) {
      setEditingId(null);
      setFormData({ title: '', subtitle: '', image_url: '' });
      fetchSlides();
    }
  }

  async function deleteSlide(id: string) {
    if (!confirm('Delete this slide?')) return;

    const { error } = await supabase.from('hero_slides').delete().eq('id', id);

    if (!error) {
      setSlides(slides.filter((s) => s.id !== id));
    }
  }

  async function toggleSlide(id: string, isVisible: boolean) {
    const { error } = await supabase
      .from('hero_slides')
      .update({ is_visible: !isVisible })
      .eq('id', id);

    if (!error) {
      setSlides(slides.map((s) => (s.id === id ? { ...s, is_visible: !isVisible } : s)));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium">Media & Hero Slides</h2>
        <p className="text-xs text-gray-500 mt-1">Manage homepage hero slideshow</p>
      </div>

      {/* Add New Slide Form */}
      {editingId === 'new' && (
        <div
          className="border p-4 rounded-sm space-y-3"
          style={{ borderColor: '#f0f0f0', backgroundColor: '#fafafa' }}
        >
          <input
            type="text"
            placeholder="Slide title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="text-xs px-3 py-2 border w-full"
            style={{ borderColor: '#e0e0e0' }}
          />
          <input
            type="text"
            placeholder="Slide subtitle"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="text-xs px-3 py-2 border w-full"
            style={{ borderColor: '#e0e0e0' }}
          />
          <input
            type="text"
            placeholder="Image URL"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="text-xs px-3 py-2 border w-full"
            style={{ borderColor: '#e0e0e0' }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => saveSlide()}
              className="text-xs px-3 py-2 rounded-sm"
              style={{
                backgroundColor: '#1c1c1c',
                color: '#fff',
              }}
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({ title: '', subtitle: '', image_url: '' });
              }}
              className="text-xs px-3 py-2 border rounded-sm"
              style={{ borderColor: '#e0e0e0' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {editingId !== 'new' && (
        <button
          onClick={() => setEditingId('new')}
          className="text-xs px-3 py-2 rounded-sm"
          style={{
            backgroundColor: '#1c1c1c',
            color: '#fff',
          }}
        >
          Add Slide
        </button>
      )}

      {/* Slides List */}
      {loading ? (
        <div className="text-xs text-gray-500">Loading...</div>
      ) : slides.length === 0 ? (
        <div className="text-xs text-gray-500">No slides found</div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="border p-4 rounded-sm"
              style={{ borderColor: '#f0f0f0' }}
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-sm flex-shrink-0 flex items-center justify-center">
                  {slide.image_url ? (
                    <img
                      src={slide.image_url}
                      alt={slide.headline}
                      className="w-full h-full object-cover rounded-sm"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">No image</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{slide.headline}</h3>
                  <p className="text-xs text-gray-600 mt-1">{slide.subtitle}</p>
                  <p className="text-xs text-gray-500 mt-2">{slide.image_url}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleSlide(slide.id, slide.is_visible)}
                    className="text-xs px-2 py-1 rounded-sm transition-colors"
                    style={{
                      backgroundColor: slide.is_visible ? '#efe' : '#fee',
                      color: slide.is_visible ? '#3c3' : '#c33',
                    }}
                  >
                    {slide.is_visible ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => deleteSlide(slide.id)}
                    className="text-xs hover:underline"
                    style={{ color: '#c33' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
