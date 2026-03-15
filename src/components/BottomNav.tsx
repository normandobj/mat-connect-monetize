import { Home, Compass, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Home', path: '/feed' },
  { icon: Compass, label: 'Explorar', path: '/explore' },
  { icon: User, label: 'Perfil', path: '/dashboard' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[430px] items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/dashboard' && location.pathname.startsWith('/dashboard'));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavPill"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon
                size={22}
                className={isActive ? 'text-primary relative z-10' : 'text-muted-foreground relative z-10'}
              />
              <span className={`text-[10px] font-medium relative z-10 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
