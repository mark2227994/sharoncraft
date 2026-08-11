import { fetchPublishedBlogPosts } from "../../lib/blog";

export default async function handler(req, res) {
  const limitValue = Number(req.query.limit || 0);
  const category = typeof req.query.category === "string" ? req.query.category : "";

  const posts = await fetchPublishedBlogPosts();
  const filtered = category
    ? posts.filter((post) => String(post.category).toLowerCase() === category.toLowerCase())
    : posts;

  res.status(200).json(limitValue > 0 ? filtered.slice(0, limitValue) : filtered);
}
