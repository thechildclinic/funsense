import React, { useState } from 'react';
import { FaHome, FaExclamationTriangle, FaRedo, FaTimes } from 'react-icons/fa';

interface EmergencyResetButtonProps {
  onReset: () => void;
  onHome: () => void;
  className?: string;
}

const EmergencyResetButton: React.FC<EmergencyResetButtonProps> = ({ 
  onReset, 
  onHome, 
  className = '' 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState<'reset' | 'home' | null>(null);

  const handleEmergencyAction = (action: 'reset' | 'home') => {
    setShowConfirmation(action);
    setShowMenu(false);
  };

  const confirmAction = () => {
    if (showConfirmation === 'reset') {
      // Clear any stuck states and reset application
      localStorage.removeItem('activeScreeningStudentId');
      onReset();
    } else if (showConfirmation === 'home') {
      onHome();
    }
    setShowConfirmation(null);
  };

  const cancelAction = () => {
    setShowConfirmation(null);
  };

  return (
    <>
      {/* Emergency Button - Always visible */}
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          title="Emergency Navigation"
          aria-label="Emergency Navigation Menu"
        >
          <FaExclamationTriangle className="text-lg" />
        </button>

        {/* Emergency Menu */}
        {showMenu && (
          <div className="absolute top-14 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-2 min-w-48">
            <div className="text-xs text-gray-600 mb-2 px-2 py-1 border-b">
              Emergency Navigation
            </div>
            
            <button
              onClick={() => handleEmergencyAction('home')}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded transition-colors"
            >
              <FaHome className="text-blue-600" />
              Go to Home
            </button>
            
            <button
              onClick={() => handleEmergencyAction('reset')}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 rounded transition-colors"
            >
              <FaRedo className="text-red-600" />
              Reset Application
            </button>
            
            <button
              onClick={() => setShowMenu(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors mt-1 border-t"
            >
              <FaTimes />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="text-yellow-500 text-xl" />
              <h3 className="text-lg font-semibold text-gray-800">
                Confirm {showConfirmation === 'reset' ? 'Reset' : 'Home Navigation'}
              </h3>
            </div>
            
            <div className="mb-6">
              {showConfirmation === 'reset' ? (
                <div>
                  <p className="text-gray-600 mb-2">
                    This will reset the entire application and clear any unsaved data.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-700 text-sm font-medium">
                      ⚠️ Warning: All current screening progress will be lost!
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    This will navigate back to the home screen.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-blue-700 text-sm">
                      Current screening progress will be saved automatically.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelAction}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  showConfirmation === 'reset'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {showConfirmation === 'reset' ? 'Reset Application' : 'Go to Home'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
};

export default EmergencyResetButton;
