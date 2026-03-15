import { useParams, useNavigate } from 'react-router-dom';
import { BeltBadge } from '@/components/BeltBadge';
import { ArrowLeft, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { BeltRank } from '@/data/mockData';

const Subscribe = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly');
  const [athlete, setAthlete] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [username]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>;
  if (!athlete) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Atleta não encontrado</p></div>;

  const plans = [
    { key: 'monthly' as const, label: 'Mensal', price: athlete.monthly_price, period: '/mês' },
    { key: 'quarterly' as const, label: 'Trimestral', price: athlete.quarterly_price, period: '/3meses', badge: 'Popular' },
    { key: 'annual' as const, label: 'Anual', price: athlete.annual_price, period: '/ano', badge: 'Melhor Valor' },
  ];

  const currentPlan = plans.find((p) => p.key === selectedPlan)!;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[430px] px-4 py-4">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center mb-4">
          <ArrowLeft size={16} className="text-foreground" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-xl bg-card border border-border flex items-center justify-center text-xl font-bold text-primary/40 overflow-hidden">
            {athlete.photo_url ? (
              <img src={athlete.photo_url} alt={athlete.name} className="w-full h-full object-cover" />
            ) : (
              athlete.name.charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{athlete.name}</h1>
            <BeltBadge belt={athlete.belt as BeltRank} size="sm" />
          </div>
        </div>

        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Selecione o Plano</h2>
        <div className="space-y-2 mb-6">
          {plans.map((plan) => (
            <motion.button
              key={plan.key}
              onClick={() => setSelectedPlan(plan.key)}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
                selectedPlan === plan.key ? 'border-primary bg-primary/10' : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center gap-3">
                {selectedPlan === plan.key ? (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check size={12} className="text-primary-foreground" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted" />
                )}
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">{plan.label}</p>
                  {plan.badge && <span className="text-[10px] font-semibold text-primary">{plan.badge}</span>}
                </div>
              </div>
              <p className="text-lg font-black text-foreground tabular-nums">R${plan.price}<span className="text-xs text-muted-foreground font-normal">{plan.period}</span></p>
            </motion.button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-card">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Plano {currentPlan.label}</span>
            <span className="font-bold text-foreground tabular-nums">R${currentPlan.price}</span>
          </div>
        </div>

        <button
          disabled
          className="w-full bg-muted text-muted-foreground font-bold text-sm py-3.5 rounded-md cursor-not-allowed opacity-70"
        >
          Pagamentos em breve — use o link de convite gratuito do atleta
        </button>
        <p className="text-center text-[10px] text-muted-foreground mt-3">Pagamento via Stripe será habilitado em breve</p>
      </div>
    </div>
  );
};

export default Subscribe;
