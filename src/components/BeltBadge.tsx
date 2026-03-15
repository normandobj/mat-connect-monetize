import { type BeltRank } from '@/data/mockData';

const beltColors: Record<BeltRank, string> = {
  white: 'bg-belt-white',
  blue: 'bg-belt-blue',
  purple: 'bg-belt-purple',
  brown: 'bg-belt-brown',
  black: 'bg-belt-black',
};

const beltLabels: Record<BeltRank, string> = {
  white: 'WHITE',
  blue: 'BLUE',
  purple: 'PURPLE',
  brown: 'BROWN',
  black: 'BLACK',
};

export function BeltBadge({ belt, size = 'md' }: { belt: BeltRank; size?: 'sm' | 'md' }) {
  const h = size === 'sm' ? 'h-5 px-2 text-[9px]' : 'h-6 px-3 text-[10px]';

  return (
    <span className={`inline-flex items-center rounded-full border border-foreground/10 overflow-hidden ${h}`}>
      <span className={`${beltColors[belt]} flex-1 h-full flex items-center justify-center font-black uppercase tracking-widest text-foreground px-1.5`}>
        {beltLabels[belt]}
      </span>
      <span className="bg-belt-black h-full w-3 flex items-center justify-center">
        <span className="w-0.5 h-full bg-red-600" />
      </span>
    </span>
  );
}
