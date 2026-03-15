import { useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Comment } from '@/hooks/useComments';

interface Props {
  comments: Comment[];
  loading: boolean;
  onAdd: (body: string) => void;
  onDelete: (id: string) => void;
}

export function CommentSection({ comments, loading, onAdd, onDelete }: Props) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [body, setBody] = useState('');

  const handleSubmit = () => {
    if (!body.trim()) return;
    onAdd(body);
    setBody('');
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return lang === 'pt' ? 'agora' : 'now';
    if (diffMin < 60) return `${diffMin}m`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}d`;
  };

  return (
    <div className="border-t border-border px-3 py-3 space-y-3">
      {loading ? (
        <p className="text-xs text-muted-foreground text-center py-2">
          {lang === 'pt' ? 'Carregando...' : 'Loading...'}
        </p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">
          {lang === 'pt' ? 'Nenhum comentário ainda.' : 'No comments yet.'}
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-primary/60 flex-shrink-0">
                {c.commenter_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-semibold text-foreground">{c.commenter_name}</span>
                  <span className="text-[10px] text-muted-foreground">{formatTime(c.created_at)}</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{c.body}</p>
              </div>
              {user && c.user_id === user.id && (
                <button onClick={() => onDelete(c.id)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 mt-1">
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {user ? (
        <div className="flex items-center gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={lang === 'pt' ? 'Escrever um comentário...' : 'Write a comment...'}
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button onClick={handleSubmit} disabled={!body.trim()} className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center disabled:opacity-40">
            <Send size={14} className="text-primary-foreground" />
          </button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center">
          {lang === 'pt' ? 'Faça login para comentar' : 'Log in to comment'}
        </p>
      )}
    </div>
  );
}
