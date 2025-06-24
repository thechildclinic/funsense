import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { AppSettings, MediaDevice } from '../types';
import { loadAppSettings, saveAppSettings } from '../services/localStorageService';
import { DEFAULT_SETTINGS } from '../constants';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  availableCameras: MediaDevice[];
  availableMicrophones: MediaDevice[];
  refreshDevices: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(loadAppSettings() || DEFAULT_SETTINGS);
  const [availableCameras, setAvailableCameras] = useState<MediaDevice[]>([]);
  const [availableMicrophones, setAvailableMicrophones] = useState<MediaDevice[]>([]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveAppSettings(updated);
      return updated;
    });
  };

  const enumerateDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.warn("MediaDevices API not available.");
        setAvailableCameras([]);
        setAvailableMicrophones([]);
        return;
      }
      // Request permission first to get device labels
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (permError) {
        // This error is expected if permissions are not yet granted or denied.
        // enumerateDevices will still work but might not have labels.
        console.info("getUserMedia permission prompt for device enumeration (labels might be missing if denied):", permError);
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      const microphones = devices.filter(device => device.kind === 'audioinput');
      
      setAvailableCameras(cameras.map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${cameras.indexOf(d) + 1}`, kind: d.kind })));
      setAvailableMicrophones(microphones.map(d => ({ deviceId: d.deviceId, label: d.label || `Microphone ${microphones.indexOf(d) + 1}`, kind: d.kind })));
    } catch (error) {
      console.error("Error enumerating media devices:", error);
      setAvailableCameras([]);
      setAvailableMicrophones([]);
    }
  }, []);

  useEffect(() => {
    enumerateDevices();
    // Listen for device changes
    navigator.mediaDevices?.addEventListener('devicechange', enumerateDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', enumerateDevices);
    };
  }, [enumerateDevices]);

  return (
    <SettingsContext.Provider value={{ 
        settings, 
        updateSettings, 
        availableCameras, 
        availableMicrophones,
        refreshDevices: enumerateDevices 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsContextProvider');
  }
  return context;
};
