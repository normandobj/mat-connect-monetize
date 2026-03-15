import { type ContentItem } from '@/data/mockData';
import { BeltBadge } from './BeltBadge';
import { Lock, Play, FileText, Radio, Heart, MessageCircle, Share2, Globe, Bell, Pause } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useRef } from 'react';
import { useLikes } from '@/hooks/useLikes';
import { useComments } from '@/hooks/useComments';
import { CommentSection } from './CommentSection';

export function ContentCard({ item }: { item: ContentItem }) {
  const { lang } = useLanguage();
  const title = lang === 'en' ? item.title_en : item.title_pt;
  const description = lang === 'en' ? item.description_en : item.description_pt;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const { likeCount, liked, toggleLike } = useLikes(item.id);
  const { comments, commentCount, loading: commentsLoading, addComment, deleteComment } = useComments(item.id, commentsOpen);

  const typeIcon = {
    drill: <Play size={14} />,
    position: <Play size={14} />,
    plan: <FileText size={14} />,
    live: <Radio size={14} />,
  };

  const typeLabel = {
    en: { drill: 'Drill', position: 'Position', plan: 'Training Plan', live: 'Live Session' },
    pt: { drill: 'Drill', position: 'Posição', plan: 'Planilha', live: 'Live' },
  };

  const lockLabel = lang === 'en' ? 'Subscribe to unlock' : 'Assine para desbloquear';
  const notifyLabel = lang === 'en' ? 'Notify me' : 'Me avise';
  const planText = lang === 'en' ? (item.planText_en || item.planText_pt) : item.planText_pt;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowControls(true);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      setTimeout(() => setShowControls(false), 2000);
    }
  };

  const handleVideoClick = () => {
    setShowControls(true);
    togglePlay();
  };

  const InteractionBar = () => (
    <>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
        <button onClick={toggleLike} className={`flex items-center gap-1 text-xs transition-colors ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-primary'}`}>
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
        </button>
        <button onClick={() => setCommentsOpen(!commentsOpen)} className={`flex items-center gap-1 text-xs transition-colors ${commentsOpen ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
          <MessageCircle size={14} />
          {commentCount > 0 && <span className="tabular-nums">{commentCount}</span>}
        </button>
        <button className="flex items-center gap-1 text-muted-foreground text-xs hover:text-primary transition-colors">
          <Share2 size={14} />
        </button>
      </div>
      {commentsOpen && (
        <CommentSection
          comments={comments}
          loading={commentsLoading}
          onAdd={addComment}
          onDelete={deleteComment}
        />
      )}
    </>
  );

  // Training plans render as text cards
  if (item.type === 'plan') {
    return (
      <div className="rounded-lg bg-card border border-border overflow-hidden shadow-card animate-slide-up">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{typeLabel[lang].plan}</p>
              <p className="text-sm font-bold text-foreground truncate">{title}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-primary/60">
                {item.athletePhoto ? (
                  <img src={item.athletePhoto} alt="" className="w-full h-full rounded-full object-cover" />
                ) : item.athleteName.charAt(0)}
              </div>
              <BeltBadge belt={item.athleteBelt} size="sm" />
            </div>
          </div>

          {item.locked ? (
            <div className="bg-muted/50 rounded-lg px-4 py-6 flex flex-col items-center gap-2">
              <Lock size={20} className="text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground">{lockLabel}</p>
            </div>
          ) : (
            <div className="bg-background border border-border rounded-lg px-3 py-3">
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-6">
                {planText || description}
              </p>
            </div>
          )}

          {lang === 'en' && (
            <span className="inline-flex items-center gap-1 text-[10px] text-primary/70 mt-2">
              <Globe size={10} /> Auto-translated by mydrill AI
            </span>
          )}

          <InteractionBar />
        </div>
      </div>
    );
  }

  const hasVideo = !!item.videoUrl && !item.locked;

  return (
    <div className="rounded-lg bg-card border border-border overflow-hidden shadow-card animate-slide-up">
      {/* Thumbnail / Video */}
      <div className="relative aspect-video bg-muted">
        {hasVideo ? (
          <>
            <video
              ref={videoRef}
              src={item.videoUrl}
              className="w-full h-full object-cover"
              playsInline
              preload="metadata"
              onClick={handleVideoClick}
              onEnded={() => { setIsPlaying(false); setShowControls(true); }}
            />
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 cursor-pointer ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
              onClick={handleVideoClick}
            >
              {!isPlaying && (
                <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Play size={24} className="text-primary-foreground ml-1" fill="currentColor" />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center ${item.locked ? 'blur-md' : ''}`}>
            <span className="text-6xl font-black text-primary/20">{item.type === 'live' ? '📡' : '🥋'}</span>
          </div>
        )}

        {item.locked && (
          <div className="absolute inset-0 bg-background/40 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <Lock size={24} className="text-foreground/70" />
              <span className="text-xs font-semibold text-foreground/70">{lockLabel}</span>
            </div>
          </div>
        )}

        {item.duration && !item.locked && !isPlaying && (
          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-medium text-foreground tabular-nums">
            {item.duration}
          </div>
        )}

        {item.type === 'live' && item.liveDate && (
          <div className="absolute top-2 left-2 bg-red-600 px-2 py-0.5 rounded text-[11px] font-bold text-foreground flex items-center gap-1">
            <Radio size={10} /> LIVE
          </div>
        )}

        {(!isPlaying || showControls) && (
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
            {typeIcon[item.type]} {typeLabel[lang][item.type]}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-primary/60 overflow-hidden">
            {item.athletePhoto ? (
              <img src={item.athletePhoto} alt="" className="w-full h-full object-cover" />
            ) : item.athleteName.charAt(0)}
          </div>
          <span className="text-xs font-semibold text-foreground">{item.athleteName}</span>
          <BeltBadge belt={item.athleteBelt} size="sm" />
        </div>

        <h3 className="text-sm font-bold text-foreground leading-snug">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>

        {lang === 'en' && (
          <span className="inline-flex items-center gap-1 text-[10px] text-primary/70 mt-1.5">
            <Globe size={10} /> Auto-translated by mydrill AI
          </span>
        )}

        {item.type === 'live' && item.liveDate && (
          <button className="mt-2 flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-md">
            <Bell size={12} /> {notifyLabel}
          </button>
        )}

        <InteractionBar />
      </div>
    </div>
  );
}
