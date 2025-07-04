import { IconType } from 'react-icons';

export enum AppScreen { // Renamed from Screen to avoid conflict if Screen becomes a common noun
  Start = 'START',
  Screening = 'SCREENING',
}

export enum ScreeningStep {
  StudentIdentification = 'STUDENT_IDENTIFICATION',
  Anthropometry = 'ANTHROPOMETRY', // Height, Weight, BMI
  SpecializedImaging = 'SPECIALIZED_IMAGING', // ENT, Dental
  VitalSigns = 'VITAL_SIGNS', // Face Vitals (sim), Stethoscope (sim), Devices
  Dermatology = 'DERMATOLOGY', // Skin assessment and lesion documentation
  ReviewAndExport = 'REVIEW_AND_EXPORT',
}

export interface ManualEntryField {
  value: string;
  reason?: string; // Reason for manual entry if applicable
}

export interface PatientInfo {
  qrId?: string; // From QR scan
  manualId?: string; // If entered manually
  name: ManualEntryField;
  age: ManualEntryField; // Age might be calculated or entered
  gender: ManualEntryField; // Keep as string for flexibility in manual entry
  reasonForManualStudentEntry?: string;
  preExistingConditions?: string; // Added for pre-existing conditions
}

export interface VitalSign {
  name: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'danger' | 'info'; // Added 'info' for general data
  icon: React.ElementType;
  method?: 'Scan' | 'Manual' | 'Calculated' | 'Simulated';
  evidenceImage?: string; // base64 for image of device reading
  manualEntryReason?: string;
  error?: string; // Added for storing error messages
  ocrAttempt?: string; // To store what OCR tried to read
  deviceImage?: string; // Specifically for the image of the device display
}

export interface NavItem {
  id: string; // Used to be Screen enum, now can be more generic or step-specific
  label: string;
  icon: React.ElementType;
  bgColorClass: string;
  description?: string;
}

export interface AnalysisConstraint {
  name: string;
  met: boolean;
  icon: IconType;
}
export interface ImageAnalysisItem {
  image?: string; // base64 of still image or video frame
  videoSrc?: string; // base64 or blob URL of captured video
  analysisType?: 'image' | 'videoFrame'; // To know the source for AI prompt
  aiAnalysis?: string;
  confidence?: number;
  constraints?: AnalysisConstraint[];
  notes?: string;
}

export interface Point { x: number; y: number; }

export interface AnthropometryData {
  heightCm: ManualEntryField & { 
    image?: string; 
    rulerVisible?: boolean; 
    instructions?: string;
    aiSilhouetteObservation?: string; 
    tappedPoints?: { top?: Point; bottom?: Point };
    referencePoints?: { p1?: Point; p2?: Point };
    referenceLengthCm?: string; 
    calculatedValue?: string; // Value calculated from taps
  };
  weightKg: ManualEntryField & { image?: string; ocrAttempt?: string };
  bmi?: {
    value: number;
    interpretation: string;
  };
  armSpanCm?: ManualEntryField & { 
    image?: string; 
    instructions?: string;
    tappedPoints?: { p1?: Point; p2?: Point };
    calculatedValue?: string; 
  };
  observedBodyType?: ManualEntryField & { options?: string[] }; // Value is selected option
}

export interface EntData {
  ear?: ImageAnalysisItem;
  nose?: ImageAnalysisItem;
  throat?: ImageAnalysisItem;
  skippedReason?: string; 
}

export interface DentalData {
  oralCavity?: ImageAnalysisItem;
  skippedReason?: string; 
}

export interface FaceVitalData {
  image?: string;
  aiObservation?: string;
  error?: string; 
}

export interface StethoscopeData {
  heart: ImageAnalysisItem & { simulatedAudioPrompt?: string };
  lungs: ImageAnalysisItem & { simulatedAudioPrompt?: string };
  placementContextImage?: string;
}

export interface DeviceVitalData {
  bp?: VitalSign & { systolic?: ManualEntryField, diastolic?: ManualEntryField }; // deviceImage is part of VitalSign
  spO2?: VitalSign;
  temperature?: VitalSign;
  hemoglobin?: VitalSign;
}

export interface ScreeningData {
  patientInfo: Partial<PatientInfo>;
  anthropometry: Partial<AnthropometryData>;
  entData: Partial<EntData>;
  dentalData: Partial<DentalData>;
  faceVitalData: Partial<FaceVitalData>;
  stethoscopeData: Partial<StethoscopeData>;
  deviceVitals: Partial<DeviceVitalData>;
  dermatologyAssessment?: Record<string, ImageAnalysisItem>; // Dermatology assessment by body area
  nurseGeneralObservations?: string;
  finalReport?: {
    aiSummary?: string;
    // doctorValidationNotes changed to preliminaryNotesForDoctor
    preliminaryNotesForDoctor?: string;
  };
  skippedSteps?: Partial<Record<ScreeningStep, string>>;
}

export interface AnalysisResult {
  text?: string;
  imageUrl?: string; 
  videoSrc?: string; 
  confidence?: number;
  constraints?: AnalysisConstraint[];
}

// Settings Types
export interface AppSettings {
  preferredCameraId?: string;
  preferredMicrophoneId?: string; 
}

export interface MediaDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind; // 'videoinput', 'audioinput', 'audiooutput'
}