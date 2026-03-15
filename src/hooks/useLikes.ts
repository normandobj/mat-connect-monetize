import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useLikes(contentId: string) {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch count
    supabase
      .from('content_likes')
      .select('id', { count: 'exact', head: true })
      .eq('content_id', contentId)
      .then(({ count }) => setLikeCount(count || 0));

    // Check if user liked
    if (user) {
      supabase
        .from('content_likes')
        .select('id')
        .eq('content_id', contentId)
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => setLiked(!!data));
    }
  }, [contentId, user]);

  const toggleLike = useCallback(async () => {
    if (!user || loading) return;
    setLoading(true);

    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
      await supabase
        .from('content_likes')
        .delete()
        .eq('content_id', contentId)
        .eq('user_id', user.id);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      await supabase
        .from('content_likes')
        .insert({ content_id: contentId, user_id: user.id });
    }

    setLoading(false);
  }, [user, liked, contentId, loading]);

  return { likeCount, liked, toggleLike };
}
