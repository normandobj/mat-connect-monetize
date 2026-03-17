import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Users, FileText, CreditCard, TrendingUp } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';

interface Stats {
  totalAthletes: number;
  totalContent: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
}

interface SubRow {
  created_at: string | null;
  plan: string;
  status: string;
}

const PLAN_PRICES: Record<string, number> = {
  monthly: 29,
  quarterly: 79,
  annual: 279,
};

function groupByMonth(subs: SubRow[]) {
  const map = new Map<string, { subscribers: number; revenue: number }>();

  // Last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, { subscribers: 0, revenue: 0 });
  }

  for (const s of subs) {
    if (!s.created_at) continue;
    const d = new Date(s.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map.has(key)) continue;
    const entry = map.get(key)!;
    entry.subscribers += 1;
    entry.revenue += PLAN_PRICES[s.plan] || 0;
  }

  return Array.from(map.entries()).map(([month, data]) => {
    const [y, m] = month.split('-');
    const label = new Date(Number(y), Number(m) - 1).toLocaleDateString('pt-BR', { month: 'short' });
    return { month: label, ...data };
  });
}

const subscribersChartConfig = {
  subscribers: { label: 'Novos Assinantes', color: 'hsl(var(--primary))' },
};

const revenueChartConfig = {
  revenue: { label: 'Receita (R$)', color: 'hsl(142 76% 36%)' },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalAthletes: 0, totalContent: 0, totalSubscriptions: 0, activeSubscriptions: 0 });
  const [recentAthletes, setRecentAthletes] = useState<any[]>([]);
  const [allSubs, setAllSubs] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [athletes, content, subs, activeSubs, recent, subsData] = await Promise.all([
        supabase.from('athlete_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('content').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('athlete_profiles').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('subscriptions').select('created_at, plan, status'),
      ]);

      setStats({
        totalAthletes: athletes.count || 0,
        totalContent: content.count || 0,
        totalSubscriptions: subs.count || 0,
        activeSubscriptions: activeSubs.count || 0,
      });
      setRecentAthletes(recent.data || []);
      setAllSubs((subsData.data as SubRow[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const chartData = useMemo(() => groupByMonth(allSubs), [allSubs]);

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

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Novos Assinantes (últimos 6 meses)</h3>
              <ChartContainer config={subscribersChartConfig} className="h-[220px] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-muted-foreground" fontSize={12} />
                  <YAxis allowDecimals={false} className="text-muted-foreground" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="subscribers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Receita Estimada (últimos 6 meses)</h3>
              <ChartContainer config={revenueChartConfig} className="h-[220px] w-full">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-muted-foreground" fontSize={12} />
                  <YAxis className="text-muted-foreground" fontSize={12} tickFormatter={(v) => `R$${v}`} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(142 76% 36%)" strokeWidth={2} dot={{ fill: 'hsl(142 76% 36%)' }} />
                </LineChart>
              </ChartContainer>
            </div>
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
