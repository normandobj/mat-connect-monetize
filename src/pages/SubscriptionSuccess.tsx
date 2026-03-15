import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'confirming' | 'success' | 'error'>('confirming');

  const athleteId = searchParams.get('athlete_id');
  const plan = searchParams.get('plan');

  useEffect(() => {
    const confirmSubscription = async () => {
      if (!user || !athleteId || !plan) {
        setStatus('error');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('confirm-subscription', {
          body: { athleteId, plan },
        });

        if (error) throw error;
        setStatus('success');
        toast.success('Assinatura confirmada! 🎉');
      } catch (err) {
        console.error('Error confirming subscription:', err);
        setStatus('error');
        toast.error('Erro ao confirmar assinatura.');
      }
    };

    confirmSubscription();
  }, [user, athleteId, plan]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        {status === 'confirming' && (
          <>
            <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-2">Confirmando assinatura...</h1>
            <p className="text-sm text-muted-foreground">Aguarde enquanto processamos seu pagamento.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Assinatura confirmada!</h1>
            <p className="text-sm text-muted-foreground mb-6">Agora você tem acesso ao conteúdo exclusivo.</p>
            <button
              onClick={() => navigate('/feed')}
              className="w-full bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded-md active:scale-[0.98] transition-transform"
            >
              Ir para o Feed
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-xl font-bold text-foreground mb-2">Algo deu errado</h1>
            <p className="text-sm text-muted-foreground mb-6">Não foi possível confirmar sua assinatura.</p>
            <button
              onClick={() => navigate('/explore')}
              className="w-full bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded-md active:scale-[0.98] transition-transform"
            >
              Voltar ao Explore
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
