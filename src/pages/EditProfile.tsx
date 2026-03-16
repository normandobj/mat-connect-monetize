import { ArrowLeft, Camera, ImagePlus, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect, forwardRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { GoogleMeetConnection } from '@/components/GoogleMeetConnection';

const EditProfile = forwardRef<HTMLDivElement>((_, ref) => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { user, athleteProfile, refreshProfile, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const isEn = lang === 'en';

  const [name, setName] = useState('');
  const [bioPt, setBioPt] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [academy, setAcademy] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState(29);

  const [quarterlyEnabled, setQuarterlyEnabled] = useState(false);
  const [quarterlyPrice, setQuarterlyPrice] = useState<number | null>(null);
  const [annualEnabled, setAnnualEnabled] = useState(false);
  const [annualPrice, setAnnualPrice] = useState<number | null>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading]);

  useEffect(() => {
    if (athleteProfile) {
      setName(athleteProfile.name || '');
      setBioPt(athleteProfile.bio_pt || '');
      setBioEn(athleteProfile.bio_en || '');
      setAcademy(athleteProfile.academy || '');
      setCity(athleteProfile.city || '');
      setCountry(athleteProfile.country || '');
      setMonthlyPrice(athleteProfile.monthly_price || 29);
      setQuarterlyEnabled(athleteProfile.quarterly_enabled ?? true);
      setQuarterlyPrice(athleteProfile.quarterly_price ?? null);
      setAnnualEnabled(athleteProfile.annual_enabled ?? true);
      setAnnualPrice(athleteProfile.annual_price ?? null);
      setCoverPreview(athleteProfile.cover_photo_url || null);
      setProfilePreview(athleteProfile.photo_url || null);
    }
  }, [athleteProfile]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setProfileFile(file); setProfilePreview(URL.createObjectURL(file)); }
  };

  const uploadPhoto = async (file: File, path: string) => {
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    return publicUrl;
  };

  const handleSave = async () => {
    if (!user || !athleteProfile) return;

    // Validate plan toggles
    if (quarterlyEnabled && (!quarterlyPrice || quarterlyPrice <= 0)) {
      toast.error(isEn ? 'Set a price before enabling the quarterly plan' : 'Defina o preço antes de ativar o plano trimestral');
      return;
    }
    if (annualEnabled && (!annualPrice || annualPrice <= 0)) {
      toast.error(isEn ? 'Set a price before enabling the annual plan' : 'Defina o preço antes de ativar o plano anual');
      return;
    }

    setSaving(true);
    try {
      let photoUrl = athleteProfile.photo_url;
      let coverUrl = athleteProfile.cover_photo_url;
      if (profileFile) photoUrl = await uploadPhoto(profileFile, `${user.id}/profile.${profileFile.name.split('.').pop()}`);
      if (coverFile) coverUrl = await uploadPhoto(coverFile, `${user.id}/cover.${coverFile.name.split('.').pop()}`);

      const { error } = await supabase
        .from('athlete_profiles')
        .update({
          name,
          bio_pt: bioPt,
          bio_en: bioEn || null,
          academy,
          city,
          country,
          monthly_price: monthlyPrice,
          quarterly_enabled: quarterlyEnabled,
          quarterly_price: quarterlyPrice || 0,
          annual_enabled: annualEnabled,
          annual_price: annualPrice || 0,
          photo_url: photoUrl,
          cover_photo_url: coverUrl,
        })
        .eq('id', athleteProfile.id);

      if (error) throw error;
      await refreshProfile();
      toast.success(isEn ? 'Profile updated!' : 'Perfil atualizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !athleteProfile) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>;
  }

  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${enabled ? 'bg-primary' : 'bg-muted'}`}>
      <div className={`w-4 h-4 rounded-full bg-foreground transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{isEn ? 'Edit Profile' : 'Editar Perfil'}</h1>
            <p className="text-xs text-muted-foreground">{isEn ? 'Update your information' : 'Atualize suas informações'}</p>
          </div>
        </div>

        {/* Cover Photo */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isEn ? 'Cover Photo' : 'Foto de Capa'}</p>
          <input type="file" ref={coverInputRef} accept="image/*" className="hidden" onChange={handleCoverChange} />
          <button onClick={() => coverInputRef.current?.click()}
            className="w-full h-32 rounded-lg border-2 border-dashed border-border bg-card flex items-center justify-center overflow-hidden relative group">
            {coverPreview ? (
              <>
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImagePlus size={24} className="text-white" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <ImagePlus size={24} />
                <span className="text-xs">{isEn ? 'Add cover' : 'Adicionar capa'}</span>
              </div>
            )}
          </button>
        </div>

        {/* Profile Photo */}
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isEn ? 'Profile Photo' : 'Foto de Perfil'}</p>
          <input type="file" ref={profileInputRef} accept="image/*" className="hidden" onChange={handleProfileChange} />
          <button onClick={() => profileInputRef.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-card flex items-center justify-center overflow-hidden relative group">
            {profilePreview ? (
              <>
                <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
                <Camera size={20} />
                <span className="text-[9px]">{isEn ? 'Photo' : 'Foto'}</span>
              </div>
            )}
          </button>
        </div>

        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isEn ? 'Full Name' : 'Nome Completo'}</p>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>

        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isEn ? 'Academy' : 'Academia'}</p>
          <input value={academy} onChange={(e) => setAcademy(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isEn ? 'City' : 'Cidade'}</p>
            <input value={city} onChange={(e) => setCity(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isEn ? 'Country' : 'País'}</p>
            <input value={country} onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>

        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Bio (Português)</p>
          <textarea value={bioPt} onChange={(e) => setBioPt(e.target.value)} rows={4}
            className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="Conte um pouco sobre você..." />
        </div>

        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Bio em inglês (opcional)</p>
          <textarea value={bioEn} onChange={(e) => setBioEn(e.target.value)} rows={4}
            className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="Tell a bit about yourself... (leave empty for auto-translate)" />
          <p className="text-[10px] text-muted-foreground mt-1">{isEn ? 'If empty, auto-translate will be used.' : 'Se vazio, será usado tradução automática.'}</p>
        </div>

        {/* Plans Section */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{isEn ? 'My Plans' : 'Meus Planos'}</h2>
          <p className="text-[10px] text-muted-foreground mb-4">{isEn ? 'Prices are independent from the monthly plan' : 'Preços são independentes do plano mensal'}</p>

          {/* Monthly - always on */}
          <div className="bg-card border border-border rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-foreground">{isEn ? 'Monthly Plan' : 'Plano Mensal'}</p>
              <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{isEn ? 'Always active' : 'Sempre ativo'}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{isEn ? 'Price (R$)' : 'Preço (R$)'}</p>
              <input type="number" value={monthlyPrice} onChange={(e) => setMonthlyPrice(Number(e.target.value))} min={1}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <input type="range" min="9" max="199" value={monthlyPrice} onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                className="w-full mt-2 accent-primary" />
            </div>
          </div>

          {/* Quarterly - toggle */}
          <div className={`bg-card border rounded-lg p-4 mb-3 transition-colors ${quarterlyEnabled ? 'border-primary/50' : 'border-border'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-foreground">{isEn ? 'Quarterly Plan' : 'Plano Trimestral'}</p>
              <Toggle enabled={quarterlyEnabled} onToggle={() => setQuarterlyEnabled(!quarterlyEnabled)} />
            </div>
            {quarterlyEnabled && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{isEn ? 'Price (R$)' : 'Preço (R$)'}</p>
                <input type="number" value={quarterlyPrice || ''} onChange={(e) => setQuarterlyPrice(e.target.value ? Number(e.target.value) : null)} min={1}
                  placeholder={isEn ? 'Set quarterly price' : 'Defina o preço trimestral'}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            )}
            {!quarterlyEnabled && (
              <p className="text-[10px] text-muted-foreground">{isEn ? 'Disabled — hidden from subscribers' : 'Desativado — oculto para assinantes'}</p>
            )}
          </div>

          {/* Annual - toggle */}
          <div className={`bg-card border rounded-lg p-4 mb-3 transition-colors ${annualEnabled ? 'border-primary/50' : 'border-border'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-foreground">{isEn ? 'Annual Plan' : 'Plano Anual'}</p>
              <Toggle enabled={annualEnabled} onToggle={() => setAnnualEnabled(!annualEnabled)} />
            </div>
            {annualEnabled && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{isEn ? 'Price (R$)' : 'Preço (R$)'}</p>
                <input type="number" value={annualPrice || ''} onChange={(e) => setAnnualPrice(e.target.value ? Number(e.target.value) : null)} min={1}
                  placeholder={isEn ? 'Set annual price' : 'Defina o preço anual'}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            )}
            {!annualEnabled && (
              <p className="text-[10px] text-muted-foreground">{isEn ? 'Disabled — hidden from subscribers' : 'Desativado — oculto para assinantes'}</p>
            )}
          </div>
        </div>

        {/* Google Meet Connection */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{isEn ? 'Connections' : 'Conexões'}</h2>
          <GoogleMeetConnection />
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 mb-6">
          <Save size={16} />
          {saving ? (isEn ? 'Saving...' : 'Salvando...') : (isEn ? 'Save Changes' : 'Salvar Alterações')}
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
