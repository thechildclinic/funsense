# Device Integration Guide - Bluetooth & USB Medical Devices

## 🔗 **OVERVIEW**

This guide covers integration of Bluetooth and USB medical devices with the School Health Screening System. The system supports automatic data capture from various medical devices to streamline the screening process.

## 🌐 **BROWSER COMPATIBILITY**

### **Web Bluetooth API Support**
| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 56+ | ✅ Full Support |
| Edge | 79+ | ✅ Full Support |
| Firefox | - | ❌ Not Supported |
| Safari | - | ❌ Not Supported |

### **Web USB API Support**
| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 61+ | ✅ Full Support |
| Edge | 79+ | ✅ Full Support |
| Firefox | - | ❌ Not Supported |
| Safari | - | ❌ Not Supported |

**⚠️ Important**: For device integration, use Chrome or Edge browsers only.

---

## 🩺 **SUPPORTED BLUETOOTH DEVICES**

### **Blood Pressure Monitors**

#### **Omron Series**
```javascript
// Device Configuration
const omronBPConfig = {
  name: "Omron BP Monitor",
  serviceUUID: "0x1810", // Blood Pressure Service
  characteristicUUID: "0x2A35", // Blood Pressure Measurement
  filters: [
    { namePrefix: "BLESmart_" },
    { namePrefix: "Omron_" }
  ]
};

// Usage Example
const connectOmronBP = async () => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: omronBPConfig.filters,
      optionalServices: [omronBPConfig.serviceUUID]
    });
    
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(omronBPConfig.serviceUUID);
    const characteristic = await service.getCharacteristic(omronBPConfig.characteristicUUID);
    
    // Listen for measurements
    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', handleBPReading);
  } catch (error) {
    console.error('Failed to connect to Omron BP monitor:', error);
  }
};
```

#### **A&D Medical Monitors**
```javascript
const adMedicalConfig = {
  name: "A&D Medical BP",
  serviceUUID: "0x1810",
  characteristicUUID: "0x2A35",
  filters: [
    { namePrefix: "A&D_" },
    { namePrefix: "UA-" }
  ]
};
```

#### **Beurer BM Series**
```javascript
const beurerConfig = {
  name: "Beurer BM",
  serviceUUID: "0x1810",
  characteristicUUID: "0x2A35",
  filters: [
    { namePrefix: "Beurer" },
    { namePrefix: "BM" }
  ]
};
```

### **Pulse Oximeters**

#### **Nonin 3230**
```javascript
const noninConfig = {
  name: "Nonin 3230",
  serviceUUID: "46a970e0-0d5f-11e2-8b5e-0002a5d5c51b",
  characteristicUUID: "0734594a-a8e7-4b1a-a6b1-cd5243059a57",
  filters: [
    { namePrefix: "Nonin3230_" }
  ]
};

const connectNonin = async () => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: noninConfig.filters,
      optionalServices: [noninConfig.serviceUUID]
    });
    
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(noninConfig.serviceUUID);
    const characteristic = await service.getCharacteristic(noninConfig.characteristicUUID);
    
    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', handleSpO2Reading);
  } catch (error) {
    console.error('Failed to connect to Nonin oximeter:', error);
  }
};
```

#### **Masimo MightySat**
```javascript
const masimoConfig = {
  name: "Masimo MightySat",
  serviceUUID: "0x1822", // Pulse Oximeter Service
  characteristicUUID: "0x2A5E", // PLX Spot-Check Measurement
  filters: [
    { namePrefix: "MightySat" },
    { namePrefix: "Masimo" }
  ]
};
```

### **Digital Thermometers**

#### **Braun ThermoScan**
```javascript
const braunConfig = {
  name: "Braun ThermoScan",
  serviceUUID: "0x1809", // Health Thermometer Service
  characteristicUUID: "0x2A1C", // Temperature Measurement
  filters: [
    { namePrefix: "ThermoScan" },
    { namePrefix: "Braun" }
  ]
};

const connectBraunThermometer = async () => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: braunConfig.filters,
      optionalServices: [braunConfig.serviceUUID]
    });
    
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(braunConfig.serviceUUID);
    const characteristic = await service.getCharacteristic(braunConfig.characteristicUUID);
    
    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', handleTemperatureReading);
  } catch (error) {
    console.error('Failed to connect to Braun thermometer:', error);
  }
};
```

