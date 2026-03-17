import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
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

interface CourseInfo {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  badge_text: string | null;
  image_url: string | null;
  students_count: string | null;
}

interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
}

interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  duration: string | null;
  sort_order: number;
}

type Tab = 'banners' | 'protocol' | 'curso';

export default function AdminTreinos() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [days, setDays] = useState<ProtocolDay[]>([]);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [editDay, setEditDay] = useState<ProtocolDay | null>(null);
  const [tab, setTab] = useState<Tab>('banners');
  const [loading, setLoading] = useState(true);

  // Course state
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [courseModules, setCourseModules] = useState<CourseModule[]>([]);
  const [courseLessons, setCourseLessons] = useState<CourseLesson[]>([]);
  const [editCourse, setEditCourse] = useState<CourseInfo | null>(null);
  const [editModule, setEditModule] = useState<CourseModule | null>(null);
  const [editLesson, setEditLesson] = useState<CourseLesson | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [b, d, c, cm, cl] = await Promise.all([
      supabase.from('training_banners').select('*').order('sort_order'),
      supabase.from('protocol_days').select('*').order('sort_order'),
      supabase.from('featured_course').select('*').limit(1).single(),
      supabase.from('course_modules').select('*').order('sort_order'),
      supabase.from('course_lessons').select('*').order('sort_order'),
    ]);
    setBanners((b.data as any[]) || []);
    setDays((d.data as any[]) || []);
    if (c.data) setCourse(c.data as any);
    setCourseModules((cm.data as any[]) || []);
    setCourseLessons((cl.data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // ---- Banner CRUD ----
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

  // ---- Protocol CRUD ----
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

  // ---- Course CRUD ----
  const saveCourseInfo = async () => {
    if (!editCourse || !course) return;
    const { id, ...data } = editCourse;
    const { error } = await supabase.from('featured_course').update(data as any).eq('id', course.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Curso atualizado!');
    setEditCourse(null);
    fetchData();
  };

  const saveModule = async () => {
    if (!editModule || !course) return;
    const { id, ...data } = editModule;
    if (id.startsWith('new-')) {
      const { error } = await supabase.from('course_modules').insert({ ...data, course_id: course.id } as any);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from('course_modules').update({ title: data.title, sort_order: data.sort_order } as any).eq('id', id);
      if (error) { toast.error(error.message); return; }
    }
    toast.success('Módulo salvo!');
    setEditModule(null);
    fetchData();
  };

  const deleteModule = async (id: string) => {
    if (!confirm('Excluir módulo e todas as aulas?')) return;
    await supabase.from('course_modules').delete().eq('id', id);
    toast.success('Módulo excluído');
    fetchData();
  };

  const saveLesson = async () => {
    if (!editLesson) return;
    const { id, ...data } = editLesson;
    if (id.startsWith('new-')) {
      const { error } = await supabase.from('course_lessons').insert(data as any);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from('course_lessons').update({ title: data.title, duration: data.duration, sort_order: data.sort_order } as any).eq('id', id);
      if (error) { toast.error(error.message); return; }
    }
    toast.success('Aula salva!');
    setEditLesson(null);
    fetchData();
  };

  const deleteLesson = async (id: string) => {
    if (!confirm('Excluir esta aula?')) return;
    await supabase.from('course_lessons').delete().eq('id', id);
    toast.success('Aula excluída');
    fetchData();
  };

  const inputCls = "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground";

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Gerenciar Treinos</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {([['banners', 'Banners'], ['protocol', 'Protocolo 21 Dias'], ['curso', 'Curso em Destaque']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Carregando...</div>
      ) : tab === 'banners' ? (
        /* ============ BANNERS TAB ============ */
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

          {editBanner && (
            <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-foreground">{editBanner.id.startsWith('new-') ? 'Novo Banner' : 'Editar Banner'}</span>
                <button onClick={() => setEditBanner(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Título</label>
                  <input value={editBanner.title} onChange={e => setEditBanner({...editBanner, title: e.target.value})} className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
                  <textarea value={editBanner.description || ''} onChange={e => setEditBanner({...editBanner, description: e.target.value})} rows={2} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Badge</label>
                  <input value={editBanner.badge_text || ''} onChange={e => setEditBanner({...editBanner, badge_text: e.target.value})} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Cor do Badge</label>
                  <select value={editBanner.badge_color || 'primary'} onChange={e => setEditBanner({...editBanner, badge_color: e.target.value})} className={inputCls}>
                    <option value="primary">Azul (Primary)</option>
                    <option value="destructive">Vermelho (Destructive)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Meta texto</label>
                  <input value={editBanner.meta_text || ''} onChange={e => setEditBanner({...editBanner, meta_text: e.target.value})} placeholder="Ex: 21 dias" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA</label>
                  <input value={editBanner.cta_text || ''} onChange={e => setEditBanner({...editBanner, cta_text: e.target.value})} className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Link (rota)</label>
                  <input value={editBanner.link} onChange={e => setEditBanner({...editBanner, link: e.target.value})} placeholder="/treinos/protocolo-21" className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">URL da imagem</label>
                  <input value={editBanner.image_url || ''} onChange={e => setEditBanner({...editBanner, image_url: e.target.value})} placeholder="https://..." className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Ordem</label>
                  <input type="number" value={editBanner.sort_order} onChange={e => setEditBanner({...editBanner, sort_order: parseInt(e.target.value) || 0})} className={inputCls} />
                </div>
              </div>
              <button onClick={saveBanner} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium mt-2">
                <Save size={14} /> Salvar
              </button>
            </div>
          )}

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
      ) : tab === 'protocol' ? (
        /* ============ PROTOCOL TAB ============ */
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
                  <input type="number" value={editDay.day_number} onChange={e => setEditDay({...editDay, day_number: parseInt(e.target.value) || 1})} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Semana nº</label>
                  <input type="number" value={editDay.week_number} onChange={e => setEditDay({...editDay, week_number: parseInt(e.target.value) || 1})} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Título da semana</label>
                  <input value={editDay.week_title || ''} onChange={e => setEditDay({...editDay, week_title: e.target.value})} placeholder="Semana 1 — Fundamentos" className={inputCls} />
                </div>
                <div className="col-span-3">
                  <label className="text-xs text-muted-foreground mb-1 block">Foco do dia</label>
                  <input value={editDay.focus} onChange={e => setEditDay({...editDay, focus: e.target.value})} className={inputCls} />
                </div>
              </div>
              <button onClick={saveDay} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium mt-2">
                <Save size={14} /> Salvar
              </button>
            </div>
          )}

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
      ) : (
        /* ============ CURSO EM DESTAQUE TAB ============ */
        <div>
          {/* Course info */}
          {course && !editCourse && (
            <div className="bg-card border border-border rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-foreground">Informações do Curso</h3>
                <button onClick={() => setEditCourse({ ...course })} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50">
                  <Pencil size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Título:</span> <span className="text-foreground ml-1">{course.title}</span></div>
                <div><span className="text-muted-foreground">Subtítulo:</span> <span className="text-foreground ml-1">{course.subtitle || '—'}</span></div>
                <div><span className="text-muted-foreground">Badge:</span> <span className="text-foreground ml-1">{course.badge_text || '—'}</span></div>
                <div><span className="text-muted-foreground">Alunos:</span> <span className="text-foreground ml-1">{course.students_count || '—'}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Descrição:</span> <span className="text-foreground ml-1">{course.description || '—'}</span></div>
              </div>
            </div>
          )}

          {editCourse && (
            <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-foreground">Editar Curso</span>
                <button onClick={() => setEditCourse(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Título</label>
                  <input value={editCourse.title} onChange={e => setEditCourse({ ...editCourse, title: e.target.value })} className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Subtítulo</label>
                  <input value={editCourse.subtitle || ''} onChange={e => setEditCourse({ ...editCourse, subtitle: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Badge</label>
                  <input value={editCourse.badge_text || ''} onChange={e => setEditCourse({ ...editCourse, badge_text: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nº de Alunos</label>
                  <input value={editCourse.students_count || ''} onChange={e => setEditCourse({ ...editCourse, students_count: e.target.value })} className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">URL da imagem</label>
                  <input value={editCourse.image_url || ''} onChange={e => setEditCourse({ ...editCourse, image_url: e.target.value })} placeholder="https://..." className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
                  <textarea value={editCourse.description || ''} onChange={e => setEditCourse({ ...editCourse, description: e.target.value })} rows={3} className={inputCls} />
                </div>
              </div>
              <button onClick={saveCourseInfo} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium mt-2">
                <Save size={14} /> Salvar
              </button>
            </div>
          )}

          {/* Modules + Lessons */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-foreground">Módulos & Aulas</h3>
            <button
              onClick={() => setEditModule({ id: 'new-' + Date.now(), course_id: course?.id || '', title: '', sort_order: courseModules.length + 1 })}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium"
            >
              <Plus size={14} /> Novo Módulo
            </button>
          </div>

          {/* Edit module form */}
          {editModule && (
            <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-foreground">{editModule.id.startsWith('new-') ? 'Novo Módulo' : 'Editar Módulo'}</span>
                <button onClick={() => setEditModule(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="text-xs text-muted-foreground mb-1 block">Título</label>
                  <input value={editModule.title} onChange={e => setEditModule({ ...editModule, title: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Ordem</label>
                  <input type="number" value={editModule.sort_order} onChange={e => setEditModule({ ...editModule, sort_order: parseInt(e.target.value) || 0 })} className={inputCls} />
                </div>
              </div>
              <button onClick={saveModule} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium mt-2">
                <Save size={14} /> Salvar
              </button>
            </div>
          )}

          {/* Edit lesson form */}
          {editLesson && (
            <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-foreground">{editLesson.id.startsWith('new-') ? 'Nova Aula' : 'Editar Aula'}</span>
                <button onClick={() => setEditLesson(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Título da Aula</label>
                  <input value={editLesson.title} onChange={e => setEditLesson({ ...editLesson, title: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Duração</label>
                  <input value={editLesson.duration || ''} onChange={e => setEditLesson({ ...editLesson, duration: e.target.value })} placeholder="12:30" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Ordem</label>
                  <input type="number" value={editLesson.sort_order} onChange={e => setEditLesson({ ...editLesson, sort_order: parseInt(e.target.value) || 0 })} className={inputCls} />
                </div>
              </div>
              <button onClick={saveLesson} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium mt-2">
                <Save size={14} /> Salvar
              </button>
            </div>
          )}

          {/* Module list with lessons */}
          <div className="space-y-4">
            {courseModules.map((mod) => {
              const modLessons = courseLessons.filter(l => l.module_id === mod.id);
              return (
                <div key={mod.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-foreground">{mod.title}</h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditLesson({ id: 'new-' + Date.now(), module_id: mod.id, title: '', duration: '0:00', sort_order: modLessons.length + 1 })}
                        className="p-1.5 rounded-md text-primary hover:bg-primary/10"
                        title="Adicionar aula"
                      >
                        <Plus size={14} />
                      </button>
                      <button onClick={() => setEditModule(mod)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteModule(mod.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {modLessons.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhuma aula neste módulo</p>
                  ) : (
                    <div className="space-y-1">
                      {modLessons.map((l) => (
                        <div key={l.id} className="flex items-center gap-3 bg-background border border-border rounded-lg px-3 py-2">
                          <span className="text-xs text-foreground flex-1 truncate">{l.title}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0">{l.duration}</span>
                          <button onClick={() => setEditLesson(l)} className="p-1 text-muted-foreground hover:text-foreground"><Pencil size={12} /></button>
                          <button onClick={() => deleteLesson(l.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {courseModules.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum módulo cadastrado</p>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
