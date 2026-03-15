import { type Athlete } from '@/data/mockData';
import { BeltBadge } from './BeltBadge';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

export function AthleteCard({ athlete }: { athlete: Athlete }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/athlete/${athlete.username}`)}
      className="flex-shrink-0 w-[200px] rounded-lg bg-card border border-border p-3 text-left transition-transform active:scale-[0.98] shadow-card"
    >
      <div className="w-full aspect-square rounded-md bg-muted mb-3 flex items-center justify-center overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center text-4xl font-bold text-primary/40">
          {athlete.name.charAt(0)}
        </div>
      </div>
      <h3 className="text-sm font-bold text-foreground truncate">{athlete.name}</h3>
      <div className="flex items-center gap-2 mt-1">
        <BeltBadge belt={athlete.belt} size="sm" />
        <span className="text-xs text-muted-foreground">{athlete.countryFlag}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{athlete.city}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs font-semibold text-primary">R${athlete.monthlyPrice}/mês</span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
          <Users size={10} /> {athlete.subscribers}
        </span>
      </div>
    </button>
  );
}
