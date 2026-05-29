-- ============================================================
-- ADD WEB DEVELOPMENT COURSE
-- Seed a second course so students can choose between tracks.
-- ============================================================

INSERT INTO public.courses (title, slug, description, price_kes)
VALUES (
  'Web Development: Build and Launch Modern Websites',
  'web-development',
  'Learn HTML, CSS, JavaScript, responsive design, and deployment by building real websites from day one.',
  4500
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- WEB DEVELOPMENT MODULES
-- ============================================================

WITH course AS (
  SELECT id FROM public.courses WHERE slug = 'web-development'
)
INSERT INTO public.modules (course_id, title, description, order_index)
SELECT course.id, m.title, m.description, m.order_index
FROM course,
(VALUES
  (1, 'Web Development Foundations', 'Understand how the web works, set up your environment, and create your first project structure.'),
  (2, 'HTML & CSS Mastery', 'Build semantic pages, style layouts, and create responsive designs that look professional.'),
  (3, 'JavaScript & Interactivity', 'Add interactivity, logic, and dynamic user experiences with modern JavaScript.'),
  (4, 'Deploy, Polish, and Launch', 'Optimize, test, and publish a live website that you can share with employers or clients.')
) AS m(order_index, title, description)
ON CONFLICT DO NOTHING;

-- ============================================================
-- MODULE 1 LESSONS
-- ============================================================

WITH mod AS (
  SELECT m.id FROM public.modules m
  JOIN public.courses c ON m.course_id = c.id
  WHERE c.slug = 'web-development' AND m.order_index = 1
)
INSERT INTO public.lessons (module_id, title, content, duration_min, order_index, lesson_type, is_preview)
SELECT mod.id, l.title, l.content, l.duration_min, l.order_index, l.lesson_type, l.is_preview
FROM mod,
(VALUES
  (1, 'Welcome to Web Development', 'Course overview, tools you need, and the projects you will build.', 8, 'text', true),
  (2, 'How the Web Works', 'Browsers, servers, URLs, HTTP, and the structure of a modern web app.', 20, 'video', true),
  (3, 'Practical: Set Up Your Workspace', 'Assignment: install your tools, create a project folder, and publish your first hello page.', 0, 'assignment', false)
) AS l(order_index, title, content, duration_min, lesson_type, is_preview)
ON CONFLICT DO NOTHING;

-- ============================================================
-- MODULE 2 LESSONS
-- ============================================================

WITH mod AS (
  SELECT m.id FROM public.modules m
  JOIN public.courses c ON m.course_id = c.id
  WHERE c.slug = 'web-development' AND m.order_index = 2
)
INSERT INTO public.lessons (module_id, title, content, duration_min, order_index, lesson_type, is_preview)
SELECT mod.id, l.title, l.content, l.duration_min, l.order_index, l.lesson_type, l.is_preview
FROM mod,
(VALUES
  (1, 'HTML Structure and Semantics', 'Use headings, sections, forms, and reusable patterns to build accessible pages.', 25, 'video', false),
  (2, 'CSS Styling and Layout', 'Learn the box model, flexbox, grid, spacing, and responsive design basics.', 30, 'video', false),
  (3, 'Practical: Build a Landing Page', 'Assignment: create a responsive landing page for a small business or personal brand.', 0, 'assignment', false)
) AS l(order_index, title, content, duration_min, lesson_type, is_preview)
ON CONFLICT DO NOTHING;

-- ============================================================
-- MODULE 3 LESSONS
-- ============================================================

WITH mod AS (
  SELECT m.id FROM public.modules m
  JOIN public.courses c ON m.course_id = c.id
  WHERE c.slug = 'web-development' AND m.order_index = 3
)
INSERT INTO public.lessons (module_id, title, content, duration_min, order_index, lesson_type, is_preview)
SELECT mod.id, l.title, l.content, l.duration_min, l.order_index, l.lesson_type, l.is_preview
FROM mod,
(VALUES
  (1, 'JavaScript Basics', 'Variables, functions, arrays, objects, and the foundations of programming for the web.', 30, 'video', false),
  (2, 'DOM Manipulation and Events', 'Make pages interactive by responding to clicks, inputs, and user behavior.', 35, 'video', false),
  (3, 'Practical: Add Interactivity', 'Assignment: add a navigation menu, form validation, or calculator to your project.', 0, 'assignment', false)
) AS l(order_index, title, content, duration_min, lesson_type, is_preview)
ON CONFLICT DO NOTHING;

-- ============================================================
-- MODULE 4 LESSONS
-- ============================================================

WITH mod AS (
  SELECT m.id FROM public.modules m
  JOIN public.courses c ON m.course_id = c.id
  WHERE c.slug = 'web-development' AND m.order_index = 4
)
INSERT INTO public.lessons (module_id, title, content, duration_min, order_index, lesson_type, is_preview)
SELECT mod.id, l.title, l.content, l.duration_min, l.order_index, l.lesson_type, l.is_preview
FROM mod,
(VALUES
  (1, 'Git, GitHub, and Deployment', 'Version your work, publish it online, and keep your projects organized.', 25, 'video', false),
  (2, 'Performance and Accessibility', 'Improve page speed, readability, and usability across devices.', 20, 'video', false),
  (3, 'Practical: Launch Your Portfolio', 'Capstone assignment: publish a portfolio website with your best work and contact details.', 0, 'assignment', false)
) AS l(order_index, title, content, duration_min, lesson_type, is_preview)
ON CONFLICT DO NOTHING;