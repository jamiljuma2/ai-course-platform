-- Restrict module and lesson visibility to enrolled users only

DROP POLICY IF EXISTS "modules_read" ON public.modules;
CREATE POLICY "modules_read" ON public.modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.enrollments e
      WHERE e.user_id = auth.uid()
        AND e.course_id = public.modules.course_id
        AND e.course_access = true
    )
  );

DROP POLICY IF EXISTS "lessons_read" ON public.lessons;
CREATE POLICY "lessons_read" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.enrollments e
      JOIN public.modules m ON m.id = public.lessons.module_id
      WHERE e.user_id = auth.uid()
        AND e.course_id = m.course_id
        AND e.course_access = true
    )
  );
