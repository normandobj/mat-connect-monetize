import { AppShell } from '@/components/AppShell';
import { ContentCard } from '@/components/ContentCard';
import { mockContent, mockAthletes } from '@/data/mockData';
import { Bell, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Feed = () => {
  const navigate = useNavigate();

  return (
    <AppShell>
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-background/95 backdrop-blur-md z-40">
        <h1 className="text-lg font-black text-foreground tracking-tight">mydrill<span className="text-primary">.app</span></h1>
        <div className="flex items-center gap-3">
          <button className="relative">
            <Bell size={20} className="text-muted-foreground" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />
          </button>
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            Y
          </div>
        </div>
      </header>

      {/* Stories */}
      <div className="flex gap-3 overflow-x-auto px-4 py-3 scrollbar-hide">
        {mockAthletes.slice(0, 5).map((athlete) => (
          <button
            key={athlete.id}
            onClick={() => navigate(`/athlete/${athlete.username}`)}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-primary to-accent">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-sm font-bold text-primary/60">
                {athlete.name.charAt(0)}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium truncate w-14 text-center">
              {athlete.name.split(' ')[0]}
            </span>
          </button>
        ))}
        <button className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-border flex items-center justify-center">
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">More</span>
        </button>
      </div>

      {/* Feed */}
      <div className="px-4 space-y-4 pb-4">
        {mockContent.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
    </AppShell>
  );
};

export default Feed;
