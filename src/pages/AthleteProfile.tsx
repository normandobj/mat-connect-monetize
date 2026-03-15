import { useParams, useNavigate } from 'react-router-dom';
import { BeltBadge } from '@/components/BeltBadge';
import { ContentCard } from '@/components/ContentCard';
import { ArrowLeft, Users, Video, Globe, Dumbbell, Radio, FileText, Star, Check, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ContentItem, BeltRank } from '@/data/mockData';

const AthleteProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'annual' | null>(null);
  const [athlete, setAthlete] = useState<any>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subCount, setSubCount] = useState(0);
  const [contentCount, setContentCount] = useState(0);

  useEffect(() => {
    fetchAthlete();
  }, [username]);

  const fetchAthlete = async () => {
    setLoading(true);
    try {
      const { data: athleteData, error } = await supabase
        .from('athlete_profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (error) throw error;
      if (!athleteData) { setLoading(false); return; }

      setAthlete(athleteData);

      const { count: subs, error: subsErr } = await supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('athlete_id', athleteData.id).eq('status', 'active');
      if (subsErr) throw subsErr;
      setSubCount(subs || 0);

      const { count: cc, error: ccErr } = await supabase.from('content').select('id', { count: 'exact', head: true }).eq('athlete_id', athleteData.id);
      if (ccErr) throw ccErr;
      setContentCount(cc || 0);

      let subscribed = false;
      if (user) {
        const { data: sub } = await supabase.from('subscriptions').select('id').eq('subscriber_id', user.id).eq('athlete_id', athleteData.id).eq('status', 'active').maybeSingle();
        subscribed = !!sub;
        setIsSubscribed(subscribed);
      }

      const isOwner = user?.id === athleteData.user_id;

      const { data: contentData, error: contentErr } = await supabase
        .from('content')
        .select('*')
        .eq('athlete_id', athleteData.id)
        .order('created_at', { ascending: false });

      if (contentErr) throw contentErr;

      if (contentData) {
        const mapped: ContentItem[] = contentData.map((item: any) => ({
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
          athleteName: athleteData.name,
          athleteBelt: athleteData.belt as BeltRank,
          athletePhoto: athleteData.photo_url || '',
          createdAt: item.created_at,
          locked: item.visibility === 'subscribers' && !subscribed && !isOwner,
          liveDate: item.live_date,
        }));
        setContent(mapped);
      }
    } catch (err: any) {
      toast.error('Erro ao carregar perfil: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isEn = lang === 'en';

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>;
  if (!athlete) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Atleta não encontrado</p></div>;

  // Build plans based on enabled flags
  const plans: { key: 'monthly' | 'quarterly' | 'annual'; label: string; price: number; period: string; badge?: string }[] = [
    { key: 'monthly', label: isEn ? 'Monthly' : 'Mensal', price: athlete.monthly_price, period: isEn ? '/mo' : '/mês' },
  ];
  if (athlete.quarterly_enabled && athlete.quarterly_price > 0) {
    plans.push({ key: 'quarterly', label: isEn ? 'Quarterly' : 'Trimestral', price: athlete.quarterly_price, period: isEn ? '/3mo' : '/3meses', badge: 'Popular' });
  }
  if (athlete.annual_enabled && athlete.annual_price > 0) {
    plans.push({ key: 'annual', label: isEn ? 'Annual' : 'Anual', price: athlete.annual_price, period: isEn ? '/yr' : '/ano', badge: isEn ? 'Best Value' : 'Melhor Valor' });
  }

  // Auto-select first plan if none selected
  const effectivePlan = selectedPlan && plans.some(p => p.key === selectedPlan) ? selectedPlan : plans[0]?.key;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[430px] pb-24">
        <div className="relative h-44 bg-gradient-to-br from-primary/20 to-secondary overflow-hidden">
          {athlete.cover_photo_url && (
            <img src={athlete.cover_photo_url} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-background/60 backdrop-blur-sm border border-border rounded-full px-2 py-1">
            <button onClick={() => setLang('pt')} className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${lang === 'pt' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>PT</button>
            <button onClick={() => setLang('en')} className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>EN</button>
          </div>
        </div>

        <div className="px-4 -mt-12 relative z-10">
          <div className="w-24 h-24 rounded-xl bg-card border-4 border-background flex items-center justify-center text-3xl font-black text-primary/40 overflow-hidden">
            {athlete.photo_url ? (
              <img src={athlete.photo_url} alt={athlete.name} className="w-full h-full object-cover" />
            ) : (
              athlete.name.charAt(0)
            )}
          </div>
          <div className="mt-3">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{athlete.name}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <BeltBadge belt={athlete.belt as BeltRank} />
              <span className="text-xs text-muted-foreground">{athlete.country_flag} {athlete.city}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{athlete.academy}</p>
          </div>

          <div className="mt-4">
            {isEn && athlete.bio_en && (
              <span className="inline-flex items-center gap-1 text-[10px] text-primary/70 mb-1.5">
                <Globe size={10} /> Auto-translated
              </span>
            )}
            <p className="text-sm text-secondary-foreground leading-relaxed">
              {isEn ? (athlete.bio_en || athlete.bio_pt) : athlete.bio_pt}
            </p>
          </div>

          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users size={14} className="text-primary" />
              <span className="font-semibold text-foreground">{subCount}</span> training partners
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Video size={14} className="text-primary" />
              <span className="font-semibold text-foreground">{contentCount}</span> posts
            </div>
          </div>
        </div>

        <section className="px-4 mt-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{isEn ? 'Choose your plan' : 'Escolha seu plano'}</h2>
          <div className={`grid gap-2 ${plans.length === 1 ? 'grid-cols-1' : plans.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {plans.map((plan) => (
              <motion.button key={plan.key} onClick={() => setSelectedPlan(plan.key)} whileTap={{ scale: 0.98 }}
                className={`relative rounded-lg p-3 text-center border transition-colors ${effectivePlan === plan.key ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                {plan.badge && <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">{plan.badge}</span>}
                {effectivePlan === plan.key && <div className="absolute top-1.5 right-1.5"><Check size={12} className="text-primary" /></div>}
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{plan.label}</p>
                <p className="text-lg font-black text-foreground mt-1 tabular-nums">R${plan.price}</p>
                <p className="text-[10px] text-muted-foreground">{plan.period}</p>
              </motion.button>
            ))}
          </div>
        </section>

        <section className="px-4 mt-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{isEn ? "What's included" : 'O que está incluído'}</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Dumbbell, label: isEn ? 'Exclusive drills' : 'Drills exclusivos' },
              { icon: Star, label: isEn ? 'Favorite positions' : 'Posições favoritas' },
              { icon: Radio, label: isEn ? 'Live sessions' : 'Sessões ao vivo' },
              { icon: FileText, label: isEn ? 'Training plans' : 'Planilhas de treino' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 bg-card border border-border rounded-md p-3">
                <item.icon size={16} className="text-primary flex-shrink-0" />
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 mt-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{isEn ? 'Content preview' : 'Preview do conteúdo'}</h2>
          <div className="space-y-3">
            {content.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{isEn ? 'No content yet' : 'Sem conteúdo ainda'}</p>}
            {content.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {user?.id !== athlete.user_id && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
            <div className="mx-auto max-w-[430px] px-4 py-3">
              {isSubscribed ? (
                <div className="w-full bg-muted text-muted-foreground font-bold text-sm py-3.5 rounded-md text-center flex items-center justify-center gap-2">
                  <Check size={16} /> {isEn ? 'Subscribed' : 'Assinado'}
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/subscribe/${athlete.username}`)}
                  className="w-full bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded-md active:scale-[0.98] transition-transform"
                >
                  {isEn ? `Subscribe from R$${athlete.monthly_price}/month` : `Assinar a partir de R$${athlete.monthly_price}/mês`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AthleteProfile;
