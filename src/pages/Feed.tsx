import { AppShell } from '@/components/AppShell';
import { ContentCard } from '@/components/ContentCard';
import { NotificationBell } from '@/components/NotificationBell';
import { ChevronRight, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { ContentItem } from '@/data/mockData';

const PAGE_SIZE = 10;

const Feed = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const { user, signOut, loading: authLoading } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [subscribedAthleteIds, setSubscribedAthleteIds] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading]);

  useEffect(() => {
    fetchAthletes();
    if (user) fetchSubscriptions();
  }, [user]);

  useEffect(() => {
    fetchContent(0, true);
  }, [subscribedAthleteIds]);

  const fetchAthletes = async () => {
    try {
      const { data, error } = await supabase.from('athlete_profiles').select('*');
      if (error) throw error;
      setAthletes(data || []);
    } catch (err: any) {
      toast.error('Erro ao carregar atletas: ' + err.message);
    }
  };

  const fetchSubscriptions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('subscriptions').select('athlete_id').eq('subscriber_id', user.id).eq('status', 'active');
      if (error) throw error;
      setSubscribedAthleteIds((data || []).map((s: any) => s.athlete_id));
    } catch (err: any) {
      toast.error('Erro ao carregar assinaturas: ' + err.message);
    }
  };

  const fetchContent = async (fromOffset: number, reset: boolean) => {
    try {
      setLoadingMore(true);
      const { data, error } = await supabase
        .from('content')
        .select('*, athlete_profiles!inner(id, name, belt, username, photo_url)')
        .order('created_at', { ascending: false })
        .range(fromOffset, fromOffset + PAGE_SIZE - 1);

      if (error) throw error;

      if (data) {
        const mapped: ContentItem[] = data.map((item: any) => {
          const isSubscribed = subscribedAthleteIds.includes(item.athlete_id);
          return {
            id: item.id,
            type: item.type as any,
            title_pt: item.title_pt,
            title_en: item.title_en || item.title_pt,
            description_pt: item.description_pt || '',
            description_en: item.description_en || item.description_pt || '',
            planText_pt: item.plan_text_pt,
            planText_en: item.plan_text_en,
            thumbnail: item.thumbnail_url || '',
            videoUrl: item.video_url || undefined,
            duration: item.duration,
            athleteId: item.athlete_id,
            athleteName: item.athlete_profiles.name,
            athleteBelt: item.athlete_profiles.belt as any,
            athletePhoto: item.athlete_profiles.photo_url || '',
            createdAt: item.created_at,
            locked: item.visibility === 'subscribers' && !isSubscribed,
            liveDate: item.live_date,
          };
        });
        if (reset) {
          setContent(mapped);
        } else {
          setContent((prev) => [...prev, ...mapped]);
        }
        setHasMore(data.length === PAGE_SIZE);
        setOffset(fromOffset + data.length);
      }
    } catch (err: any) {
      toast.error('Erro ao carregar conteúdo: ' + err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchContent(offset, false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <AppShell>
      <header className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-background/95 backdrop-blur-md z-40">
        <h1 className="text-lg font-black text-foreground tracking-tight">mydrill<span className="text-primary">.app</span></h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-card border border-border rounded-full px-2 py-1">
            <button onClick={() => setLang('pt')} className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${lang === 'pt' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>PT</button>
            <button onClick={() => setLang('en')} className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>EN</button>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex gap-3 overflow-x-auto px-4 py-3 scrollbar-hide">
        {athletes.slice(0, 5).map((athlete) => (
          <button key={athlete.id} onClick={() => navigate(`/athlete/${athlete.username}`)} className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-primary to-accent">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-sm font-bold text-primary/60">
                {athlete.name.charAt(0)}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium truncate w-14 text-center">
              {athlete.name.split(' ')[0]}
            </span>
          </button>
        ))}
        <button onClick={() => navigate('/explore')} className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-border flex items-center justify-center">
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">{lang === 'en' ? 'More' : 'Mais'}</span>
        </button>
      </div>

      <div className="px-4 space-y-4 pb-4">
        {content.length === 0 && !loadingMore && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              {lang === 'en' ? 'Subscribe to an athlete to start seeing their content here.' : 'Assine um atleta para ver conteúdo aqui.'}
            </p>
          </div>
        )}
        {content.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
        {hasMore && content.length > 0 && (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="w-full py-3 rounded-lg border border-border bg-card text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingMore ? (
              <><Loader2 size={14} className="animate-spin" /> {lang === 'en' ? 'Loading...' : 'Carregando...'}</>
            ) : (
              lang === 'en' ? 'Load more' : 'Carregar mais'
            )}
          </button>
        )}
      </div>
    </AppShell>
  );
};

export default Feed;
