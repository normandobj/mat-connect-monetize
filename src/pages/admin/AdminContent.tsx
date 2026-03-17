import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminContent() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    setLoading(true);
    let query = supabase
      .from('content')
      .select('*, athlete_profiles(name, username)')
      .order('created_at', { ascending: false });
    if (search.trim()) {
      query = query.ilike('title_pt', `%${search}%`);
    }
    const { data } = await query.limit(50);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchContent(); }, [search]);

  const deleteContent = async (id: string, title: string) => {
    if (!confirm(`Excluir "${title}"?`)) return;
    const { error } = await supabase.from('content').delete().eq('id', id);
    if (error) {
      toast.error('Erro: ' + error.message);
    } else {
      toast.success('Conteúdo excluído');
      fetchContent();
    }
  };

  const typeLabels: Record<string, string> = {
    drill: 'Drill',
    position: 'Posição',
    plan: 'Planilha',
    live: 'Live',
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Conteúdos</h1>
        <span className="text-sm text-muted-foreground">{items.length} encontrado(s)</span>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por título..."
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
                <th className="text-left p-3 text-muted-foreground font-medium">Título</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Tipo</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Atleta</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Visibilidade</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Data</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-foreground font-medium max-w-[200px] truncate">{c.title_pt}</td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {typeLabels[c.type] || c.type}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{(c.athlete_profiles as any)?.name || '—'}</td>
                  <td className="p-3 text-muted-foreground capitalize">{c.visibility}</td>
                  <td className="p-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => deleteContent(c.id, c.title_pt)}
                      className="text-xs text-destructive hover:underline"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum conteúdo encontrado</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
