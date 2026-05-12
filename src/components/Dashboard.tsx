import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Cloud, CloudRain, Wind, Droplets, Activity, 
  Watch, Bluetooth, BluetoothOff, MapPin, Clock, 
  Thermometer, Umbrella, Eye, Footprints, Flame, Heart
} from 'lucide-react';
import { getWeatherData, WeatherData } from '../utils/weatherService';

const Dashboard = () => {
  const { 
    userProfile, 
    watchData, 
    connectWatch, 
    disconnectWatch, 
    habits, 
    toggleHabitComplete, 
    snoozeHabit,
    connectedBluetoothDevice,
    setConnectedBluetoothDevice
  } = useAppStore();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Weather with Geolocation
  useEffect(() => {
    const fetchWeather = async () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const data = await getWeatherData(latitude, longitude, 'My Location', true);
            setWeather(data);
            setIsLocationEnabled(true);
          },
          async (error) => {
            console.log('Location denied, using fallback', error);
            const data = await getWeatherData(35.1796, 129.0756, 'Busan', false);
            setWeather(data);
            setIsLocationEnabled(false);
          }
        );
      } else {
        const data = await getWeatherData(35.1796, 129.0756, 'Busan', false);
        setWeather(data);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Simulated Real-time Data Updates (Heart Rate, Steps)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only update if we have a watch connected (real or simulated)
      if (watchData.isConnected) {
        // Fluctuate heart rate slightly
        const baseHR = watchData.heartRate || 70;
        const fluctuation = Math.floor(Math.random() * 5) - 2; 
        // In a real app, we would call an action to update the store
        // For now, this is visual logic handled in the store via bluetoothService if real
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [watchData]);

  const handleScanDevices = async () => {
    setIsScanning(true);
    setScanError(null);
    setShowDeviceModal(true);

    try {
      // Check for Web Bluetooth API
      if (navigator.bluetooth) {
        // Request any device (shows all nearby BLE devices)
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service', 'device_information']
        });
        
        if (device) {
          setConnectedBluetoothDevice(device);
          // We don't connect immediately here, just select it in the modal
          // The "Connect" button in the modal will handle the GATT connection
        }
      } else {
        setScanError("Web Bluetooth not supported in this browser. Use Chrome/Edge.");
      }
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        setScanError("No device selected.");
      } else {
        setScanError(error.message || "Scan failed");
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnectSelected = async () => {
    if (connectedBluetoothDevice) {
      try {
        await connectWatch(connectedBluetoothDevice);
        setShowDeviceModal(false);
      } catch (err) {
        setScanError("Connection failed");
      }
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Clear': return <Sun className="w-8 h-8 text-yellow-400" />;
      case 'Partly Cloudy': return <Cloud className="w-8 h-8 text-gray-300" />;
      case 'Cloudy': return <Cloud className="w-8 h-8 text-gray-400" />;
      case 'Rainy': return <CloudRain className="w-8 h-8 text-blue-400" />;
      default: return <Sun className="w-8 h-8 text-yellow-400" />;
    }
  };

  const activeReminders = habits.filter(h => !h.completedToday).length;

  return (
    <div className="space-y-6 pb-24">
      {/* Header with Clock */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hello, {userProfile?.username || 'User'}
          </h1>
          <div className="flex items-center gap-2 text-cyan-400 mt-1">
            <Clock className="w-4 h-4" />
            <span className="text-lg font-mono">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
          {userProfile?.username?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>

      {/* Weather Widget */}
      {weather && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-md rounded-2xl p-4 border border-white/10"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                {getWeatherIcon(weather.condition)}
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs text-gray-300">
                  <MapPin className="w-3 h-3" />
                  {weather.locationName}
                  {weather.isRealLocation && <span className="text-green-400 text-[10px]">● Live</span>}
                </div>
                <div className="text-2xl font-bold text-white">{weather.temp}°C</div>
                <div className="text-xs text-gray-300">{weather.condition}</div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-1 text-xs text-gray-300 justify-end">
                <Droplets className="w-3 h-3" /> {weather.humidity}%
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-300 justify-end">
                <Sun className="w-3 h-3" /> UV {weather.uvIndex}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div 
          whileTap={{ scale: 0.95 }}
          className="bg-surface p-4 rounded-2xl border border-white/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Footprints className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-gray-400">Steps</span>
          </div>
          <div className="text-xl font-bold text-white">{watchData.steps.toLocaleString()}</div>
          <div className="text-xs text-green-400">+12% vs yesterday</div>
        </motion.div>

        <motion.div 
          whileTap={{ scale: 0.95 }}
          className="bg-surface p-4 rounded-2xl border border-white/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-400">Heart Rate</span>
          </div>
          <div className="text-xl font-bold text-white">{watchData.heartRate} bpm</div>
          <div className="text-xs text-gray-400">Resting</div>
        </motion.div>

        <motion.div 
          whileTap={{ scale: 0.95 }}
          className="bg-surface p-4 rounded-2xl border border-white/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-gray-400">Calories</span>
          </div>
          <div className="text-xl font-bold text-white">{watchData.calories}</div>
          <div className="text-xs text-gray-400">kcal burned</div>
        </motion.div>

        <motion.div 
          whileTap={{ scale: 0.95 }}
          className="bg-surface p-4 rounded-2xl border border-white/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Reminders</span>
          </div>
          <div className="text-xl font-bold text-white">{activeReminders}</div>
          <div className="text-xs text-cyan-400">Pending today</div>
        </motion.div>
      </div>

      {/* Watch Connection Card */}
      <div className="bg-surface rounded-2xl p-4 border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${watchData.isConnected ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
              {watchData.isConnected ? <Bluetooth className="w-5 h-5" /> : <BluetoothOff className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {watchData.isConnected ? watchData.name : 'No Watch Connected'}
              </h3>
              <p className="text-xs text-gray-400">
                {watchData.isConnected 
                  ? `Battery: ${watchData.batteryLevel}% • Synced: ${watchData.lastSynced ? new Date(watchData.lastSynced).toLocaleTimeString() : 'Never'}`
                  : 'Connect your device'}
              </p>
            </div>
          </div>
          {watchData.isConnected && (
            <button 
              onClick={disconnectWatch}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Disconnect
            </button>
          )}
        </div>

        {!watchData.isConnected && (
          <button
            onClick={() => setShowDeviceModal(true)}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Bluetooth className="w-4 h-4" />
            Scan Devices
          </button>
        )}
      </div>

      {/* Device Selection Modal */}
      {showDeviceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card w-full max-w-md rounded-2xl p-6 border border-white/10"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Select Device</h3>
              <button onClick={() => setShowDeviceModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {scanError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {scanError}
              </div>
            )}

            <div className="space-y-3 mb-6">
              {connectedBluetoothDevice ? (
                <div className="p-4 bg-cyan-500/20 border border-cyan-500/50 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-cyan-500 rounded-lg text-white">
                    <Watch className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{connectedBluetoothDevice.name || 'Unknown Device'}</div>
                    <div className="text-xs text-cyan-300 flex items-center gap-1">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                      Real Device Detected
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-xl text-center">
                  <p className="text-gray-400 text-sm mb-3">No device selected yet.</p>
                  <button
                    onClick={handleScanDevices}
                    disabled={isScanning}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isScanning ? 'Scanning...' : 'Scan for Real Devices'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Opens Bluetooth picker (Chrome/Edge only)
                  </p>
                </div>
              )}

              {/* Simulated Fallback Options */}
              {!connectedBluetoothDevice && (
                <>
                  <div className="text-xs text-gray-500 text-center my-2">— OR SELECT SIMULATED —</div>
                  {['FitWatch Pro', 'Black Shark GT3 Neo', 'Polar H10', 'Garmin Venu'].map((device) => (
                    <button
                      key={device}
                      onClick={() => {
                        // Create a mock device object for simulation
                        const mockDevice = {
                          id: `sim-${device}`,
                          name: device,
                          gatt: null
                        } as unknown as BluetoothDevice;
                        setConnectedBluetoothDevice(mockDevice);
                      }}
                      className="w-full p-3 bg-surface hover:bg-white/5 border border-white/5 rounded-xl text-left flex items-center gap-3 transition-colors"
                    >
                      <Watch className="w-5 h-5 text-gray-400" />
                      <span className="text-white font-medium">{device}</span>
                      <span className="ml-auto text-xs text-gray-500">Simulation</span>
                    </button>
                  ))}
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeviceModal(false)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectSelected}
                disabled={!connectedBluetoothDevice}
                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium"
              >
                Connect
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Tips Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">AI Daily Tips</h3>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 p-4 rounded-xl border border-cyan-500/20"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium text-white text-sm">Hydration Reminder</h4>
              <p className="text-xs text-gray-300 mt-1">
                Based on your activity level and local weather ({weather?.temp}°C), try to drink 250ml of water every hour.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
