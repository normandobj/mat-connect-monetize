import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { type BeltRank } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const belts: { rank: BeltRank; color: string }[] = [
  { rank: 'white', color: 'bg-belt-white' },
  { rank: 'blue', color: 'bg-belt-blue' },
  { rank: 'purple', color: 'bg-belt-purple' },
  { rank: 'brown', color: 'bg-belt-brown' },
  { rank: 'black', color: 'bg-belt-black' },
];

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedBelt, setSelectedBelt] = useState<BeltRank>('blue');
  const [monthlyPrice, setMonthlyPrice] = useState(29);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [academy, setAcademy] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Brazil');
  const [bioPt, setBioPt] = useState('');
  const [pixKey, setPixKey] = useState('');

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para se cadastrar como atleta.');
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('athlete_profiles').insert({
        user_id: user.id,
        username: username.toLowerCase().replace(/[^a-z0-9]/g, ''),
        name,
        belt: selectedBelt,
        academy,
        city,
        country,
        bio_pt: bioPt,
        monthly_price: monthlyPrice,
        quarterly_price: Math.round(monthlyPrice * 2.7),
        annual_price: Math.round(monthlyPrice * 9),
        pix_key: pixKey,
      });

      if (error) throw error;
      toast.success('Perfil de atleta criado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[430px] px-4 py-4 min-h-screen flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Join as Athlete</h1>
            <p className="text-xs text-muted-foreground">It's free · Step {step} of 4</p>
          </div>
        </div>

        <div className="flex gap-1 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-foreground">Basic Info</h2>
            {!user && (
              <div className="bg-primary/10 border border-primary/20 rounded-md p-3">
                <p className="text-xs text-primary">Você precisa criar uma conta primeiro. <button onClick={() => navigate('/auth')} className="underline font-bold">Criar conta</button></p>
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" className="mt-1 w-full bg-card border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="lucasbarbosa" className="mt-1 w-full bg-card border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button onClick={() => setStep(2)} disabled={!name || !username} className="mt-auto bg-primary text-primary-foreground font-bold text-sm py-3 rounded-md disabled:opacity-40">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-foreground">Belt Rank & Academy</h2>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your Belt</label>
              <div className="flex gap-2 mt-2">
                {belts.map((b) => (
                  <button key={b.rank} onClick={() => setSelectedBelt(b.rank)}
                    className={`flex-1 h-12 rounded-md border-2 transition-all ${b.color} ${selectedBelt === b.rank ? 'border-primary scale-105' : 'border-transparent opacity-60'}`}>
                    <span className="text-[8px] font-black uppercase tracking-widest text-foreground drop-shadow-sm">{b.rank}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Academy Name</label>
              <input value={academy} onChange={(e) => setAcademy(e.target.value)} placeholder="Atos Jiu-Jitsu" className="mt-1 w-full bg-card border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="São Paulo" className="mt-1 w-full bg-card border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Country</label>
              <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Brazil" className="mt-1 w-full bg-card border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button onClick={() => setStep(3)} className="mt-auto bg-primary text-primary-foreground font-bold text-sm py-3 rounded-md">Continue</button>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-foreground">Profile & Bio</h2>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bio (Portuguese)</label>
              <textarea value={bioPt} onChange={(e) => setBioPt(e.target.value)} placeholder="Conte um pouco sobre você..." rows={4} className="mt-1 w-full bg-card border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Monthly Price (R$)</label>
              <input type="number" value={monthlyPrice} onChange={(e) => setMonthlyPrice(Number(e.target.value))} className="mt-1 w-full bg-card border border-border rounded-md px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary tabular-nums" />
              <input type="range" min={15} max={97} value={monthlyPrice} onChange={(e) => setMonthlyPrice(Number(e.target.value))} className="w-full mt-2 accent-primary" />
              <div className="bg-card border border-border rounded-lg p-3 space-y-2 mt-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Monthly</span><span className="font-bold text-foreground tabular-nums">R${monthlyPrice}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Quarterly (10% off)</span><span className="font-bold text-foreground tabular-nums">R${Math.round(monthlyPrice * 2.7)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Annual (25% off)</span><span className="font-bold text-foreground tabular-nums">R${Math.round(monthlyPrice * 9)}</span></div>
              </div>
            </div>
            <button onClick={() => setStep(4)} className="mt-auto bg-primary text-primary-foreground font-bold text-sm py-3 rounded-md">Continue</button>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-foreground">Connect Payment</h2>
            <p className="text-xs text-muted-foreground">How would you like to receive your earnings?</p>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">PIX Key</label>
              <input value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="CPF, email, or phone" className="mt-1 w-full bg-card border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="bg-card border border-border rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Payouts are processed monthly. Platform fee: 15%.</p>
            </div>
            <button onClick={handleSubmit} disabled={loading} className="mt-auto bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded-md active:scale-[0.98] transition-transform disabled:opacity-50">
              {loading ? 'Salvando...' : 'Complete Registration 🚀'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
