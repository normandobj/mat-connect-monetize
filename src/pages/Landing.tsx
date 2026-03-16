import { useNavigate } from 'react-router-dom';
import { AthleteCard } from '@/components/AthleteCard';
import { mockAthletes } from '@/data/mockData';
import { ArrowRight, Dumbbell, CreditCard, Video, Search, UserPlus, DollarSign, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState, forwardRef } from 'react';
import { toast } from 'sonner';

const content = {
  en: {
    heroTitle: 'Train with the best.',
    heroHighlight: 'Anywhere.',
    heroSub: 'Support your favorite BJJ athlete. Learn their game. Monthly plans starting at R$29.',
    heroBadge: '🌐 Content in English and Portuguese',
    findAthlete: 'Find an Athlete',
    joinAthlete: 'Join as Athlete',
    imAthlete: "I'm an Athlete",
    featured: 'Featured Athletes',
    forStudents: 'How it works — For Students',
    forAthletes: 'How it works — For Athletes',
    steps_students: [
      { step: '01', title: 'Discover', desc: 'Find athletes by belt rank, style, or location.' },
      { step: '02', title: 'Subscribe', desc: 'Choose a plan and unlock exclusive content.' },
      { step: '03', title: 'Learn & Support', desc: 'Watch drills, download plans, and support your athlete.' },
    ],
    steps_athletes: [
      { step: '01', title: 'Register', desc: "Create your profile in minutes — it's free." },
      { step: '02', title: 'Set your price', desc: 'Monthly, quarterly, or annual — you choose.' },
      { step: '03', title: 'Post from your phone', desc: 'Upload drills, plans, and go live — all from mobile.' },
    ],
    ctaTitle: 'Turn your training into income.',
    ctaSub: 'Join mydrill.app — starting today.',
    ctaBtn: 'Get Started Free',
    login: 'Login',
    copyright: '© 2026 mydrill. All rights reserved.',
  },
  pt: {
    heroTitle: 'Treine com os melhores.',
    heroHighlight: 'Em qualquer lugar.',
    heroSub: 'Apoie seu atleta favorito de BJJ. Aprenda com ele. Planos a partir de R$29/mês.',
    heroBadge: '🌐 Conteúdo em Português e Inglês',
    findAthlete: 'Encontrar Atleta',
    joinAthlete: 'Sou Atleta',
    imAthlete: 'Sou Atleta',
    featured: 'Atletas em Destaque',
    forStudents: 'Como funciona — Para Alunos',
    forAthletes: 'Como funciona — Para Atletas',
    steps_students: [
      { step: '01', title: 'Descubra', desc: 'Encontre atletas por faixa, estilo ou localização.' },
      { step: '02', title: 'Assine', desc: 'Escolha um plano e acesse conteúdo exclusivo.' },
      { step: '03', title: 'Aprenda & Apoie', desc: 'Assista drills, baixe planilhas e apoie seu atleta.' },
    ],
    steps_athletes: [
      { step: '01', title: 'Cadastre-se', desc: 'Crie seu perfil em minutos — é gratuito.' },
      { step: '02', title: 'Defina seu preço', desc: 'Mensal, trimestral ou anual — você decide.' },
      { step: '03', title: 'Poste pelo celular', desc: 'Suba drills, planilhas e faça lives — tudo pelo celular.' },
    ],
    ctaTitle: 'Transforme seu treino em renda.',
    ctaSub: 'Entre no mydrill.app — comece hoje.',
    ctaBtn: 'Começar Gratuitamente',
    login: 'Entrar',
    copyright: '© 2026 mydrill. Todos os direitos reservados.',
  },
};

const stepIcons_students = [Search, CreditCard, Dumbbell];
const stepIcons_athletes = [UserPlus, DollarSign, Smartphone];

