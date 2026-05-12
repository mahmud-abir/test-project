import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { scanBluetoothDevices, connectToDevice, disconnectFromDevice, setupHeartRateListener, isRealDeviceConnected } from '../utils/bluetoothService';
import { 
  Sun, Cloud, CloudRain, CloudSun, Droplets, Wind, 
  Watch, Bluetooth, CheckCircle, AlertCircle, Footprints, Heart, 
  Flame, Bell, Scan, X
} from 'lucide-react';

export default function Dashboard() {
  const { userProfile, weather, watchData, aiTips, habits, reminders, disconnectWatch, connectWatch, availableDevices, setWatchData, setConnectedBluetoothDevice } = useAppStore();
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Clear': return <Sun className="w-8 h-8 text-warning" />;
      case 'Partly Cloudy': return <CloudSun className="w-8 h-8 text-text-secondary" />;
      case 'Rainy': return <CloudRain className="w-8 h-8 text-primary" />;
      case 'Cloudy': return <Cloud className="w-8 h-8 text-text-muted" />;
      default: return <Sun className="w-8 h-8 text-warning" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      weather: 'bg-blue-500/20 text-blue-400',
      activity: 'bg-green-500/20 text-green-400',
      health: 'bg-red-500/20 text-red-400',
      habit: 'bg-purple-500/20 text-purple-400',
      motivation: 'bg-yellow-500/20 text-yellow-400',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  };

  const pendingReminders = reminders.filter(r => r.isPending).length;
  const activeHabits = habits.filter(h => h.isActive).length;

  const handleConnect = async () => {
    if (selectedDevice) {
      const device = availableDevices.find(d => d.name === selectedDevice)?.device;
      
      // Try to connect to real device first
      if (device) {
        const connected = await connectToDevice(device);
        if (connected) {
          connectWatch(selectedDevice, true, device);
          // Setup heart rate listener for real-time updates
          setupHeartRateListener((heartRate) => {
            setWatchData({ heartRate });
          });
        } else {
          // Fallback to simulation
          connectWatch(selectedDevice, false);
        }
      } else {
        // Simulation mode
        connectWatch(selectedDevice, false);
      }
      
      setShowDeviceModal(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold gradient-text">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {userProfile?.username}!
          </h1>
          <p className="text-text-secondary text-sm">Ready for your daily goals?</p>
        </div>
      </motion.div>

      {/* Weather Widget */}
      {weather && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card bg-gradient-to-br from-blue-500/20 to-purple-500/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getWeatherIcon(weather.condition)}
              <div>
                <p className="text-3xl font-bold">{weather.temperature}°C</p>
                <p className="text-text-secondary text-sm">{weather.location}</p>
              </div>
            </div>
            <div className="text-right space-y-1 text-sm text-text-secondary">
              <div className="flex items-center gap-2 justify-end">
                <Droplets className="w-4 h-4" />
                <span>{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Wind className="w-4 h-4" />
                <span>UV: {weather.uvIndex}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Tips Section */}
      {aiTips.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            AI Daily Tips
          </h2>
          <div className="space-y-2">
            {aiTips.slice(0, 3).map((tip, i) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-3 rounded-xl ${getCategoryColor(tip.category)}`}
              >
                <p className="text-sm">{tip.content}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Active Reminders Badge */}
      {pendingReminders > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="badge badge-warning text-base py-2 px-4"
        >
          <Bell className="w-4 h-4 mr-2" />
          {pendingReminders} Pending Reminder{pendingReminders > 1 ? 's' : ''}
        </motion.div>
      )}

      {/* Quick Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Footprints className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{watchData.steps.toLocaleString()}</p>
            <p className="text-xs text-text-secondary">Steps</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{watchData.heartRate}</p>
            <p className="text-xs text-text-secondary">BPM</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{watchData.calories}</p>
            <p className="text-xs text-text-secondary">Calories</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeHabits}</p>
            <p className="text-xs text-text-secondary">Active</p>
          </div>
        </div>
      </motion.div>

      {/* Watch Connection Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              watchData.isConnected ? 'bg-primary/20' : 'bg-bg-surface'
            }`}>
              {watchData.isConnected ? (
                <Bluetooth className="w-6 h-6 text-primary" />
              ) : (
                <Watch className="w-6 h-6 text-text-muted" />
              )}
            </div>
            <div>
              <p className="font-semibold">
                {watchData.isConnected ? watchData.deviceName : 'No Device'}
              </p>
              <p className={`text-sm ${
                watchData.isConnected 
                  ? watchData.connectionQuality === 'excellent' ? 'text-success' 
                  : watchData.connectionQuality === 'good' ? 'text-warning'
                  : 'text-text-muted'
                  : 'text-text-muted'
              }`}>
                {watchData.isConnected 
                  ? `Connected (${watchData.connectionType === 'real' ? 'Real' : 'Simulation'})`
                  : 'Disconnected'}
              </p>
            </div>
          </div>
          
          {watchData.isConnected && (
            <button 
              onClick={() => {
                disconnectFromDevice();
                disconnectWatch();
                setConnectedBluetoothDevice(null);
              }} 
              className="text-text-muted hover:text-red-400"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {!watchData.isConnected ? (
          <button 
            onClick={() => setShowDeviceModal(true)}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Scan className="w-5 h-5" />
            Scan Devices
          </button>
        ) : (
          <div className="text-xs text-text-secondary">
            Last synced: {watchData.lastSynced.toLocaleTimeString()}
          </div>
        )}
      </motion.div>

      {/* Device Selection Modal */}
      {showDeviceModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDeviceModal(false)}
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="card w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Select Device</h3>
              <button onClick={() => setShowDeviceModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableDevices.map((device) => (
                <button
                  key={device.name}
                  onClick={() => setSelectedDevice(device.name)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedDevice === device.name
                      ? 'bg-primary/20 border-primary'
                      : 'bg-bg-surface border-bg-card hover:border-primary/50'
                  } border`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-sm text-text-muted capitalize">{device.type}</p>
                    </div>
                    {selectedDevice === device.name && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleConnect}
              disabled={!selectedDevice}
              className={`btn-primary w-full mt-4 ${!selectedDevice ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Connect
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
