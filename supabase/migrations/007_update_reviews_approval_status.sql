-- ============================================================
-- REVIEWS APPROVAL STATUS UPDATE
-- ============================================================

UPDATE public.reviews
SET status = 'approved'
WHERE status = 'published';

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_status_check;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_status_check
  CHECK (status IN ('approved', 'pending', 'hidden'));

ALTER TABLE public.reviews
  ALTER COLUMN status SET DEFAULT 'pending';

DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews;

CREATE POLICY "reviews_public_read" ON public.reviews
  FOR SELECT
  USING (status = 'approved');