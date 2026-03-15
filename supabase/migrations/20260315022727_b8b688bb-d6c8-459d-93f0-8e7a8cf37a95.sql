
-- Content likes table
CREATE TABLE public.content_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (content_id, user_id)
);

ALTER TABLE public.content_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes" ON public.content_likes
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can insert own likes" ON public.content_likes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own likes" ON public.content_likes
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Content comments table
CREATE TABLE public.content_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments" ON public.content_comments
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can insert own comments" ON public.content_comments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON public.content_comments
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages" ON public.messages
  FOR SELECT TO authenticated USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can insert messages as sender" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can update read status" ON public.messages
  FOR UPDATE TO authenticated USING (recipient_id = auth.uid());

-- Enable realtime for comments and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.content_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
