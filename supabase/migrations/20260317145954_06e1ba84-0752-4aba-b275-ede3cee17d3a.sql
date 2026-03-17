-- Training banners (the cards shown on /treinos)
CREATE TABLE public.training_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  badge_text text,
  badge_color text DEFAULT 'primary',
  meta_icon text DEFAULT 'clock',
  meta_text text,
  cta_text text DEFAULT 'Saiba mais',
  link text NOT NULL DEFAULT '/treinos',
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Protocol days (21-day protocol content)
CREATE TABLE public.protocol_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number int NOT NULL,
  week_number int NOT NULL,
  week_title text,
  focus text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_days ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can read visible banners" ON public.training_banners FOR SELECT USING (visible = true);
CREATE POLICY "Anyone can read protocol days" ON public.protocol_days FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admins can manage banners" ON public.training_banners FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage protocol days" ON public.protocol_days FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
