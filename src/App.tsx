import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import { generateHabits } from './utils/habitGenerator';
import { getSimulationDevices, simulateWatchData, getConnectionQuality, isRealDeviceConnected, getRealHeartRate } from './utils/bluetoothService';
import { getTimeBasedTip, getWeatherTip, getActivityTip, getHealthTip } from './utils/tipGenerator';
import OnboardingForm from './components/OnboardingForm';
import Dashboard from './components/Dashboard';
import HabitsList from './components/HabitsList';
import ProfileSettings from './components/ProfileSettings';
import TabBar from './components/TabBar';

function App() {
  const {
    isOnboarded,
    userProfile,
    healthConditions,
    customConditions,
    habits,
    watchData,
    currentScreen,
    setOnboarded,
    setHabits,
    addAITip,
    setWeather,
    setWatchData,
    setAvailableDevices,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);

  // Initialize app
  useEffect(() => {
    const init = async () => {
      // Set available devices
      setAvailableDevices(getSimulationDevices());

      // If user is onboarded and has profile, generate habits if empty
      if (isOnboarded && userProfile && habits.length === 0) {
        const generatedHabits = generateHabits(userProfile, healthConditions, customConditions);
        setHabits(generatedHabits);
      }

      setIsLoading(false);
    };

    init();
  }, []);

  // Weather auto-refresh every 60 seconds
  useEffect(() => {
    if (!isOnboarded) return;

    const refreshWeather = () => {
      const conditions: ('Clear' | 'Partly Cloudy' | 'Rainy' | 'Cloudy')[] = ['Clear', 'Partly Cloudy', 'Rainy', 'Cloudy'];
      const newWeather = {
        location: 'Busan, South Korea',
        temperature: Math.floor(Math.random() * 25) + 5,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        humidity: Math.floor(Math.random() * 40) + 40,
        uvIndex: Math.floor(Math.random() * 10) + 1,
        feelsLike: Math.floor(Math.random() * 25) + 5,
      };
      setWeather(newWeather);

      // Add weather-based tip
      const weatherTip = getWeatherTip(newWeather);
      addAITip(weatherTip);
    };

    refreshWeather();
    const interval = setInterval(refreshWeather, 60000);
    return () => clearInterval(interval);
  }, [isOnboarded]);

  // Watch data simulation - update every 3 seconds
  useEffect(() => {
    if (!isOnboarded || !watchData.isConnected) return;

    const updateWatchData = () => {
      // For real devices, try to get real heart rate first
      if (watchData.connectionType === 'real' && isRealDeviceConnected()) {
        getRealHeartRate().then(realHeartRate => {
          if (realHeartRate !== null && realHeartRate > 0) {
            setWatchData({ heartRate: realHeartRate });
          }
        });
      }
      
      const newData = simulateWatchData(watchData);
      newData.connectionQuality = getConnectionQuality(true);
      setWatchData(newData);

      // Trigger tips based on changes
      if (Math.abs(newData.heartRate - watchData.heartRate) > 15) {
        addAITip(getHealthTip(newData));
      }

      if (newData.steps % 2000 === 0 && newData.steps > watchData.steps) {
        addAITip(getActivityTip(newData));
      }
    };

    const interval = setInterval(updateWatchData, 3000);
    return () => clearInterval(interval);
  }, [isOnboarded, watchData.isConnected, watchData.connectionType, watchData.heartRate, watchData.steps]);

  // Time-based tips
  useEffect(() => {
    if (!isOnboarded) return;

    const addTimeTip = () => {
      const timeTip = getTimeBasedTip();
      addAITip(timeTip);
    };

    // Add initial time-based tip
    addTimeTip();

    // Add new tip every 30 minutes
    const interval = setInterval(addTimeTip, 1800000);
    return () => clearInterval(interval);
  }, [isOnboarded]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isOnboarded) {
    return (
      <OnboardingForm 
        onComplete={() => {
          const profile = useAppStore.getState().userProfile;
          const conditions = useAppStore.getState().healthConditions;
          const customs = useAppStore.getState().customConditions;

          if (profile) {
            const generatedHabits = generateHabits(profile, conditions, customs);
            setHabits(generatedHabits);
          }

          setOnboarded(true);

          // Add welcome tip
          addAITip({
            content: "Welcome to your fitness journey! Let's build healthy habits together.",
            category: 'motivation',
            priority: 'high',
          });
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      <AnimatePresence mode="wait">
        {currentScreen === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard />
          </motion.div>
        )}

        {currentScreen === 'habits' && (
          <motion.div
            key="habits"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <HabitsList />
          </motion.div>
        )}

        {currentScreen === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ProfileSettings />
          </motion.div>
        )}
      </AnimatePresence>

      <TabBar />
    </div>
  );
}

export default App;
