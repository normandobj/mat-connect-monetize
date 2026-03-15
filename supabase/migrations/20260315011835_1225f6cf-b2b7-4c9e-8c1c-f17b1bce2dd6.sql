
-- User roles enum
CREATE TYPE public.app_role AS ENUM ('athlete', 'subscriber');

-- User roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Athlete profiles table
CREATE TABLE public.athlete_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username text NOT NULL UNIQUE,
  name text NOT NULL,
  belt text NOT NULL DEFAULT 'white',
  academy text,
  city text,
  country text,
  country_flag text DEFAULT '🇧🇷',
  bio_pt text,
  bio_en text,
  photo_url text,
  cover_photo_url text,
  monthly_price integer NOT NULL DEFAULT 29,
  quarterly_price integer NOT NULL DEFAULT 79,
  annual_price integer NOT NULL DEFAULT 279,
  pix_key text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.athlete_profiles ENABLE ROW LEVEL SECURITY;

-- Content table
CREATE TABLE public.content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES public.athlete_profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL DEFAULT 'drill',
  title_pt text NOT NULL,
  title_en text,
  description_pt text,
  description_en text,
  plan_text_pt text,
  plan_text_en text,
  thumbnail_url text,
  video_url text,
  duration text,
  visibility text NOT NULL DEFAULT 'subscribers',
  live_date timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  athlete_id uuid REFERENCES public.athlete_profiles(id) ON DELETE CASCADE NOT NULL,
  plan text NOT NULL DEFAULT 'monthly',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  UNIQUE (subscriber_id, athlete_id)
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.user_roles
  WHERE user_id = _user_id LIMIT 1
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- user_roles
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own role" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- profiles
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- athlete_profiles
CREATE POLICY "Anyone can read athlete profiles" ON public.athlete_profiles
  FOR SELECT USING (true);

CREATE POLICY "Athletes can insert own profile" ON public.athlete_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Athletes can update own profile" ON public.athlete_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- content
CREATE POLICY "Anyone can read free content" ON public.content
  FOR SELECT USING (visibility = 'free');

CREATE POLICY "Subscribers can read subscribed content" ON public.content
  FOR SELECT TO authenticated
  USING (
    visibility = 'subscribers' AND EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE subscriber_id = auth.uid()
        AND athlete_id = content.athlete_id
        AND status = 'active'
    )
  );

CREATE POLICY "Athletes can read own content" ON public.content
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.athlete_profiles
      WHERE id = content.athlete_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Athletes can insert own content" ON public.content
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.athlete_profiles
      WHERE id = content.athlete_id AND user_id = auth.uid()
    )
  );

-- subscriptions
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated USING (subscriber_id = auth.uid());

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT TO authenticated WITH CHECK (subscriber_id = auth.uid());

-- Storage bucket for content uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('content', 'content', true);

-- Storage RLS
CREATE POLICY "Authenticated users can upload content" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'content');

CREATE POLICY "Anyone can read content files" ON storage.objects
  FOR SELECT USING (bucket_id = 'content');
