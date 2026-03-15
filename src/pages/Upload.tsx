import { AppShell } from '@/components/AppShell';
import { Video, Dumbbell, FileText, Radio, ArrowLeft, Upload as UploadIcon, Globe, AlignLeft, AlertTriangle, Info } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ACCEPTED_FORMATS = ['video/mp4', 'video/quicktime'];
const MAX_SIZE_MB = 100;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const MAX_DURATION_SECONDS = 120;

const contentTypes = [
  { key: 'drill', icon: Video, label: 'Drill Clip', desc: 'Video curto de tecnica' },
  { key: 'position', icon: Dumbbell, label: 'Posicao', desc: 'Detalhamento de posicao' },
  { key: 'plan', icon: FileText, label: 'Planilha de Treino', desc: 'Escreva sua planilha em texto' },
  { key: 'live', icon: Radio, label: 'Agendar Live', desc: 'Transmissao ao vivo' },
];

const UploadPage = () => {
  const navigate = useNavigate();
  const { user, athleteProfile, loading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [step, setStep] = useState(1);
  const [contentType, setContentType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [visibility, setVisibility] = useState<'subscribers' | 'free'>('subscribers');
  const [planText, setPlanText] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoErrors, setVideoErrors] = useState<string[]>([]);
  const [videoWarning, setVideoWarning] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPlan = contentType === 'plan';

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading]);

  const handleVideoSelect = (file: File) => {
    const errors: string[] = [];
    setVideoWarning(null);
    setVideoErrors([]);
    setVideoDuration(null);

    // Format check
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      errors.push(isEn ? 'Format not supported. Use MP4 or MOV.' : 'Formato não suportado. Use MP4 ou MOV.');
    }

    // Size check
    if (file.size > MAX_SIZE_BYTES) {
      errors.push(isEn ? `File too large. Maximum size: ${MAX_SIZE_MB}MB.` : `Vídeo muito grande. Tamanho máximo: ${MAX_SIZE_MB}MB.`);
    }

    if (errors.length > 0) {
      setVideoErrors(errors);
      setVideoFile(null);
      return;
    }

    // Duration + orientation check via metadata
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const dur = Math.round(video.duration);
      setVideoDuration(dur);

      const metaErrors: string[] = [];
      if (dur > MAX_DURATION_SECONDS) {
        metaErrors.push(isEn ? 'Video too long. Maximum 2 minutes.' : 'Vídeo muito longo. Máximo de 2 minutos.');
      }

      if (metaErrors.length > 0) {
        setVideoErrors(metaErrors);
        setVideoFile(null);
        URL.revokeObjectURL(video.src);
        return;
      }

      // Orientation warning (not blocking)
      if (video.videoWidth > video.videoHeight) {
        setVideoWarning(
          isEn
            ? 'Tip: vertical videos (9:16) work best in the app, like Instagram Reels.'
            : 'Dica: vídeos na vertical (9:16) funcionam melhor no app, como Reels do Instagram.'
        );
      }

      setVideoFile(file);
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => {
      setVideoErrors([isEn ? 'Could not read video metadata.' : 'Não foi possível ler os metadados do vídeo.']);
      URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(file);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const bjjTerms: Record<string, string> = {
    'Raspagem': 'Sweep', 'raspagem': 'sweep',
    'Guarda': 'Guard', 'guarda': 'guard',
    'Passagem': 'Pass', 'passagem': 'pass',
    'Finalização': 'Submission', 'finalização': 'submission',
    'Posição': 'Position', 'posição': 'position',
    'Treino': 'Training', 'treino': 'training',
    'Planilha': 'Training Plan', 'planilha': 'training plan',
    'Drill': 'Drill', 'Faixa': 'Belt', 'faixa': 'belt',
    'Competição': 'Competition', 'competição': 'competition',
    'Gancho': 'Hook', 'gancho': 'hook',
  };
  const mockTranslate = (text: string) =>
    Object.entries(bjjTerms).reduce((t, [pt, en]) => t.split(pt).join(en), text);
  const translatedTitle = title ? mockTranslate(title) : '';
  const translatedDesc = description ? mockTranslate(description) : '';

  const handlePost = async () => {
    if (!athleteProfile) {
      toast.error(isEn ? 'You need to complete your athlete profile first.' : 'Você precisa completar seu perfil de atleta primeiro.');
      return;
    }

    setUploading(true);
    try {
      let videoUrl = null;

      if (videoFile) {
        const ext = videoFile.name.split('.').pop();
        const path = `${user!.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('content').upload(path, videoFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('content').getPublicUrl(path);
        videoUrl = publicUrl;
      }

      const { error } = await supabase.from('content').insert({
        athlete_id: athleteProfile.id,
        type: contentType,
        title_pt: title,
        title_en: autoTranslate ? mockTranslate(title) : null,
        description_pt: description,
        description_en: autoTranslate ? mockTranslate(description) : null,
        plan_text_pt: isPlan ? planText : null,
        plan_text_en: isPlan && autoTranslate ? mockTranslate(planText) : null,
        video_url: videoUrl,
        visibility,
        duration: videoDuration ? formatDuration(videoDuration) : null,
      });

      if (error) throw error;
      toast.success(isEn ? 'Content published!' : 'Conteúdo publicado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const specsText = isEn
    ? 'Formats: MP4 or MOV · Max 100MB · Max 2 min · Vertical (9:16) recommended'
    : 'Formatos: MP4 ou MOV · Máx. 100MB · Máx. 2 min · Vertical (9:16) recomendado';

  return (
    <AppShell showNav={false}>
      <div className="px-4 py-4 min-h-screen flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">{isEn ? 'New Content' : 'Novo Conteúdo'}</h1>
            <p className="text-xs text-muted-foreground">{isEn ? `Step ${step} of 4` : `Etapa ${step} de 4`}</p>
          </div>
        </div>

        <div className="flex gap-1 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-3 flex-1">
            <h2 className="text-sm font-bold text-foreground">{isEn ? 'Choose content type' : 'Escolha o tipo de conteúdo'}</h2>
            {contentTypes.map((ct) => (
              <button key={ct.key} onClick={() => { setContentType(ct.key); setStep(2); }}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-colors active:scale-[0.98] ${contentType === ct.key ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center"><ct.icon size={22} className="text-primary" /></div>
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">{ct.label}</p>
                  <p className="text-xs text-muted-foreground">{ct.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col">
            {isPlan ? (
              <>
                <div className="flex items-center gap-2 mb-1"><AlignLeft size={16} className="text-primary" /><h2 className="text-sm font-bold text-foreground">{isEn ? 'Write your plan' : 'Escreva sua planilha'}</h2></div>
                <p className="text-xs text-muted-foreground mb-4">{isEn ? 'Describe exercises, sets, reps and notes.' : 'Descreva os exercicios, series, repeticoes e observacoes.'}</p>
                <textarea value={planText} onChange={(e) => setPlanText(e.target.value)}
                  placeholder={`Ex:\n\nSegunda — Forca\n• Agachamento 4x8\n• Levantamento terra 3x5`}
                  rows={14} className="flex-1 w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed" />
              </>
            ) : (
              <>
                <h2 className="text-sm font-bold text-foreground mb-2">{isEn ? 'Upload content' : 'Enviar conteúdo'}</h2>
                
                {/* Specs info box */}
                <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 mb-4">
                  <Info size={14} className="text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{specsText}</p>
                </div>

                <input type="file" ref={fileInputRef} accept="video/mp4,video/quicktime,.mp4,.mov" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleVideoSelect(e.target.files[0]); }} />
                
                {videoFile ? (
                  <div className="flex-1 max-h-72 rounded-xl overflow-hidden border border-border relative">
                    <video
                      src={URL.createObjectURL(videoFile)}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      preload="metadata"
                    />
                    <button onClick={() => { setVideoFile(null); setVideoDuration(null); setVideoErrors([]); setVideoWarning(null); }}
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-xs font-semibold px-2 py-1 rounded-md">
                      {isEn ? 'Change' : 'Trocar'}
                    </button>
                    {videoDuration && (
                      <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-1 rounded-md tabular-nums">
                        {formatDuration(videoDuration)}
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex-1 max-h-60 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 bg-card/50">
                    <UploadIcon size={32} className="text-muted-foreground" />
                    <p className="text-sm font-semibold text-muted-foreground">{isEn ? 'Record or select video' : 'Gravar ou selecionar video'}</p>
                    <p className="text-xs text-muted-foreground">MP4 / MOV · Max {MAX_SIZE_MB}MB · Max 2min</p>
                  </button>
                )}

                {/* Validation errors */}
                {videoErrors.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {videoErrors.map((err, i) => (
                      <div key={i} className="flex items-center gap-2 text-red-500 text-xs">
                        <AlertTriangle size={12} className="flex-shrink-0" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Orientation warning */}
                {videoWarning && !videoErrors.length && (
                  <div className="mt-3 flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                    <AlertTriangle size={12} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-yellow-600 dark:text-yellow-400">{videoWarning}</p>
                  </div>
                )}
              </>
            )}
            <button onClick={() => setStep(3)} disabled={(isPlan && planText.trim().length === 0) || (!isPlan && !videoFile && contentType !== 'live')}
              className="mt-4 bg-primary text-primary-foreground font-bold text-sm py-3 rounded-md disabled:opacity-40 disabled:cursor-not-allowed">{isEn ? 'Continue' : 'Continuar'}</button>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-foreground">{isEn ? 'Add details' : 'Adicionar detalhes'}</h2>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{isEn ? 'Title (Portuguese)' : 'Título (Português)'}</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Raspagem de Gancho" className="mt-1 w-full bg-card border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{isEn ? 'Description (Portuguese)' : 'Descrição (Português)'}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={isEn ? 'Describe your content...' : 'Descreva seu conteúdo...'} rows={3} className="mt-1 w-full bg-card border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
            </div>
            <div className="flex items-center justify-between bg-card border border-border rounded-md p-3">
              <div className="flex items-center gap-2"><Globe size={16} className="text-primary" /><span className="text-sm font-medium text-foreground">{isEn ? 'Auto-translate to English' : 'Traduzir para inglês'}</span></div>
              <button onClick={() => setAutoTranslate(!autoTranslate)} className={`w-10 h-5 rounded-full transition-colors ${autoTranslate ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`w-4 h-4 rounded-full bg-foreground transition-transform ${autoTranslate ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {autoTranslate && title && (
              <div className="bg-card/50 border border-border rounded-md p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">{isEn ? 'English Preview' : 'Preview em Inglês'}</p>
                <p className="text-sm font-semibold text-foreground">{translatedTitle}</p>
                {description && <p className="text-xs text-muted-foreground mt-1">{translatedDesc}</p>}
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{isEn ? 'Visibility' : 'Visibilidade'}</label>
              <div className="flex gap-2 mt-1">
                {[{ key: 'subscribers' as const, label: isEn ? 'Subscribers only' : 'Apenas assinantes' }, { key: 'free' as const, label: isEn ? 'Free preview' : 'Preview gratuito' }].map((v) => (
                  <button key={v.key} onClick={() => setVisibility(v.key)}
                    className={`flex-1 py-2 rounded-md text-xs font-semibold border transition-colors ${visibility === v.key ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground'}`}>{v.label}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(4)} className="mt-auto bg-primary text-primary-foreground font-bold text-sm py-3 rounded-md">{isEn ? 'Preview & Post' : 'Revisar & Postar'}</button>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-foreground">{isEn ? 'Review & Post' : 'Revisar & Postar'}</h2>
            <div className="bg-card border border-border rounded-lg p-4 shadow-card">
              {isPlan ? (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0"><FileText size={18} className="text-primary" /></div>
                  <div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{isEn ? 'Training Plan' : 'Planilha de Treino'}</p><p className="text-sm font-bold text-foreground">{title || (isEn ? 'No title' : 'Sem titulo')}</p></div>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-3 overflow-hidden">
                  {videoFile ? (
                    <video src={URL.createObjectURL(videoFile)} className="w-full h-full object-cover" controls playsInline preload="metadata" />
                  ) : <span className="text-4xl">🥋</span>}
                </div>
              )}
              {isPlan && planText ? <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-6">{planText}</p> : <p className="text-xs text-muted-foreground mt-1">{description || (isEn ? 'No description' : 'Sem descricao')}</p>}
              {autoTranslate && <p className="text-[10px] text-primary/70 mt-2 flex items-center gap-1"><Globe size={10} /> {isEn ? 'Will be auto-translated to English' : 'Sera traduzido para ingles automaticamente'}</p>}
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">{visibility === 'subscribers' ? (isEn ? '🔒 Subscribers only' : '🔒 Apenas assinantes') : (isEn ? '👁 Free preview' : '👁 Visualizacao gratuita')}</p>
              {videoDuration && <p className="text-[10px] text-muted-foreground mt-1">{isEn ? 'Duration' : 'Duração'}: {formatDuration(videoDuration)}</p>}
            </div>
            <button onClick={handlePost} disabled={uploading}
              className="mt-auto bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded-md active:scale-[0.98] transition-transform disabled:opacity-50">
              {uploading ? (isEn ? 'Publishing...' : 'Publicando...') : (isEn ? 'Post Now 🚀' : 'Publicar 🚀')}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default UploadPage;
