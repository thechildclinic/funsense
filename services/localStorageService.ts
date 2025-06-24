import { ScreeningData, ScreeningStep, AppSettings } from '../types';

const ACTIVE_SCREENING_STUDENT_ID_KEY = 'activeScreeningStudentId_v2';
const APP_SETTINGS_KEY = 'appSettings_v2';
const SCREENING_DATA_PREFIX = 'screeningData_v2_'; // To store data per student

// App Settings
export const saveAppSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving app settings to localStorage:", error);
  }
};

export const loadAppSettings = (): AppSettings | null => {
  try {
    const settingsJson = localStorage.getItem(APP_SETTINGS_KEY);
    return settingsJson ? JSON.parse(settingsJson) : null;
  } catch (error) {
    console.error("Error loading app settings from localStorage:", error);
    return null;
  }
};


// Active Screening Session ID (the student currently being worked on)
export const getActiveScreeningStudentId = (): string | null => {
  return localStorage.getItem(ACTIVE_SCREENING_STUDENT_ID_KEY);
};

export const setActiveScreeningStudentId = (studentId: string | null): void => {
  if (studentId) {
    localStorage.setItem(ACTIVE_SCREENING_STUDENT_ID_KEY, studentId);
  } else {
    localStorage.removeItem(ACTIVE_SCREENING_STUDENT_ID_KEY);
  }
};

// Student-Specific Screening Data
export const saveActiveScreening = (
  studentId: string, 
  data: ScreeningData, 
  currentStep: ScreeningStep
): void => {
  if (!studentId) {
    console.warn("Attempted to save screening data without a student ID.");
    return;
  }
  try {
    const sessionData = { data, currentStep, lastUpdated: new Date().toISOString() };
    localStorage.setItem(`${SCREENING_DATA_PREFIX}${studentId}`, JSON.stringify(sessionData));
    setActiveScreeningStudentId(studentId); // Ensure this student is marked active
  } catch (error) {
    console.error(`Error saving screening data for student ${studentId}:`, error);
    // Potentially handle quota exceeded error
  }
};

export const loadActiveScreening = (studentId: string): { data: ScreeningData; currentStep: ScreeningStep } | null => {
  if (!studentId) return null;
  try {
    const sessionJson = localStorage.getItem(`${SCREENING_DATA_PREFIX}${studentId}`);
    if (sessionJson) {
      const parsed = JSON.parse(sessionJson);
      // setActiveScreeningStudentId(studentId); // Mark as active if loaded successfully
      return { data: parsed.data, currentStep: parsed.currentStep };
    }
    return null;
  } catch (error) {
    console.error(`Error loading screening data for student ${studentId}:`, error);
    return null;
  }
};

export const clearActiveScreening = (studentId: string): void => {
  if (!studentId) {
    console.warn("Attempted to clear screening data without a student ID.");
    return;
  }
  try {
    localStorage.removeItem(`${SCREENING_DATA_PREFIX}${studentId}`);
    // If the cleared student was the globally "active" one, clear that marker too.
    if (getActiveScreeningStudentId() === studentId) {
      setActiveScreeningStudentId(null);
    }
  } catch (error)
 {
    console.error(`Error clearing screening data for student ${studentId}:`, error);
  }
};

// Utility to clear ALL screening data (for all students) and settings - use with caution
export const clearAllApplicationData = (): void => {
  try {
    // Clear individual student screening data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(SCREENING_DATA_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    // Clear active student ID marker
    localStorage.removeItem(ACTIVE_SCREENING_STUDENT_ID_KEY);
    // Clear app settings
    localStorage.removeItem(APP_SETTINGS_KEY);
    console.log("All application data cleared from localStorage.");
  } catch (error) {
    console.error("Error clearing all application data from localStorage:", error);
  }
};

// For settings modal, a more specific clear for just screening data
export const clearAllScreeningSessionData = (): void => {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(SCREENING_DATA_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    localStorage.removeItem(ACTIVE_SCREENING_STUDENT_ID_KEY);
    console.log("All screening session data cleared from localStorage.");
  } catch (error) {
    console.error("Error clearing all screening session data:", error);
  }
};
