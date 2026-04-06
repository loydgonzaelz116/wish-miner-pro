CREATE TABLE public.search_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  search_date date NOT NULL DEFAULT CURRENT_DATE,
  search_count integer NOT NULL DEFAULT 0,
  UNIQUE(user_id, search_date)
);

ALTER TABLE public.search_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
ON public.search_usage FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage"
ON public.search_usage FOR ALL
TO service_role
USING (true)
WITH CHECK (true);