-- ============================================================
-- AI COURSE PLATFORM - COMPLETE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE (extends Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  phone       TEXT,
  role        TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin', 'instructor')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COURSES TABLE (multi-course support)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  price_kes   INTEGER NOT NULL DEFAULT 2500,
  thumbnail   TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the main course
INSERT INTO public.courses (title, slug, description, price_kes) VALUES
('AI for Beginners: Practical Skills for Students, Freelancers & Professionals',
 'ai-for-beginners',
 'Master AI tools to earn more, work smarter, and build a profitable digital career — starting today.',
 2500)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- MODULES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.modules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id   UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed course modules
WITH course AS (SELECT id FROM public.courses WHERE slug = 'ai-for-beginners')
INSERT INTO public.modules (course_id, title, description, order_index) 
SELECT course.id, m.title, m.description, m.order_index FROM course,
(VALUES
  (1, 'Introduction to AI & Digital Economy',
   'Understand AI fundamentals, types of AI, real-world use cases, and how it''s reshaping the economy and job market.'),
  (2, 'Mastering ChatGPT',
   'Deep dive into prompt engineering, role-based prompting, advanced techniques, and building your personal AI assistant system.'),
  (3, 'AI for Content Creation',
   'Use AI to write compelling content, manage social media, start a blog, and target the right audience with the right tone.'),
  (4, 'AI for Freelancing & Income',
   'Build a profitable freelance career using AI. Learn Fiverr and Upwork strategies and discover high-demand AI service ideas.'),
  (5, 'AI for Business',
   'Generate business ideas, conduct AI-powered market research, build a brand, and validate your concept before investing.'),
  (6, 'AI Automation',
   'Automate repetitive tasks using Zapier and Make. Build efficient workflows that save hours of manual work every week.'),
  (7, 'Building AI Tools',
   'Understand APIs, design AI-powered applications, and think like a systems architect to create sellable AI tools.'),
  (8, 'Monetization & Career Paths',
   'Turn your AI skills into income streams. Build a professional portfolio, explore career paths, and create your 30-day income plan.')
) AS m(order_index, title, description)
ON CONFLICT DO NOTHING;

-- ============================================================
-- LESSONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id    UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT,
  video_url    TEXT,
  duration_min INTEGER DEFAULT 0,
  order_index  INTEGER NOT NULL,
  lesson_type  TEXT DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'quiz', 'assignment')),
  is_preview   BOOLEAN DEFAULT false,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Module 1 lessons
WITH mod AS (SELECT m.id FROM public.modules m JOIN public.courses c ON m.course_id = c.id WHERE c.slug = 'ai-for-beginners' AND m.order_index = 1)
INSERT INTO public.lessons (module_id, title, content, duration_min, order_index, lesson_type, is_preview)
SELECT mod.id, l.title, l.content, l.duration_min, l.order_index, l.lesson_type, l.is_preview FROM mod,
(VALUES
  (1, 'Welcome & What to Expect', 'Course overview, learning outcomes, and how to get the most from this program.', 5, 'text', true),
  (2, 'What is Artificial Intelligence?', 'History of AI, core concepts, narrow vs general AI, and machine learning basics.', 20, 'video', true),
  (3, 'Types of AI & Real-World Use Cases', 'Classification of AI systems and practical examples in healthcare, finance, education, and business.', 25, 'video', false),
  (4, 'AI''s Impact on Jobs & Opportunities', 'Which jobs AI replaces, which it augments, and how to position yourself for success.', 30, 'video', false),
  (5, 'AI Tools Landscape Overview', 'Survey of 50+ AI tools across writing, design, coding, video, audio, and automation categories.', 20, 'text', false),
  (6, 'Practical: AI Tools Identification + Personal Reflection', 'Assignment: Map 5 AI tools to your current work/study + write your personal AI opportunity statement.', 0, 'assignment', false)
) AS l(order_index, title, content, duration_min, lesson_type, is_preview)
ON CONFLICT DO NOTHING;

