import { AppShell } from '@/components/AppShell';
import { Dumbbell, ArrowRight, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bannerProtocolo from '@/assets/banner-protocolo-21.jpg';
import bannerCurso from '@/assets/banner-curso-destaque.jpg';

export default function Treinos() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="px-4 py-6 pb-24">
        <div className="flex items-center gap-2 mb-1">
          <Dumbbell size={22} className="text-primary" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Treinos</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Protocolos e cursos para evoluir seu jogo.</p>

        {/* Banner 1 — Protocolo 21 Dias */}
        <div className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer active:scale-[0.98] transition-transform mb-4">
          <img src={bannerProtocolo} alt="Protocolo 21 Dias" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-destructive/90 text-destructive-foreground px-2 py-0.5 rounded-full">
                Protocolo
              </span>
              <span className="flex items-center gap-1 text-[10px] text-white/70">
                <Clock size={10} /> 21 dias
              </span>
            </div>
            <h2 className="text-lg font-black text-white leading-tight">Protocolo 21 Dias</h2>
            <p className="text-xs text-white/70 mt-1 line-clamp-2">
              Transforme seu jogo em 3 semanas com treinos diários focados em técnica, condicionamento e estratégia.
            </p>
            <div className="flex items-center gap-1 mt-3 text-primary text-xs font-bold">
              Começar agora <ArrowRight size={14} />
            </div>
          </div>
        </div>

        {/* Banner 2 — Curso em Destaque */}
        <div className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer active:scale-[0.98] transition-transform">
          <img src={bannerCurso} alt="Curso em Destaque" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full">
                Novo Curso
              </span>
              <span className="flex items-center gap-1 text-[10px] text-white/70">
                <Star size={10} /> Em destaque
              </span>
            </div>
            <h2 className="text-lg font-black text-white leading-tight">Curso em Destaque</h2>
            <p className="text-xs text-white/70 mt-1 line-clamp-2">
              Aprenda as técnicas mais eficazes com nosso curso exclusivo. Conteúdo atualizado semanalmente.
            </p>
            <div className="flex items-center gap-1 mt-3 text-primary text-xs font-bold">
              Saiba mais <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
