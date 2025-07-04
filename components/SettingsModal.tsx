import React, { useEffect } from 'react';
import { useSettingsContext } from '../contexts/SettingsContext';
import { clearAllScreeningSessionData } from '../services/localStorageService'; // Changed from clearAllApplicationData
import { FaCamera, FaMicrophone, FaTrashAlt, FaTimes, FaCog } from 'react-icons/fa';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, availableCameras, availableMicrophones, refreshDevices } = useSettingsContext();

  useEffect(() => {
    if (isOpen) {
        refreshDevices(); // Refresh device list when modal opens
    }
  }, [isOpen, refreshDevices]);

  if (!isOpen) return null;

  const handleClearCache = () => {
    if (window.confirm("Are you sure you want to clear ALL cached screening data? This will remove any incomplete screenings saved on this device and cannot be undone.")) {
      clearAllScreeningSessionData(); // Use the more specific cache clearing
      alert("All cached screening data has been cleared.");
      // Optionally, could also reset current app state if needed, but usually just clearing storage is enough.
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
        onClick={onClose} // Close on overlay click
    >
      <div 
        className="bg-white rounded-xl shadow-2xl p-5 md:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
    >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
            <FaCog className="text-brand-light-blue" /> Application Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Preferred Camera */}
          <div>
            <label htmlFor="preferredCamera" className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <FaCamera className="text-sky-500" /> Preferred Camera
            </label>
            <select
              id="preferredCamera"
              value={settings.preferredCameraId || ''}
              onChange={(e) => updateSettings({ preferredCameraId: e.target.value || undefined })}
              className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-brand-light-blue focus:border-brand-light-blue bg-white"
            >
              <option value="">System Default / Auto-select</option>
              {availableCameras.map(device => (
                <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">Select your preferred camera. The app will try to use this first.</p>
          </div>

          {/* Preferred Microphone (for future use with actual audio) */}
          <div>
            <label htmlFor="preferredMicrophone" className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <FaMicrophone className="text-rose-500"/> Preferred Microphone
            </label>
            <select
              id="preferredMicrophone"
              value={settings.preferredMicrophoneId || ''}
              onChange={(e) => updateSettings({ preferredMicrophoneId: e.target.value || undefined })}
              className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-brand-light-blue focus:border-brand-light-blue bg-white"
            >
              <option value="">System Default / Auto-select</option>
              {availableMicrophones.map(device => (
                <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
              ))}
            </select>
             <p className="text-xs text-slate-500 mt-1">Select preferred microphone (used for video recording audio if enabled, or future audio features).</p>
          </div>
          
          <button 
             onClick={refreshDevices}
             className="text-xs text-blue-600 hover:text-blue-800"
          >
            Refresh device list
          </button>

          {/* Clear Cache */}
          <div className="pt-3 border-t border-gray-200">
            <h3 className="text-md font-medium text-slate-700 mb-1">Data Management</h3>
            <button
              onClick={handleClearCache}
              className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors"
            >
              <FaTrashAlt /> Clear All Cached Screening Data
            </button>
            <p className="text-xs text-slate-500 mt-1">This removes all incomplete student screening data saved on this device. Submitted data is not affected.</p>
          </div>

          {/* Future Integrations */}
          <div className="pt-3 border-t border-gray-200">
            <h3 className="text-md font-medium text-slate-700 mb-1">Future Integrations</h3>
            <p className="text-sm text-slate-500 p-3 bg-gray-100 rounded-md">
              AI provider selection and AyuSync SDK integration will be available in future updates.
            </p>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-brand-primary hover:bg-brand-dark-blue text-white font-semibold py-2 px-5 rounded-lg shadow transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>


    </div>
  );
};

export default SettingsModal;
