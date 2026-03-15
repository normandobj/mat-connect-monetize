import { AppShell } from '@/components/AppShell';
import { Video, Dumbbell, FileText, Radio, ArrowLeft, Upload as UploadIcon, Globe } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const contentTypes = [
  { key: 'drill', icon: Video, label: 'Drill Clip', desc: 'Short technique video' },
  { key: 'position', icon: Dumbbell, label: 'Position Tutorial', desc: 'Detailed breakdown' },
  { key: 'plan', icon: FileText, label: 'Training Plan', desc: 'Upload PDF' },
  { key: 'live', icon: Radio, label: 'Schedule Live', desc: 'Go live with subscribers' },
];

const UploadPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [contentType, setContentType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [visibility, setVisibility] = useState<'subscribers' | 'free'>('subscribers');

  const translatedTitle = title ? title.replace(/Raspagem/g, 'Sweep').replace(/Guarda/g, 'Guard') + ' (EN preview)' : '';
  const translatedDesc = description ? description + ' (auto-translated preview)' : '';

  return (
    <AppShell showNav={false}>
      <div className="px-4 py-4 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">New Content</h1>
            <p className="text-xs text-muted-foreground">Step {step} of 4</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-3 flex-1">
            <h2 className="text-sm font-bold text-foreground">Choose content type</h2>
            {contentTypes.map((ct) => (
              <button
                key={ct.key}
                onClick={() => { setContentType(ct.key); setStep(2); }}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-colors active:scale-[0.98] ${
                  contentType === ct.key ? 'border-primary bg-primary/10' : 'border-border bg-card'
                }`}
              >
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <ct.icon size={22} className="text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">{ct.label}</p>
                  <p className="text-xs text-muted-foreground">{ct.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-sm font-bold text-foreground mb-4">Upload your content</h2>
            <button
              onClick={() => setStep(3)}
              className="flex-1 max-h-60 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 bg-card/50"
            >
              <UploadIcon size={32} className="text-muted-foreground" />
              <p className="text-sm font-semibold text-muted-foreground">
                {contentType === 'plan' ? 'Tap to select PDF' : 'Tap to record or select video'}
              </p>
              <p className="text-xs text-muted-foreground">Max 500MB</p>
            </button>
            <button
              onClick={() => setStep(3)}
              className="mt-4 bg-primary text-primary-foreground font-bold text-sm py-3 rounded-md"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-foreground">Add details</h2>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Title (Portuguese)</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Raspagem de Gancho"
                className="mt-1 w-full bg-card border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description (Portuguese)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva seu conteúdo..."
                rows={3}
                className="mt-1 w-full bg-card border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Auto-translate */}
            <div className="flex items-center justify-between bg-card border border-border rounded-md p-3">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">Auto-translate to English</span>
              </div>
              <button
                onClick={() => setAutoTranslate(!autoTranslate)}
                className={`w-10 h-5 rounded-full transition-colors ${autoTranslate ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-foreground transition-transform ${autoTranslate ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {autoTranslate && title && (
              <div className="bg-card/50 border border-border rounded-md p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">English Preview</p>
                <p className="text-sm font-semibold text-foreground">{translatedTitle}</p>
                {description && <p className="text-xs text-muted-foreground mt-1">{translatedDesc}</p>}
              </div>
            )}

            {/* Visibility */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Visibility</label>
              <div className="flex gap-2 mt-1">
                {[
                  { key: 'subscribers' as const, label: 'Subscribers only' },
                  { key: 'free' as const, label: 'Free preview' },
                ].map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setVisibility(v.key)}
                    className={`flex-1 py-2 rounded-md text-xs font-semibold border transition-colors ${
                      visibility === v.key ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(4)}
              className="mt-auto bg-primary text-primary-foreground font-bold text-sm py-3 rounded-md"
            >
              Preview & Post
            </button>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-foreground">Review & Post</h2>

            <div className="bg-card border border-border rounded-lg p-4 shadow-card">
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-3">
                <span className="text-4xl">🥋</span>
              </div>
              <p className="text-sm font-bold text-foreground">{title || 'Untitled'}</p>
              <p className="text-xs text-muted-foreground mt-1">{description || 'No description'}</p>
              {autoTranslate && (
                <p className="text-[10px] text-primary/70 mt-2 flex items-center gap-1">
                  <Globe size={10} /> Will be auto-translated to English
                </p>
              )}
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">
                {visibility === 'subscribers' ? '🔒 Subscribers only' : '👁 Free preview'}
              </p>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="mt-auto bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded-md active:scale-[0.98] transition-transform"
            >
              Post Now 🚀
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default UploadPage;
