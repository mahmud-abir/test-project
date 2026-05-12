export interface UserProfile {
  username: string;
  weight: number;
  height: number;
  age: number;
}

export interface HealthCondition {
  id: string;
  name: string;
  isCustom?: boolean;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: 'recurring' | 'daily';
  intervalMinutes?: number;
  scheduledTime?: string;
  isActive: boolean;
  streak: number;
  lastCompleted?: string;
  nextReminder?: Date | string;
  snoozeUntil?: Date | string;
  conditionId?: string;
}

export interface AITip {
  id: string;
  content: string;
  category: 'weather' | 'activity' | 'health' | 'habit' | 'motivation';
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: 'Clear' | 'Partly Cloudy' | 'Rainy' | 'Cloudy';
  humidity: number;
  uvIndex: number;
  feelsLike: number;
}

export interface WatchData {
  isConnected: boolean;
  connectionType: 'real' | 'simulation';
  deviceName?: string;
  steps: number;
  heartRate: number;
  calories: number;
  lastSynced: Date | string;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export interface Reminder {
  id: string;
  habitId: string;
  message: string;
  scheduledTime: Date;
  isPending: boolean;
}

export type OnboardingStep = 'profile' | 'conditions' | 'watch' | 'completion';

export type Screen = 'dashboard' | 'habits' | 'profile';