#### **iHealth Thermometers**
```javascript
const ihealthConfig = {
  name: "iHealth Thermometer",
  serviceUUID: "0x1809",
  characteristicUUID: "0x2A1C",
  filters: [
    { namePrefix: "iHealth" },
    { namePrefix: "PT3SBT" }
  ]
};
```

---

## 🔌 **SUPPORTED USB DEVICES**

### **Digital Scales**

#### **Tanita Medical Scales**
```javascript
const tanitaUSBConfig = {
  vendorId: 0x0c05, // Tanita vendor ID
  productId: 0x0001, // Product ID varies by model
  name: "Tanita Medical Scale"
};

const connectTanitaScale = async () => {
  try {
    const device = await navigator.usb.requestDevice({
      filters: [{ vendorId: tanitaUSBConfig.vendorId }]
    });
    
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(0);
    
    // Read weight data
    const result = await device.transferIn(1, 64);
    const weight = parseWeightData(result.data);
    
    return weight;
  } catch (error) {
    console.error('Failed to connect to Tanita scale:', error);
  }
};

const parseWeightData = (data) => {
  // Parse binary data based on Tanita protocol
  const dataView = new DataView(data.buffer);
  const weight = dataView.getFloat32(0, true); // Little endian
  return { value: weight, unit: 'kg' };
};
```

#### **Omron Body Composition Scales**
```javascript
const omronScaleConfig = {
  vendorId: 0x0590, // Omron vendor ID
  productId: 0x00a9, // HBF series
  name: "Omron Body Composition Scale"
};
```

### **Height Measurers**

#### **Seca Stadiometers**
```javascript
const secaStadiometerConfig = {
  vendorId: 0x04d8, // Seca vendor ID
  productId: 0x0002,
  name: "Seca Digital Stadiometer"
};

const connectSecaStadiometer = async () => {
  try {
    const device = await navigator.usb.requestDevice({
      filters: [{ vendorId: secaStadiometerConfig.vendorId }]
    });
    
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(0);
    
    // Request height measurement
    const command = new Uint8Array([0x02, 0x48, 0x03]); // Height command
    await device.transferOut(1, command);
    
    // Read response
    const result = await device.transferIn(1, 64);
    const height = parseHeightData(result.data);
    
    return height;
  } catch (error) {
    console.error('Failed to connect to Seca stadiometer:', error);
  }
};
```

### **Digital Stethoscopes**

#### **3M Littmann CORE**
```javascript
const littmannConfig = {
  vendorId: 0x0451, // 3M vendor ID
  productId: 0x16a8,
  name: "3M Littmann CORE"
};

const connectLittmannStethoscope = async () => {
  try {
    const device = await navigator.usb.requestDevice({
      filters: [{ vendorId: littmannConfig.vendorId }]
    });
    
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(0);
    
    // Start audio capture
    const audioData = await captureHeartSounds(device);
    return audioData;
  } catch (error) {
    console.error('Failed to connect to Littmann stethoscope:', error);
  }
};
```

---

## 🔧 **IMPLEMENTATION GUIDE**

### **1. Device Detection Service**

