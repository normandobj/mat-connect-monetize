
DROP POLICY "System can insert notifications" ON public.notifications;
CREATE POLICY "Triggers insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
