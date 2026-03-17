import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { ArrowLeft, CheckCircle2, Clock, Dumbbell, Flame, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import bannerProtocolo from '@/assets/banner-protocolo-21.jpg';

interface ProtocolDay {
  id: string;
  day_number: number;
  week_number: number;
  week_title: string | null;
  focus: string;
}

interface Week {
  number: number;
  title: string;
  icon: any;
  days: ProtocolDay[];
}

const weekIcons = [Target, Flame, CheckCircle2];

export default function Protocolo21() {
  const navigate = useNavigate();
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('protocol_days')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        const days = (data as any[]) || [];
        const weekMap = new Map<number, Week>();
        days.forEach((d) => {
          if (!weekMap.has(d.week_number)) {
            weekMap.set(d.week_number, {
              number: d.week_number,
              title: d.week_title || `Semana ${d.week_number}`,
              icon: weekIcons[(d.week_number - 1) % weekIcons.length],
              days: [],
            });
          }
          weekMap.get(d.week_number)!.days.push(d);
        });
        setWeeks(Array.from(weekMap.values()).sort((a, b) => a.number - b.number));
        setLoading(false);
      });
  }, []);

  const totalDays = weeks.reduce((a, w) => a + w.days.length, 0);
  const restDays = weeks.reduce((a, w) => a + w.days.filter(d => d.focus.toLowerCase().includes('descanso')).length, 0);

  return (
    <AppShell>
      <div className="pb-24">
        <div className="relative h-56 overflow-hidden">
          <img src={bannerProtocolo} alt="Protocolo 21 Dias" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <button onClick={() => navigate('/treinos')} className="absolute top-4 left-4 p-2 rounded-full bg-background/60 backdrop-blur-sm text-foreground">
            <ArrowLeft size={20} />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-destructive/90 text-destructive-foreground px-2 py-0.5 rounded-full">Protocolo</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock size={10} /> {totalDays} dias</span>
            </div>
            <h1 className="text-2xl font-black text-foreground">Protocolo 21 Dias</h1>
          </div>
        </div>

        <div className="px-4 pt-4">
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Transforme seu jogo em 3 semanas com treinos diários focados em técnica, condicionamento e estratégia.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Dias', value: String(totalDays), icon: Clock },
              { label: 'Treinos', value: String(totalDays - restDays), icon: Dumbbell },
              { label: 'Descansos', value: String(restDays), icon: Target },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-xl p-3 text-center border border-border">
                <s.icon size={16} className="mx-auto text-primary mb-1" />
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />)}
            </div>
          ) : (
            weeks.map((week) => (
              <div key={week.number} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <week.icon size={16} className="text-primary" />
                  <h2 className="text-sm font-bold text-foreground">{week.title}</h2>
                </div>
                <div className="space-y-2">
                  {week.days.map((d) => (
                    <div key={d.id} className="flex items-center gap-3 bg-card border border-border rounded-lg px-3 py-2.5">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 rounded-md px-2 py-1 min-w-[48px] text-center">Dia {d.day_number}</span>
                      <span className="text-xs text-foreground">{d.focus}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
