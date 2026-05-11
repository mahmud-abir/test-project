import { AITip, WeatherData, WatchData } from '../types';

const WEATHER_TIPS = [
  "It's a beautiful day! Perfect for an outdoor walk.",
  "The weather is pleasant. Consider some light exercise outside.",
  "Stay hydrated as the temperature rises throughout the day.",
  "Cloudy skies - great for indoor workouts!",
  "Rainy day? Try some stretching exercises at home.",
];

const ACTIVITY_TIPS = [
  "You're doing great! Keep up the momentum.",
  "Every step counts towards your health goals.",
  "Consider taking a short walk to boost your energy.",
  "Your activity level is improving. Well done!",
  "Remember to stay active throughout the day.",
];

const HEALTH_TIPS = [
  "Don't forget to check your vitals regularly.",
  "Proper posture helps prevent back pain.",
  "Deep breathing can help reduce stress.",
  "Stay consistent with your health routines.",
  "Listen to your body and rest when needed.",
];

const HABIT_TIPS = [
  "Building habits takes time. Be patient with yourself.",
  "Small consistent actions lead to big results.",
  "Track your progress to stay motivated.",
  "Celebrate small wins along your journey.",
  "Your future self will thank you for today's efforts.",
];

const MOTIVATION_TIPS = [
  "You're stronger than you think!",
  "Every day is a new opportunity to improve.",
  "Believe in yourself and your abilities.",
  "Progress, not perfection, is the goal.",
  "You've got this! Keep pushing forward.",
];

export const generateAITip = (
  category: 'weather' | 'activity' | 'health' | 'habit' | 'motivation',
  weather?: WeatherData,
  watchData?: WatchData
): Omit<AITip, 'id' | 'timestamp'> => {
  let content = '';
  let priority: 'high' | 'medium' | 'low' = 'medium';

  switch (category) {
    case 'weather':
      if (weather) {
        if (weather.temperature > 25) {
          content = `It's warm (${weather.temperature}°C) in ${weather.location}. Stay hydrated and avoid prolonged sun exposure.`;
          priority = 'high';
        } else if (weather.temperature < 10) {
          content = `It's chilly (${weather.temperature}°C). Dress warmly if going outside.`;
          priority = 'medium';
        } else if (weather.condition === 'Rainy') {
          content = "It's raining. Consider indoor activities or carry an umbrella.";
          priority = 'medium';
        } else {
          content = WEATHER_TIPS[Math.floor(Math.random() * WEATHER_TIPS.length)];
        }
      } else {
        content = WEATHER_TIPS[Math.floor(Math.random() * WEATHER_TIPS.length)];
      }
      break;

    case 'activity':
      if (watchData && watchData.steps > 8000) {
        content = `Great job! You've reached ${watchData.steps} steps today. Keep it up!`;
        priority = 'high';
      } else if (watchData && watchData.steps < 2000) {
        content = "Let's get moving! Even a short walk can boost your energy.";
        priority = 'medium';
      } else {
        content = ACTIVITY_TIPS[Math.floor(Math.random() * ACTIVITY_TIPS.length)];
      }
      break;

    case 'health':
      if (watchData && watchData.heartRate > 100) {
        content = "Your heart rate is elevated. Take a moment to rest and breathe deeply.";
        priority = 'high';
      } else if (watchData && watchData.heartRate < 50) {
        content = "Your heart rate is low. Make sure you're feeling okay.";
        priority = 'high';
      } else {
        content = HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)];
      }
      break;

    case 'habit':
      content = HABIT_TIPS[Math.floor(Math.random() * HABIT_TIPS.length)];
      break;

    case 'motivation':
      content = MOTIVATION_TIPS[Math.floor(Math.random() * MOTIVATION_TIPS.length)];
      break;
  }

  return { content, category, priority };
};

export const getTimeBasedTip = (): Omit<AITip, 'id' | 'timestamp'> => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 9) {
    return {
      content: "Good morning! Start your day with a glass of water and some light stretching.",
      category: 'habit',
      priority: 'medium',
    };
  } else if (hour >= 9 && hour < 12) {
    return {
      content: "Mid-morning energy boost! Take a short break and move around.",
      category: 'activity',
      priority: 'medium',
    };
  } else if (hour >= 12 && hour < 14) {
    return {
      content: "Lunch time! Remember to make healthy food choices.",
      category: 'health',
      priority: 'medium',
    };
  } else if (hour >= 14 && hour < 17) {
    return {
      content: "Afternoon slump? A quick walk can refresh your mind.",
      category: 'activity',
      priority: 'low',
    };
  } else if (hour >= 17 && hour < 20) {
    return {
      content: "Evening is a great time for exercise. How about a walk?",
      category: 'activity',
      priority: 'medium',
    };
  } else if (hour >= 20 && hour < 23) {
    return {
      content: "Wind down time. Prepare for a good night's sleep.",
      category: 'health',
      priority: 'medium',
    };
  } else {
    return {
      content: "Rest is essential for recovery. Make sure you're getting enough sleep.",
      category: 'health',
      priority: 'low',
    };
  }
};

export const getWeatherTip = (weather: WeatherData): Omit<AITip, 'id' | 'timestamp'> => {
  return generateAITip('weather', weather);
};

export const getActivityTip = (watchData: WatchData): Omit<AITip, 'id' | 'timestamp'> => {
  return generateAITip('activity', undefined, watchData);
};

export const getHealthTip = (watchData: WatchData): Omit<AITip, 'id' | 'timestamp'> => {
  return generateAITip('health', undefined, watchData);
};
