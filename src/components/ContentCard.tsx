import { type ContentItem } from '@/data/mockData';
import { BeltBadge } from './BeltBadge';
import { Lock, Play, FileText, Radio, Heart, MessageCircle, Share2, Globe, Bell } from 'lucide-react';
import { useState } from 'react';

export function ContentCard({ item, lang = 'en' }: { item: ContentItem; lang?: 'pt' | 'en' }) {
  const [showLang, setShowLang] = useState<'pt' | 'en'>(lang);
  const title = showLang === 'en' ? item.title_en : item.title_pt;
  const description = showLang === 'en' ? item.description_en : item.description_pt;

  const typeIcon = {
    drill: <Play size={14} />,
    position: <Play size={14} />,
    plan: <FileText size={14} />,
    live: <Radio size={14} />,
  };

  const typeLabel = {
    drill: 'Drill',
    position: 'Position',
    plan: 'Training Plan',
    live: 'Live Session',
  };

  return (
    <div className="rounded-lg bg-card border border-border overflow-hidden shadow-card animate-slide-up">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        <div className={`w-full h-full bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center ${item.locked ? 'blur-md' : ''}`}>
          <span className="text-6xl font-black text-primary/20">{item.type === 'live' ? '📡' : '🥋'}</span>
        </div>

        {item.locked && (
          <div className="absolute inset-0 bg-background/40 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <Lock size={24} className="text-foreground/70" />
              <span className="text-xs font-semibold text-foreground/70">Subscribe to unlock</span>
            </div>
          </div>
        )}

        {item.duration && !item.locked && (
          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-medium text-foreground tabular-nums">
            {item.duration}
          </div>
        )}

        {item.type === 'live' && item.liveDate && (
          <div className="absolute top-2 left-2 bg-red-600 px-2 py-0.5 rounded text-[11px] font-bold text-foreground flex items-center gap-1">
            <Radio size={10} /> LIVE
          </div>
        )}

        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
          {typeIcon[item.type]} {typeLabel[item.type]}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-primary/60">
            {item.athleteName.charAt(0)}
          </div>
          <span className="text-xs font-semibold text-foreground">{item.athleteName}</span>
          <BeltBadge belt={item.athleteBelt} size="sm" />
        </div>

        <h3 className="text-sm font-bold text-foreground leading-snug">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>

        {showLang === 'en' && (
          <span className="inline-flex items-center gap-1 text-[10px] text-primary/70 mt-1.5">
            <Globe size={10} /> Auto-translated by mydrill AI
          </span>
        )}

        {item.type === 'live' && item.liveDate && (
          <button className="mt-2 flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-md">
            <Bell size={12} /> Notify me
          </button>
        )}

        {item.type === 'plan' && !item.locked && (
          <button className="mt-2 flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-md">
            <FileText size={12} /> Download PDF
          </button>
        )}

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
          <button className="flex items-center gap-1 text-muted-foreground text-xs hover:text-primary transition-colors">
            <Heart size={14} /> 24
          </button>
          <button className="flex items-center gap-1 text-muted-foreground text-xs hover:text-primary transition-colors">
            <MessageCircle size={14} /> 8
          </button>
          <button className="flex items-center gap-1 text-muted-foreground text-xs hover:text-primary transition-colors">
            <Share2 size={14} />
          </button>
          <button
            onClick={() => setShowLang(showLang === 'en' ? 'pt' : 'en')}
            className="ml-auto text-[10px] font-semibold text-primary/70 uppercase tracking-wider hover:text-primary transition-colors"
          >
            {showLang === 'en' ? 'PT' : 'EN'}
          </button>
        </div>
      </div>
    </div>
  );
}