```javascript
// services/deviceService.js
class DeviceService {
  constructor() {
    this.connectedDevices = new Map();
    this.deviceCallbacks = new Map();
  }

  async scanForBluetoothDevices() {
    if (!navigator.bluetooth) {
      throw new Error('Bluetooth not supported in this browser');
    }

    const devices = [];
    
    // Scan for blood pressure monitors
    try {
      const bpDevices = await this.scanForDeviceType('bloodPressure');
      devices.push(...bpDevices);
    } catch (error) {
      console.warn('No BP devices found:', error);
    }

    // Scan for pulse oximeters
    try {
      const oxDevices = await this.scanForDeviceType('pulseOximeter');
      devices.push(...oxDevices);
    } catch (error) {
      console.warn('No oximeter devices found:', error);
    }

    // Scan for thermometers
    try {
      const tempDevices = await this.scanForDeviceType('thermometer');
      devices.push(...tempDevices);
    } catch (error) {
      console.warn('No thermometer devices found:', error);
    }

    return devices;
  }

  async scanForUSBDevices() {
    if (!navigator.usb) {
      throw new Error('USB not supported in this browser');
    }

    const devices = await navigator.usb.getDevices();
    return devices.filter(device => this.isSupportedUSBDevice(device));
  }

  isSupportedUSBDevice(device) {
    const supportedVendors = [
      0x0c05, // Tanita
      0x0590, // Omron
      0x04d8, // Seca
      0x0451  // 3M
    ];
    
    return supportedVendors.includes(device.vendorId);
  }

  async connectToDevice(deviceId, deviceType) {
    try {
      if (deviceType === 'bluetooth') {
        return await this.connectBluetoothDevice(deviceId);
      } else if (deviceType === 'usb') {
        return await this.connectUSBDevice(deviceId);
      }
    } catch (error) {
      console.error(`Failed to connect to ${deviceType} device:`, error);
      throw error;
    }
  }

  onDeviceData(deviceId, callback) {
    this.deviceCallbacks.set(deviceId, callback);
  }

  disconnectDevice(deviceId) {
    const device = this.connectedDevices.get(deviceId);
    if (device) {
      if (device.gatt) {
        device.gatt.disconnect();
      } else if (device.close) {
        device.close();
      }
      this.connectedDevices.delete(deviceId);
      this.deviceCallbacks.delete(deviceId);
    }
  }
}

export const deviceService = new DeviceService();
```

### **2. React Hook for Device Integration**

```javascript
// hooks/useDeviceIntegration.js
import { useState, useEffect, useCallback } from 'react';
import { deviceService } from '../services/deviceService';

export const useDeviceIntegration = () => {
  const [availableDevices, setAvailableDevices] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [deviceData, setDeviceData] = useState({});

  const scanForDevices = useCallback(async () => {
    setIsScanning(true);
    try {
      const bluetoothDevices = await deviceService.scanForBluetoothDevices();
      const usbDevices = await deviceService.scanForUSBDevices();
      
      setAvailableDevices([...bluetoothDevices, ...usbDevices]);
    } catch (error) {
      console.error('Device scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const connectDevice = useCallback(async (device) => {
    try {
      const connection = await deviceService.connectToDevice(device.id, device.type);
      
      setConnectedDevices(prev => [...prev, { ...device, connection }]);
      
      // Set up data listener
      deviceService.onDeviceData(device.id, (data) => {
        setDeviceData(prev => ({
          ...prev,
          [device.id]: data
        }));
      });
      
      return connection;
    } catch (error) {
      console.error('Failed to connect device:', error);
      throw error;
    }
  }, []);

  const disconnectDevice = useCallback((deviceId) => {
    deviceService.disconnectDevice(deviceId);
    setConnectedDevices(prev => prev.filter(d => d.id !== deviceId));
    setDeviceData(prev => {
      const newData = { ...prev };
      delete newData[deviceId];
      return newData;
    });
  }, []);

  return {
    availableDevices,
    connectedDevices,
    isScanning,
    deviceData,
    scanForDevices,
    connectDevice,
    disconnectDevice
  };
};
```

### **3. Device Integration Component**

