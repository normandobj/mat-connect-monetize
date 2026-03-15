import { useParams, useNavigate } from 'react-router-dom';
import { mockAthletes, mockContent } from '@/data/mockData';
import { BeltBadge } from '@/components/BeltBadge';
import { ContentCard } from '@/components/ContentCard';
import { ArrowLeft, Users, Video, Globe, Dumbbell, Radio, FileText, Star, Check } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const AthleteProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly');

  const athlete = mockAthletes.find((a) => a.username === username) || mockAthletes[0];
  const content = mockContent.filter((c) => c.athleteId === athlete.id);

  const isEn = lang === 'en';

  const plans = [
    { key: 'monthly' as const, label: isEn ? 'Monthly' : 'Mensal', price: athlete.monthlyPrice, period: isEn ? '/mo' : '/mês' },
    { key: 'quarterly' as const, label: isEn ? 'Quarterly' : 'Trimestral', price: athlete.quarterlyPrice, period: isEn ? '/3mo' : '/3meses', badge: isEn ? 'Popular' : 'Popular' },
    { key: 'annual' as const, label: isEn ? 'Annual' : 'Anual', price: athlete.annualPrice, period: isEn ? '/yr' : '/ano', badge: isEn ? 'Best Value' : 'Melhor Valor' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[430px] pb-24">
        {/* Cover */}
        <div className="relative h-44 bg-gradient-to-br from-primary/20 to-secondary">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center"
          >
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          {/* Language Toggle */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-background/60 backdrop-blur-sm border border-border rounded-full px-2 py-1">
            <button
              onClick={() => setLang('pt')}
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${lang === 'pt' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              PT
            </button>
            <button
              onClick={() => setLang('en')}
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-4 -mt-12 relative z-10">
          <div className="w-24 h-24 rounded-xl bg-card border-4 border-background flex items-center justify-center text-3xl font-black text-primary/40">
            {athlete.name.charAt(0)}
          </div>

          <div className="mt-3">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{athlete.name}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <BeltBadge belt={athlete.belt} />
              <span className="text-xs text-muted-foreground">{athlete.countryFlag} {athlete.city}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{athlete.academy}</p>
          </div>

          {/* Bio */}
          <div className="mt-4">
            {isEn && (
              <span className="inline-flex items-center gap-1 text-[10px] text-primary/70 mb-1.5">
                <Globe size={10} /> Auto-translated
              </span>
            )}
            <p className="text-sm text-secondary-foreground leading-relaxed">
              {isEn ? athlete.bio_en : athlete.bio_pt}
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users size={14} className="text-primary" />
              <span className="font-semibold text-foreground">{athlete.subscribers}</span> training partners
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Video size={14} className="text-primary" />
              <span className="font-semibold text-foreground">{athlete.contentCount}</span> posts
            </div>
          </div>
        </div>

        {/* Plans */}
        <section className="px-4 mt-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Choose your plan</h2>
          <div className="grid grid-cols-3 gap-2">
            {plans.map((plan) => (
              <motion.button
                key={plan.key}
                onClick={() => setSelectedPlan(plan.key)}
                whileTap={{ scale: 0.98 }}
                className={`relative rounded-lg p-3 text-center border transition-colors ${
                  selectedPlan === plan.key
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {plan.badge}
                  </span>
                )}
                {selectedPlan === plan.key && (
                  <div className="absolute top-1.5 right-1.5">
                    <Check size={12} className="text-primary" />
                  </div>
                )}
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{plan.label}</p>
                <p className="text-lg font-black text-foreground mt-1 tabular-nums">R${plan.price}</p>
                <p className="text-[10px] text-muted-foreground">{plan.period}</p>
              </motion.button>
            ))}
          </div>
        </section>

        {/* What's Included */}
        <section className="px-4 mt-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">What's included</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Dumbbell, label: 'Exclusive drills' },
              { icon: Star, label: 'Favorite positions' },
              { icon: Radio, label: 'Live sessions' },
              { icon: FileText, label: 'Training plans' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 bg-card border border-border rounded-md p-3">
                <item.icon size={16} className="text-primary flex-shrink-0" />
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Content Preview */}
        <section className="px-4 mt-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Content preview</h2>
          <div className="space-y-3">
            {content.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Sticky Subscribe */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
          <div className="mx-auto max-w-[430px] px-4 py-3">
            <button
              onClick={() => navigate(`/subscribe/${athlete.username}`)}
              className="w-full bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded-md active:scale-[0.98] transition-transform"
            >
              Subscribe from R${athlete.monthlyPrice}/month
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteProfile;
