import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Heart, 
  Footprints, 
  Flame, 
  Bell, 
  Watch, 
  Bluetooth, 
  ScanLine, 
  Thermometer, 
  Droplets, 
  Sun, 
  Cloud, 
  CloudRain, 
  Wind,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Smartphone
} from 'lucide-react';
import { scanBluetoothDevices, connectToDevice, disconnectFromDevice, isRealDeviceConnected, setupHeartRateListener } from '../utils/bluetoothService';
import { getWeatherData, WeatherData } from '../utils/weatherService';

// Types
interface DeviceOption {
  id: string;
  name: string;
  isReal?: boolean;
}

const Dashboard: React.FC = () => {
  const { 
    user, 
    watchData, 
    connectWatch, 
    disconnectWatch, 
    habits, 
    completeHabit, 
    snoozeHabit,
    setWatchData,
    addAiTip
  } = useAppStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<DeviceOption[]>([]);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('disconnected');
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  // Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Weather Effect (Real-time Location)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              const data = await getWeatherData(latitude, longitude);
              setWeather(data);
              setIsLocationEnabled(true);
              
              // Add weather-based tip
              if (data.temperature < 10) {
                addAiTip("It's cold outside! Dress warmly for your morning walk.", "weather", "medium");
              } else if (data.temperature > 25) {
                addAiTip("Warm weather detected. Stay hydrated during workouts!", "weather", "high");
              }
            },
            (error) => {
              console.warn("Location access denied or unavailable", error);
              // Fallback to Busan
              const fallback = await getWeatherData(35.1796, 129.0756);
              setWeather(fallback);
              setIsLocationEnabled(false);
            }
          );
        } else {
          throw new Error("Geolocation not supported");
        }
      } catch (err) {
        // Fallback to Busan on any error
        const fallback = await getWeatherData(35.1796, 129.0756);
        setWeather(fallback);
        setIsLocationEnabled(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [addAiTip]);

  // Simulated Data Updates & Connection Quality
  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (watchData?.isConnected) {
        // Simulate connection quality fluctuation
        const qualities: ('excellent' | 'good' | 'poor')[] = ['excellent', 'good', 'good', 'excellent'];
        setConnectionQuality(qualities[Math.floor(Math.random() * qualities.length)]);

        // If real device connected, try to get real HR, else simulate
        if (watchData.id === 'real-device') {
           // Real device logic handled in bluetoothService listener which updates store directly
           // We just update lastSynced here
           setWatchData({
             ...watchData,
             lastSynced: new Date(),
           });
        } else {
          // Simulation
          setWatchData({
            ...watchData,
            steps: watchData.steps + Math.floor(Math.random() * 10),
            heartRate: Math.max(60, Math.min(100, watchData.heartRate + (Math.random() > 0.5 ? 1 : -1))),
            calories: watchData.calories + 0.1,
            lastSynced: new Date(),
          });
        }
      } else {
        setConnectionQuality('disconnected');
      }
    }, 3000);

    return () => clearInterval(updateInterval);
  }, [watchData, setWatchData]);

  // Scan Devices Handler
  const handleScanDevices = async () => {
    setIsScanning(true);
    try {
      // Try real scan first
      const realDevice = await scanBluetoothDevices();
      if (realDevice) {
        setAvailableDevices([{ id: realDevice.id, name: realDevice.name, isReal: true }]);
      } else {
        // Fallback to simulated list if no real device found or user cancelled
        setAvailableDevices([
          { id: 'sim-1', name: 'FitWatch Pro' },
          { id: 'sim-2', name: 'Black Shark GT3 Neo' },
          { id: 'sim-3', name: 'Polar H10' },
          { id: 'sim-4', name: 'Garmin Venu' },
        ]);
      }
      setShowDeviceModal(true);
    } catch (error) {
      console.error("Scan failed:", error);
      // Show simulated devices on error
      setAvailableDevices([
        { id: 'sim-1', name: 'FitWatch Pro' },
        { id: 'sim-2', name: 'Black Shark GT3 Neo' },
      ]);
      setShowDeviceModal(true);
    } finally {
      setIsScanning(false);
    }
  };

  // Connect Handler
  const handleConnect = async (device: DeviceOption) => {
    try {
      if (device.isReal) {
        const connected = await connectToDevice(device.id); // ID is actually the device object passed through scan
        if (connected) {
          connectWatch(device.name, true);
          setupHeartRateListener((hr) => {
            // This callback updates the store directly in bluetoothService usually, 
            // but ensuring store update here if needed
            const current = useAppStore.getState().watchData;
            if(current) setWatchData({ ...current, heartRate: hr, lastSynced: new Date() });
          });
        }
      } else {
        // Simulated connection
        connectWatch(device.name, false);
      }
      setShowDeviceModal(false);
    } catch (err) {
      console.error("Connection failed", err);
      alert("Failed to connect. Please try again.");
    }
  };

  // Format Helpers
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear': return <Sun className="w-8 h-8 text-yellow-400" />;
      case 'rainy': return <CloudRain className="w-8 h-8 text-blue-400" />;
      case 'cloudy': return <Cloud className="w-8 h-8 text-gray-400" />;
      default: return <Sun className="w-8 h-8 text-yellow-400" />;
    }
  };

  const activeReminders = habits.filter(h => !h.completedToday && h.nextReminder <= new Date()).length;

  return (
    <div className="space-y-6 pb-24">
      {/* Header with Clock */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hello, {user?.username || 'User'}
          </h1>
          <div className="flex items-center gap-2 text-cyan-400 mt-1">
            <Clock className="w-4 h-4" />
            <span className="text-lg font-mono font-semibold">{formatTime(currentTime)}</span>
          </div>
          <p className="text-sm text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(currentTime)}
          </p>
        </div>
        
        <div className="relative">
          <button className="p-2 bg-surface rounded-full relative">
            <Bell className="w-6 h-6 text-white" />
            {activeReminders > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                {activeReminders}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Weather Widget */}
      {weather && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              {getWeatherIcon(weather.condition)}
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{Math.round(weather.temperature)}°C</p>
              <p className="text-sm text-gray-300 capitalize">{weather.condition}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                {isLocationEnabled ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isLocationEnabled ? 'Live Location' : 'Busan (Default)'}
              </p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center justify-end gap-1 text-xs text-gray-300">
              <Droplets className="w-3 h-3" /> {weather.humidity}%
            </div>
            <div className="flex items-center justify-end gap-1 text-xs text-gray-300">
              <Wind className="w-3 h-3" /> {weather.windSpeed} km/h
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Footprints, label: 'Steps', value: watchData?.steps.toLocaleString() || '0', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
          { icon: Heart, label: 'Heart Rate', value: `${watchData?.heartRate || '--'} bpm`, color: 'text-red-400', bg: 'bg-red-400/10' },
          { icon: Flame, label: 'Calories', value: `${Math.round(watchData?.calories || 0)}`, color: 'text-orange-400', bg: 'bg-orange-400/10' },
          { icon: Activity, label: 'Reminders', value: activeReminders, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`${stat.bg} p-4 rounded-2xl border border-white/5`}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Watch Connection Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-surface border border-white/10 rounded-2xl p-5"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${watchData?.isConnected ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
              {watchData?.isConnected ? <Bluetooth className="w-6 h-6" /> : <Watch className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {watchData?.isConnected ? watchData.name : 'No Watch Connected'}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${
                  connectionQuality === 'excellent' ? 'text-green-400' :
                  connectionQuality === 'good' ? 'text-yellow-400' :
                  connectionQuality === 'poor' ? 'text-orange-400' : 'text-gray-400'
                }`}>
                  {watchData?.isConnected 
                    ? `Signal: ${connectionQuality.charAt(0).toUpperCase() + connectionQuality.slice(1)}` 
                    : 'Disconnected'}
                </span>
                {watchData?.isConnected && (
                   <span className="text-xs text-gray-500">
                     {watchData.lastSynced ? new Date(watchData.lastSynced).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                   </span>
                )}
              </div>
            </div>
          </div>
          {watchData?.isConnected ? (
            <button 
              onClick={disconnectWatch}
              className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition"
            >
              Disconnect
            </button>
          ) : (
            <button 
              onClick={handleScanDevices}
              disabled={isScanning}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {isScanning ? <ScanLine className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
              {isScanning ? 'Scanning...' : 'Scan Devices'}
            </button>
          )}
        </div>

        {watchData?.isConnected && (
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-xs text-gray-400">Battery</p>
              <p className="text-sm font-bold text-white">{watchData.batteryLevel}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">HR Zone</p>
              <p className="text-sm font-bold text-white">
                {watchData.heartRate > 140 ? 'Peak' : watchData.heartRate > 120 ? 'Cardio' : 'Fat Burn'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Status</p>
              <p className="text-sm font-bold text-green-400">Active</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* AI Tips Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">AI Daily Tips</h3>
        <AnimatePresence>
          {useAppStore.getState().aiTips.slice(0, 3).map((tip, idx) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-xl border-l-4 ${
                tip.category === 'health' ? 'bg-red-500/10 border-red-500' :
                tip.category === 'activity' ? 'bg-orange-500/10 border-orange-500' :
                tip.category === 'weather' ? 'bg-blue-500/10 border-blue-500' :
                'bg-cyan-500/10 border-cyan-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 mt-0.5 ${
                   tip.category === 'health' ? 'text-red-400' :
                   tip.category === 'activity' ? 'text-orange-400' :
                   tip.category === 'weather' ? 'text-blue-400' : 'text-cyan-400'
                }`} />
                <div>
                  <p className="text-sm text-white">{tip.message}</p>
                  <p className="text-xs text-gray-400 mt-1 capitalize">{tip.category} • {tip.priority} priority</p>
                </div>
              </div>
            </motion.div>
          ))}
          {useAppStore.getState().aiTips.length === 0 && (
            <p className="text-sm text-gray-500 italic">No new tips right now. Keep moving!</p>
          )}
        </AnimatePresence>
      </div>

      {/* Device Selection Modal */}
      {showDeviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card w-full max-w-md rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-4">Select Device</h3>
            
            {availableDevices.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No devices found.</p>
            ) : (
              <div className="space-y-2">
                {availableDevices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => handleConnect(device)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-surface hover:bg-white/10 transition border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      {device.isReal ? (
                        <Smartphone className="w-6 h-6 text-green-400" />
                      ) : (
                        <Watch className="w-6 h-6 text-gray-400" />
                      )}
                      <div className="text-left">
                        <p className="text-white font-medium">{device.name}</p>
                        {device.isReal && (
                          <p className="text-xs text-green-400">Real Bluetooth Device</p>
                        )}
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  </button>
                ))}
              </div>
            )}
            
            <button 
              onClick={() => setShowDeviceModal(false)}
              className="mt-6 w-full py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
