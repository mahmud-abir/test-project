import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';
import { 
  Sun, Cloud, CloudRain, Wind, Droplets, Activity, 
  Watch, Bluetooth, Battery, Heart, MapPin, AlertCircle 
} from 'lucide-react';
import { scanBluetoothDevices, connectToDevice, disconnectFromDevice, getRealHeartRate, setupHeartRateListener } from '../utils/bluetoothService';

const Dashboard = () => {
  const { user, watchData, setWatchData, habits, addTip, toggleHabitComplete } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<{ temp: number; condition: string; humidity: number; uv: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<{ id: string; name: string; isReal: boolean }[]>([]);

  // 1. Real-Time Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Real-Time Location Weather
  useEffect(() => {
    const fetchLocationWeather = async () => {
      if (!navigator.geolocation) {
        setLocationError('Geolocation not supported');
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => 
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        const { latitude, longitude } = position.coords;

        // Fetch from Open-Meteo API (Free, no key required)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`
        );
        const data = await response.json();
        const current = data.current;

        // Map WMO weather codes to conditions
        const getCondition = (code: number) => {
          if (code === 0) return 'Clear';
          if (code <= 3) return 'Partly Cloudy';
          if (code <= 48) return 'Cloudy';
          if (code <= 67) return 'Rainy';
          return 'Unknown';
        };

        setWeather({
          temp: Math.round(current.temperature_2m),
          condition: getCondition(current.weather_code),
          humidity: current.relative_humidity_2m,
          uv: 3 // Simulated UV as API requires extra params
        });
      } catch (err) {
        console.error('Location error:', err);
        setLocationError('Location access denied. Showing default.');
        // Fallback to Busan
        setWeather({ temp: 22, condition: 'Partly Cloudy', humidity: 60, uv: 4 });
      }
    };

    fetchLocationWeather();
    const interval = setInterval(fetchLocationWeather, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // 3. Bluetooth Scanning
  const handleScanDevices = async () => {
    setIsScanning(true);
    try {
      // Try real Web Bluetooth
      if (navigator.bluetooth) {
        const device = await scanBluetoothDevices();
        if (device) {
          setAvailableDevices(prev => [...prev, { id: device.id, name: device.name, isReal: true }]);
        }
      }
    } catch (err) {
      console.log('Real scan failed or cancelled, showing simulated');
    } finally {
      // Always show simulated fallbacks
      setAvailableDevices([
        { id: 'sim-1', name: 'FitWatch Pro', isReal: false },
        { id: 'sim-2', name: 'Black Shark GT3 Neo', isReal: false },
        { id: 'sim-3', name: 'Polar H10', isReal: false },
        ...availableDevices
      ]);
      setIsScanning(false);
      setShowDeviceModal(true);
    }
  };

  const handleConnect = async (deviceId: string, deviceName: string, isReal: boolean) => {
    if (isReal && navigator.bluetooth) {
      // Re-trigger connection for real device if needed
      await connectToDevice(deviceId);
    }
    
    setWatchData({
      id: deviceId,
      name: deviceName,
      lastSynced: new Date(),
      batteryLevel: Math.floor(Math.random() * 40) + 60,
      isConnected: true
    });
    setShowDeviceModal(false);
    
    // Start real heart rate listener if real device
    if (isReal) {
      setupHeartRateListener((hr) => {
        // Update store with real HR logic here
      });
    }
  };

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('Clear')) return <Sun className="w-8 h-8 text-yellow-400" />;
    if (condition.includes('Cloud')) return <Cloud className="w-8 h-8 text-gray-400" />;
    if (condition.includes('Rain')) return <CloudRain className="w-8 h-8 text-blue-400" />;
    return <Sun className="w-8 h-8 text-yellow-400" />;
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header with Clock */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Hello, {user.username || 'User'}</h1>
          <div className="text-cyan-400 font-mono text-xl mt-1">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <p className="text-gray-400 text-sm">
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
          {user.username?.[0]?.toUpperCase() || 'U'}
        </div>
      </motion.div>

      {/* Weather Widget (Live Location) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-md rounded-2xl p-4 border border-white/10 relative overflow-hidden"
      >
        <div className="flex justify-between items-center relative z-10">
          <div>
            <div className="flex items-center gap-2 text-gray-300 text-sm mb-1">
              <MapPin className="w-4 h-4" />
              <span>{locationError ? 'Default Location' : 'Current Location'}</span>
            </div>
            <div className="text-4xl font-bold text-white">{weather?.temp || '--'}°</div>
            <div className="text-gray-300">{weather?.condition || 'Loading...'}</div>
          </div>
          <div className="text-right">
            {getWeatherIcon(weather?.condition || 'Clear')}
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
              <Droplets className="w-4 h-4" /> {weather?.humidity || '--'}%
            </div>
          </div>
        </div>
        {/* Decorative background */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl"></div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Steps', value: '8,432', icon: Activity, color: 'text-green-400' },
          { label: 'Heart Rate', value: watchData.isConnected ? `${watchData.heartRate || 72}` : '--', icon: Heart, color: 'text-red-400' },
          { label: 'Calories', value: '420', icon: Flame, color: 'text-orange-400' },
          { label: 'Reminders', value: habits.filter(h => !h.completedToday).length, icon: Bell, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="bg-[#252540] p-4 rounded-2xl border border-white/5"
          >
            <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-2 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Watch Connection Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#252540] p-4 rounded-2xl border border-white/5"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Smart Watch</h3>
          {watchData.isConnected && (
            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Connected
            </span>
          )}
        </div>
        
        {watchData.isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                <Watch className="w-6 h-6 text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{watchData.name}</div>
                <div className="text-xs text-gray-400">
                  Last synced: {watchData.lastSynced ? new Date(watchData.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </div>
              </div>
              <Battery className="w-5 h-5 text-green-400" />
            </div>
            <button 
              onClick={() => setWatchData({ ...watchData, isConnected: false })}
              className="w-full py-2 text-sm text-red-400 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button 
            onClick={handleScanDevices}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Bluetooth className="w-5 h-5" />
            Scan Devices
          </button>
        )}
      </motion.div>

      {/* Device Selection Modal */}
      {showDeviceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#252540] rounded-2xl p-6 w-full max-w-sm border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-4">Select Device</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableDevices.map(device => (
                <button
                  key={device.id}
                  onClick={() => handleConnect(device.id, device.name, device.isReal)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  {device.isReal ? (
                    <Bluetooth className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <Watch className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <div className="text-white font-medium">{device.name}</div>
                    {device.isReal && <div className="text-xs text-cyan-400">Real Device Detected</div>}
                  </div>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowDeviceModal(false)}
              className="mt-4 w-full py-2 text-gray-400 hover:text-white transition-colors"
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
