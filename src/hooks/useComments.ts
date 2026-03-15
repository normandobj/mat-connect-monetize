import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Comment {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  commenter_name: string;
}

export function useComments(contentId: string, expanded: boolean) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch count always
  useEffect(() => {
    supabase
      .from('content_comments')
      .select('id', { count: 'exact', head: true })
      .eq('content_id', contentId)
      .then(({ count }) => setCommentCount(count || 0));
  }, [contentId]);

  // Fetch full comments when expanded
  useEffect(() => {
    if (!expanded) return;
    setLoading(true);
    const fetchComments = async () => {
      try {
        const { data } = await supabase
          .from('content_comments')
          .select('id, body, created_at, user_id')
          .eq('content_id', contentId)
          .order('created_at', { ascending: true });
        if (!data) { setLoading(false); return; }

        const userIds = [...new Set(data.map((c) => c.user_id))];
        const nameMap = new Map<string, string>();

        // Try profiles table first
        try {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds);
          if (profiles) {
            profiles.forEach((p) => {
              const name = p.full_name || (p.email ? p.email.split('@')[0] : null);
              if (name) nameMap.set(p.id, name);
            });
          }
        } catch {}

        // For any user_id still missing, use email prefix fallback
        const missing = userIds.filter((id) => !nameMap.has(id));
        if (missing.length > 0) {
          try {
            const { data: fallbackProfiles } = await supabase
              .from('profiles')
              .select('id, email')
              .in('id', missing);
            if (fallbackProfiles) {
              fallbackProfiles.forEach((p) => {
                if (p.email) nameMap.set(p.id, p.email.split('@')[0]);
              });
            }
          } catch {}
        }

        setComments(
          data.map((c) => ({
            ...c,
            commenter_name: nameMap.get(c.user_id) || 'Anônimo',
          }))
        );
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [contentId, expanded]);

  // Realtime subscription
  useEffect(() => {
    if (!expanded) return;
    const channel = supabase
      .channel(`comments-${contentId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'content_comments',
        filter: `content_id=eq.${contentId}`,
      }, async (payload) => {
        const newComment = payload.new as any;
        // Don't duplicate if we already have it
        setComments((prev) => {
          if (prev.some((c) => c.id === newComment.id)) return prev;
          return [...prev, { ...newComment, commenter_name: 'Novo' }];
        });
        setCommentCount((c) => c + 1);
        // Fetch name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', newComment.user_id)
          .maybeSingle();
        setComments((prev) =>
          prev.map((c) =>
            c.id === newComment.id ? { ...c, commenter_name: profile?.full_name || 'Anônimo' } : c
          )
        );
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [contentId, expanded]);

  const addComment = useCallback(async (body: string) => {
    if (!user || !body.trim()) return;
    const { data, error } = await supabase
      .from('content_comments')
      .insert({ content_id: contentId, user_id: user.id, body: body.trim() })
      .select('id, body, created_at, user_id')
      .single();
    if (data && !error) {
      const name = user.user_metadata?.full_name || 'Você';
      setComments((prev) => {
        if (prev.some((c) => c.id === data.id)) return prev;
        return [...prev, { ...data, commenter_name: name }];
      });
      setCommentCount((c) => c + 1);
    }
  }, [user, contentId]);

  const deleteComment = useCallback(async (commentId: string) => {
    await supabase.from('content_comments').delete().eq('id', commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentCount((c) => Math.max(0, c - 1));
  }, []);

  return { comments, commentCount, loading, addComment, deleteComment };
}
