ALTER TABLE public.profiles ADD COLUMN plan_tier text NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN plan_expires_at timestamp with time zone;