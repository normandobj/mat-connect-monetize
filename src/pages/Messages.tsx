import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Search, Lock, ExternalLink } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface Thread {
  id: string;
  name: string;
  photo_url: string | null;
  lastMessage: string;
  unreadCount: number;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface AthleteSearchResult {
  user_id: string;
  name: string;
  username: string;
  photo_url: string | null;
  subscribed: boolean;
}

const Messages = () => {
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [threadProfiles, setThreadProfiles] = useState<Map<string, { name: string; photo: string | null }>>(new Map());
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AthleteSearchResult[]>([]);
  const [subscribedAthleteUserIds, setSubscribedAthleteUserIds] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    loadThreads();
    loadSubscribedAthletes();
  }, [user]);

  useEffect(() => {
    if (routeUserId && user) {
      setSelectedThread(routeUserId);
      loadProfileForUser(routeUserId);
    }
  }, [routeUserId, user]);

  // Search athletes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(() => searchAthletes(searchQuery.trim()), 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, subscribedAthleteUserIds]);

  const loadSubscribedAthletes = async () => {
    if (!user) return;
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('athlete_id, athlete_profiles!inner(user_id)')
      .eq('subscriber_id', user.id)
      .eq('status', 'active');

    if (subs) {
      const userIds = new Set(subs.map((s: any) => s.athlete_profiles.user_id as string));
      setSubscribedAthleteUserIds(userIds);
    }
  };

  const searchAthletes = async (query: string) => {
    setIsSearching(true);
    try {
      const { data: athletes } = await supabase
        .from('athlete_profiles')
        .select('user_id, name, username, photo_url')
        .ilike('name', `%${query}%`)
        .limit(10);

      if (athletes) {
        const results: AthleteSearchResult[] = athletes.map((a) => ({
          user_id: a.user_id,
          name: a.name,
          username: a.username,
          photo_url: a.photo_url,
          subscribed: subscribedAthleteUserIds.has(a.user_id),
        }));
        setSearchResults(results);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const loadProfileForUser = async (userId: string) => {
    if (threadProfiles.has(userId)) return;
    const { data: ap } = await supabase.from('athlete_profiles').select('user_id, name, photo_url').eq('user_id', userId).maybeSingle();
    if (ap) {
      setThreadProfiles(prev => new Map(prev).set(userId, { name: ap.name, photo: ap.photo_url }));
      return;
    }
    const { data: p } = await supabase.from('profiles').select('id, full_name, avatar_url').eq('id', userId).maybeSingle();
    if (p) {
      setThreadProfiles(prev => new Map(prev).set(userId, { name: p.full_name || 'Usuário', photo: p.avatar_url }));
    }
  };

  const loadThreads = async () => {
    if (!user) return;
    setLoadingThreads(true);
    try {
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!msgs || msgs.length === 0) { setThreads([]); return; }

      const partnerMap = new Map<string, { lastMsg: string; unread: number; time: string }>();
      for (const m of msgs) {
        const partnerId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
        if (!partnerMap.has(partnerId)) {
          partnerMap.set(partnerId, { lastMsg: m.body, unread: 0, time: m.created_at });
        }
        if (!m.read && m.recipient_id === user.id) {
          const entry = partnerMap.get(partnerId)!;
          entry.unread++;
        }
      }

      const partnerIds = [...partnerMap.keys()];

      const { data: athleteProfiles } = await supabase.from('athlete_profiles').select('user_id, name, photo_url').in('user_id', partnerIds);
      const { data: regularProfiles } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', partnerIds);

      const profileMap = new Map<string, { name: string; photo: string | null }>();
      for (const p of regularProfiles || []) profileMap.set(p.id, { name: p.full_name || 'Usuário', photo: p.avatar_url });
      for (const a of athleteProfiles || []) profileMap.set(a.user_id, { name: a.name, photo: a.photo_url });

      setThreadProfiles(prev => {
        const next = new Map(prev);
        profileMap.forEach((v, k) => next.set(k, v));
        return next;
      });

      const threadList: Thread[] = partnerIds.map((pid) => {
        const info = partnerMap.get(pid)!;
        const profile = profileMap.get(pid);
        return { id: pid, name: profile?.name || 'Usuário', photo_url: profile?.photo || null, lastMessage: info.lastMsg, unreadCount: info.unread };
      });

      setThreads(threadList);
    } finally {
      setLoadingThreads(false);
    }
  };

  // Load messages for selected thread
  useEffect(() => {
    if (!user || !selectedThread) return;
    loadMessages(selectedThread);
    markAsRead(selectedThread);

    const channel = supabase
      .channel(`dm-${selectedThread}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as Message;
        if (
          (msg.sender_id === user.id && msg.recipient_id === selectedThread) ||
          (msg.sender_id === selectedThread && msg.recipient_id === user.id)
        ) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          if (msg.sender_id === selectedThread) {
            supabase.from('messages').update({ read: true }).eq('id', msg.id);
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedThread, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (partnerId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const markAsRead = async (partnerId: string) => {
    if (!user) return;
    await supabase.from('messages').update({ read: true }).eq('sender_id', partnerId).eq('recipient_id', user.id).eq('read', false);
  };

  const sendMessage = async () => {
    if (!user || !selectedThread || !newMessage.trim()) return;
    const { data } = await supabase
      .from('messages')
      .insert({ sender_id: user.id, recipient_id: selectedThread, body: newMessage.trim() })
      .select()
      .single();
    if (data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    }
    setNewMessage('');
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  const selectedProfile = selectedThread ? threadProfiles.get(selectedThread) : null;

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background sticky top-0 z-10">
          {selectedThread ? (
            <>
              <button onClick={() => { setSelectedThread(null); if (routeUserId) navigate('/messages'); }} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
                <ArrowLeft size={16} className="text-foreground" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-primary/60 overflow-hidden">
                  {selectedProfile?.photo ? (
                    <img src={selectedProfile.photo} alt="" className="w-full h-full object-cover" />
                  ) : (selectedProfile?.name || 'U').charAt(0)}
                </div>
                <span className="text-sm font-bold text-foreground">{selectedProfile?.name || 'Usuário'}</span>
              </div>
            </>
          ) : (
            <h1 className="text-lg font-bold text-foreground">
              {lang === 'pt' ? 'Mensagens' : 'Messages'}
            </h1>
          )}
        </div>

        {!selectedThread ? (
          /* Thread list with search */
          <div className="flex-1 overflow-y-auto">
            {/* Search bar */}
            <div className="px-4 py-3 border-b border-border">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'pt' ? 'Pesquisar atletas...' : 'Search athletes...'}
                  className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Search results */}
            {searchQuery.trim() && (
              <div className="border-b border-border">
                {isSearching ? (
                  <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">{lang === 'pt' ? 'Buscando...' : 'Searching...'}</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">{lang === 'pt' ? 'Nenhum atleta encontrado.' : 'No athletes found.'}</p>
                  </div>
                ) : (
                  searchResults.map((result) => (
                    <div key={result.user_id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-primary/60 overflow-hidden flex-shrink-0">
                        {result.photo_url ? (
                          <img src={result.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : result.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-foreground truncate">{result.name}</span>
                          {!result.subscribed && <Lock size={12} className="text-muted-foreground flex-shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground">@{result.username}</p>
                      </div>
                      {result.subscribed ? (
                        <button
                          onClick={() => {
                            setSelectedThread(result.user_id);
                            setSearchQuery('');
                            loadProfileForUser(result.user_id);
                          }}
                          className="text-xs font-semibold text-primary-foreground bg-primary px-3 py-1.5 rounded-lg flex-shrink-0"
                        >
                          {lang === 'pt' ? 'Conversar' : 'Chat'}
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/athlete/${result.username}`)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg flex-shrink-0"
                        >
                          <ExternalLink size={12} />
                          {lang === 'pt' ? 'Assinar' : 'Subscribe'}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Existing threads */}
            {loadingThreads ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">
                  {lang === 'pt' ? 'Carregando...' : 'Loading...'}
                </p>
              </div>
            ) : threads.length === 0 && !searchQuery.trim() ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center px-6">
                  <p className="text-sm text-muted-foreground">
                    {lang === 'pt' ? 'Nenhuma mensagem ainda.' : 'No messages yet.'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lang === 'pt' ? 'Pesquise um atleta acima para iniciar uma conversa.' : 'Search for an athlete above to start a conversation.'}
                  </p>
                </div>
              </div>
            ) : (
              threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThread(thread.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-primary/60 overflow-hidden flex-shrink-0">
                    {thread.photo_url ? (
                      <img src={thread.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : thread.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{thread.name}</span>
                      {thread.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{thread.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          /* Chat */
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">
                    {lang === 'pt' ? 'Comece a conversa!' : 'Start the conversation!'}
                  </p>
                </div>
              )}
              {messages.map((msg) => {
                const isMine = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${isMine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-card border border-border text-foreground rounded-bl-sm'}`}>
                      <p className="text-sm leading-relaxed">{msg.body}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border px-4 py-3 bg-background">
              <div className="flex items-center gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={lang === 'pt' ? 'Digite uma mensagem...' : 'Type a message...'}
                  className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button onClick={sendMessage} disabled={!newMessage.trim()} className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center disabled:opacity-40">
                  <Send size={18} className="text-primary-foreground" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
};

export default Messages;
