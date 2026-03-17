import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Search } from 'lucide-react';

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSubs = async () => {
    setLoading(true);
    let query = supabase
      .from('subscriptions')
      .select('*, athlete_profiles(name, username), profiles:subscriber_id(full_name, email)')
      .order('created_at', { ascending: false });
    if (search.trim()) {
      query = query.eq('status', search.toLowerCase());
    }
    const { data } = await query.limit(50);
    setSubs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSubs(); }, [search]);

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400',
    canceled: 'bg-destructive/10 text-destructive',
    pending: 'bg-yellow-500/10 text-yellow-400',
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Assinaturas</h1>
        <span className="text-sm text-muted-foreground">{subs.length} encontrado(s)</span>
      </div>

      <div className="flex gap-2 mb-4">
        {['Todas', 'active', 'canceled', 'pending'].map((filter) => (
          <button
            key={filter}
            onClick={() => setSearch(filter === 'Todas' ? '' : filter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              (filter === 'Todas' && !search) || search === filter
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter === 'Todas' ? 'Todas' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-muted-foreground font-medium">Assinante</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Atleta</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Plano</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => {
                const subscriber = s.profiles as any;
                const athlete = s.athlete_profiles as any;
                return (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-foreground">{subscriber?.full_name || subscriber?.email || '—'}</td>
                    <td className="p-3 text-muted-foreground">{athlete?.name || '—'}</td>
                    <td className="p-3 text-muted-foreground capitalize">{s.plan}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColors[s.status] || 'bg-muted text-muted-foreground'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                );
              })}
              {subs.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nenhuma assinatura encontrada</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
