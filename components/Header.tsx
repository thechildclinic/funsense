import React from 'react';
import { APP_TITLE, STEP_ICONS } from '../constants'; // Added STEP_ICONS
import { FaUserDoctor } from 'react-icons/fa6';
import { IconType } from 'react-icons'; // Added IconType

interface HeaderPatientInfo {
  name: string;
  id: string;
  age?: number | string; 
  gender?: 'Male' | 'Female' | 'Other' | string; 
}

interface HeaderProps {
  patient: HeaderPatientInfo;
  onOpenSettings?: () => void; // Optional: only the main app header might have this
  showSettingsButton?: boolean; // Control visibility of settings button
}

const Header: React.FC<HeaderProps> = ({ patient, onOpenSettings, showSettingsButton = false }) => {
  const SettingsIcon = STEP_ICONS['Settings'] as IconType | undefined;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 md:p-4 mb-3 text-center shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-cyan via-brand-light-blue to-brand-dark-blue"></div>
      
      <div className="flex justify-between items-center">
        <div className="flex-1"> {/* Invisible spacer to help center title if settings button not shown or on other side */}
           {/* If settings button is on left, this helps balance */}
        </div>
        <h1 className="text-slate-700 text-lg md:text-xl font-bold flex items-center justify-center gap-2 flex-grow text-center">
            <FaUserDoctor className="text-brand-light-blue text-2xl" />
            {APP_TITLE}
        </h1>
        <div className="flex-1 flex justify-end">
        {/* Settings button is now part of App.tsx's direct rendering for global access, 
            This header might be used in multiple places, so the button is optional.
            ScreeningFlow has its own Header instance which doesn't need to show this button.
            App.tsx's header instance (if it had one, currently settings button is separate) would.
            Keeping showSettingsButton prop for flexibility if this Header is reused.
        */}
        {/* 
          {showSettingsButton && onOpenSettings && SettingsIcon && (
            <button onClick={onOpenSettings} title="Settings" className="p-2 text-slate-500 hover:text-brand-dark-blue">
              <SettingsIcon size={18}/>
            </button>
          )}
        */}
        </div>
      </div>

      {patient && (patient.name !== "N/A" || patient.id !== "N/A") && (
         <div className="text-xs md:text-sm text-slate-500 mt-1">
            Current Student: <span className="font-semibold text-slate-600">{patient.name} (ID: {patient.id})</span>
            {patient.age && <span> - Age: {patient.age}</span>}
            {patient.gender && <span> - Gender: {patient.gender}</span>}
        </div>
      )}
    </div>
  );
};

export default Header;