import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Check, Clock, Bell, Zap, X } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {};

export default function HabitsList() {
  const { habits, completeHabit, snoozeHabit } = useAppStore();
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: Record<string, string> = {};
      
      habits.forEach(habit => {
        if (habit.intervalMinutes && habit.nextReminder) {
          const diff = new Date(habit.nextReminder).getTime() - Date.now();
          if (diff > 0) {
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            newCountdowns[habit.id] = `${hours}h ${minutes}m`;
          } else {
            newCountdowns[habit.id] = 'Now!';
          }
        }
      });
      
      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [habits]);

  const recurringHabits = habits.filter(h => h.category === 'recurring');
  const dailyHabits = habits.filter(h => h.category === 'daily');

  const renderHabitCard = (habit: typeof habits[0], index: number) => {
    const isSnoozed = habit.snoozeUntil && new Date(habit.snoozeUntil) > new Date();
    
    return (
      <motion.div
        key={habit.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`card relative overflow-hidden ${isSnoozed ? 'opacity-75' : ''}`}
      >
        {habit.streak > 0 && (
          <div className="absolute top-0 right-0">
            <span className="badge badge-success text-xs">
              <Zap className="w-3 h-3 mr-1" />
              {habit.streak} day streak
            </span>
          </div>
        )}

        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${habit.color}20` }}
          >
            <span className="text-2xl">{habit.icon}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1 break-words">{habit.name}</h3>
            
            <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
              {habit.intervalMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Every {habit.intervalMinutes}min
                </span>
              )}
              
              {habit.scheduledTime && (
                <span className="flex items-center gap-1">
                  <Bell className="w-4 h-4" />
                  {habit.scheduledTime}
                </span>
              )}

              {habit.isActive && (
                <span className="badge badge-primary text-xs">
                  Reminder Active
                </span>
              )}
            </div>

            {countdowns[habit.id] && (
              <p className="text-xs text-text-muted mt-2">
                Next: {countdowns[habit.id]}
              </p>
            )}
          </div>
        </div>

        {!isSnoozed && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-bg-card">
            <button
              onClick={() => snoozeHabit(habit.id, 5)}
              className="btn-secondary text-xs py-2 px-3 flex-1"
            >
              Snooze 5m
            </button>
            <button
              onClick={() => snoozeHabit(habit.id, 15)}
              className="btn-secondary text-xs py-2 px-3 flex-1"
            >
              15m
            </button>
            <button
              onClick={() => snoozeHabit(habit.id, 30)}
              className="btn-secondary text-xs py-2 px-3 flex-1"
            >
              30m
            </button>
            <button
              onClick={() => completeHabit(habit.id)}
              className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center hover:bg-success/30 transition-colors"
            >
              <Check className="w-5 h-5 text-success" />
            </button>
          </div>
        )}

        {isSnoozed && (
          <div className="mt-4 pt-4 border-t border-bg-card">
            <p className="text-sm text-warning flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Snoozed until {new Date(habit.snoozeUntil!).toLocaleTimeString()}
            </p>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold gradient-text">Your Habits</h1>
        <p className="text-text-secondary text-sm">Build consistency, one habit at a time</p>
      </motion.div>

      {/* Recurring Reminders */}
      {recurringHabits.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recurring Reminders
          </h2>
          <div className="space-y-3">
            {recurringHabits.map((habit, i) => renderHabitCard(habit, i))}
          </div>
        </section>
      )}

      {/* Daily Routines */}
      {dailyHabits.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Sun className="w-5 h-5 text-warning" />
            Daily Routines
          </h2>
          <div className="space-y-3">
            {dailyHabits.map((habit, i) => renderHabitCard(habit, i + recurringHabits.length))}
          </div>
        </section>
      )}

      {habits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary">No habits yet. Complete onboarding to get started!</p>
        </div>
      )}
    </div>
  );
}

const Sun = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
