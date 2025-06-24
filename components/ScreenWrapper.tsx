
import React from 'react';
import BackButton from './BackButton'; // BackButton might navigate steps, not just home
import { IconType } from 'react-icons';

interface ScreenWrapperProps {
  title: string;
  icon?: IconType;
  onBack?: () => void; // Make onBack optional or context-aware (previousStep)
  children: React.ReactNode;
  showBackButton?: boolean;
  backButtonText?: string;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ title, icon: IconComponent, onBack, children, showBackButton = true, backButtonText = "Back" }) => {
  // This component might be less used if steps manage their own layout directly for better control
  // or if BackButton is integrated into a main StepNavigation component.
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 md:p-5 shadow-lg mb-4 animate-fadeIn">
      {showBackButton && onBack && <BackButton onClick={onBack} text={backButtonText} />}
      <div className="flex items-center gap-3 mb-4 text-slate-700">
        {IconComponent && <IconComponent className="text-xl md:text-2xl bg-gradient-to-br from-brand-light-blue to-brand-cyan text-transparent bg-clip-text" />}
        <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
};

export default ScreenWrapper;
