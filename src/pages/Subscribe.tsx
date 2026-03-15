import { useParams, useNavigate } from 'react-router-dom';
import { mockAthletes } from '@/data/mockData';
import { BeltBadge } from '@/components/BeltBadge';
import { ArrowLeft, Check, CreditCard, QrCode } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const Subscribe = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const athlete = mockAthletes.find((a) => a.username === username) || mockAthletes[0];
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');

  const plans = [
    { key: 'monthly' as const, label: 'Monthly', price: athlete.monthlyPrice, period: '/mo' },
    { key: 'quarterly' as const, label: 'Quarterly', price: athlete.quarterlyPrice, period: '/3mo', badge: 'Popular' },
    { key: 'annual' as const, label: 'Annual', price: athlete.annualPrice, period: '/yr', badge: 'Best Value' },
  ];

  const currentPlan = plans.find((p) => p.key === selectedPlan)!;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[430px] px-4 py-4">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center mb-4">
          <ArrowLeft size={16} className="text-foreground" />
        </button>

        {/* Athlete mini profile */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-xl bg-card flex items-center justify-center text-xl font-bold text-primary/40">
            {athlete.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{athlete.name}</h1>
            <BeltBadge belt={athlete.belt} size="sm" />
          </div>
        </div>

        {/* Plans */}
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Select Plan</h2>
        <div className="space-y-2 mb-6">
          {plans.map((plan) => (
            <motion.button
              key={plan.key}
              onClick={() => setSelectedPlan(plan.key)}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
                selectedPlan === plan.key ? 'border-primary bg-primary/10' : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center gap-3">
                {selectedPlan === plan.key ? (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check size={12} className="text-primary-foreground" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted" />
                )}
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">{plan.label}</p>
                  {plan.badge && <span className="text-[10px] font-semibold text-primary">{plan.badge}</span>}
                </div>
              </div>
              <p className="text-lg font-black text-foreground tabular-nums">R${plan.price}<span className="text-xs text-muted-foreground font-normal">{plan.period}</span></p>
            </motion.button>
          ))}
        </div>

        {/* Payment Method */}
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Payment Method</h2>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-semibold transition-colors ${
              paymentMethod === 'card' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground'
            }`}
          >
            <CreditCard size={16} /> Credit Card
          </button>
          <button
            onClick={() => setPaymentMethod('pix')}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-semibold transition-colors ${
              paymentMethod === 'pix' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground'
            }`}
          >
            <QrCode size={16} /> PIX
          </button>
        </div>

        {/* Price Summary */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-card">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{currentPlan.label} plan</span>
            <span className="font-bold text-foreground tabular-nums">R${currentPlan.price}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Secure payment via Stripe/PIX · Cancel anytime</p>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/feed')}
          className="w-full bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded-md active:scale-[0.98] transition-transform"
        >
          Subscribe and Start Learning
        </button>
        <p className="text-center text-[10px] text-muted-foreground mt-3">Cancel anytime · Instant access</p>
      </div>
    </div>
  );
};

export default Subscribe;
