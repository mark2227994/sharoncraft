'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterApproved, setFilterApproved] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    fetchReviews();
  }, [filterApproved]);

  async function fetchReviews() {
    setLoading(true);
    try {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });

      if (filterApproved === 'approved') {
        query = query.eq('is_approved', true);
      } else if (filterApproved === 'pending') {
        query = query.eq('is_approved', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }

      setReviews(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function approveReview(id: string) {
    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: true })
      .eq('id', id);

    if (!error) {
      setReviews(reviews.map((r) => (r.id === id ? { ...r, is_approved: true } : r)));
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Delete this review?')) return;

    const { error } = await supabase.from('reviews').delete().eq('id', id);

    if (!error) {
      setReviews(reviews.filter((r) => r.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium">Reviews</h2>
        <p className="text-xs text-gray-500 mt-1">{reviews.length} reviews</p>
      </div>

      {/* Filter */}
      <select
        value={filterApproved}
        onChange={(e) => setFilterApproved(e.target.value as any)}
        className="text-xs px-3 py-2 border"
        style={{ borderColor: '#e0e0e0' }}
      >
        <option value="all">All Reviews</option>
        <option value="pending">Pending Approval</option>
        <option value="approved">Approved</option>
      </select>

      {/* Reviews List */}
      {loading ? (
        <div className="text-xs text-gray-500">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="text-xs text-gray-500">No reviews found</div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border p-4 rounded-sm"
              style={{ borderColor: '#f0f0f0' }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium">{review.customer_name}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!review.is_approved && (
                    <button
                      onClick={() => approveReview(review.id)}
                      className="text-xs px-2 py-1 rounded-sm"
                      style={{
                        backgroundColor: '#efe',
                        color: '#3c3',
                      }}
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="text-xs px-2 py-1 rounded-sm"
                    style={{
                      backgroundColor: '#fee',
                      color: '#c33',
                    }}
                  >
                    Delete
                  </button>
                  {review.is_approved && (
                    <span
                      className="text-xs px-2 py-1 rounded-sm"
                      style={{
                        backgroundColor: '#d4edda',
                        color: '#155724',
                      }}
                    >
                      ✓ Approved
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-700 mt-3">{review.comment}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
