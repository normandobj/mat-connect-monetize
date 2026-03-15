import { useState, useEffect } from 'react';
import { Radio, Calendar, Loader2, ExternalLink, X, Video } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { ScheduleLiveModal } from './ScheduleLiveModal';
import { useNavigate } from 'react-router-dom';

export function LiveSection() {
  const { athleteProfile } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const isEn = lang === 'en';
  const [googleConnected, setGoogleConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [goingLive, setGoingLive] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [upcomingLives, setUpcomingLives] = useState<any[]>([]);

  useEffect(() => {
    if (athleteProfile) {
      checkGoogleConnection();
      fetchUpcomingLives();
    }
  }, [athleteProfile]);

  const checkGoogleConnection = async () => {
    try {
      const { data } = await supabase
        .from('athlete_google_tokens')
        .select('id')
        .eq('athlete_id', athleteProfile!.id)
        .maybeSingle();
      setGoogleConnected(!!data);
    } catch {
      // ignore
    } finally {
      setCheckingConnection(false);
    }
  };

  const fetchUpcomingLives = async () => {
    try {
      const { data } = await supabase
        .from('content')
        .select('*')
        .eq('athlete_id', athleteProfile!.id)
        .eq('type', 'live')
        .in('live_status', ['scheduled', 'live'])
        .order('scheduled_at', { ascending: true });
      setUpcomingLives(data || []);
    } catch {
      // ignore
    }
  };

  const handleGoLive = async () => {
    if (!athleteProfile) return;
    setGoingLive(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-meet', {
        body: {
          athlete_id: athleteProfile.id,
          title: `Live - ${athleteProfile.name}`,
          description: '',
          scheduled_at: null,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(isEn ? 'Live created! Your subscribers have been notified.' : 'Live criada! Seus assinantes foram notificados.');
      if (data?.meet_url) {
        window.open(data.meet_url, '_blank');
      }
      fetchUpcomingLives();
    } catch (err: any) {
      toast.error(err.message || 'Error creating live');
    } finally {
      setGoingLive(false);
    }
  };

  const handleEndLive = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('content')
        .update({ live_status: 'ended', is_live_now: false })
        .eq('id', contentId);
      if (error) throw error;
      toast.success(isEn ? 'Live ended' : 'Live encerrada');
      fetchUpcomingLives();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCancelLive = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', contentId);
      if (error) throw error;
      toast.success(isEn ? 'Live cancelled' : 'Live cancelada');
      fetchUpcomingLives();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (checkingConnection) return null;

  return (
    <div className="mt-6">
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
        {isEn ? 'Lives' : 'Lives'}
      </h2>

      {!googleConnected ? (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Video size={20} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isEn
                ? 'Connect Google Meet in settings to use lives'
                : 'Conecte seu Google Meet nas configurações para usar lives'}
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/edit')}
            className="text-xs text-primary font-semibold hover:underline"
          >
            {isEn ? 'Go to settings →' : 'Ir para configurações →'}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={handleGoLive}
              disabled={goingLive}
              className="bg-red-600 text-white rounded-lg p-3 flex flex-col items-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {goingLive ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Radio size={20} />
              )}
              <span className="text-[10px] font-semibold">
                {goingLive
                  ? (isEn ? 'Creating room...' : 'Criando sala...')
                  : (isEn ? 'Go Live Now' : 'Ir ao vivo agora')}
              </span>
            </button>

            <button
              onClick={() => setShowScheduleModal(true)}
              className="bg-card border border-border rounded-lg p-3 flex flex-col items-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Calendar size={20} className="text-primary" />
              <span className="text-[10px] font-semibold text-foreground">
                {isEn ? 'Schedule Live' : 'Agendar live'}
              </span>
            </button>
          </div>

          {/* Upcoming lives */}
          {upcomingLives.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {isEn ? 'Upcoming / Active' : 'Agendadas / Ativas'}
              </p>
              {upcomingLives.map((live) => (
                <div key={live.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {live.live_status === 'live' && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                      <p className="text-sm font-semibold text-foreground truncate">{live.title_pt}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {live.live_status === 'live'
                        ? (isEn ? 'Live now' : 'Ao vivo agora')
                        : new Date(live.scheduled_at).toLocaleString(isEn ? 'en' : 'pt-BR', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {live.live_status === 'live' && live.meet_url && (
                      <button
                        onClick={() => window.open(live.meet_url, '_blank')}
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink size={14} />
                      </button>
                    )}
                    {live.live_status === 'live' ? (
                      <button
                        onClick={() => handleEndLive(live.id)}
                        className="text-[10px] font-semibold text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-1 rounded"
                      >
                        {isEn ? 'End' : 'Encerrar'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCancelLive(live.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showScheduleModal && (
        <ScheduleLiveModal
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            setShowScheduleModal(false);
            fetchUpcomingLives();
          }}
        />
      )}
    </div>
  );
}
