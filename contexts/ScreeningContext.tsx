import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { ScreeningStep, ScreeningData, PatientInfo, ImageAnalysisItem, VitalSign } from '../types';
import { DEFAULT_PATIENT_DATA, STEP_ICONS } from '../constants';
import { FaHeartbeat, FaPercent, FaThermometerFull, FaVial } from 'react-icons/fa'; // For default icons

interface ScreeningContextType {
  currentStep: ScreeningStep;
  screeningData: ScreeningData;
  setStudentInfo: (info: Partial<PatientInfo>) => void;
  updateScreeningData: (data: Partial<ScreeningData> | ((prev: ScreeningData) => ScreeningData)) => void;
  navigateToStep: (step: ScreeningStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetScreening: () => void;
  getStudentDisplayName: () => string;
  markStepAsSkipped: (step: ScreeningStep, reason: string) => void;
  unskipStep: (step: ScreeningStep) => void;
}

const defaultVitalSign = (name: string, unit: string, icon: React.ElementType): VitalSign => ({
  name,
  value: '',
  unit,
  status: 'info',
  icon,
  method: undefined,
  evidenceImage: undefined,
  manualEntryReason: '',
  error: '',
  ocrAttempt: '',
  deviceImage: '',
});

const defaultScreeningData: ScreeningData = {
  patientInfo: { ...DEFAULT_PATIENT_DATA, preExistingConditions: '' },
  anthropometry: {},
  entData: {},
  dentalData: {},
  faceVitalData: {},
  stethoscopeData: { 
    heart: { image: '', simulatedAudioPrompt: '' }, 
    lungs: { image: '', simulatedAudioPrompt: '' } 
  },
  deviceVitals: {
    bp: defaultVitalSign("Blood Pressure", "mmHg", FaHeartbeat), // Default BP structure
    spO2: defaultVitalSign("SpO2", "%", FaPercent),
    temperature: defaultVitalSign("Temperature", "°C", FaThermometerFull),
    hemoglobin: defaultVitalSign("Hemoglobin", "g/dL", FaVial),
  },
  nurseGeneralObservations: '',
  finalReport: {
    aiSummary: '',
    preliminaryNotesForDoctor: '', // Initialize this
  },
  skippedSteps: {},
};

const ScreeningContext = createContext<ScreeningContextType | undefined>(undefined);

export const ScreeningContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<ScreeningStep>(ScreeningStep.StudentIdentification);
  const [screeningData, setScreeningData] = useState<ScreeningData>(defaultScreeningData);

  const stepOrder: ScreeningStep[] = [
    ScreeningStep.StudentIdentification,
    ScreeningStep.Anthropometry,
    ScreeningStep.SpecializedImaging,
    ScreeningStep.VitalSigns,
    ScreeningStep.ReviewAndExport,
  ];

  const setStudentInfo = useCallback((info: Partial<PatientInfo>) => {
    setScreeningData(prev => ({
      ...prev,
      patientInfo: { ...prev.patientInfo, ...info }
    }));
  }, []);

  const updateScreeningData = useCallback((data: Partial<ScreeningData> | ((prev: ScreeningData) => ScreeningData)) => {
    if (typeof data === 'function') {
      setScreeningData(data);
    } else {
      setScreeningData(prev => {
        const newState = { ...prev, ...data };
        if (data.stethoscopeData) {
          newState.stethoscopeData = { ...prev.stethoscopeData, ...data.stethoscopeData };
        }
        if (data.deviceVitals) {
          newState.deviceVitals = { ...prev.deviceVitals, ...data.deviceVitals };
        }
        if (data.finalReport) {
            newState.finalReport = { ...prev.finalReport, ...data.finalReport };
        }
        return newState;
      });
    }
  }, []);

  const markStepAsSkipped = useCallback((step: ScreeningStep, reason: string) => {
    setScreeningData(prev => ({
      ...prev,
      skippedSteps: {
        ...prev.skippedSteps,
        [step]: reason,
      }
    }));
  }, []);

  const unskipStep = useCallback((step: ScreeningStep) => {
    setScreeningData(prev => {
      const newSkippedSteps = { ...prev.skippedSteps };
      delete newSkippedSteps[step];
      return {
        ...prev,
        skippedSteps: newSkippedSteps,
      };
    });
  }, []);

  const navigateToStep = (step: ScreeningStep) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    let nextIndex = currentIndex + 1;
    while (nextIndex < stepOrder.length && screeningData.skippedSteps?.[stepOrder[nextIndex]]) {
      nextIndex++;
    }
    if (nextIndex < stepOrder.length) {
      setCurrentStep(stepOrder[nextIndex]);
    } else if (currentIndex < stepOrder.length -1 && stepOrder[stepOrder.length -1] !== ScreeningStep.ReviewAndExport && !screeningData.skippedSteps?.[ScreeningStep.ReviewAndExport]) {
        setCurrentStep(ScreeningStep.ReviewAndExport);
    } else if (nextIndex >= stepOrder.length && currentStep !== ScreeningStep.ReviewAndExport) {
         setCurrentStep(ScreeningStep.ReviewAndExport); 
    }
  };

  const previousStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    let prevIndex = currentIndex - 1;
    while (prevIndex >= 0 && screeningData.skippedSteps?.[stepOrder[prevIndex]]) {
      prevIndex--;
    }
    if (prevIndex >= 0) {
      setCurrentStep(stepOrder[prevIndex]);
    }
  };
  
  const getStudentDisplayName = (): string => {
    const { name, manualId, qrId } = screeningData.patientInfo;
    let displayName = name?.value || "N/A";
    const id = manualId || qrId;
    if (id) {
      displayName += ` (ID: ${id})`;
    }
    return displayName;
  };

  const resetScreening = () => {
    setScreeningData(defaultScreeningData);
    setCurrentStep(ScreeningStep.StudentIdentification);
  };

  return (
    <ScreeningContext.Provider value={{ 
        currentStep, 
        screeningData, 
        setStudentInfo,
        updateScreeningData, 
        navigateToStep, 
        nextStep, 
        previousStep, 
        resetScreening,
        getStudentDisplayName,
        markStepAsSkipped,
        unskipStep,
    }}>
      {children}
    </ScreeningContext.Provider>
  );
};

export const useScreeningContext = () => {
  const context = useContext(ScreeningContext);
  if (context === undefined) {
    throw new Error('useScreeningContext must be used within a ScreeningContextProvider');
  }
  return context;
};