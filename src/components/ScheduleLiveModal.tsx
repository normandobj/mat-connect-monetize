import { useState } from 'react';
import { X, Loader2, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleLiveModal({ onClose, onSuccess }: Props) {
  const { athleteProfile } = useAuth();
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!athleteProfile || !title || !date || !time) {
      toast.error(isEn ? 'Fill in all required fields' : 'Preencha todos os campos obrigatórios');
      return;
    }

    const scheduledAt = new Date(`${date}T${time}:00`);
    const minTime = new Date(Date.now() + 15 * 60 * 1000);
    if (scheduledAt <= minTime) {
      toast.error(isEn ? 'Choose a time at least 15 minutes from now' : 'Escolha um horário com pelo menos 15 minutos de antecedência');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-meet', {
        body: {
          athlete_id: athleteProfile.id,
          title,
          description,
          scheduled_at: scheduledAt.toISOString(),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const formattedDate = scheduledAt.toLocaleString(isEn ? 'en' : 'pt-BR', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
      });
      toast.success(isEn ? `Live scheduled for ${formattedDate}` : `Live agendada para ${formattedDate}`);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Error scheduling live');
    } finally {
      setSaving(false);
    }
  };

  // Get today's date as min for date picker
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              {isEn ? 'Schedule Live' : 'Agendar Live'}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
              {isEn ? 'Title' : 'Título'} *
            </p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isEn ? 'e.g. Guard Passing Masterclass' : 'ex. Masterclass de Passagem de Guarda'}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
              {isEn ? 'Description' : 'Descrição'}
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={isEn ? 'What will you cover?' : 'O que será abordado?'}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                {isEn ? 'Date' : 'Data'} *
              </p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={minDate}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                {isEn ? 'Time' : 'Horário'} *
              </p>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || !title || !date || !time}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 mt-6 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> {isEn ? 'Scheduling...' : 'Agendando...'}</>
          ) : (
            isEn ? 'Schedule' : 'Agendar'
          )}
        </button>
      </div>
    </div>
  );
}
