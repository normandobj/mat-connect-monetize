import { AppShell } from '@/components/AppShell';
import { AthleteCard } from '@/components/AthleteCard';
import { mockAthletes, type BeltRank } from '@/data/mockData';
import { Search } from 'lucide-react';
import { useState } from 'react';

const filters: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Black Belt', value: 'black' },
  { label: 'Brown Belt', value: 'brown' },
  { label: 'Purple Belt', value: 'purple' },
  { label: 'Blue Belt', value: 'blue' },
  { label: 'Brazil', value: 'brazil' },
];

const Explore = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mockAthletes.filter((a) => {
    if (activeFilter !== 'all' && activeFilter !== 'brazil') {
      if (a.belt !== activeFilter as BeltRank) return false;
    }
    if (searchQuery) {
      return a.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <AppShell>
      <div className="px-4 py-4">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Explore</h1>

        {/* Search */}
        <div className="relative mt-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search athletes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-md pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto mt-4 pb-1 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeFilter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Trending */}
        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Trending this week</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {mockAthletes.slice(0, 3).map((athlete) => (
              <AthleteCard key={athlete.id} athlete={athlete} />
            ))}
          </div>
        </section>

        {/* Grid */}
        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">All Athletes</h2>
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((athlete) => (
              <div key={athlete.id} className="w-full">
                <AthleteCard athlete={athlete} />
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No athletes found.</p>
          )}
        </section>
      </div>
    </AppShell>
  );
};

export default Explore;
