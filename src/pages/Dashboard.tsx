import { AppShell } from '@/components/AppShell';
import { Users, DollarSign, FileText, Flame, Plus, Radio, Dumbbell } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { icon: Users, label: 'Subscribers', value: '127', color: 'text-primary' },
    { icon: DollarSign, label: 'Revenue', value: 'R$4,953', color: 'text-green-400' },
    { icon: FileText, label: 'Content', value: '84', color: 'text-primary' },
    { icon: Flame, label: 'Streak', value: '12d', color: 'text-orange-400' },
  ];

  const recentSubs = [
    { name: 'James Wilson', plan: 'Quarterly', date: 'Mar 10' },
    { name: 'Maria García', plan: 'Monthly', date: 'Mar 9' },
    { name: 'Tom Anderson', plan: 'Annual', date: 'Mar 7' },
    { name: 'Yuki Tanaka', plan: 'Monthly', date: 'Mar 5' },
  ];

  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const revenues = [2800, 3200, 3800, 4100, 4600, 4953];
  const maxRev = Math.max(...revenues);

  return (
    <AppShell>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Olá, Lucas 👊</h1>
        <p className="text-sm text-muted-foreground mt-1">Here's your training hub overview.</p>

        {/* Stats */}
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

        {/* Revenue Chart */}
        <div className="bg-card border border-border rounded-lg p-4 mt-4 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Monthly Revenue</h2>
          <div className="flex items-end gap-2 h-32">
            {revenues.map((rev, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary/20 rounded-t-sm relative overflow-hidden"
                  style={{ height: `${(rev / maxRev) * 100}%` }}
                >
                  <div
                    className="absolute bottom-0 w-full bg-primary rounded-t-sm transition-all duration-500"
                    style={{ height: i === revenues.length - 1 ? '100%' : '60%' }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground font-medium">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Plus, label: 'Post Drill', href: '/upload' },
              { icon: Radio, label: 'Go Live', href: '/upload' },
              { icon: Dumbbell, label: 'Upload Plan', href: '/upload' },
            ].map((action) => (
              <button
                key={action.label}
                className="bg-card border border-border rounded-lg p-3 flex flex-col items-center gap-2 active:scale-[0.98] transition-transform"
              >
                <action.icon size={20} className="text-primary" />
                <span className="text-[10px] font-semibold text-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Subscribers */}
        <div className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Recent Subscribers</h2>
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
              </div>
            ))}
          </div>
        </div>

        {/* Payout */}
        <div className="bg-card border border-border rounded-lg p-4 mt-6 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Next Payout</h2>
          <p className="text-xl font-black text-foreground tabular-nums">R$4,953</p>
          <p className="text-xs text-muted-foreground mt-1">Scheduled for March 30, 2024</p>
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '72%' }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">72% of payout period complete</p>
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
