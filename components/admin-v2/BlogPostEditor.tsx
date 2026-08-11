'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { notifyIndexNowForBlogPost } from '@/lib/indexnow';
import { renderMarkdownToHtml, sanitizeBlogHtml, slugify, estimateReadTime } from '@/lib/blog';
import { supabase } from '@/lib/supabase/client';

type BlogPostEditorProps = {
  postId?: string;
};

type BlogPostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string | null;
  author: string | null;
  read_time: number | null;
  is_published: boolean | null;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  tags: string[] | null;
};

const categories = ['Education', 'Styling', 'Behind the Scenes', 'Care Guide', 'Gift Guide'];

function formatDatetimeLocal(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function parseTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

type EditorBlock = {
  raw: string;
  type: 'image' | 'heading' | 'quote' | 'list' | 'paragraph';
  label: string;
  preview: string;
};

function splitEditorBlocks(content: string): EditorBlock[] {
  return String(content)
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
      const firstLine = lines[0] || '';
      const imageMatch = firstLine.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

      if (imageMatch) {
        const altText = imageMatch[1] || 'Article image';
        const captionLine = lines[1]?.replace(/^[*_]|[*_]$/g, '') || '';
        return {
          raw: block,
          type: 'image',
          label: altText,
          preview: captionLine || imageMatch[2],
        };
      }

      if (firstLine.startsWith('## ')) {
        return {
          raw: block,
          type: 'heading',
          label: firstLine.replace(/^##\s+/, ''),
          preview: 'Section heading',
        };
      }

      if (firstLine.startsWith('### ')) {
        return {
          raw: block,
          type: 'heading',
          label: firstLine.replace(/^###\s+/, ''),
          preview: 'Subheading',
        };
      }

      if (firstLine.startsWith('> ')) {
        return {
          raw: block,
          type: 'quote',
          label: firstLine.replace(/^>\s+/, '').slice(0, 60),
          preview: 'Quote block',
        };
      }

      if (/^[-*]\s+/.test(firstLine) || /^\d+\.\s+/.test(firstLine)) {
        return {
          raw: block,
          type: 'list',
          label: 'List block',
          preview: firstLine.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').slice(0, 80),
        };
      }

      return {
        raw: block,
        type: 'paragraph',
        label: firstLine.slice(0, 60) || 'Paragraph',
        preview: lines.slice(1).join(' ').slice(0, 90),
      };
    });
}

function reorderBlocks(blocks: EditorBlock[], fromIndex: number, toIndex: number) {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= blocks.length ||
    toIndex >= blocks.length ||
    fromIndex === toIndex
  ) {
    return blocks;
  }

  const next = [...blocks];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export default function BlogPostEditor({ postId }: BlogPostEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inlineImageInputRef = useRef<HTMLInputElement | null>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [loading, setLoading] = useState(Boolean(postId));
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInlineImage, setUploadingInlineImage] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showSeo, setShowSeo] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(postId));
  const [draggingBlockIndex, setDraggingBlockIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [category, setCategory] = useState('Education');
  const [author, setAuthor] = useState('Sharon');
  const [readTime, setReadTime] = useState(5);
  const [isPublished, setIsPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [tagsValue, setTagsValue] = useState('');

  useEffect(() => {
    if (!title || slugTouched) return;
    setSlug(slugify(title));
  }, [slugTouched, title]);

  useEffect(() => {
    const estimate = estimateReadTime(content);
    if (!readTime || readTime < 1) {
      setReadTime(estimate);
    }
  }, [content, readTime]);

  useEffect(() => {
    if (!postId) return;

    async function loadPost() {
      setLoading(true);
      setError('');

      const { data, error: loadError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .maybeSingle();

      const nextData = data as BlogPostRecord | null;

      if (loadError || !nextData) {
        setError('Could not load this post.');
        setLoading(false);
        return;
      }

      setTitle(nextData.title || '');
      setSlug(nextData.slug || '');
      setExcerpt(nextData.excerpt || '');
      setContent(nextData.content || '');
      setCoverImageUrl(nextData.cover_image_url || '');
      setCategory(nextData.category || 'Education');
      setAuthor(nextData.author || 'Sharon');
      setReadTime(nextData.read_time || estimateReadTime(nextData.content || ''));
      setIsPublished(Boolean(nextData.is_published));
      setPublishedAt(formatDatetimeLocal(nextData.published_at));
      setSeoTitle(nextData.seo_title || '');
      setSeoDescription(nextData.seo_description || '');
      setTagsValue(Array.isArray(nextData.tags) ? nextData.tags.join(', ') : '');
      setLoading(false);
    }

    void loadPost();
  }, [postId]);

  const previewHtml = useMemo(
    () => sanitizeBlogHtml(renderMarkdownToHtml(content || excerpt || '')),
    [content, excerpt],
  );
  const contentBlocks = useMemo(() => splitEditorBlocks(content), [content]);

  async function uploadBlogImage(file: File, prefix: 'cover' | 'inline') {
    setError('');
    setMessage('');

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5MB or smaller.');
      return null;
    }

    const extension = file.name.split('.').pop() || 'jpg';
    const fileSlug = slug || slugify(title) || `blog-post-${Date.now()}`;
    const filePath = `blog/${fileSlug}/${prefix}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage.from('site-images').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

    if (uploadError) {
      setError(uploadError.message || 'Could not upload image.');
      return null;
    }

    const { data } = supabase.storage.from('site-images').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleCoverUpload(file: File) {
    setUploadingCover(true);
    const publicUrl = await uploadBlogImage(file, 'cover');

    if (publicUrl) {
      setCoverImageUrl(publicUrl);
      setMessage('Cover image uploaded.');
    }

    setUploadingCover(false);
  }

  function insertAtCursor(snippet: string) {
    const textarea = contentTextareaRef.current;
    if (!textarea) {
      setContent((current) => `${current}${current ? '\n\n' : ''}${snippet}`);
      return;
    }

    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? content.length;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const needsLeadingBreak = before && !before.endsWith('\n\n') ? '\n\n' : '';
    const needsTrailingBreak = after && !after.startsWith('\n') ? '\n\n' : '';
    const nextValue = `${before}${needsLeadingBreak}${snippet}${needsTrailingBreak}${after}`;

    setContent(nextValue);

    window.requestAnimationFrame(() => {
      textarea.focus();
      const caretPosition = before.length + needsLeadingBreak.length + snippet.length;
      textarea.setSelectionRange(caretPosition, caretPosition);
    });
  }

  function applyBlockOrder(blocks: EditorBlock[]) {
    setContent(blocks.map((block) => block.raw.trim()).join('\n\n'));
    setMessage('Article flow updated.');
  }

  function moveBlock(fromIndex: number, toIndex: number) {
    const nextBlocks = reorderBlocks(contentBlocks, fromIndex, toIndex);
    if (nextBlocks === contentBlocks) return;
    applyBlockOrder(nextBlocks);
  }

  async function handleInlineImageUpload(file: File) {
    setUploadingInlineImage(true);
    const publicUrl = await uploadBlogImage(file, 'inline');

    if (publicUrl) {
      const fallbackAlt = title ? `${title} article image` : 'SharonCraft journal image';
      const suggestedAlt = window.prompt('Alt text for this image', fallbackAlt)?.trim() || fallbackAlt;
      const caption = window.prompt('Optional caption (leave blank to skip)', '')?.trim() || '';
      const figureMarkdown = caption
        ? `![${suggestedAlt}](${publicUrl})\n*${caption}*`
        : `![${suggestedAlt}](${publicUrl})`;

      insertAtCursor(figureMarkdown);
      setMessage('Inline image uploaded and inserted into the article.');
    }

    setUploadingInlineImage(false);
  }

  async function handleSave(forcePublish = false) {
    setSaving(true);
    setError('');
    setMessage('');

    const nextSlug = slug || slugify(title);

    if (!title.trim() || !nextSlug.trim() || !content.trim()) {
      setError('Title, slug, and content are required.');
      setSaving(false);
      return;
    }

    const nextPublished = forcePublish ? true : isPublished;
    const nextPublishedAt = nextPublished
      ? publishedAt
        ? new Date(publishedAt).toISOString()
        : new Date().toISOString()
      : null;

    const payload = {
      title: title.trim(),
      slug: nextSlug.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      cover_image_url: coverImageUrl.trim() || null,
      category,
      author: author.trim() || 'Sharon',
      read_time: readTime || estimateReadTime(content),
      is_published: nextPublished,
      published_at: nextPublishedAt,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      tags: parseTags(tagsValue),
      updated_at: new Date().toISOString(),
    };

    const query = postId
      ? supabase.from('blog_posts').update(payload).eq('id', postId).select('*').single()
      : supabase.from('blog_posts').insert(payload).select('*').single();

    const { data, error: saveError } = await query;

    if (saveError) {
      setError(saveError.message || 'Could not save the post.');
      setSaving(false);
      return;
    }

    setSlug(data.slug);
    setIsPublished(Boolean(data.is_published));
    setPublishedAt(formatDatetimeLocal(data.published_at));
    setMessage(nextPublished ? 'Post saved and published.' : 'Draft saved.');
    setSaving(false);
    void notifyIndexNowForBlogPost(data);

    if (!postId && data?.id) {
      router.replace(`/admin-v2/blog/${data.id}/edit`);
    }
  }

  function getBlockTypeLabel(type: EditorBlock['type']) {
    if (type === 'image') return 'Image';
    if (type === 'heading') return 'Heading';
    if (type === 'quote') return 'Quote';
    if (type === 'list') return 'List';
    return 'Text';
  }

  if (loading) {
    return (
      <div style={{ padding: '32px', color: '#666' }}>
        Loading post editor...
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', background: '#fafaf8', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 400, color: '#1c1c1c' }}>
            {postId ? 'Edit Post' : 'New Post'}
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#888' }}>
            Write, preview, and publish stories for the SharonCraft journal.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowPreview((current) => !current)}
            style={{
              height: '40px',
              padding: '0 18px',
              background: '#ffffff',
              color: '#1c1c1c',
              border: '0.5px solid rgba(0,0,0,0.12)',
              borderRadius: '2px',
              fontSize: '10px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={() => void handleSave(false)}
            disabled={saving}
            style={{
              height: '40px',
              padding: '0 18px',
              background: '#ffffff',
              color: '#1c1c1c',
              border: '0.5px solid rgba(0,0,0,0.12)',
              borderRadius: '2px',
              fontSize: '10px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => void handleSave(true)}
            disabled={saving}
            style={{
              height: '40px',
              padding: '0 18px',
              background: '#1c1c1c',
              color: '#ffffff',
              border: 'none',
              borderRadius: '2px',
              fontSize: '10px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : isPublished ? 'Save Changes' : 'Save + Publish'}
          </button>
        </div>
      </div>

      {error ? (
        <div style={{ marginBottom: '16px', padding: '12px 14px', background: 'rgba(192,57,43,0.08)', color: '#C0392B', fontSize: '12px' }}>
          {error}
        </div>
      ) : null}
      {message ? (
        <div style={{ marginBottom: '16px', padding: '12px 14px', background: 'rgba(46,125,50,0.08)', color: '#2E7D32', fontSize: '12px' }}>
          {message}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '16px', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: '16px' }}>
          <section style={{ background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '2px', padding: '20px' }}>
            <div style={{ display: 'grid', gap: '14px' }}>
              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>Title</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="The meaning of Maasai bead colors"
                  style={{ height: '42px', padding: '0 12px', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: '2px', background: '#fafaf8', fontSize: '13px', color: '#1c1c1c', outline: 'none' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>Slug</span>
                <input
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(slugify(event.target.value));
                  }}
                  placeholder="meaning-of-maasai-bead-colors"
                  style={{ height: '42px', padding: '0 12px', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: '2px', background: '#fafaf8', fontSize: '13px', color: '#1c1c1c', outline: 'none' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>Excerpt</span>
                <textarea
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  rows={4}
                  placeholder="A short summary for cards and search previews."
                  style={{ padding: '12px', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: '2px', background: '#fafaf8', fontSize: '13px', color: '#1c1c1c', outline: 'none', resize: 'vertical' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>Content</span>
                <textarea
                  ref={contentTextareaRef}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={18}
                  placeholder="Write in simple markdown. Use ## for h2, ### for h3, - for lists, > for quotes, and [text](url) for links."
                  style={{ padding: '12px', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: '2px', background: '#fafaf8', fontSize: '13px', color: '#1c1c1c', outline: 'none', resize: 'vertical', lineHeight: 1.7 }}
                />
              </label>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => inlineImageInputRef.current?.click()}
                  disabled={uploadingInlineImage}
                  style={{
                    height: '40px',
                    padding: '0 16px',
                    border: '0.5px solid rgba(0,0,0,0.15)',
                    background: '#ffffff',
                    color: '#1c1c1c',
                    borderRadius: '2px',
                    fontSize: '10px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    cursor: uploadingInlineImage ? 'not-allowed' : 'pointer',
                    opacity: uploadingInlineImage ? 0.6 : 1,
                  }}
                >
                  {uploadingInlineImage ? 'Uploading Image...' : 'Insert Article Image'}
                </button>
                <button
                  type="button"
                  onClick={() => insertAtCursor('![Alt text](https://example.com/image.jpg)\n*Optional caption*')}
                  style={{
                    height: '40px',
                    padding: '0 16px',
                    border: '0.5px solid rgba(0,0,0,0.15)',
                    background: '#ffffff',
                    color: '#1c1c1c',
                    borderRadius: '2px',
                    fontSize: '10px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Insert Image Block
                </button>
                <input
                  ref={inlineImageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleInlineImageUpload(file);
                    }
                    event.currentTarget.value = '';
                  }}
                />
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#888', lineHeight: 1.7 }}>
                Uploading an article image inserts markdown directly into the story body. Captions are optional.
              </p>
            </div>
          </section>

          {contentBlocks.length ? (
            <section style={{ background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '2px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>
                    Story Flow
                  </span>
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#666' }}>
                    Drag blocks to reorder them. Image sections are highlighted for quick arrangement.
                  </p>
                </div>
                <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#bbb' }}>
                  {contentBlocks.length} blocks
                </span>
              </div>

              <div style={{ display: 'grid', gap: '10px' }}>
                {contentBlocks.map((block, index) => {
                  const isDragging = draggingBlockIndex === index;
                  const isDropTarget = dropTargetIndex === index;

                  return (
                    <div
                      key={`${block.type}-${index}-${block.label}`}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', String(index));
                        setDraggingBlockIndex(index);
                        setDropTargetIndex(index);
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'move';
                        setDropTargetIndex(index);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        const fromIndex = Number(event.dataTransfer.getData('text/plain'));
                        moveBlock(fromIndex, index);
                        setDraggingBlockIndex(null);
                        setDropTargetIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggingBlockIndex(null);
                        setDropTargetIndex(null);
                      }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr auto',
                        gap: '12px',
                        alignItems: 'center',
                        padding: '12px 14px',
                        border: block.type === 'image'
                          ? '0.5px solid rgba(139,94,60,0.35)'
                          : '0.5px solid rgba(0,0,0,0.08)',
                        borderRadius: '2px',
                        background: isDragging
                          ? 'rgba(139,94,60,0.08)'
                          : isDropTarget
                            ? 'rgba(0,0,0,0.03)'
                            : '#fafaf8',
                        cursor: 'grab',
                      }}
                    >
                      <div style={{ display: 'grid', gap: '4px', justifyItems: 'center', minWidth: '32px' }}>
                        <span style={{ fontSize: '10px', color: '#bbb' }}>⋮⋮</span>
                        <span style={{ fontSize: '10px', color: '#bbb' }}>{index + 1}</span>
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '9px',
                              letterSpacing: '1.5px',
                              textTransform: 'uppercase',
                              color: block.type === 'image' ? '#8B5E3C' : '#888',
                              background: block.type === 'image' ? 'rgba(139,94,60,0.08)' : 'rgba(0,0,0,0.04)',
                              padding: '3px 8px',
                              borderRadius: '2px',
                            }}
                          >
                            {getBlockTypeLabel(block.type)}
                          </span>
                          <span style={{ fontSize: '12px', color: '#1c1c1c' }}>{block.label || 'Untitled block'}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '11px', lineHeight: 1.6, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {block.preview || 'No preview'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => moveBlock(index, Math.max(0, index - 1))}
                          disabled={index === 0}
                          style={{
                            height: '30px',
                            width: '30px',
                            border: '0.5px solid rgba(0,0,0,0.12)',
                            background: '#ffffff',
                            color: '#1c1c1c',
                            borderRadius: '2px',
                            cursor: index === 0 ? 'not-allowed' : 'pointer',
                            opacity: index === 0 ? 0.35 : 1,
                          }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlock(index, Math.min(contentBlocks.length - 1, index + 1))}
                          disabled={index === contentBlocks.length - 1}
                          style={{
                            height: '30px',
                            width: '30px',
                            border: '0.5px solid rgba(0,0,0,0.12)',
                            background: '#ffffff',
                            color: '#1c1c1c',
                            borderRadius: '2px',
                            cursor: index === contentBlocks.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: index === contentBlocks.length - 1 ? 0.35 : 1,
                          }}
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {showPreview ? (
            <section style={{ background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '2px', padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>Preview</span>
                <h2 style={{ margin: '10px 0 4px', fontSize: '28px', fontWeight: 300, color: '#1c1c1c' }}>{title || 'Untitled post'}</h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#bbb' }}>
                  By {author || 'Sharon'} · {readTime || estimateReadTime(content)} min read
                </p>
              </div>
              {coverImageUrl ? (
                <div style={{ position: 'relative', width: '100%', height: '220px', background: '#F5F0EB', marginBottom: '20px', overflow: 'hidden' }}>
                  <Image src={coverImageUrl} alt={title || 'Preview cover'} fill sizes="100vw" style={{ objectFit: 'cover' }} />
                </div>
              ) : null}
              <div
                className="blog-post-editor__preview"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
                style={{ fontSize: '15px', lineHeight: 1.9, color: '#444' }}
              />
            </section>
          ) : null}
        </div>

        <aside style={{ display: 'grid', gap: '16px' }}>
          <section style={{ background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '2px', padding: '20px' }}>
            <div style={{ display: 'grid', gap: '14px' }}>
              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>Category</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  style={{ height: '42px', padding: '0 12px', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: '2px', background: '#fafaf8', fontSize: '13px', color: '#1c1c1c', outline: 'none' }}
                >
                  {categories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>Author</span>
                <input
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  style={{ height: '42px', padding: '0 12px', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: '2px', background: '#fafaf8', fontSize: '13px', color: '#1c1c1c', outline: 'none' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>Read Time</span>
                <input
                  type="number"
                  min={1}
                  value={readTime}
                  onChange={(event) => setReadTime(Number(event.target.value) || 1)}
                  style={{ height: '42px', padding: '0 12px', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: '2px', background: '#fafaf8', fontSize: '13px', color: '#1c1c1c', outline: 'none' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>Cover Image URL</span>
                <input
                  value={coverImageUrl}
                  onChange={(event) => setCoverImageUrl(event.target.value)}
                  placeholder="https://..."
                  style={{ height: '42px', padding: '0 12px', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: '2px', background: '#fafaf8', fontSize: '13px', color: '#1c1c1c', outline: 'none' }}
                />
              </label>

              <div style={{ display: 'grid', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingCover}
                  style={{
                    height: '40px',
                    border: '0.5px solid rgba(0,0,0,0.15)',
                    background: '#ffffff',
                    color: '#1c1c1c',
                    borderRadius: '2px',
                    fontSize: '10px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    cursor: uploadingCover ? 'not-allowed' : 'pointer',
                    opacity: uploadingCover ? 0.6 : 1,
                  }}
                >
                  {uploadingCover ? 'Uploading...' : 'Upload Cover Image'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleCoverUpload(file);
                    }
                    event.currentTarget.value = '';
                  }}
                />
              </div>

              {coverImageUrl ? (
                <div style={{ position: 'relative', width: '100%', height: '180px', background: '#F5F0EB', overflow: 'hidden' }}>
                  <Image src={coverImageUrl} alt="Cover preview" fill sizes="320px" style={{ objectFit: 'cover' }} />
                </div>
              ) : null}

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#1c1c1c' }}>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(event) => setIsPublished(event.target.checked)}
                />
                Publish this post
              </label>

              {isPublished ? (
                <label style={{ display: 'grid', gap: '6px' }}>
                  <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>Publish Date</span>
                  <input
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(event) => setPublishedAt(event.target.value)}
                    style={{ height: '42px', padding: '0 12px', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: '2px', background: '#fafaf8', fontSize: '13px', color: '#1c1c1c', outline: 'none' }}
                  />
                </label>
              ) : null}
            </div>
          </section>

          <section style={{ background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '2px', padding: '20px' }}>
            <button
              type="button"
              onClick={() => setShowSeo((current) => !current)}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>SEO Fields</span>
              <span style={{ color: '#8B5E3C', fontSize: '12px' }}>{showSeo ? 'Hide' : 'Show'}</span>
            </button>

            {showSeo ? (
              <div style={{ display: 'grid', gap: '14px', marginTop: '16px' }}>
                <label style={{ display: 'grid', gap: '6px' }}>
                  <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>SEO Title</span>
                  <input
                    value={seoTitle}
                    onChange={(event) => setSeoTitle(event.target.value)}
                    style={{ height: '42px', padding: '0 12px', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: '2px', background: '#fafaf8', fontSize: '13px', color: '#1c1c1c', outline: 'none' }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px' }}>
                  <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>SEO Description</span>
                  <textarea
                    value={seoDescription}
                    onChange={(event) => setSeoDescription(event.target.value)}
                    rows={4}
                    style={{ padding: '12px', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: '2px', background: '#fafaf8', fontSize: '13px', color: '#1c1c1c', outline: 'none', resize: 'vertical' }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px' }}>
                  <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>Tags</span>
                  <input
                    value={tagsValue}
                    onChange={(event) => setTagsValue(event.target.value)}
                    placeholder="Maasai beadwork, Kenyan culture, gifting"
                    style={{ height: '42px', padding: '0 12px', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: '2px', background: '#fafaf8', fontSize: '13px', color: '#1c1c1c', outline: 'none' }}
                  />
                </label>
              </div>
            ) : null}
          </section>
        </aside>
      </div>

      <style jsx global>{`
        .blog-post-editor__preview figure {
          margin: 24px 0;
        }

        .blog-post-editor__preview img {
          display: block;
          width: 100%;
          height: auto;
          background: #f5f0eb;
        }

        .blog-post-editor__preview figcaption {
          margin-top: 10px;
          font-size: 12px;
          line-height: 1.6;
          color: #888;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
