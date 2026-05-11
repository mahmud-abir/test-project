import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Home, CheckSquare, User } from 'lucide-react';

export default function TabBar() {
  const { currentScreen, setCurrentScreen } = useAppStore();

  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'habits', icon: CheckSquare, label: 'Habits' },
    { id: 'profile', icon: User, label: 'Profile' },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-bg-surface/95 backdrop-blur-lg border-t border-bg-card px-6 py-2 z-40">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = currentScreen === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentScreen(tab.id)}
              className="relative flex flex-col items-center py-2 px-4"
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Icon 
                  className={`w-6 h-6 ${
                    isActive ? 'text-primary' : 'text-text-muted'
                  }`} 
                />
              </motion.div>
              
              <span className={`text-xs mt-1 ${
                isActive ? 'text-primary font-medium' : 'text-text-muted'
              }`}>
                {tab.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-2 w-8 h-1 bg-primary rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
