
-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL, -- 'like', 'comment', 'message'
  actor_id uuid NOT NULL,
  content_id uuid, -- nullable, for likes/comments
  message_id uuid, -- nullable, for messages
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- System can insert notifications (via trigger with security definer)
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_notifications_user_read ON public.notifications (user_id, read, created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger function for likes: notify the content owner
CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _owner_user_id uuid;
BEGIN
  SELECT ap.user_id INTO _owner_user_id
  FROM content c
  JOIN athlete_profiles ap ON ap.id = c.athlete_id
  WHERE c.id = NEW.content_id;

  IF _owner_user_id IS NOT NULL AND _owner_user_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, actor_id, content_id)
    VALUES (_owner_user_id, 'like', NEW.user_id, NEW.content_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_like
  AFTER INSERT ON public.content_likes
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();

-- Trigger function for comments: notify the content owner
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _owner_user_id uuid;
BEGIN
  SELECT ap.user_id INTO _owner_user_id
  FROM content c
  JOIN athlete_profiles ap ON ap.id = c.athlete_id
  WHERE c.id = NEW.content_id;

  IF _owner_user_id IS NOT NULL AND _owner_user_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, actor_id, content_id)
    VALUES (_owner_user_id, 'comment', NEW.user_id, NEW.content_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_comment
  AFTER INSERT ON public.content_comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- Trigger function for messages: notify the recipient
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, actor_id, message_id)
  VALUES (NEW.recipient_id, 'message', NEW.sender_id, NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();
