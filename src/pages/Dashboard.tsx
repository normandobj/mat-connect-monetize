import { AppShell } from '@/components/AppShell';
import { Users, DollarSign, FileText, Flame, Plus, Radio, Dumbbell, Link, Copy, Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAthletes } from '@/data/mockData';

const athlete = mockAthletes[0];

const Dashboard = () => {
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedInvitePlan, setSelectedInvitePlan] = useState('free');
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);

  const invitePlans = [
    { key: 'free', label: 'Gratuito', sublabel: 'Acesso completo sem cobrar', badge: 'Para o teste' },
    { key: 'trial7', label: '7 dias gratis', sublabel: 'Cadastra agora, paga no 7 dia', badge: 'Recomendado' },
    { key: 'monthly', label: 'Mensal — R$' + athlete.monthlyPrice, sublabel: 'Cobranca imediata mensal', badge: null },
    { key: 'quarterly', label: 'Trimestral — R$' + athlete.quarterlyPrice, sublabel: 'Cobranca imediata trimestral', badge: null },
    { key: 'annual', label: 'Anual — R$' + athlete.annualPrice, sublabel: 'Melhor valor anual', badge: null },
  ];

  const selectedPlan = invitePlans.find((p) => p.key === selectedInvitePlan);
  const inviteLink = 'mydrill.app/invite/' + athlete.username + '/' + selectedInvitePlan;

  const handleCopy = () => {
    navigator.clipboard.writeText('https://' + inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const stats = [
    { icon: Users, label: 'Assinantes', value: '127', color: 'text-primary' },
    { icon: DollarSign, label: 'Receita', value: 'R$4.953', color: 'text-green-400' },
    { icon: FileText, label: 'Conteudos', value: '84', color: 'text-primary' },
    { icon: Flame, label: 'Sequencia', value: '12d', color: 'text-orange-400' },
  ];

  const recentSubs = [
    { name: 'James Wilson', plan: 'Trimestral', date: '10 Mar', free: false },
    { name: 'Maria Garcia', plan: 'Mensal', date: '9 Mar', free: false },
    { name: 'Tom Anderson', plan: 'Anual', date: '7 Mar', free: false },
    { name: 'Yuki Tanaka', plan: 'Gratis', date: '5 Mar', free: true },
  ];

  const months = ['Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar'];
  const revenues = [2800, 3200, 3800, 4100, 4600, 4953];
  const maxRev = Math.max(...revenues);

  return (
    <AppShell>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Ola, Lucas 👊</h1>
        <p className="text-sm text-muted-foreground mt-1">Visao geral do seu perfil.</p>

        <div className="grid grid-cols-2 gap-2 mt-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-3 shadow-card">
              <div className="flex items-center gap-2">
                <stat.icon size={14} className={stat.color} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-xl font-black text-foreground mt-1 tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg p-4 mt-4 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Receita Mensal</h2>
          <div className="flex items-end gap-2 h-32">
            {revenues.map((rev, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary/20 rounded-t-sm relative overflow-hidden" style={{ height: (rev / maxRev * 100) + '%' }}>
                  <div className="absolute bottom-0 w-full bg-primary rounded-t-sm" style={{ height: i === revenues.length - 1 ? '100%' : '60%' }} />
                </div>
                <span className="text-[9px] text-muted-foreground font-medium">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Acoes Rapidas</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Plus, label: 'Postar Drill', href: '/upload' },
              { icon: Radio, label: 'Fazer Live', href: '/upload' },
              { icon: Dumbbell, label: 'Planilha', href: '/upload' },
            ].map((action) => (
              <button key={action.label} onClick={() => navigate(action.href)}
                className="bg-card border border-border rounded-lg p-3 flex flex-col items-center gap-2 active:scale-[0.98] transition-transform">
                <action.icon size={20} className="text-primary" />
                <span className="text-[10px] font-semibold text-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Convidar Assinantes</h2>
          <div className="bg-card border border-border rounded-lg p-4 shadow-card">
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Gere um link e escolha como seus convidados vao acessar seu conteudo. Ideal para stories ou grupo da academia.
            </p>

            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Tipo de acesso</p>
            <div className="relative mb-4">
              <button onClick={() => setShowPlanDropdown(!showPlanDropdown)}
                className="w-full flex items-center justify-between bg-background border border-border rounded-lg px-3 py-3 text-left">
                <div>
                  <p className="text-sm font-bold text-foreground">{selectedPlan?.label}</p>
                  <p className="text-[10px] text-muted-foreground">{selectedPlan?.sublabel}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {selectedPlan?.badge && (
                    <span className="text-[9px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">{selectedPlan.badge}</span>
                  )}
                  <ChevronDown size={14} className={'text-muted-foreground transition-transform ' + (showPlanDropdown ? 'rotate-180' : '')} />
                </div>
              </button>

              {showPlanDropdown && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-lg overflow-hidden shadow-lg">
                  {invitePlans.map((plan) => (
                    <button key={plan.key}
                      onClick={() => { setSelectedInvitePlan(plan.key); setShowPlanDropdown(false); }}
                      className={'w-full flex items-center justify-between px-3 py-3 text-left hover:bg-primary/5 transition-colors border-b border-border last:border-0 ' + (selectedInvitePlan === plan.key ? 'bg-primary/10' : '')}>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{plan.label}</p>
                        <p className="text-[10px] text-muted-foreground">{plan.sublabel}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {plan.badge && (
                          <span className="text-[9px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">{plan.badge}</span>
                        )}
                        {selectedInvitePlan === plan.key && <Check size={14} className="text-primary" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Seu link</p>
            <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2.5 mb-3">
              <Link size={14} className="text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground flex-1 truncate">{inviteLink}</p>
            </div>

            <button onClick={handleCopy}
              className={'w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all active:scale-[0.98] ' + (copiedLink ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-primary text-primary-foreground')}>
              {copiedLink ? <><Check size={16} /> Link copiado!</> : <><Copy size={16} /> Copiar link</>}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Assinantes Recentes</h2>
          <div className="bg-card border border-border rounded-lg divide-y divide-border shadow-card">
            {recentSubs.map((sub) => (
              <div key={sub.name} className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {sub.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{sub.name}</p>
                  <p className="text-[10px] text-muted-foreground">{sub.plan} · {sub.date}</p>
                </div>
                {sub.free && (
                  <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Gratis</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 mt-6 mb-4 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Proximo Pagamento</h2>
          <p className="text-xl font-black text-foreground tabular-nums">R$4.953</p>
          <p className="text-xs text-muted-foreground mt-1">Previsto para 30 de marco de 2026</p>
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '72%' }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">72% do periodo concluido</p>
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
