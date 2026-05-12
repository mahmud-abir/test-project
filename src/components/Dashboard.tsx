import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, Sun, Rain, Wind, Droplets, Thermometer, 
  Watch, Bluetooth, Battery, Activity, Heart, 
  Footprints, Flame, Bell, ChevronRight, ScanLine,
  Clock, MapPin, AlertCircle
} from 'lucide-react';
import { scanBluetoothDevices, connectToDevice, disconnectFromDevice, getRealHeartRate, setupHeartRateListener, isRealDeviceConnected } from '../utils/bluetoothService';
import { fetchWeatherData } from '../utils/weatherService';

const Dashboard: React.FC = () => {
  const { 
    user, 
    watchData, 
    connectWatch, 
    disconnectWatch, 
    habits, 
    tips,
    setLastSynced,
    setWatchData
  } = useAppStore();

  const [isScanning, setIsScanning] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<{ id: string; name: string; isReal: boolean }[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<any>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Weather with Geolocation
  useEffect(() => {
    const getLiveWeather = async () => {
      setIsLocationLoading(true);
      setLocationError(null);
      
      if (!navigator.geolocation) {
        setLocationError('Geolocation not supported');
        setIsLocationLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await fetchWeatherData(
              position.coords.latitude,
              position.coords.longitude
            );
            setWeather(data);
          } catch (err) {
            setLocationError('Failed to fetch weather');
          } finally {
            setIsLocationLoading(false);
          }
        },
        (error) => {
          setLocationError('Location access denied');
          setIsLocationLoading(false);
        }
      );
    };

    getLiveWeather();
    const interval = setInterval(getLiveWeather, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Simulated Data Updates
  useEffect(() => {
    const interval = setInterval(async () => {
      const isRealConnected = await isRealDeviceConnected();
      
      if (isRealConnected && watchData.isConnected) {
        try {
          const realHr = await getRealHeartRate();
          if (realHr) {
            setWatchData({ ...watchData, heartRate: realHr, lastSynced: new Date() });
            setLastSynced(new Date());
            return;
          }
        } catch (e) {
          console.log('Real device read failed, falling back to simulation');
        }
      }

      // Fallback Simulation
      if (watchData.isConnected) {
        setWatchData({
          ...watchData,
          steps: watchData.steps + Math.floor(Math.random() * 50),
          heartRate: 60 + Math.floor(Math.random() * 40),
          calories: watchData.calories + Math.floor(Math.random() * 5),
          lastSynced: new Date(),
        });
        setLastSynced(new Date());
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [watchData, setWatchData, setLastSynced]);

  const handleScanDevices = async () => {
    setIsScanning(true);
    try {
      const devices = await scanBluetoothDevices();
      setAvailableDevices(devices);
      setShowDeviceModal(true);
    } catch (error) {
      console.error('Scan failed:', error);
      // Fallback simulated devices if scan fails or is cancelled
      setAvailableDevices([
        { id: 'sim-1', name: 'FitWatch Pro', isReal: false },
        { id: 'sim-2', name: 'Black Shark GT3 Neo', isReal: false },
        { id: 'sim-3', name: 'Polar H10', isReal: false },
        { id: 'sim-4', name: 'Garmin Venu', isReal: false },
      ]);
      setShowDeviceModal(true);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnectDevice = async (device: any) => {
    try {
      await connectWatch(device.name, device.isReal ? 'real' : 'simulation');
      if (device.isReal) {
        await setupHeartRateListener((hr) => {
          setWatchData(prev => ({ ...prev, heartRate: hr, lastSynced: new Date() }));
        });
      }
      setShowDeviceModal(false);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = async () => {
    await disconnectFromDevice();
    await disconnectWatch();
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'clear': return <Sun className="w-8 h-8 text-yellow-400" />;
      case 'rainy': return <Rain className="w-8 h-8 text-blue-400" />;
      case 'cloudy': return <Cloud className="w-8 h-8 text-gray-400" />;
      default: return <Sun className="w-8 h-8 text-yellow-400" />;
    }
  };

  const formatTime = (date: Date | string | null) => {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          <h1 className="text-2xl font-bold text-white">
            Hello, {user?.username || 'User'}
          </h1>
          <div className="flex items-center gap-2 text-cyan-400 mt-1">
            <Clock className="w-4 h-4" />
            <span className="text-lg font-mono font-semibold">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        
        <button 
          onClick={() => setShowDeviceModal(true)}
          className="p-2 bg-surface rounded-full hover:bg-card transition-colors"
        >
          <Bell className="w-6 h-6 text-white" />
        </button>
      </motion.div>

      {/* Weather Widget */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-4 text-white shadow-lg"
      >
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-1 text-blue-100 text-sm mb-1">
              <MapPin className="w-3 h-3" />
              <span>{isLocationLoading ? 'Locating...' : locationError ? 'Default Location' : 'Current Location'}</span>
            </div>
            {isLocationLoading ? (
              <div className="h-8 w-24 bg-white/20 rounded animate-pulse" />
            ) : (
              <div className="text-3xl font-bold">
                {weather ? `${Math.round(weather.temperature)}°C` : '22°C'}
              </div>
            )}
            <p className="text-blue-100 text-sm">
              {weather ? weather.condition : 'Partly Cloudy'}
            </p>
          </div>
          <div className="text-right">
            {isLocationLoading ? (
              <div className="h-12 w-12 bg-white/20 rounded-full animate-pulse" />
            ) : (
              getWeatherIcon(weather ? weather.condition : 'Clear')
            )}
            <div className="mt-2 text-xs text-blue-100">
              {weather ? `H:${Math.round(weather.temperature + 4)}° L:${Math.round(weather.temperature - 3)}°` : 'H:26° L:19°'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Tips */}
      {tips.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-xl p-4 border-l-4 border-cyan-400"
        >
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-cyan-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white">AI Daily Tip</h3>
              <p className="text-sm text-gray-300 mt-1">{tips[0].content}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Steps', value: watchData.steps, icon: Footprints, color: 'text-green-400' },
          { label: 'Heart Rate', value: `${watchData.heartRate} bpm`, icon: Heart, color: 'text-red-400' },
          { label: 'Calories', value: watchData.calories, icon: Flame, color: 'text-orange-400' },
          { label: 'Reminders', value: habits.filter(h => !h.completedToday).length, icon: Bell, color: 'text-cyan-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="bg-surface rounded-xl p-4 flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg bg-opacity-10 ${stat.color.replace('text-', 'bg-')}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className="text-lg font-bold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Watch Connection Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-surface rounded-xl p-4"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${watchData.isConnected ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
              <Watch className={`w-6 h-6 ${watchData.isConnected ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
            <div>
              <h3 className="text-white font-semibold">
                {watchData.isConnected ? watchData.name : 'No Watch Connected'}
              </h3>
              <p className="text-xs text-gray-400">
                {watchData.isConnected 
                  ? `Last synced: ${formatTime(watchData.lastSynced)}` 
                  : 'Connect to track health'}
              </p>
            </div>
          </div>
          {watchData.isConnected && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-green-400 text-xs">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Connected
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                <Battery className="w-3 h-3" />
                {watchData.batteryLevel}%
              </div>
            </div>
          )}
        </div>

        {!watchData.isConnected ? (
          <button
            onClick={handleScanDevices}
            disabled={isScanning}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isScanning ? (
              <>
                <ScanLine className="w-4 h-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Bluetooth className="w-4 h-4" />
                Scan Devices
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors"
          >
            Disconnect
          </button>
        )}
      </motion.div>

      {/* Device Selection Modal */}
      <AnimatePresence>
        {showDeviceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeviceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Select Device</h2>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {availableDevices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => handleConnectDevice(device)}
                    className="w-full flex items-center justify-between p-4 bg-surface hover:bg-gray-700 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {device.isReal ? (
                        <ScanLine className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Watch className="w-5 h-5 text-gray-400" />
                      )}
                      <div className="text-left">
                        <p className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                          {device.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {device.isReal ? 'Real Bluetooth Device' : 'Simulated Mode'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white" />
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-400 text-center">
                  {availableDevices.some(d => d.isReal) 
                    ? 'Select a real device to connect via Web Bluetooth' 
                    : 'No real devices found. Showing simulated options.'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