const Landing = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const { user, userRole } = useAuth();
  const t = content[lang];
  const [dbAthletes, setDbAthletes] = useState<any[]>([]);
  const [loadingAthletes, setLoadingAthletes] = useState(true);

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const { data, error } = await supabase.from('athlete_profiles').select('*').limit(5);
        if (error) throw error;
        if (data && data.length > 0) setDbAthletes(data);
      } catch (err: any) {
        toast.error(lang === 'pt' ? 'Erro ao carregar atletas' : 'Failed to load athletes');
      } finally {
        setLoadingAthletes(false);
      }
    };
    fetchAthletes();
  }, []);

  const displayAthletes = dbAthletes.length > 0
    ? dbAthletes.map(a => ({
        id: a.id,
        username: a.username,
        name: a.name,
        belt: a.belt as any,
        academy: a.academy || '',
        city: a.city || '',
        country: a.country || '',
        countryFlag: a.country_flag || '🇧🇷',
        bio_pt: a.bio_pt || '',
        bio_en: a.bio_en || '',
        photo: a.photo_url || '',
        coverPhoto: a.cover_photo_url || '',
        subscribers: 0,
        monthlyPrice: a.monthly_price,
        quarterlyPrice: a.quarterly_price,
        annualPrice: a.annual_price,
        contentCount: 0,
      }))
    : mockAthletes.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[430px]">
        <header className="flex items-center justify-between px-4 py-4">
          <h2 className="text-lg font-black text-foreground tracking-tight">mydrill<span className="text-primary">.app</span></h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-card border border-border rounded-full px-2 py-1">
              <button onClick={() => setLang('pt')} className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${lang === 'pt' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>PT</button>
              <button onClick={() => setLang('en')} className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>EN</button>
            </div>
            {user ? (
              <button onClick={() => navigate(userRole === 'athlete' ? '/dashboard' : '/feed')} className="text-xs font-semibold text-primary">
                {userRole === 'athlete' ? 'Dashboard' : 'Feed'}
              </button>
            ) : (
              <button onClick={() => navigate('/auth')} className="text-xs font-semibold text-primary">{t.login}</button>
            )}
          </div>
        </header>

        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }} className="px-4 pt-8 pb-10">
          <h1 className="text-3xl font-black text-foreground leading-tight tracking-tight">{t.heroTitle}{' '}<span className="text-primary">{t.heroHighlight}</span></h1>
          <p className="text-base text-secondary-foreground mt-3 leading-relaxed">{t.heroSub}</p>
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">{t.heroBadge}</p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => navigate('/explore')} className="flex-1 bg-primary text-primary-foreground font-bold text-sm py-3 rounded-md flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">{t.findAthlete} <ArrowRight size={16} /></button>
            <button onClick={() => navigate(user ? '/register/athlete' : '/auth')} className="flex-1 bg-secondary text-secondary-foreground font-bold text-sm py-3 rounded-md active:scale-[0.98] transition-transform">{t.joinAthlete}</button>
          </div>
        </motion.section>

        <section className="pb-8">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t.featured}</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {displayAthletes.map((athlete) => (
              <AthleteCard key={athlete.id} athlete={athlete} />
            ))}
          </div>
        </section>

        <section className="px-4 py-8 border-t border-border">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">{t.forStudents}</h2>
          <div className="space-y-4">
            {t.steps_students.map((item, i) => {
              const Icon = stepIcons_students[i];
              return (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0"><Icon size={18} className="text-primary" /></div>
                  <div><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.step}</span><h3 className="text-sm font-bold text-foreground">{item.title}</h3><p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p></div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-4 py-8 border-t border-border">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">{t.forAthletes}</h2>
          <div className="space-y-4">
            {t.steps_athletes.map((item, i) => {
              const Icon = stepIcons_athletes[i];
              return (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0"><Icon size={18} className="text-primary" /></div>
                  <div><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.step}</span><h3 className="text-sm font-bold text-foreground">{item.title}</h3><p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p></div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-4 py-10 border-t border-border text-center">
          <h2 className="text-xl font-black text-foreground tracking-tight">{t.ctaTitle}</h2>
          <p className="text-sm text-muted-foreground mt-2">{t.ctaSub}</p>
          <button onClick={() => navigate(user ? '/register/athlete' : '/auth')} className="mt-4 bg-primary text-primary-foreground font-bold text-sm py-3 px-8 rounded-md active:scale-[0.98] transition-transform">{t.ctaBtn}</button>
        </section>

        <footer className="px-4 py-6 border-t border-border text-center">
          <p className="text-lg font-black text-foreground tracking-tight">mydrill<span className="text-primary">.app</span></p>
          <p className="text-xs text-muted-foreground mt-2">{t.copyright}</p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
