import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Users, FileText, CreditCard, TrendingUp } from 'lucide-react';

interface Stats {
  totalAthletes: number;
  totalContent: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalAthletes: 0, totalContent: 0, totalSubscriptions: 0, activeSubscriptions: 0 });
  const [recentAthletes, setRecentAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [athletes, content, subs, activeSubs, recent] = await Promise.all([
        supabase.from('athlete_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('content').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('athlete_profiles').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        totalAthletes: athletes.count || 0,
        totalContent: content.count || 0,
        totalSubscriptions: subs.count || 0,
        activeSubscriptions: activeSubs.count || 0,
      });
      setRecentAthletes(recent.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: 'Atletas', value: stats.totalAthletes, icon: Users, color: 'text-blue-400' },
    { label: 'Conteúdos', value: stats.totalContent, icon: FileText, color: 'text-green-400' },
    { label: 'Assinaturas', value: stats.totalSubscriptions, icon: CreditCard, color: 'text-yellow-400' },
    { label: 'Ativas', value: stats.activeSubscriptions, icon: TrendingUp, color: 'text-emerald-400' },
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Visão Geral</h1>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((c) => (
              <div key={c.label} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{c.label}</span>
                  <c.icon size={16} className={c.color} />
                </div>
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-foreground mb-3">Atletas Recentes</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium">Nome</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Username</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Faixa</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Academia</th>
                </tr>
              </thead>
              <tbody>
                {recentAthletes.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="p-3 text-foreground">{a.name}</td>
                    <td className="p-3 text-muted-foreground">@{a.username}</td>
                    <td className="p-3 text-muted-foreground capitalize">{a.belt}</td>
                    <td className="p-3 text-muted-foreground">{a.academy || '—'}</td>
                  </tr>
                ))}
                {recentAthletes.length === 0 && (
                  <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Nenhum atleta cadastrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
