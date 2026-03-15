import { ArrowLeft, Camera, ImagePlus, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, athleteProfile, refreshProfile, loading } = useAuth();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [bioPt, setBioPt] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [academy, setAcademy] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState(29);
  const [pixKey, setPixKey] = useState('');

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
      setPixKey(athleteProfile.pix_key || '');
      setCoverPreview(athleteProfile.cover_photo_url || null);
      setProfilePreview(athleteProfile.photo_url || null);
    }
  }, [athleteProfile]);

  const quarterlyPrice = Math.round(monthlyPrice * 3 * 0.9);
  const annualPrice = Math.round(monthlyPrice * 12 * 0.75);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const uploadPhoto = async (file: File, path: string) => {
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    return publicUrl;
  };

  const handleSave = async () => {
    if (!user || !athleteProfile) return;
    setSaving(true);

    try {
      let photoUrl = athleteProfile.photo_url;
      let coverUrl = athleteProfile.cover_photo_url;

      if (profileFile) {
        photoUrl = await uploadPhoto(profileFile, `${user.id}/profile.${profileFile.name.split('.').pop()}`);
      }
      if (coverFile) {
        coverUrl = await uploadPhoto(coverFile, `${user.id}/cover.${coverFile.name.split('.').pop()}`);
      }

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
          quarterly_price: quarterlyPrice,
          annual_price: annualPrice,
          pix_key: pixKey || null,
          photo_url: photoUrl,
          cover_photo_url: coverUrl,
        })
        .eq('id', athleteProfile.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Perfil atualizado com sucesso!');
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

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Editar Perfil</h1>
            <p className="text-xs text-muted-foreground">Atualize suas informações</p>
          </div>
        </div>

        {/* Cover Photo */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Foto de Capa</p>
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
                <span className="text-xs">Adicionar capa</span>
              </div>
            )}
          </button>
        </div>

        {/* Profile Photo */}
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Foto de Perfil</p>
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
                <span className="text-[9px]">Foto</span>
              </div>
            )}
          </button>
        </div>

        {/* Name */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Nome Completo</p>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>

        {/* Academy */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Academia</p>
          <input value={academy} onChange={(e) => setAcademy(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>

        {/* City & Country */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Cidade</p>
            <input value={city} onChange={(e) => setCity(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">País</p>
            <input value={country} onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>

        {/* Bio PT */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Bio (Português)</p>
          <textarea value={bioPt} onChange={(e) => setBioPt(e.target.value)} rows={4}
            className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="Conte um pouco sobre você..." />
        </div>

        {/* Bio EN */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Bio em inglês (opcional)</p>
          <textarea value={bioEn} onChange={(e) => setBioEn(e.target.value)} rows={4}
            className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="Tell a bit about yourself... (leave empty for auto-translate)" />
          <p className="text-[10px] text-muted-foreground mt-1">Se vazio, será usado tradução automática.</p>
        </div>

        {/* Monthly Price */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Preço Mensal (R$)</p>
          <input type="number" value={monthlyPrice} onChange={(e) => setMonthlyPrice(Number(e.target.value))}
            className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <div className="flex items-center justify-between mt-2 px-1">
            <input type="range" min="9" max="199" value={monthlyPrice} onChange={(e) => setMonthlyPrice(Number(e.target.value))}
              className="flex-1 accent-primary" />
          </div>
          <div className="bg-card border border-border rounded-lg p-3 mt-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Mensal</span><span className="font-bold text-foreground">R${monthlyPrice}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Trimestral (10% off)</span><span className="font-bold text-foreground">R${quarterlyPrice}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Anual (25% off)</span><span className="font-bold text-foreground">R${annualPrice}</span>
            </div>
          </div>
        </div>

        {/* PIX Key */}
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Chave PIX</p>
          <input value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="CPF, email ou telefone"
            className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>

        {/* Save Button */}
        <button onClick={handleSave} disabled={saving}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 mb-6">
          <Save size={16} />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