-- Seed Module 2 lessons
WITH mod AS (SELECT m.id FROM public.modules m JOIN public.courses c ON m.course_id = c.id WHERE c.slug = 'ai-for-beginners' AND m.order_index = 2)
INSERT INTO public.lessons (module_id, title, content, duration_min, order_index, lesson_type, is_preview)
SELECT mod.id, l.title, l.content, l.duration_min, l.order_index, l.lesson_type, l.is_preview FROM mod,
(VALUES
  (1, 'Introduction to ChatGPT', 'Setup, interface, models (GPT-4o, o1), and understanding tokens and context.', 15, 'video', false),
  (2, 'The Art of Prompt Engineering', 'The CRISPE framework: Context, Role, Instructions, Scope, Purpose, Examples.', 35, 'video', false),
  (3, 'Role-Based Prompting Mastery', 'How to assign expert personas to get specialist-level outputs from ChatGPT.', 30, 'video', false),
  (4, 'Advanced Prompting Techniques', 'Chain-of-thought, few-shot examples, output formatting, and iterative refinement.', 40, 'video', false),
  (5, 'Common Mistakes & How to Fix Them', 'Diagnosing weak prompts and a systematic troubleshooting process.', 20, 'text', false),
  (6, 'Custom GPTs & System Instructions', 'Build reusable AI assistants with custom system prompts and knowledge bases.', 30, 'video', false),
  (7, 'Practical: Build Your Personal AI Assistant', 'Assignment: Design and configure a custom GPT for your specific niche or workflow.', 0, 'assignment', false)
) AS l(order_index, title, content, duration_min, lesson_type, is_preview)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ASSIGNMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assignments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id    UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  lesson_id    UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  instructions TEXT,
  rubric       JSONB,
  due_days     INTEGER DEFAULT 7,
  is_required  BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ASSIGNMENT SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.submissions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id  UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content        TEXT,
  file_url       TEXT,
  status         TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved')),
  feedback       TEXT,
  score          INTEGER,
  submitted_at   TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at    TIMESTAMPTZ
);

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES public.users(id) ON DELETE SET NULL,
  course_id        UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  amount           INTEGER NOT NULL,
  currency         TEXT DEFAULT 'KES',
  phone            TEXT NOT NULL,
  checkout_request_id TEXT UNIQUE,
  merchant_request_id TEXT,
  transaction_id   TEXT UNIQUE,
  mpesa_receipt    TEXT,
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  failure_reason   TEXT,
  metadata         JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ENROLLMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE,
  course_id       UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  payment_id      UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  payment_status  TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  course_access   BOOLEAN DEFAULT false,
  enrolled_at     TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  certificate_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ============================================================
-- PROGRESS TRACKING
-- ============================================================
CREATE TABLE IF NOT EXISTS public.progress (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id    UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed    BOOLEAN DEFAULT false,
  watch_time   INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ============================================================
-- CAPSTONE PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.capstone_projects (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES public.users(id) ON DELETE CASCADE,
  course_id         UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  portfolio_url     TEXT,
  freelance_service TEXT,
  business_idea     TEXT,
  content_samples   TEXT,
  automation_flow   TEXT,
  status            TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  feedback          TEXT,
  certificate_issued BOOLEAN DEFAULT false,
  submitted_at      TIMESTAMPTZ,
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EMAIL LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  type       TEXT NOT NULL,
  recipient  TEXT NOT NULL,
  subject    TEXT,
  status     TEXT DEFAULT 'sent',
  provider_id TEXT,
  sent_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capstone_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Users: read/update own profile
CREATE POLICY "users_own" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Modules: public read for active modules
CREATE POLICY "modules_read" ON public.modules
  FOR SELECT USING (is_active = true);

-- Lessons: enrolled users or preview lessons
CREATE POLICY "lessons_read" ON public.lessons
  FOR SELECT USING (
    is_preview = true OR
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.modules m ON m.id = module_id
      WHERE e.user_id = auth.uid()
        AND e.course_id = m.course_id
        AND e.course_access = true
    )
  );

-- Enrollments: own records
CREATE POLICY "enrollments_own" ON public.enrollments
  FOR ALL USING (user_id = auth.uid());

-- Payments: own records
CREATE POLICY "payments_own" ON public.payments
  FOR ALL USING (user_id = auth.uid());

-- Progress: own records
CREATE POLICY "progress_own" ON public.progress
  FOR ALL USING (user_id = auth.uid());

-- Submissions: own records
CREATE POLICY "submissions_own" ON public.submissions
  FOR ALL USING (user_id = auth.uid());

-- Capstone: own records
CREATE POLICY "capstone_own" ON public.capstone_projects
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to get user progress percentage
CREATE OR REPLACE FUNCTION get_course_progress(p_user_id UUID, p_course_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_lessons
  FROM public.lessons l
  JOIN public.modules m ON l.module_id = m.id
  WHERE m.course_id = p_course_id AND l.is_active = true AND l.lesson_type != 'assignment';

  SELECT COUNT(*) INTO completed_lessons
  FROM public.progress pr
  JOIN public.lessons l ON pr.lesson_id = l.id
  JOIN public.modules m ON l.module_id = m.id
  WHERE pr.user_id = p_user_id
    AND m.course_id = p_course_id
    AND pr.completed = true;

  IF total_lessons = 0 THEN RETURN 0; END IF;
  RETURN ROUND((completed_lessons::FLOAT / total_lessons) * 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_checkout ON public.payments(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_modules_course ON public.modules(course_id);
