import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Check, Clock, Bell, Zap } from 'lucide-react';
import { Sun } from 'lucide-react';

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
            <h3 className="font-semibold text-base mb-1 break-words line-clamp-2">{habit.name}</h3>
            
            <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
              {habit.intervalMinutes && (
                <span className="flex items-center gap-1 min-w-0">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Every {habit.intervalMinutes}min</span>
                </span>
              )}
              
              {habit.scheduledTime && (
                <span className="flex items-center gap-1 min-w-0">
                  <Bell className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{habit.scheduledTime}</span>
                </span>
              )}

              {habit.isActive && (
                <span className="badge badge-primary text-xs whitespace-nowrap">
                  Reminder Active
                </span>
              )}
            </div>

            {countdowns[habit.id] && (
              <p className="text-xs text-text-muted mt-2 truncate">
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
              Snoozed until {habit.snoozeUntil ? new Date(habit.snoozeUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 overflow-hidden">
            <Clock className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="truncate">Recurring Reminders</span>
          </h2>
          <div className="space-y-3">
            {recurringHabits.map((habit, i) => renderHabitCard(habit, i))}
          </div>
        </section>
      )}

      {/* Daily Routines */}
      {dailyHabits.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 overflow-hidden">
            <Sun className="w-5 h-5 text-warning flex-shrink-0" />
            <span className="truncate">Daily Routines</span>
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
