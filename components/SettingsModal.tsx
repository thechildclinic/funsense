import React, { useEffect, useState } from 'react';
import { useSettingsContext } from '../contexts/SettingsContext';
import { clearAllScreeningSessionData } from '../services/localStorageService'; // Changed from clearAllApplicationData
import { FaCamera, FaMicrophone, FaTrashAlt, FaTimes, FaCog, FaBrain, FaKey, FaCheck, FaExclamationTriangle, FaRobot } from 'react-icons/fa';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, availableCameras, availableMicrophones, refreshDevices } = useSettingsContext();

  // AI Provider Configuration State
  const [selectedAIProvider, setSelectedAIProvider] = useState(localStorage.getItem('aiProvider') || 'gemini');
  const [apiKey, setApiKey] = useState(localStorage.getItem('aiApiKey') || '');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

  const handleAIProviderChange = (provider: string) => {
    setSelectedAIProvider(provider);
    localStorage.setItem('aiProvider', provider);
    setConnectionStatus('idle');
  };

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('aiApiKey', key);
    setConnectionStatus('idle');
  };

  const testAIConnection = async () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key first');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      // Simple test call to verify API key works
      const response = await fetch('/.netlify/functions/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateText',
          prompt: 'Test connection - respond with "OK"',
          provider: selectedAIProvider,
          apiKey: apiKey
        })
      });

      if (response.ok) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const aiProviders = [
    { id: 'gemini', name: 'Google Gemini', description: 'Google\'s advanced AI model' },
    { id: 'openai', name: 'OpenAI GPT', description: 'ChatGPT and GPT models' },
    { id: 'claude', name: 'Anthropic Claude', description: 'Claude AI assistant' },
    { id: 'local', name: 'Local AI', description: 'On-device AI models (Gemma, etc.)' }
  ];

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

          {/* AI Provider Configuration - Enhanced */}
          <div className="pt-3 border-t border-gray-200" style={{backgroundColor: '#f8f9fa'}}>
            <h3 className="text-md font-medium text-slate-700 mb-3 flex items-center gap-2">
              <FaBrain className="text-blue-600" /> AI Provider Configuration
            </h3>

            {/* Debug info */}
            <div className="text-xs text-gray-500 mb-2">
              Current Provider: {selectedAIProvider} | API Key: {apiKey ? 'Set' : 'Not Set'}
            </div>

            {/* AI Provider Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-2">Select AI Provider:</label>
              <div className="grid grid-cols-2 gap-2">
                {aiProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleAIProviderChange(provider.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedAIProvider === provider.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="font-medium text-sm">{provider.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{provider.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* API Key Configuration */}
            {selectedAIProvider !== 'local' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-1">
                  <FaKey className="text-gray-500" /> API Key:
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="Enter your API key..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={testAIConnection}
                    disabled={isTestingConnection || !apiKey.trim()}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-md text-sm flex items-center gap-1"
                  >
                    {isTestingConnection ? (
                      <FaRobot className="animate-spin" />
                    ) : (
                      <FaCheck />
                    )}
                    Test
                  </button>
                </div>

                {/* Connection Status */}
                {connectionStatus === 'success' && (
                  <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <FaCheck /> Connection successful!
                  </div>
                )}
                {connectionStatus === 'error' && (
                  <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationTriangle /> Connection failed. Check your API key.
                  </div>
                )}
              </div>
            )}

            {/* Local AI Info */}
            {selectedAIProvider === 'local' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="text-sm text-green-700">
                  <strong>Local AI Mode:</strong> Uses on-device AI models for privacy and offline capability.
                  No API key required.
                </div>
              </div>
            )}
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
