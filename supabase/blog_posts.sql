CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  cover_image_url text,
  category text DEFAULT 'general',
  author text DEFAULT 'Sharon',
  read_time integer DEFAULT 5,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  seo_title text,
  seo_description text,
  tags text[]
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published blog posts" ON blog_posts;
CREATE POLICY "Public read published blog posts"
ON blog_posts
FOR SELECT
USING (is_published = true);

DROP POLICY IF EXISTS "Authenticated admins manage blog posts" ON blog_posts;
CREATE POLICY "Authenticated admins manage blog posts"
ON blog_posts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  category,
  author,
  read_time,
  is_published,
  published_at,
  seo_title,
  seo_description,
  tags
) VALUES (
  'The meaning of Maasai bead colors',
  'meaning-of-maasai-bead-colors',
  'Every color in Maasai beadwork has a meaning. Learn what your jewelry is really saying.',
  '## Every color carries a story

Maasai beadwork is more than ornament. In many communities, color is used to express **identity, stage of life, blessing, strength, and connection**.

## What the colors often symbolize

- **Red** speaks to bravery, unity, and vitality.
- **White** is linked to purity, health, and peace.
- **Blue** reflects the sky, rain, and provision.
- **Green** speaks to land, growth, and nourishment.
- **Orange and yellow** often carry warmth and hospitality.

## Why this matters when you shop

Knowing the color language helps you choose a piece with more intention. A gift feels more personal, and the craft itself becomes easier to appreciate beyond surface beauty.',
  'Education',
  'Sharon',
  4,
  true,
  now(),
  'Maasai Bead Colors Meaning',
  'Discover the meaning behind Maasai bead colors. Red, white, blue and more each tell a story in Kenyan culture.',
  ARRAY['Maasai beadwork', 'Kenyan culture', 'Education']
)
ON CONFLICT (slug) DO NOTHING;
