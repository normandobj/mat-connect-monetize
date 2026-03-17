import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/integrations/supabase/client';
import { Dumbbell, ArrowRight, Clock, Star } from 'lucide-react';
import bannerProtocoloFallback from '@/assets/banner-protocolo-21.jpg';
import bannerCursoFallback from '@/assets/banner-curso-destaque.jpg';

interface Banner {
  id: string;
  title: string;
  description: string | null;
  badge_text: string | null;
  badge_color: string | null;
  meta_icon: string | null;
  meta_text: string | null;
  cta_text: string | null;
  link: string;
  image_url: string | null;
  sort_order: number;
}

const fallbackImages = [bannerProtocoloFallback, bannerCursoFallback];

const iconMap: Record<string, any> = { clock: Clock, star: Star };

export default function Treinos() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('training_banners')
      .select('*')
      .eq('visible', true)
      .order('sort_order')
      .then(({ data }) => {
        setBanners((data as any[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <AppShell>
      <div className="px-4 py-6 pb-24">
        <div className="flex items-center gap-2 mb-1">
          <Dumbbell size={22} className="text-primary" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Treinos</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Protocolos e cursos para evoluir seu jogo.</p>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-48 bg-card rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {banners.map((b, i) => {
              const MetaIcon = iconMap[b.meta_icon || 'clock'] || Clock;
              const imgSrc = b.image_url || fallbackImages[i] || fallbackImages[0];

              return (
                <div
                  key={b.id}
                  onClick={() => navigate(b.link)}
                  className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <img src={imgSrc} alt={b.title} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      {b.badge_text && (
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          b.badge_color === 'destructive' ? 'bg-destructive/90 text-destructive-foreground' : 'bg-primary/90 text-primary-foreground'
                        }`}>
                          {b.badge_text}
                        </span>
                      )}
                      {b.meta_text && (
                        <span className="flex items-center gap-1 text-[10px] text-white/70">
                          <MetaIcon size={10} /> {b.meta_text}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-black text-white leading-tight">{b.title}</h2>
                    {b.description && (
                      <p className="text-xs text-white/70 mt-1 line-clamp-2">{b.description}</p>
                    )}
                    {b.cta_text && (
                      <div className="flex items-center gap-1 mt-3 text-primary text-xs font-bold">
                        {b.cta_text} <ArrowRight size={14} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
