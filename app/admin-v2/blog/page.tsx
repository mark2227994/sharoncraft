'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { notifyIndexNowForBlogPost } from '@/lib/indexnow';
import { supabase } from '@/lib/supabase/client';

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  author: string | null;
  read_time: number | null;
  is_published: boolean | null;
  published_at: string | null;
  updated_at: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return 'Draft';
  return new Date(value).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      const { data } = await supabase
        .from('blog_posts')
        .select('id,title,slug,category,author,read_time,is_published,published_at,updated_at')
        .order('updated_at', { ascending: false });

      setPosts((data || []) as BlogRow[]);
      setLoading(false);
    }

    void loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return posts;
    return posts.filter((post) =>
      [post.title, post.category, post.author, post.slug]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [posts, search]);

  async function togglePublish(post: BlogRow) {
    const nextPublished = !post.is_published;
    const nextTimestamp = new Date().toISOString();
    const nextPublishedAt = nextPublished ? post.published_at || nextTimestamp : null;
    const { error } = await supabase
      .from('blog_posts')
      .update({
        is_published: nextPublished,
        published_at: nextPublishedAt,
        updated_at: nextTimestamp,
      })
      .eq('id', post.id);

    if (error) return;

    const updatedPost = {
      ...post,
      is_published: nextPublished,
      published_at: nextPublishedAt,
      updated_at: nextTimestamp,
    };

    setPosts((current) =>
      current.map((entry) =>
        entry.id === post.id ? updatedPost : entry,
      ),
    );
    void notifyIndexNowForBlogPost(updatedPost);
  }

  async function deletePost(id: string) {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;

    setDeletingId(id);
    const deletedPost = posts.find((post) => post.id === id) || null;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);

    if (!error) {
      setPosts((current) => current.filter((post) => post.id !== id));
      if (deletedPost) {
        void notifyIndexNowForBlogPost(deletedPost);
      }
    }

    setDeletingId(null);
  }

  const stats = {
    total: posts.length,
    published: posts.filter((post) => post.is_published).length,
    drafts: posts.filter((post) => !post.is_published).length,
    categories: new Set(posts.map((post) => post.category).filter(Boolean)).size,
  };

  return (
    <div style={{ padding: '32px', background: '#fafaf8', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 400, color: '#1c1c1c' }}>Blog Posts</h1>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#888' }}>
            Manage stories, publishing state, and journal content for the public blog.
          </p>
        </div>

        <Link
          href="/admin-v2/blog/new"
          style={{
            height: '40px',
            padding: '0 20px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1c1c1c',
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '11px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            borderRadius: '2px',
          }}
        >
          + New Post
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Posts', value: stats.total, color: '#1c1c1c' },
          { label: 'Published', value: stats.published, color: '#2E7D32' },
          { label: 'Drafts', value: stats.drafts, color: '#8B5E3C' },
          { label: 'Categories', value: stats.categories, color: '#666' },
        ].map((card) => (
          <div key={card.label} style={{ background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '2px', padding: '20px' }}>
            <span style={{ display: 'block', marginBottom: '4px', fontSize: '28px', fontWeight: 300, color: card.color }}>{card.value}</span>
            <span style={{ fontSize: '11px', color: '#888', letterSpacing: '0.5px' }}>{card.label}</span>
          </div>
        ))}
      </div>

      <div style={{ background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '2px', padding: '14px 16px', marginBottom: '2px' }}>
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ width: '100%', maxWidth: '360px', height: '40px', padding: '0 12px', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: '2px', background: '#fafaf8', fontSize: '13px', color: '#1c1c1c', outline: 'none' }}
        />
      </div>

      <div style={{ background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 120px 120px 120px 90px 210px', gap: '12px', padding: '10px 16px', background: '#fafaf8', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
          {['Title', 'Status', 'Category', 'Date', 'Views', 'Actions'].map((column) => (
            <span key={column} style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#bbb' }}>
              {column}
            </span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '28px 16px', color: '#888', fontSize: '13px' }}>Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ padding: '48px 16px', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 300, color: '#1c1c1c' }}>No blog posts yet</h2>
            <p style={{ margin: '0 0 20px', color: '#888', fontSize: '12px' }}>
              Create your first story to start the journal.
            </p>
            <Link href="/admin-v2/blog/new" style={{ color: '#1c1c1c', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', borderBottom: '1px solid #1c1c1c' }}>
              Write First Post
            </Link>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} style={{ display: 'grid', gridTemplateColumns: '1.7fr 120px 120px 120px 90px 210px', gap: '12px', padding: '14px 16px', alignItems: 'center', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
              <div>
                <span style={{ display: 'block', fontSize: '13px', color: '#1c1c1c', marginBottom: '2px' }}>{post.title}</span>
                <span style={{ fontSize: '10px', color: '#bbb' }}>
                  {post.author || 'Sharon'} · {post.read_time || 5} min · /blog/{post.slug}
                </span>
              </div>
              <span style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: post.is_published ? '#2E7D32' : '#8B5E3C' }}>
                {post.is_published ? 'Published' : 'Draft'}
              </span>
              <span style={{ fontSize: '11px', color: '#666' }}>{post.category || 'General'}</span>
              <span style={{ fontSize: '11px', color: '#666' }}>{formatDate(post.published_at || post.updated_at)}</span>
              <span style={{ fontSize: '11px', color: '#bbb' }}>—</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Link
                  href={`/admin-v2/blog/${post.id}/edit`}
                  style={{ padding: '6px 10px', background: '#1c1c1c', color: '#ffffff', textDecoration: 'none', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', borderRadius: '2px' }}
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => void togglePublish(post)}
                  style={{ padding: '6px 10px', background: '#ffffff', color: '#8B5E3C', border: '0.5px solid rgba(139,94,60,0.3)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', borderRadius: '2px', cursor: 'pointer' }}
                >
                  {post.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => void deletePost(post.id)}
                  disabled={deletingId === post.id}
                  style={{ padding: '6px 10px', background: 'rgba(192,57,43,0.08)', color: '#C0392B', border: 'none', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', borderRadius: '2px', cursor: 'pointer', opacity: deletingId === post.id ? 0.5 : 1 }}
                >
                  {deletingId === post.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
