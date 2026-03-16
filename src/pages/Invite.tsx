import { useParams, useNavigate } from 'react-router-dom';
import { BeltBadge } from '@/components/BeltBadge';
import { Check, Gift, Clock, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState, forwardRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { BeltRank } from '@/data/mockData';

const VALID_PLANS = ['free', 'trial7', 'monthly', 'quarterly', 'annual'];

const planLabels: Record<string, { title: string; subtitle: string; badge: string; badgeColor: string; icon: React.ElementType }> = {
  free:      { title: 'Acesso Gratuito', subtitle: 'Voce foi convidado para acessar todo o conteudo sem pagar nada.', badge: 'Convite Especial', badgeColor: 'bg-primary/20 text-primary', icon: Gift },
  trial7:    { title: '7 Dias Gratis', subtitle: 'Comece agora sem pagar. No 7 dia voce escolhe se continua.', badge: 'Teste Gratis', badgeColor: 'bg-green-500/20 text-green-400', icon: Clock },
  monthly:   { title: 'Plano Mensal', subtitle: 'Acesso completo renovado todo mes.', badge: 'Mensal', badgeColor: 'bg-primary/20 text-primary', icon: CreditCard },
  quarterly: { title: 'Plano Trimestral', subtitle: 'Acesso completo por 3 meses com desconto.', badge: 'Popular', badgeColor: 'bg-primary/20 text-primary', icon: CreditCard },
  annual:    { title: 'Plano Anual', subtitle: 'Melhor custo-beneficio. Acesso por 12 meses.', badge: 'Melhor Valor', badgeColor: 'bg-primary/20 text-primary', icon: CreditCard },
};

const Invite = forwardRef<HTMLDivElement>((_, ref) => {
  const { username, plan } = useParams();
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [invalidPlan, setInvalidPlan] = useState(false);

  useEffect(() => {
    if (!plan || !VALID_PLANS.includes(plan)) {
      setInvalidPlan(true);
      setLoading(false);
      return;
    }
    const fetchAthlete = async () => {
      const { data } = await supabase
        .from('athlete_profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();
      setAthlete(data);
      setLoading(false);
    };
    fetchAthlete();
  }, [username, plan]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>;

  if (invalidPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Link inválido</h1>
          <p className="text-sm text-muted-foreground mb-4">O tipo de plano neste link não é válido.</p>
          <button onClick={() => navigate('/explore')} className="bg-primary text-primary-foreground font-bold text-sm px-6 py-3 rounded-md">
            Explorar atletas
          </button>
        </div>
      </div>
    );
  }

  if (!athlete) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Atleta não encontrado</p></div>;

  const planKey = plan!;
  const planInfo = planLabels[planKey];
  const PlanIcon = planInfo.icon;

  const getPrice = () => {
    if (planKey === 'free' || planKey === 'trial7') return null;
    if (planKey === 'monthly') return athlete.monthly_price;
    if (planKey === 'quarterly') return athlete.quarterly_price;
    if (planKey === 'annual') return athlete.annual_price;
    return null;
  };

  const price = getPrice();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="mx-auto max-w-[430px] w-full px-4 py-8 flex flex-col flex-1">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="text-center mb-8">
            <p className="text-lg font-black text-foreground tracking-tight">mydrill<span className="text-primary">.app</span></p>
          </div>

          <div className={'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 ' + planInfo.badgeColor}>
            <PlanIcon size={12} />
            {planInfo.badge}
          </div>

          <h1 className="text-2xl font-black text-foreground leading-tight mb-1">{planInfo.title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">{planInfo.subtitle}</p>

          <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl mb-6">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-black text-primary/40 flex-shrink-0 overflow-hidden">
              {athlete.photo_url ? (
                <img src={athlete.photo_url} alt={athlete.name} className="w-full h-full object-cover" />
              ) : (
                athlete.name.charAt(0)
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">{athlete.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <BeltBadge belt={athlete.belt as BeltRank} size="sm" />
                <span className="text-xs text-muted-foreground">{athlete.country_flag} {athlete.city}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{athlete.academy}</p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            {['Drills e posicoes exclusivas', 'Planilhas de treino', 'Lives programadas', 'Conteudo em PT e EN'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-primary" />
                </div>
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>

          {price && (
            <div className="bg-card border border-border rounded-lg p-3 mb-4 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-black text-foreground tabular-nums">R${price}</span>
            </div>
          )}

          <button
            onClick={() => navigate('/auth')}
            className="w-full bg-primary text-primary-foreground font-bold text-sm py-4 rounded-xl active:scale-[0.98] transition-transform"
          >
            {planKey === 'free' ? 'Criar conta e acessar gratis' :
             planKey === 'trial7' ? 'Comecar 7 dias gratis' :
             'Criar conta e assinar'}
          </button>

          <p className="text-center text-[10px] text-muted-foreground mt-3">
            {planKey === 'free' ? 'Acesso gratuito · Sem cartao de credito' :
             planKey === 'trial7' ? '7 dias gratuitos · Cancele antes de ser cobrado' :
             'Pagamento seguro · Cancele quando quiser'}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Invite;
