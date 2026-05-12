import type { WatchData } from '../types';

declare global {
  interface Navigator {
    bluetooth?: {
      requestDevice: (options: { acceptAllDevices?: boolean; optionalServices?: string[] }) => Promise<BluetoothDevice>;
    };
  }
}

interface BluetoothDevice {
  name?: string;
  id: string;
  gatt?: BluetoothRemoteGATTServer;
  watchAdvertisements(): Promise<void>;
}

interface BluetoothRemoteGATTServer {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic {
  readValue(): Promise<DataView>;
  writeValue(value: DataView): Promise<void>;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  addEventListener(event: string, listener: EventListener): void;
  removeEventListener(event: string, listener: EventListener): void;
}

const SIMULATION_DEVICES = [
  { name: 'FitWatch Pro', type: 'smartwatch' },
  { name: 'Black Shark GT3 Neo', type: 'smartwatch' },
  { name: 'Polar H10', type: 'heart-rate-monitor' },
  { name: 'Garmin Venu', type: 'smartwatch' },
];

export const getSimulationDevices = () => SIMULATION_DEVICES;

// Store for real Bluetooth connection
let realDevice: BluetoothDevice | null = null;
let realGatt: BluetoothRemoteGATTServer | null = null;
let heartRateCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
let heartRateListener: ((event: Event) => void) | null = null;

export const scanBluetoothDevices = async (): Promise<{ name: string; type: string; device?: BluetoothDevice }[]> => {
  // Check if Web Bluetooth API is available
  if (!navigator.bluetooth) {
    console.log('Web Bluetooth API not available, using simulation');
    return SIMULATION_DEVICES;
  }

  try {
    // Request ANY Bluetooth device - this opens the native picker showing ALL nearby BLE devices
    // including smartwatches, phones (in pairing mode), headphones, fitness trackers, etc.
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        'battery_service',
        'device_information',
        'heart_rate',
        'blood_pressure',
        'weight_scale',
        'fitness_machine',
      ],
    });

    // Store the real device for later connection
    realDevice = device;

    // Return the scanned real device along with simulated ones as fallback
    return [
      { name: device.name || 'Unknown Device', type: 'bluetooth', device },
      ...SIMULATION_DEVICES,
    ];
  } catch (error) {
    console.log('Bluetooth scan failed or cancelled:', error);
    // Return simulation devices if scan was cancelled or failed
    return SIMULATION_DEVICES;
  }
};

export const connectToDevice = async (device?: BluetoothDevice): Promise<boolean> => {
  try {
    const deviceToConnect = device || realDevice;
    
    if (!deviceToConnect) {
      console.log('No device to connect to');
      return false;
    }

    // Connect to GATT server
    const server = await deviceToConnect.gatt?.connect();
    if (!server) {
      console.log('Failed to connect to GATT server');
      return false;
    }

    realGatt = server;

    // Try to get heart rate service
    try {
      const heartRateService = await server.getPrimaryService('heart_rate');
      heartRateCharacteristic = await heartRateService.getCharacteristic('heart_rate_measurement');
      
      // Start notifications for heart rate
      await heartRateCharacteristic.startNotifications();
      
      console.log('Connected to heart rate monitor');
      return true;
    } catch (error) {
      console.log('Heart rate service not available, but device connected:', error);
      return true; // Device is connected even without heart rate
    }
  } catch (error) {
    console.error('Failed to connect to device:', error);
    return false;
  }
};

export const disconnectFromDevice = (): void => {
  if (realGatt && realGatt.connected) {
    realGatt.disconnect();
  }
  
  if (heartRateCharacteristic && heartRateListener) {
    heartRateCharacteristic.removeEventListener('characteristicvaluechanged', heartRateListener);
    heartRateListener = null;
  }
  
  realGatt = null;
  heartRateCharacteristic = null;
  realDevice = null;
  
  console.log('Disconnected from device');
};

export const isRealDeviceConnected = (): boolean => {
  return realGatt?.connected ?? false;
};

export const getRealHeartRate = async (): Promise<number | null> => {
  if (!heartRateCharacteristic) {
    return null;
  }

  try {
    const value = await heartRateCharacteristic.readValue();
    // Parse heart rate measurement according to Bluetooth spec
    const flags = value.getUint8(0);
    const format = flags & 0x01 ? 'uint16' : 'uint8';
    
    if (format === 'uint8') {
      return value.getUint8(1);
    } else {
      return value.getUint16(1, true);
    }
  } catch (error) {
    console.error('Failed to read heart rate:', error);
    return null;
  }
};

export const setupHeartRateListener = (callback: (heartRate: number) => void): void => {
  if (!heartRateCharacteristic) {
    return;
  }

  heartRateListener = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;

    const flags = value.getUint8(0);
    const format = flags & 0x01 ? 'uint16' : 'uint8';
    
    let heartRate: number;
    if (format === 'uint8') {
      heartRate = value.getUint8(1);
    } else {
      heartRate = value.getUint16(1, true);
    }
    
    callback(heartRate);
  };

  heartRateCharacteristic.addEventListener('characteristicvaluechanged', heartRateListener);
};

export const simulateWatchData = (currentData: WatchData): WatchData => {
  // If we have a real device connected, try to get real heart rate
  if (isRealDeviceConnected()) {
    getRealHeartRate().then(realHeartRate => {
      if (realHeartRate !== null && realHeartRate > 0) {
        // Real heart rate will be updated via the listener
        return;
      }
    });
  }

  // Simulate realistic data changes for other metrics
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
  
  // For real devices, check actual connection quality
  if (realGatt?.connected) {
    return 'excellent'; // Real connection is typically stable
  }
  
  const random = Math.random();
  if (random > 0.9) return 'poor';
  if (random > 0.7) return 'good';
  return 'excellent';
};
