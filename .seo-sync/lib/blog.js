import { buildArticleSchema } from "./seo";
import { supabase, supabaseAdmin } from "./supabase-server";

export const BLOG_CATEGORIES = [
  "Education",
  "Styling",
  "Behind the Scenes",
  "Care Guide",
  "Gift Guide",
];

const FALLBACK_POSTS = [
  {
    id: "fallback-maasai-bead-colors",
    title: "The meaning of Maasai bead colors",
    slug: "meaning-of-maasai-bead-colors",
    excerpt:
      "Every color in Maasai beadwork carries a meaning. Learn what your jewelry is really saying and why those color choices matter.",
    content: [
      "## Every color carries a story",
      "Maasai beadwork is more than ornament. In many communities, color is used to express **identity, stage of life, blessing, strength, and connection**. When you wear a beaded piece, you are also wearing a visual language.",
      "## What the colors often symbolize",
      "- **Red** speaks to bravery, unity, and the vitality of community life.",
      "- **White** is often linked to purity, health, and peace.",
      "- **Blue** reflects the sky and the blessing of rain and provision.",
      "- **Green** can suggest land, growth, and nourishment.",
      "- **Orange and yellow** often carry warmth, welcome, and hospitality.",
      "## Why this matters when you shop",
      "Knowing the color language helps you choose a piece with more intention. A gift feels more personal. A styling choice feels more rooted. And the craft itself becomes easier to appreciate beyond surface beauty.",
      "> Handmade jewelry becomes more meaningful when you understand the story held inside the pattern.",
      "## Bringing culture into everyday wear",
      "At SharonCraft, we love pieces that balance tradition and modern styling. That means you can wear beadwork with denim, tailored neutrals, occasion outfits, or layered gift sets without losing the original spirit of the craft.",
      "## Final thought",
      "When you choose beadwork thoughtfully, color stops being decoration alone. It becomes memory, message, and presence all at once.",
    ].join("\n\n"),
    cover_image_url: "/media/products/Gemini_Generated_Image_p3e0hup3e0hup3e0.jpg",
    category: "Education",
    author: "Sharon",
    read_time: 4,
    is_published: true,
    published_at: new Date("2026-05-19T09:00:00.000Z").toISOString(),
    created_at: new Date("2026-05-19T09:00:00.000Z").toISOString(),
    updated_at: new Date("2026-05-19T09:00:00.000Z").toISOString(),
    seo_title: "Maasai Bead Colors Meaning | SharonCraft Kenya",
    seo_description:
      "Discover the meaning behind Maasai bead colors. Red, white, blue and more each tell a story in Kenyan culture.",
    tags: ["Maasai beadwork", "Kenyan culture", "Education"],
  },
];

const AUTHOR_BIOS = {
  Sharon:
    "Sharon curates SharonCraft with a love for Kenyan craft, meaningful gifting, and the stories that live inside handmade pieces.",
};

