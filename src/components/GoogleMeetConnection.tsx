import { useState, useEffect } from 'react';
import { Video, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export function GoogleMeetConnection() {
  const { athleteProfile } = useAuth();
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    checkConnection();
    // Check URL params for success callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_connected') === 'true') {
      setConnected(true);
      toast.success(isEn ? 'Google Meet connected!' : 'Google Meet conectado!');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [athleteProfile]);

  const checkConnection = async () => {
    if (!athleteProfile) return;
    try {
      const { data, error } = await supabase
        .from('athlete_google_tokens')
        .select('id')
        .eq('athlete_id', athleteProfile.id)
        .maybeSingle();
      if (!error && data) setConnected(true);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!athleteProfile) return;
    try {
      const { data, error } = await supabase.functions.invoke('google-oauth-start', {
        body: { athlete_id: athleteProfile.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || (isEn ? 'Failed to start Google OAuth' : 'Erro ao iniciar OAuth do Google'));
    }
  };

  const startOAuthViaEdge = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-oauth-start', {
        body: { athlete_id: athleteProfile!.id },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || 'Failed to start Google OAuth');
    }
  };

  const handleDisconnect = async () => {
    if (!athleteProfile) return;
    setDisconnecting(true);
    try {
      const { error } = await supabase
        .from('athlete_google_tokens')
        .delete()
        .eq('athlete_id', athleteProfile.id);
      if (error) throw error;
      setConnected(false);
      toast.success(isEn ? 'Google Meet disconnected' : 'Google Meet desconectado');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
        <Loader2 size={16} className="animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{isEn ? 'Checking connection...' : 'Verificando conexão...'}</span>
      </div>
    );
  }

  return (
    <div className={`bg-card border rounded-lg p-4 transition-colors ${connected ? 'border-green-500/50' : 'border-border'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${connected ? 'bg-green-500/10' : 'bg-primary/10'}`}>
            <Video size={20} className={connected ? 'text-green-500' : 'text-primary'} />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Google Meet</p>
            {connected ? (
              <p className="text-[10px] text-green-500 flex items-center gap-1">
                <Check size={10} /> {isEn ? 'Connected' : 'Conectado'}
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                {isEn ? 'Required for live sessions' : 'Necessário para lives'}
              </p>
            )}
          </div>
        </div>

        {connected ? (
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            {disconnecting ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
            {isEn ? 'Disconnect' : 'Desconectar'}
          </button>
        ) : (
          <button
            onClick={handleConnect}
            className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg active:scale-[0.98] transition-transform"
          >
            {isEn ? 'Connect' : 'Conectar'}
          </button>
        )}
      </div>
    </div>
  );
}
