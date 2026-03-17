
-- Featured course metadata (single row or multiple courses)
CREATE TABLE public.featured_course (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Guarda Completa',
  subtitle text DEFAULT 'Do zero ao avançado em guarda fechada',
  description text,
  badge_text text DEFAULT 'Novo Curso',
  image_url text,
  students_count text DEFAULT '230+',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.featured_course ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read featured course" ON public.featured_course FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage featured course" ON public.featured_course FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Course modules
CREATE TABLE public.course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.featured_course(id) ON DELETE CASCADE,
  title text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read course modules" ON public.course_modules FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage course modules" ON public.course_modules FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Course lessons
CREATE TABLE public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  duration text DEFAULT '0:00',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read course lessons" ON public.course_lessons FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage course lessons" ON public.course_lessons FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