function getBlogClient() {
  return supabaseAdmin || supabase || null;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripMarkdown(value = "") {
  return String(value)
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[*_`>#-]/g, "")
    .replace(/\d+\.\s+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function renderInlineMarkdown(value = "") {
  let html = escapeHtml(value);

  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g,
    (_, label, href) => `<a href="${href}"${href.startsWith("http") ? ' target="_blank" rel="noreferrer"' : ""}>${label}</a>`,
  );
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  return html;
}

function renderImageFigure(markdown = "") {
  const lines = String(markdown)
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return null;

  const imageMatch = lines[0].match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)$/i);
  if (!imageMatch) return null;

  const [, altText = "", src = ""] = imageMatch;
  const captionSource = lines[1] || "";
  const captionMatch = captionSource.match(/^(?:\*|_)(.*?)(?:\*|_)$/);
  const caption = captionMatch ? renderInlineMarkdown(captionMatch[1].trim()) : "";

  return `<figure><img src="${escapeAttribute(src)}" alt="${escapeAttribute(altText)}" loading="lazy" />${
    caption ? `<figcaption>${caption}</figcaption>` : ""
  }</figure>`;
}

export function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function estimateReadTime(content = "") {
  const words = stripMarkdown(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

export function formatBlogDate(value) {
  if (!value) return "Recently";

  try {
    return new Date(value).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Recently";
  }
}

export function getBlogAuthorBio(author = "Sharon") {
  return AUTHOR_BIOS[author] || AUTHOR_BIOS.Sharon;
}

export function normalizeBlogPost(post, index = 0) {
  const publishedAt =
    post?.published_at || post?.created_at || new Date().toISOString();
  const content = String(post?.content || "");
  const title = String(post?.title || "Untitled story");

  return {
    id: post?.id || `blog-fallback-${index + 1}`,
    title,
    slug: post?.slug || slugify(title) || `story-${index + 1}`,
    excerpt: post?.excerpt || stripMarkdown(content).slice(0, 180),
    content,
    cover_image_url: post?.cover_image_url || "",
    category: post?.category || "General",
    author: post?.author || "Sharon",
    read_time: Number(post?.read_time) || estimateReadTime(content),
    is_published: typeof post?.is_published === "boolean" ? post.is_published : true,
    published_at: publishedAt,
    created_at: post?.created_at || publishedAt,
    updated_at: post?.updated_at || publishedAt,
    seo_title: post?.seo_title || "",
    seo_description: post?.seo_description || "",
    tags: Array.isArray(post?.tags) ? post.tags.filter(Boolean) : [],
  };
}

export function getFallbackBlogPosts() {
  return FALLBACK_POSTS.map((post, index) => normalizeBlogPost(post, index));
}

export async function fetchPublishedBlogPosts() {
  const client = getBlogClient();
  const fallback = getFallbackBlogPosts();

  if (!client) {
    return fallback;
  }

  try {
    const { data, error } = await client
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (error) {
      return fallback;
    }

    const normalized = (data || []).map(normalizeBlogPost).filter((post) => post.is_published);
    return normalized.length ? normalized : fallback;
  } catch {
    return fallback;
  }
}

export async function fetchBlogPostBySlug(slug) {
  const normalizedSlug = String(slug || "").trim();
  const fallback = getFallbackBlogPosts();
  const fallbackMatch = fallback.find((post) => post.slug === normalizedSlug);
  const client = getBlogClient();

  if (!client) {
    return fallbackMatch || null;
  }

  try {
    const { data, error } = await client
      .from("blog_posts")
      .select("*")
      .eq("slug", normalizedSlug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      return fallbackMatch || null;
    }

    if (!data) {
      return fallbackMatch || null;
    }

    return normalizeBlogPost(data);
  } catch {
    return fallbackMatch || null;
  }
}

export function getRelatedBlogPosts(posts, currentSlug, category, limit = 3) {
  return posts
    .filter((post) => post.slug !== currentSlug)
    .sort((left, right) => {
      const leftWeight = left.category === category ? 0 : 1;
      const rightWeight = right.category === category ? 0 : 1;

      if (leftWeight !== rightWeight) {
        return leftWeight - rightWeight;
      }

      return new Date(right.published_at).getTime() - new Date(left.published_at).getTime();
    })
    .slice(0, limit);
}

export function splitBlogContentBlocks(content = "") {
  return String(content)
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export function renderMarkdownToHtml(markdown = "") {
  const figureHtml = renderImageFigure(markdown);
  if (figureHtml) {
    return figureHtml;
  }

  const lines = String(markdown).replace(/\r\n/g, "\n").split("\n");
  const html = [];
  const paragraphLines = [];
  const listItems = [];
  let listType = null;

  function flushParagraph() {
    if (!paragraphLines.length) return;
    html.push(`<p>${renderInlineMarkdown(paragraphLines.join(" "))}</p>`);
    paragraphLines.length = 0;
  }

  function flushList() {
    if (!listType || !listItems.length) return;
    html.push(`<${listType}>${listItems.map((item) => `<li>${item}</li>`).join("")}</${listType}>`);
    listItems.length = 0;
    listType = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line === "---") {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      html.push(`<h2>${renderInlineMarkdown(line.replace(/^##\s+/, ""))}</h2>`);
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      html.push(`<h3>${renderInlineMarkdown(line.replace(/^###\s+/, ""))}</h3>`);
      continue;
    }

    if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      html.push(`<blockquote>${renderInlineMarkdown(line.replace(/^>\s+/, ""))}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      if (listType && listType !== "ul") {
        flushList();
      }
      listType = "ul";
      listItems.push(renderInlineMarkdown(line.replace(/^[-*]\s+/, "")));
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      if (listType && listType !== "ol") {
        flushList();
      }
      listType = "ol";
      listItems.push(renderInlineMarkdown(line.replace(/^\d+\.\s+/, "")));
      continue;
    }

    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return html.join("");
}

function escapeAttribute(value = "") {
  return String(value).replace(/"/g, "&quot;");
}

export function sanitizeBlogHtml(html = "") {
  const allowedTags = new Set([
    "p",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "blockquote",
    "strong",
    "em",
    "a",
    "figure",
    "img",
    "figcaption",
  ]);

  let output = String(html)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\son\w+=(["']).*?\1/gi, "")
    .replace(/\s(?:href|src)=(["'])\s*javascript:[^"']*\1/gi, "");

  output = output.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (match, rawTagName, rawAttributes) => {
    const tagName = String(rawTagName || "").toLowerCase();
    const isClosing = match.startsWith("</");

    if (!allowedTags.has(tagName)) {
      return "";
    }

    if (isClosing) {
      return `</${tagName}>`;
    }

    if (tagName === "a") {
      const hrefMatch = String(rawAttributes || "").match(/\shref=(["'])(.*?)\1/i);
      const href = hrefMatch?.[2] || "#";
      const isSafeHref = /^(https?:\/\/|\/)/i.test(href);
      const nextHref = isSafeHref ? href : "#";
      const externalAttrs = /^https?:\/\//i.test(nextHref) ? ' target="_blank" rel="noreferrer"' : "";
      return `<a href="${escapeAttribute(nextHref)}"${externalAttrs}>`;
    }

    if (tagName === "img") {
      const srcMatch = String(rawAttributes || "").match(/\ssrc=(["'])(.*?)\1/i);
      const altMatch = String(rawAttributes || "").match(/\salt=(["'])(.*?)\1/i);
      const src = srcMatch?.[2] || "";
      const alt = altMatch?.[2] || "";

      if (!/^(https?:\/\/|\/)/i.test(src)) {
        return "";
      }

      return `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}" loading="lazy" />`;
    }

    return `<${tagName}>`;
  });

  return output;
}

export async function renderBlogBlocks(markdown = "") {
  const blocks = splitBlogContentBlocks(markdown);
  return Promise.all(blocks.map(async (block) => sanitizeBlogHtml(renderMarkdownToHtml(block))));
}

export function buildBlogPostingJsonLd(post) {
  return buildArticleSchema(post);
}
