-- ============================================================
-- PUBLIC REVIEWS / RATINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  role             TEXT,
  rating           INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment          TEXT NOT NULL,
  avatar_initials  TEXT NOT NULL,
  status           TEXT DEFAULT 'published' CHECK (status IN ('published', 'pending', 'hidden')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_public_read" ON public.reviews
  FOR SELECT
  USING (status = 'published');

CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews (created_at DESC);