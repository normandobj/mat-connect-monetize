import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { ArrowLeft, BookOpen, Clock, Play, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import bannerCursoFallback from '@/assets/banner-curso-destaque.jpg';

interface CourseInfo {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  badge_text: string | null;
  image_url: string | null;
  students_count: string | null;
}

interface Module {
  id: string;
  title: string;
  sort_order: number;
  lessons: { id: string; title: string; duration: string | null; sort_order: number }[];
}

export default function CursoDestaque() {
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [courseRes, modulesRes, lessonsRes] = await Promise.all([
        supabase.from('featured_course').select('*').limit(1).single(),
        supabase.from('course_modules').select('*').order('sort_order'),
        supabase.from('course_lessons').select('*').order('sort_order'),
      ]);

      if (courseRes.data) setCourse(courseRes.data as any);

      const mods = (modulesRes.data || []) as any[];
      const lessons = (lessonsRes.data || []) as any[];

      setModules(
        mods.map((m: any) => ({
          ...m,
          lessons: lessons.filter((l: any) => l.module_id === m.id),
        }))
      );
      setLoading(false);
    }
    load();
  }, []);

  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);
  const bannerImg = course?.image_url || bannerCursoFallback;

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>
      </AppShell>
    );
  }

  if (!course) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64 text-muted-foreground">Curso não encontrado</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="pb-24">
        {/* Hero */}
        <div className="relative h-56 overflow-hidden">
          <img src={bannerImg} alt={course.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <button
            onClick={() => navigate('/treinos')}
            className="absolute top-4 left-4 p-2 rounded-full bg-background/60 backdrop-blur-sm text-foreground"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              {course.badge_text && (
                <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full">
                  {course.badge_text}
                </span>
              )}
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Star size={10} /> Em destaque
              </span>
            </div>
            <h1 className="text-2xl font-black text-foreground">{course.title}</h1>
            {course.subtitle && <p className="text-xs text-muted-foreground mt-1">{course.subtitle}</p>}
          </div>
        </div>

        <div className="px-4 pt-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Módulos', value: String(modules.length), icon: BookOpen },
              { label: 'Aulas', value: String(totalLessons), icon: Play },
              { label: 'Alunos', value: course.students_count || '0', icon: Users },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-xl p-3 text-center border border-border">
                <s.icon size={16} className="mx-auto text-primary mb-1" />
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {course.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{course.description}</p>
          )}

          {/* Modules */}
          {modules.map((mod) => (
            <div key={mod.id} className="mb-6">
              <h2 className="text-sm font-bold text-foreground mb-3">{mod.title}</h2>
              <div className="space-y-2">
                {mod.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 bg-card border border-border rounded-lg px-3 py-2.5"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shrink-0">
                      <Play size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{lesson.title}</p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                      <Clock size={10} /> {lesson.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
