import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, HealthCondition, Habit, AITip, WeatherData, WatchData, Reminder, OnboardingStep, Screen } from '../types';

interface AppState {
  // Onboarding
  isOnboarded: boolean;
  onboardingStep: OnboardingStep;
  
  // User Profile
  userProfile: UserProfile | null;
  healthConditions: HealthCondition[];
  customConditions: string[];
  
  // Habits
  habits: Habit[];
  
  // AI Tips
  aiTips: AITip[];
  tipCooldowns: Record<string, number>;
  
  // Weather
  weather: WeatherData | null;
  
  // Watch
  watchData: WatchData;
  availableDevices: { name: string; type: string }[];
  
  // Reminders
  reminders: Reminder[];
  
  // Navigation
  currentScreen: Screen;
  
  // Actions
  setOnboarded: (value: boolean) => void;
  setOnboardingStep: (step: OnboardingStep) => void;
  setUserProfile: (profile: UserProfile) => void;
  addHealthCondition: (condition: HealthCondition) => void;
  removeHealthCondition: (id: string) => void;
  addCustomCondition: (name: string) => void;
  removeCustomCondition: (name: string) => void;
  setHabits: (habits: Habit[]) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  completeHabit: (habitId: string) => void;
  snoozeHabit: (habitId: string, minutes: number) => void;
  addAITip: (tip: Omit<AITip, 'id' | 'timestamp'>) => void;
  setWeather: (weather: WeatherData) => void;
  setWatchData: (data: Partial<WatchData>) => void;
  setAvailableDevices: (devices: { name: string; type: string }[]) => void;
  connectWatch: (deviceName: string, isReal: boolean) => void;
  disconnectWatch: () => void;
  addReminder: (reminder: Reminder) => void;
  removeReminder: (id: string) => void;
  setCurrentScreen: (screen: Screen) => void;
  resetApp: () => void;
}

const initialWatchData: WatchData = {
  isConnected: false,
  connectionType: 'simulation',
  steps: 0,
  heartRate: 72,
  calories: 0,
  lastSynced: new Date(),
  connectionQuality: 'disconnected',
};

const initialWeather: WeatherData = {
  location: 'Busan, South Korea',
  temperature: 22,
  condition: 'Clear',
  humidity: 65,
  uvIndex: 5,
  feelsLike: 24,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      isOnboarded: false,
      onboardingStep: 'profile',
      userProfile: null,
      healthConditions: [],
      customConditions: [],
      habits: [],
      aiTips: [],
      tipCooldowns: {},
      weather: initialWeather,
      watchData: initialWatchData,
      availableDevices: [],
      reminders: [],
      currentScreen: 'dashboard',

      // Actions
      setOnboarded: (value) => set({ isOnboarded: value }),
      
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      addHealthCondition: (condition) => 
        set((state) => ({ 
          healthConditions: [...state.healthConditions, condition] 
        })),
      
      removeHealthCondition: (id) => 
        set((state) => ({ 
          healthConditions: state.healthConditions.filter(c => c.id !== id) 
        })),
      
      addCustomCondition: (name) => 
        set((state) => ({ 
          customConditions: [...state.customConditions, name] 
        })),
      
      removeCustomCondition: (name) => 
        set((state) => ({ 
          customConditions: state.customConditions.filter(c => c !== name) 
        })),
      
      setHabits: (habits) => set({ habits }),
      
      updateHabit: (habitId, updates) => 
        set((state) => ({
          habits: state.habits.map(h => 
            h.id === habitId ? { ...h, ...updates } : h
          ),
        })),
      
      completeHabit: (habitId) => 
        set((state) => ({
          habits: state.habits.map(h => 
            h.id === habitId 
              ? { 
                  ...h, 
                  streak: h.streak + 1, 
                  lastCompleted: new Date().toISOString(),
                  nextReminder: h.intervalMinutes 
                    ? new Date(Date.now() + h.intervalMinutes * 60000)
                    : undefined,
                }
              : h
          ),
        })),
      
      snoozeHabit: (habitId, minutes) => 
        set((state) => ({
          habits: state.habits.map(h => 
            h.id === habitId 
              ? { ...h, snoozeUntil: new Date(Date.now() + minutes * 60000) }
              : h
          ),
        })),
      
      addAITip: (tip) => {
        const id = `tip-${Date.now()}-${Math.random()}`;
        set((state) => ({
          aiTips: [
            { ...tip, id, timestamp: new Date() },
            ...state.aiTips.slice(0, 9),
          ],
          tipCooldowns: {
            ...state.tipCooldowns,
            [tip.category]: Date.now(),
          },
        }));
      },
      
      setWeather: (weather) => set({ weather }),
      
      setWatchData: (data) => 
        set((state) => ({ 
          watchData: { ...state.watchData, ...data } 
        })),
      
      setAvailableDevices: (devices) => set({ availableDevices: devices }),
      
      connectWatch: (deviceName, isReal) => 
        set(() => ({
          watchData: {
            isConnected: true,
            connectionType: isReal ? 'real' : 'simulation',
            deviceName,
            steps: Math.floor(Math.random() * 5000) + 3000,
            heartRate: Math.floor(Math.random() * 30) + 65,
            calories: Math.floor(Math.random() * 500) + 200,
            lastSynced: new Date(),
            connectionQuality: 'excellent' as const,
          },
        })),
      
      disconnectWatch: () => 
        set(() => ({
          watchData: {
            ...initialWatchData,
            lastSynced: new Date(),
          },
        })),
      
      addReminder: (reminder) => 
        set((state) => ({ reminders: [...state.reminders, reminder] })),
      
      removeReminder: (id) => 
        set((state) => ({ 
          reminders: state.reminders.filter(r => r.id !== id) 
        })),
      
      setCurrentScreen: (screen) => set({ currentScreen: screen }),
      
      resetApp: () => 
        set({
          isOnboarded: false,
          onboardingStep: 'profile',
          userProfile: null,
          healthConditions: [],
          customConditions: [],
          habits: [],
          aiTips: [],
          tipCooldowns: {},
          weather: initialWeather,
          watchData: initialWatchData,
          availableDevices: [],
          reminders: [],
          currentScreen: 'dashboard',
        }),
    }),
    {
      name: 'fitness-app-storage',
      partialize: (state) => ({
        isOnboarded: state.isOnboarded,
        userProfile: state.userProfile,
        healthConditions: state.healthConditions,
        customConditions: state.customConditions,
        habits: state.habits,
        watchData: state.watchData,
      }),
    }
  )
);
