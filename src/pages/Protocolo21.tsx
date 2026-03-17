import { AppShell } from '@/components/AppShell';
import { ArrowLeft, CheckCircle2, Clock, Dumbbell, Flame, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bannerProtocolo from '@/assets/banner-protocolo-21.jpg';

const weeks = [
  {
    title: 'Semana 1 — Fundamentos',
    icon: Target,
    days: [
      { day: 'Dia 1', focus: 'Postura base e movimentação' },
      { day: 'Dia 2', focus: 'Guarda fechada — controle de quadril' },
      { day: 'Dia 3', focus: 'Raspagem de tesoura — detalhe' },
      { day: 'Dia 4', focus: 'Descanso ativo — mobilidade' },
      { day: 'Dia 5', focus: 'Passagem de guarda — conceitos' },
      { day: 'Dia 6', focus: 'Side control — manutenção' },
      { day: 'Dia 7', focus: 'Revisão + rolamento livre' },
    ],
  },
  {
    title: 'Semana 2 — Progressão',
    icon: Flame,
    days: [
      { day: 'Dia 8', focus: 'Guarda De La Riva — entrada' },
      { day: 'Dia 9', focus: 'Raspagem de gancho — quadril' },
      { day: 'Dia 10', focus: 'Leg drag — passagem moderna' },
      { day: 'Dia 11', focus: 'Descanso ativo — alongamento' },
      { day: 'Dia 12', focus: 'Montada — ataques' },
      { day: 'Dia 13', focus: 'Costas — controle e finalização' },
      { day: 'Dia 14', focus: 'Revisão + sparring temático' },
    ],
  },
  {
    title: 'Semana 3 — Integração',
    icon: CheckCircle2,
    days: [
      { day: 'Dia 15', focus: 'Combinações de raspagem' },
      { day: 'Dia 16', focus: 'Transições guarda → costas' },
      { day: 'Dia 17', focus: 'Defesa de submissão' },
      { day: 'Dia 18', focus: 'Descanso ativo — recuperação' },
      { day: 'Dia 19', focus: 'Gameplan pessoal — montagem' },
      { day: 'Dia 20', focus: 'Simulação de competição' },
      { day: 'Dia 21', focus: 'Avaliação final + rolamento' },
    ],
  },
];

export default function Protocolo21() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="pb-24">
        {/* Hero */}
        <div className="relative h-56 overflow-hidden">
          <img src={bannerProtocolo} alt="Protocolo 21 Dias" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <button
            onClick={() => navigate('/treinos')}
            className="absolute top-4 left-4 p-2 rounded-full bg-background/60 backdrop-blur-sm text-foreground"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-destructive/90 text-destructive-foreground px-2 py-0.5 rounded-full">
                Protocolo
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock size={10} /> 21 dias
              </span>
            </div>
            <h1 className="text-2xl font-black text-foreground">Protocolo 21 Dias</h1>
          </div>
        </div>

        <div className="px-4 pt-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Transforme seu jogo em 3 semanas com treinos diários focados em técnica, condicionamento e estratégia.
            Cada dia é projetado para construir sobre o anterior, criando uma evolução progressiva no seu jiu-jitsu.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Dias', value: '21', icon: Clock },
              { label: 'Treinos', value: '18', icon: Dumbbell },
              { label: 'Descansos', value: '3', icon: Target },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-xl p-3 text-center border border-border">
                <s.icon size={16} className="mx-auto text-primary mb-1" />
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <week.icon size={16} className="text-primary" />
                <h2 className="text-sm font-bold text-foreground">{week.title}</h2>
              </div>
              <div className="space-y-2">
                {week.days.map((d, di) => (
                  <div
                    key={di}
                    className="flex items-center gap-3 bg-card border border-border rounded-lg px-3 py-2.5"
                  >
                    <span className="text-[10px] font-bold text-primary bg-primary/10 rounded-md px-2 py-1 min-w-[48px] text-center">
                      {d.day}
                    </span>
                    <span className="text-xs text-foreground">{d.focus}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
