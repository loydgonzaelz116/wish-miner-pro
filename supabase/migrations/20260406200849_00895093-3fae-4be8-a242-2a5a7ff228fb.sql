CREATE TABLE public.x_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash text NOT NULL,
  post_text text NOT NULL,
  author text,
  like_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  quote_count integer DEFAULT 0,
  post_timestamp timestamptz,
  raw_data jsonb,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_x_posts_query_hash ON public.x_posts (query_hash);
CREATE INDEX idx_x_posts_fetched_at ON public.x_posts (fetched_at);

ALTER TABLE public.x_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached posts"
ON public.x_posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can insert cached posts"
ON public.x_posts FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can delete cached posts"
ON public.x_posts FOR DELETE
TO service_role
USING (true);