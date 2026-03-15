import { useNavigate } from 'react-router-dom';
import { AthleteCard } from '@/components/AthleteCard';
import { mockAthletes } from '@/data/mockData';
import { ArrowRight, Dumbbell, CreditCard, Video, Search, UserPlus, DollarSign, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[430px]">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4">
          <h2 className="text-lg font-black text-foreground tracking-tight">mydrill<span className="text-primary">.app</span></h2>
          <button
            onClick={() => navigate('/register/athlete')}
            className="text-xs font-semibold text-primary"
          >
            I'm an Athlete
          </button>
        </header>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="px-4 pt-8 pb-10"
        >
          <h1 className="text-3xl font-black text-foreground leading-tight tracking-tight">
            Train with the best.{' '}
            <span className="text-primary">Anywhere.</span>
          </h1>
          <p className="text-base text-secondary-foreground mt-3 leading-relaxed">
            Support your favorite BJJ athlete. Learn their game. Monthly plans starting at R$15.
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
            🌐 Content in English and Portuguese
          </p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => navigate('/explore')}
              className="flex-1 bg-primary text-primary-foreground font-bold text-sm py-3 rounded-md flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              Find an Athlete <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/register/athlete')}
              className="flex-1 bg-secondary text-secondary-foreground font-bold text-sm py-3 rounded-md active:scale-[0.98] transition-transform"
            >
              Join as Athlete
            </button>
          </div>
        </motion.section>

        {/* Featured Athletes */}
        <section className="pb-8">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Featured Athletes</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {mockAthletes.slice(0, 5).map((athlete) => (
              <AthleteCard key={athlete.id} athlete={athlete} />
            ))}
          </div>
        </section>

        {/* How it works — Fans */}
        <section className="px-4 py-8 border-t border-border">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">How it works — For Students</h2>
          <div className="space-y-4">
            {[
              { icon: Search, step: '01', title: 'Discover', desc: 'Find athletes by belt rank, style, or location.' },
              { icon: CreditCard, step: '02', title: 'Subscribe', desc: 'Choose a plan and unlock exclusive content.' },
              { icon: Dumbbell, step: '03', title: 'Learn & Support', desc: 'Watch drills, download plans, and support your athlete.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-primary" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.step}</span>
                  <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works — Athletes */}
        <section className="px-4 py-8 border-t border-border">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">How it works — For Athletes</h2>
          <div className="space-y-4">
            {[
              { icon: UserPlus, step: '01', title: 'Register', desc: 'Create your profile in minutes — it\'s free.' },
              { icon: DollarSign, step: '02', title: 'Set your price', desc: 'Monthly, quarterly, or annual — you choose.' },
              { icon: Smartphone, step: '03', title: 'Post from your phone', desc: 'Upload drills, plans, and go live — all from mobile.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-primary" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.step}</span>
                  <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-10 border-t border-border text-center">
          <h2 className="text-xl font-black text-foreground tracking-tight">Turn your training into income.</h2>
          <p className="text-sm text-muted-foreground mt-2">Join mydrill.app — starting today.</p>
          <button
            onClick={() => navigate('/register/athlete')}
            className="mt-4 bg-primary text-primary-foreground font-bold text-sm py-3 px-8 rounded-md active:scale-[0.98] transition-transform"
          >
            Get Started Free
          </button>
        </section>

        {/* Footer */}
        <footer className="px-4 py-6 border-t border-border text-center">
          <p className="text-lg font-black text-foreground tracking-tight">mydrill<span className="text-primary">.app</span></p>
          <p className="text-xs text-muted-foreground mt-2">© 2024 mydrill. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-3">
            <button className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">PT</button>
            <span className="text-muted-foreground">|</span>
            <button className="text-xs font-semibold text-primary">EN</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
