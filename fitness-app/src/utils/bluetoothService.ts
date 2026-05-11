import type { WatchData } from '../types';

declare global {
  interface Navigator {
    bluetooth?: {
      requestDevice: (options: { acceptAllDevices?: boolean; optionalServices?: string[] }) => Promise<{ name?: string }>;
    };
  }
}

const SIMULATION_DEVICES = [
  { name: 'FitWatch Pro', type: 'smartwatch' },
  { name: 'Black Shark GT3 Neo', type: 'smartwatch' },
  { name: 'Polar H10', type: 'heart-rate-monitor' },
  { name: 'Garmin Venu', type: 'smartwatch' },
];

export const getSimulationDevices = () => SIMULATION_DEVICES;

export const scanBluetoothDevices = async (): Promise<{ name: string; type: string }[]> => {
  // Check if Web Bluetooth API is available
  if (!navigator.bluetooth) {
    console.log('Web Bluetooth API not available, using simulation');
    return SIMULATION_DEVICES;
  }

  try {
    // Request Bluetooth devices
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['battery_service'],
    });

    // If a device is found, return it along with simulated ones
    return [
      { name: device.name || 'Unknown Device', type: 'bluetooth' },
      ...SIMULATION_DEVICES,
    ];
  } catch (error) {
    console.log('Bluetooth scan failed or cancelled:', error);
    return SIMULATION_DEVICES;
  }
};

export const simulateWatchData = (currentData: WatchData): WatchData => {
  // Simulate realistic data changes
  const stepsChange = Math.floor(Math.random() * 50) + 10;
  const heartRateChange = Math.floor(Math.random() * 7) - 3;
  const caloriesChange = Math.floor(Math.random() * 5) + 1;

  let newHeartRate = currentData.heartRate + heartRateChange;
  // Keep heart rate in realistic range
  newHeartRate = Math.max(50, Math.min(180, newHeartRate));

  return {
    ...currentData,
    steps: currentData.steps + stepsChange,
    heartRate: newHeartRate,
    calories: currentData.calories + caloriesChange,
    lastSynced: new Date(),
  };
};

export const getConnectionQuality = (isConnected: boolean): WatchData['connectionQuality'] => {
  if (!isConnected) return 'disconnected';
  
  const random = Math.random();
  if (random > 0.9) return 'poor';
  if (random > 0.7) return 'good';
  return 'excellent';
};
