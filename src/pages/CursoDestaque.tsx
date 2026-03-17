import { AppShell } from '@/components/AppShell';
import { ArrowLeft, BookOpen, Clock, Play, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bannerCurso from '@/assets/banner-curso-destaque.jpg';

const modules = [
  {
    title: 'Módulo 1 — Fundamentos da Guarda',
    lessons: [
      { title: 'Postura e base na guarda fechada', duration: '12:30' },
      { title: 'Quebra de postura do adversário', duration: '8:45' },
      { title: 'Controle de manga e gola', duration: '10:20' },
    ],
  },
  {
    title: 'Módulo 2 — Raspagens Essenciais',
    lessons: [
      { title: 'Raspagem de tesoura — detalhes avançados', duration: '14:10' },
      { title: 'Raspagem de pendulum', duration: '11:50' },
      { title: 'Hip bump sweep e variações', duration: '9:30' },
    ],
  },
  {
    title: 'Módulo 3 — Finalizações',
    lessons: [
      { title: 'Triângulo — setup e ajustes', duration: '15:00' },
      { title: 'Armlock da guarda fechada', duration: '12:20' },
      { title: 'Omoplata — cadeia de ataques', duration: '13:45' },
    ],
  },
  {
    title: 'Módulo 4 — Gameplan Competitivo',
    lessons: [
      { title: 'Montando seu jogo A', duration: '18:00' },
      { title: 'Transições entre posições', duration: '14:30' },
      { title: 'Estratégia de luta e gestão de tempo', duration: '16:10' },
    ],
  },
];

export default function CursoDestaque() {
  const navigate = useNavigate();

  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);

  return (
    <AppShell>
      <div className="pb-24">
        {/* Hero */}
        <div className="relative h-56 overflow-hidden">
          <img src={bannerCurso} alt="Curso em Destaque" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <button
            onClick={() => navigate('/treinos')}
            className="absolute top-4 left-4 p-2 rounded-full bg-background/60 backdrop-blur-sm text-foreground"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full">
                Novo Curso
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Star size={10} /> Em destaque
              </span>
            </div>
            <h1 className="text-2xl font-black text-foreground">Guarda Completa</h1>
            <p className="text-xs text-muted-foreground mt-1">Do zero ao avançado em guarda fechada</p>
          </div>
        </div>

        <div className="px-4 pt-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Módulos', value: String(modules.length), icon: BookOpen },
              { label: 'Aulas', value: String(totalLessons), icon: Play },
              { label: 'Alunos', value: '230+', icon: Users },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-xl p-3 text-center border border-border">
                <s.icon size={16} className="mx-auto text-primary mb-1" />
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Um curso completo sobre guarda fechada, desde os fundamentos até técnicas avançadas de competição.
            Conteúdo atualizado semanalmente com novas aulas e variações.
          </p>

          {/* Modules */}
          {modules.map((mod, mi) => (
            <div key={mi} className="mb-6">
              <h2 className="text-sm font-bold text-foreground mb-3">{mod.title}</h2>
              <div className="space-y-2">
                {mod.lessons.map((lesson, li) => (
                  <div
                    key={li}
                    className="flex items-center gap-3 bg-card border border-border rounded-lg px-3 py-2.5"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shrink-0">
                      <Play size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{lesson.title}</p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                      <Clock size={10} /> {lesson.duration}
                    </span>
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
