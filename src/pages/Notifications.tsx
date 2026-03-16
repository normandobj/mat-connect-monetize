import { useEffect, useState, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Heart, MessageCircle, Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: string;
  actor_id: string;
  content_id: string | null;
  message_id: string | null;
  read: boolean;
  created_at: string;
  actor_name?: string;
  content_title?: string;
}

const Notifications = forwardRef<HTMLDivElement>(function Notifications(_, ref) {
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const isEn = lang === 'en';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }

    // Ensure session is ready before querying RLS-protected tables
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setLoading(false);
        return;
      }
      fetchNotifications();
    }).catch(() => setLoading(false));

    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, authLoading]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (!data || data.length === 0) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      // Fetch actor names
      const actorIds = [...new Set(data.map(n => n.actor_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', actorIds);

      const profileMap: Record<string, string> = {};
      (profiles || []).forEach(p => { profileMap[p.id] = p.full_name || (isEn ? 'Someone' : 'Alguém'); });

      // Fetch content titles for like/comment notifications
      const contentIds = [...new Set(data.filter(n => n.content_id).map(n => n.content_id!))];
      const contentMap: Record<string, string> = {};
      if (contentIds.length > 0) {
        const { data: contents } = await supabase
          .from('content')
          .select('id, title_pt, title_en')
          .in('id', contentIds);
        (contents || []).forEach(c => {
          contentMap[c.id] = isEn ? (c.title_en || c.title_pt) : c.title_pt;
        });
      }

      const enriched = data.map(n => ({
        ...n,
        actor_name: profileMap[n.actor_id] || (isEn ? 'Someone' : 'Alguém'),
        content_title: n.content_id ? (contentMap[n.content_id] || '') : undefined,
      }));

      setNotifications(enriched);
    } catch (err: any) {
      toast({ title: isEn ? 'Error loading notifications' : 'Erro ao carregar notificações', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast({ title: isEn ? 'All marked as read' : 'Todas marcadas como lidas' });
    }
  };

  const handleClick = async (n: Notification) => {
    // Mark as read
    if (!n.read) {
      await supabase.from('notifications').update({ read: true }).eq('id', n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    }
    if (n.type === 'message') {
      navigate('/messages');
    }
    // For likes/comments we could navigate to the content, but feed is fine for now
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={18} className="text-destructive" />;
      case 'comment': return <MessageCircle size={18} className="text-accent-foreground" />;
      case 'message': return <Mail size={18} className="text-primary" />;
      default: return null;
    }
  };

  const getText = (n: Notification) => {
    const name = <span className="font-semibold">{n.actor_name}</span>;
    const title = n.content_title ? <span className="font-medium"> "{n.content_title}"</span> : null;
    switch (n.type) {
      case 'like':
        return <>{name} {isEn ? 'liked' : 'curtiu'} {title}</>;
      case 'comment':
        return <>{name} {isEn ? 'commented on' : 'comentou em'} {title}</>;
      case 'message':
        return <>{name} {isEn ? 'sent you a message' : 'enviou uma mensagem'}</>;
      default:
        return <>{name}</>;
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return isEn ? 'now' : 'agora';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (authLoading || loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">
            {isEn ? 'Notifications' : 'Notificações'}
          </h1>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs gap-1">
              <Check size={14} />
              {isEn ? 'Mark all read' : 'Marcar todas'}
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            {isEn ? 'No notifications yet' : 'Nenhuma notificação ainda'}
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map(n => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                  n.read ? 'bg-background' : 'bg-primary/5'
                } hover:bg-accent`}
              >
                <div className="mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">
                    {getText(n)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {timeAgo(n.created_at)}
                  </p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
});

Notifications.displayName = 'Notifications';
export default Notifications;