```javascript
// components/DeviceIntegration.jsx
import React from 'react';
import { useDeviceIntegration } from '../hooks/useDeviceIntegration';

const DeviceIntegration = ({ onDataReceived }) => {
  const {
    availableDevices,
    connectedDevices,
    isScanning,
    deviceData,
    scanForDevices,
    connectDevice,
    disconnectDevice
  } = useDeviceIntegration();

  useEffect(() => {
    // Auto-scan on component mount
    scanForDevices();
  }, [scanForDevices]);

  useEffect(() => {
    // Forward device data to parent component
    if (Object.keys(deviceData).length > 0) {
      onDataReceived(deviceData);
    }
  }, [deviceData, onDataReceived]);

  return (
    <div className="device-integration">
      <div className="mb-4">
        <button
          onClick={scanForDevices}
          disabled={isScanning}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isScanning ? 'Scanning...' : 'Scan for Devices'}
        </button>
      </div>

      {/* Available Devices */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Available Devices</h3>
        {availableDevices.length === 0 ? (
          <p className="text-gray-500">No devices found</p>
        ) : (
          <div className="space-y-2">
            {availableDevices.map(device => (
              <div key={device.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{device.name}</div>
                  <div className="text-sm text-gray-500">{device.type}</div>
                </div>
                <button
                  onClick={() => connectDevice(device)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connected Devices */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Connected Devices</h3>
        {connectedDevices.length === 0 ? (
          <p className="text-gray-500">No devices connected</p>
        ) : (
          <div className="space-y-2">
            {connectedDevices.map(device => (
              <div key={device.id} className="flex items-center justify-between p-3 border rounded bg-green-50">
                <div>
                  <div className="font-medium">{device.name}</div>
                  <div className="text-sm text-gray-500">Connected</div>
                  {deviceData[device.id] && (
                    <div className="text-sm text-blue-600">
                      Latest: {JSON.stringify(deviceData[device.id])}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => disconnectDevice(device.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceIntegration;
```

---

## 🔒 **SECURITY CONSIDERATIONS**

### **Device Permissions**
- Users must explicitly grant permission for each device
- Permissions are per-origin and persistent
- Always request minimal necessary permissions

### **Data Validation**
```javascript
const validateDeviceData = (data, deviceType) => {
  switch (deviceType) {
    case 'bloodPressure':
      return data.systolic > 0 && data.systolic < 300 &&
             data.diastolic > 0 && data.diastolic < 200;
    
    case 'pulseOximeter':
      return data.spO2 >= 70 && data.spO2 <= 100 &&
             data.heartRate > 30 && data.heartRate < 220;
    
    case 'thermometer':
      return data.temperature > 30 && data.temperature < 45;
    
    default:
      return true;
  }
};
```

### **Error Handling**
```javascript
const handleDeviceError = (error, deviceType) => {
  console.error(`${deviceType} device error:`, error);
  
  // Log for debugging
  if (error.name === 'NotFoundError') {
    return 'Device not found. Please check connection.';
  } else if (error.name === 'SecurityError') {
    return 'Permission denied. Please allow device access.';
  } else if (error.name === 'NetworkError') {
    return 'Connection failed. Please try again.';
  }
  
  return 'Unknown device error occurred.';
};
```

---

## 📋 **TROUBLESHOOTING**

### **Common Issues**

#### **Bluetooth Connection Failed**
```
Problem: Device not connecting via Bluetooth
Solutions:
1. Ensure device is in pairing mode
2. Check browser compatibility (Chrome/Edge only)
3. Clear browser cache and permissions
4. Restart browser and try again
5. Check device battery level
```

#### **USB Device Not Recognized**
```
Problem: USB device not appearing in scan
Solutions:
1. Check USB cable connection
2. Verify device drivers are installed
3. Try different USB port
4. Restart browser with device connected
5. Check device compatibility list
```

#### **Permission Denied**
```
Problem: Browser blocks device access
Solutions:
1. Click lock icon in address bar
2. Reset site permissions
3. Refresh page and try again
4. Ensure HTTPS connection
5. Check browser settings for device permissions
```

---

## 📞 **SUPPORT**

For device integration issues:
1. Check device compatibility list
2. Verify browser support (Chrome/Edge)
3. Test with different device/browser combination
4. Contact device manufacturer for API documentation
5. Submit GitHub issue with device details

---

**Last Updated**: [Current Date]
**Version**: 1.0
