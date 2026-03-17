import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Search, Ban, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAthletes() {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAthletes = async () => {
    setLoading(true);
    let query = supabase.from('athlete_profiles').select('*').order('created_at', { ascending: false });
    if (search.trim()) {
      query = query.or(`name.ilike.%${search}%,username.ilike.%${search}%`);
    }
    const { data } = await query.limit(50);
    setAthletes(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAthletes(); }, [search]);

  const deleteAthlete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o perfil de ${name}? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from('athlete_profiles').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao excluir: ' + error.message);
    } else {
      toast.success(`Perfil de ${name} excluído`);
      fetchAthletes();
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Atletas</h1>
        <span className="text-sm text-muted-foreground">{athletes.length} encontrado(s)</span>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome ou username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-muted-foreground font-medium">Nome</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Username</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Faixa</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Academia</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Preço mensal</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {athletes.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-foreground font-medium">{a.name}</td>
                  <td className="p-3 text-muted-foreground">@{a.username}</td>
                  <td className="p-3 text-muted-foreground capitalize">{a.belt}</td>
                  <td className="p-3 text-muted-foreground">{a.academy || '—'}</td>
                  <td className="p-3 text-muted-foreground">R$ {a.monthly_price}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => deleteAthlete(a.id, a.name)}
                      className="text-xs text-destructive hover:underline"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {athletes.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum atleta encontrado</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
