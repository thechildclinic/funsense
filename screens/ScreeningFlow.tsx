

import React from 'react';
import { useScreeningContext } from '../contexts/ScreeningContext';
import { ScreeningStep } from '../types';
import { STEP_ICONS } from '../constants';
import { FaBan } from 'react-icons/fa'; 

import StudentIdentificationStep from './screening_steps/StudentIdentificationStep';
import AnthropometryStep from './screening_steps/AnthropometryStep';
import SpecializedImagingStep from './screening_steps/SpecializedImagingStep';
import VitalSignsStep from './screening_steps/VitalSignsStep';
import { ReviewAndExportStep } from './screening_steps/ReviewAndExportStep'; // Changed to named import
import Header from '../components/Header'; 

interface ScreeningFlowProps {
  onScreeningEnd: () => void;
}

const screeningStepsOrder: ScreeningStep[] = [
    ScreeningStep.StudentIdentification,
    ScreeningStep.Anthropometry,
    ScreeningStep.SpecializedImaging,
    ScreeningStep.VitalSigns,
    ScreeningStep.ReviewAndExport,
];

const ScreeningFlow: React.FC<ScreeningFlowProps> = ({ onScreeningEnd }) => {
  const { currentStep, screeningData, nextStep, previousStep, navigateToStep, getStudentDisplayName } = useScreeningContext();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case ScreeningStep.StudentIdentification:
        return <StudentIdentificationStep />;
      case ScreeningStep.Anthropometry:
        return <AnthropometryStep onScreeningEnd={onScreeningEnd} />;
      case ScreeningStep.SpecializedImaging:
        return <SpecializedImagingStep onScreeningEnd={onScreeningEnd} />;
      case ScreeningStep.VitalSigns:
        return <VitalSignsStep onScreeningEnd={onScreeningEnd} />;
      case ScreeningStep.ReviewAndExport:
        return <ReviewAndExportStep onScreeningComplete={onScreeningEnd} />;
      default:
        navigateToStep(ScreeningStep.StudentIdentification); 
        return <StudentIdentificationStep />;
    }
  };
  
  const studentDisplayName = getStudentDisplayName();
  const patientForHeader = {
      name: screeningData.patientInfo.name?.value || "N/A",
      id: screeningData.patientInfo.manualId || screeningData.patientInfo.qrId || "N/A",
      age: screeningData.patientInfo.age?.value || undefined, 
      gender: screeningData.patientInfo.gender?.value || undefined
  };


  return (
    <div className="flex flex-col h-full">
      <Header patient={patientForHeader} />

      {/* Top Navigation Tabs for Steps */}
      <div className="mb-3 px-1 sticky top-0 z-10 bg-sky-50/90 backdrop-blur-sm py-2 shadow-sm rounded-b-lg">
        <nav className="flex space-x-1 justify-around overflow-x-auto pb-1">
          {screeningStepsOrder.map((stepKey) => {
            const stepName = stepKey.replace(/_/g, ' ');
            const IconComponent = STEP_ICONS[stepKey as keyof typeof STEP_ICONS] || (() => <div/>) ;
            const isActive = currentStep === stepKey;
            const isSkipped = !!screeningData.skippedSteps?.[stepKey];

            return (
              <button
                key={stepKey}
                onClick={() => navigateToStep(stepKey)}
                title={stepName + (isSkipped ? ' (Skipped)' : '')}
                className={`flex flex-col items-center px-2 py-1.5 rounded-md transition-all duration-200 text-xs sm:text-sm relative
                            ${isActive 
                                ? 'bg-brand-light-blue text-white shadow-md scale-105' 
                                : isSkipped 
                                    ? 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                                    : 'bg-white text-slate-600 hover:bg-sky-100 hover:text-brand-dark-blue'
                            }
                            ${isSkipped && !isActive ? 'line-through' : ''}
                          `}
              >
                <IconComponent className={`mb-0.5 ${isActive ? 'text-white' : isSkipped ? 'text-gray-400' : 'text-brand-primary'}`} size={16}/>
                <span className={`truncate max-w-[80px] sm:max-w-none ${isSkipped && !isActive ? 'text-gray-500' : ''}`}>{stepName}</span>
                {isSkipped && <FaBan className="absolute top-0.5 right-0.5 text-orange-500 text-[10px]" title="Module Skipped"/>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-grow p-1 animate-fadeIn overflow-y-auto"> 
        {renderCurrentStep()}
      </div>

      <div className="py-3 px-1 mt-auto border-t border-gray-200 bg-white/90 backdrop-blur-sm sticky bottom-0 z-10">
        <div className="flex justify-between items-center">
          <button
            onClick={previousStep}
            disabled={currentStep === screeningStepsOrder[0] || (screeningStepsOrder.indexOf(currentStep) > 0 && screeningStepsOrder.slice(0, screeningStepsOrder.indexOf(currentStep)).every(s => screeningData.skippedSteps?.[s]))}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg shadow transition-colors disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 hidden sm:block">Current: {currentStep.replace(/_/g, ' ')}{screeningData.skippedSteps?.[currentStep] ? ' (Skipped)' : ''}</span>
          {currentStep !== ScreeningStep.ReviewAndExport ? (
            <button
              onClick={nextStep}
              className="bg-brand-primary hover:bg-brand-dark-blue text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors"
            >
              Next Step
            </button>
          ) : (
             <button
              className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg shadow"
              disabled 
            >
              Finish Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreeningFlow;
