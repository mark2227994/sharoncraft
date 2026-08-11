import BlogPostEditor from '@/components/admin-v2/BlogPostEditor';

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlogPostEditor postId={id} />;
}
