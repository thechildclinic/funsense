
import React, { useState, useCallback, useEffect } from 'react';
import { AppScreen } from './types';
import Header from './components/Header';
import StartScreeningScreen from './screens/StartScreeningScreen';
import ScreeningFlow from './screens/ScreeningFlow';
import { ScreeningContextProvider, useScreeningContext } from './contexts/ScreeningContext';
import { SettingsContextProvider } from './contexts/SettingsContext'; 
import SettingsModal from './components/SettingsModal';
import { getActiveScreeningStudentId, loadActiveScreening, setActiveScreeningStudentId } from './services/localStorageService';
import { FaCog } from 'react-icons/fa';

const AppInternal: React.FC = () => {
  const [currentAppScreen, setCurrentAppScreen] = useState<AppScreen>(AppScreen.Start);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const { screeningData } = useScreeningContext(); 

  useEffect(() => {
    // This effect is to potentially resume a session if the app was closed/reloaded
    // and was in the middle of a screening. StartScreeningScreen handles resuming
    // if a student ID is entered and a session exists.
    const activeStudentId = getActiveScreeningStudentId();
    if (activeStudentId) {
        // If an active student ID is found, we might want to automatically
        // switch to the screening flow. However, StartScreeningScreen handles the explicit
        // loading/resuming. This App.tsx level check is more for a direct app reload scenario.
        // For simplicity, we'll let StartScreeningScreen manage the resume prompt.
        // If we wanted to auto-resume without prompt, logic would go here.
        console.log("App found active screening ID on mount:", activeStudentId);
    }
  }, []);

  const handleScreeningStart = () => {
    setCurrentAppScreen(AppScreen.Screening);
    // Student data is set via StartScreeningScreen into its own context instance now
    // and then into the main ScreeningFlow context.
  };

  const handleScreeningEnd = () => {
    // This is called when "Save & Return to Student List" is clicked or after "Mark Complete & Submit"
    // It should navigate back to the start screen.
    // The active student context will be "closed" when ScreeningFlow unmounts.
    // Data for the student remains in localStorage unless explicitly cleared by "Mark Complete & Submit".
    // setActiveScreeningStudentId(null); // Let StartScreeningScreen handle active ID management on new selection
    setCurrentAppScreen(AppScreen.Start);
  };
  
  const patientForHeader = currentAppScreen === AppScreen.Screening ? {
      name: screeningData.patientInfo?.name?.value || "N/A",
      id: screeningData.patientInfo?.manualId || screeningData.patientInfo?.qrId || "N/A",
  } : { name: "N/A", id: "N/A"};


  return (
    <div className="max-w-md mx-auto p-2.5 min-h-screen flex flex-col">
      {/* Main App Header - shown on StartScreen, ScreeningFlow has its own context-aware Header */}
      {currentAppScreen === AppScreen.Start && <Header patient={patientForHeader} /> }
      
      {/* Settings Button - always accessible potentially, or part of a more global header */}
       <button 
          onClick={() => setIsSettingsModalOpen(true)} 
          className="fixed top-2 right-2 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-gray-100"
          title="Open Settings"
        >
          <FaCog className="text-brand-dark-blue" />
        </button>

      <main className="flex-grow">
        {currentAppScreen === AppScreen.Start && (
          // StartScreeningScreen now has its own context provider for initial student data input
          <StartScreeningScreen onScreeningStart={handleScreeningStart} />
        )}
        {currentAppScreen === AppScreen.Screening && (
          // ScreeningFlow needs its own provider instance that is live during the screening
          <ScreeningContextProvider>
            <ScreeningFlow onScreeningEnd={handleScreeningEnd} />
          </ScreeningContextProvider>
        )}
      </main>
      
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />

      <footer className="text-center text-xs text-gray-500 py-4 mt-auto">
        <p>&copy; {new Date().getFullYear()} School Health Screening System. For educational and illustrative purposes.</p>
        {/* Removed API_KEY mention as it's a developer setup detail */}
      </footer>
    </div>
  );
};

const App: React.FC = () => (
    <SettingsContextProvider> {/* Settings context wraps everything */}
         {/* ScreeningContextProvider here would make one context instance for the whole app lifespan.
             However, the current design has StartScreeningScreen make one for input, and ScreeningFlow make another for the active session.
             This is acceptable but could be refactored for a single global screening context if desired.
             For now, let's keep the user's provided structure where ScreeningFlow makes its own.
          */}
        <ScreeningContextProvider> 
            <AppInternal />
        </ScreeningContextProvider>
    </SettingsContextProvider>
);


export default App;
