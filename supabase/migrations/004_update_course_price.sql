-- Update the course price for existing databases
UPDATE public.courses
SET price_kes = 3000
WHERE slug = 'ai-for-beginners';

ALTER TABLE public.courses
  ALTER COLUMN price_kes SET DEFAULT 3000;
