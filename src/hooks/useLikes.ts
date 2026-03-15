import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useLikes(contentId: string) {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from('content_likes')
      .select('id', { count: 'exact', head: true })
      .eq('content_id', contentId)
      .then(({ count }) => setLikeCount(count || 0));

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

    const wasLiked = liked;
    const prevCount = likeCount;

    try {
      if (wasLiked) {
        const { error } = await supabase
          .from('content_likes')
          .delete()
          .eq('content_id', contentId)
          .eq('user_id', user.id);
        if (error) throw error;
        setLiked(false);
        setLikeCount((c) => c - 1);
      } else {
        const { error } = await supabase
          .from('content_likes')
          .insert({ content_id: contentId, user_id: user.id });
        if (error) throw error;
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } catch (err: any) {
      toast.error('Erro ao curtir');
      setLiked(wasLiked);
      setLikeCount(prevCount);
    } finally {
      setLoading(false);
    }
  }, [user, liked, likeCount, contentId, loading]);

  return { likeCount, liked, toggleLike };
}
