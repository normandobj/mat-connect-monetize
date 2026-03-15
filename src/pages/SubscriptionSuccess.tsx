import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">
          {lang === 'en' ? 'Thank you!' : 'Obrigado!'}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {lang === 'en'
            ? 'Your access will be granted shortly.'
            : 'Seu acesso será liberado em breve.'}
        </p>
        <button
          onClick={() => navigate('/feed')}
          className="w-full bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded-md active:scale-[0.98] transition-transform"
        >
          {lang === 'en' ? 'Go to Feed' : 'Ir para o Feed'}
        </button>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
