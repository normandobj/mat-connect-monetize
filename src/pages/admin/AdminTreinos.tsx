import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Pencil, Trash2, Save, X, GripVertical, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface Banner {
  id: string;
  title: string;
  description: string | null;
  badge_text: string | null;
  badge_color: string | null;
  meta_text: string | null;
  cta_text: string | null;
  link: string;
  image_url: string | null;
  sort_order: number;
  visible: boolean;
}

interface ProtocolDay {
  id: string;
  day_number: number;
  week_number: number;
  week_title: string | null;
  focus: string;
}

export default function AdminTreinos() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [days, setDays] = useState<ProtocolDay[]>([]);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [editDay, setEditDay] = useState<ProtocolDay | null>(null);
  const [tab, setTab] = useState<'banners' | 'protocol'>('banners');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [b, d] = await Promise.all([
      supabase.from('training_banners').select('*').order('sort_order'),
      supabase.from('protocol_days').select('*').order('sort_order'),
    ]);
    setBanners((b.data as any[]) || []);
    setDays((d.data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Banner CRUD
  const saveBanner = async () => {
    if (!editBanner) return;
    const { id, ...data } = editBanner;
    if (id.startsWith('new-')) {
      const { error } = await supabase.from('training_banners').insert(data as any);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from('training_banners').update(data as any).eq('id', id);
      if (error) { toast.error(error.message); return; }
    }
    toast.success('Banner salvo!');
    setEditBanner(null);
    fetchData();
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Excluir este banner?')) return;
    await supabase.from('training_banners').delete().eq('id', id);
    toast.success('Banner excluído');
    fetchData();
  };

  const toggleVisibility = async (b: Banner) => {
    await supabase.from('training_banners').update({ visible: !b.visible } as any).eq('id', b.id);
    fetchData();
  };

  // Protocol day CRUD
  const saveDay = async () => {
    if (!editDay) return;
    const { id, ...data } = editDay;
    if (id.startsWith('new-')) {
      const { error } = await supabase.from('protocol_days').insert({ ...data, sort_order: data.day_number } as any);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from('protocol_days').update(data as any).eq('id', id);
      if (error) { toast.error(error.message); return; }
    }
    toast.success('Dia salvo!');
    setEditDay(null);
    fetchData();
  };

  const deleteDay = async (id: string) => {
    if (!confirm('Excluir este dia?')) return;
    await supabase.from('protocol_days').delete().eq('id', id);
    toast.success('Dia excluído');
    fetchData();
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Gerenciar Treinos</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['banners', 'protocol'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'banners' ? 'Banners' : 'Protocolo 21 Dias'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Carregando...</div>
      ) : tab === 'banners' ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground">{banners.length} banner(s)</span>
            <button
              onClick={() => setEditBanner({ id: 'new-' + Date.now(), title: '', description: '', badge_text: '', badge_color: 'primary', meta_text: '', cta_text: 'Saiba mais', link: '/treinos', image_url: '', sort_order: banners.length, visible: true })}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium"
            >
              <Plus size={14} /> Novo Banner
            </button>
          </div>

          {/* Edit modal */}
          {editBanner && (
            <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-foreground">{editBanner.id.startsWith('new-') ? 'Novo Banner' : 'Editar Banner'}</span>
                <button onClick={() => setEditBanner(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Título</label>
                  <input value={editBanner.title} onChange={e => setEditBanner({...editBanner, title: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
                  <textarea value={editBanner.description || ''} onChange={e => setEditBanner({...editBanner, description: e.target.value})} rows={2} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Badge</label>
                  <input value={editBanner.badge_text || ''} onChange={e => setEditBanner({...editBanner, badge_text: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Cor do Badge</label>
                  <select value={editBanner.badge_color || 'primary'} onChange={e => setEditBanner({...editBanner, badge_color: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground">
                    <option value="primary">Azul (Primary)</option>
                    <option value="destructive">Vermelho (Destructive)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Meta texto</label>
                  <input value={editBanner.meta_text || ''} onChange={e => setEditBanner({...editBanner, meta_text: e.target.value})} placeholder="Ex: 21 dias" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA</label>
                  <input value={editBanner.cta_text || ''} onChange={e => setEditBanner({...editBanner, cta_text: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Link (rota)</label>
                  <input value={editBanner.link} onChange={e => setEditBanner({...editBanner, link: e.target.value})} placeholder="/treinos/protocolo-21" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">URL da imagem</label>
                  <input value={editBanner.image_url || ''} onChange={e => setEditBanner({...editBanner, image_url: e.target.value})} placeholder="https://..." className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Ordem</label>
                  <input type="number" value={editBanner.sort_order} onChange={e => setEditBanner({...editBanner, sort_order: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground" />
                </div>
              </div>
              <button onClick={saveBanner} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium mt-2">
                <Save size={14} /> Salvar
              </button>
            </div>
          )}

          {/* Banner list */}
          <div className="space-y-2">
            {banners.map((b) => (
              <div key={b.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                {b.image_url && <img src={b.image_url} alt="" className="w-20 h-14 object-cover rounded-lg shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{b.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.link}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleVisibility(b)} className={`p-1.5 rounded-md ${b.visible ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-muted-foreground hover:bg-muted/50'}`}>
                    {b.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => setEditBanner(b)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteBanner(b.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground">{days.length} dia(s)</span>
            <button
              onClick={() => setEditDay({ id: 'new-' + Date.now(), day_number: days.length + 1, week_number: Math.ceil((days.length + 1) / 7), week_title: '', focus: '' })}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium"
            >
              <Plus size={14} /> Novo Dia
            </button>
          </div>

          {editDay && (
            <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-foreground">{editDay.id.startsWith('new-') ? 'Novo Dia' : 'Editar Dia'}</span>
                <button onClick={() => setEditDay(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Dia nº</label>
                  <input type="number" value={editDay.day_number} onChange={e => setEditDay({...editDay, day_number: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Semana nº</label>
                  <input type="number" value={editDay.week_number} onChange={e => setEditDay({...editDay, week_number: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Título da semana</label>
                  <input value={editDay.week_title || ''} onChange={e => setEditDay({...editDay, week_title: e.target.value})} placeholder="Semana 1 — Fundamentos" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground" />
                </div>
                <div className="col-span-3">
                  <label className="text-xs text-muted-foreground mb-1 block">Foco do dia</label>
                  <input value={editDay.focus} onChange={e => setEditDay({...editDay, focus: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground" />
                </div>
              </div>
              <button onClick={saveDay} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium mt-2">
                <Save size={14} /> Salvar
              </button>
            </div>
          )}

          {/* Days grouped by week */}
          {[1, 2, 3].map(week => {
            const weekDays = days.filter(d => d.week_number === week);
            if (weekDays.length === 0) return null;
            const weekTitle = weekDays[0]?.week_title || `Semana ${week}`;
            return (
              <div key={week} className="mb-4">
                <h3 className="text-sm font-bold text-foreground mb-2">{weekTitle}</h3>
                <div className="space-y-1">
                  {weekDays.sort((a, b) => a.day_number - b.day_number).map(d => (
                    <div key={d.id} className="flex items-center gap-3 bg-card border border-border rounded-lg px-3 py-2.5">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 rounded-md px-2 py-1 min-w-[48px] text-center">Dia {d.day_number}</span>
                      <span className="text-xs text-foreground flex-1">{d.focus}</span>
                      <button onClick={() => setEditDay(d)} className="p-1 text-muted-foreground hover:text-foreground"><Pencil size={12} /></button>
                      <button onClick={() => deleteDay(d.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
