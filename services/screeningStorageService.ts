import { ScreeningData } from '../types';

const SCREENING_DATA_PREFIX = 'screening_data_';
const SCREENING_LIST_KEY = 'screening_list';

export interface StoredScreeningData extends ScreeningData {
  studentId: string;
  createdAt: string;
  updatedAt: string;
  status: 'in_progress' | 'completed' | 'uploaded';
  version: number;
}

export interface ScreeningListItem {
  studentId: string;
  studentName?: string;
  createdAt: string;
  updatedAt: string;
  status: 'in_progress' | 'completed' | 'uploaded';
  completedSteps: string[];
}

/**
 * Save screening data for a specific student ID
 */
export const saveScreeningData = (studentId: string, data: ScreeningData, status: 'in_progress' | 'completed' = 'in_progress'): void => {
  try {
    const now = new Date().toISOString();
    const existingData = getScreeningData(studentId);
    
    const storedData: StoredScreeningData = {
      ...data,
      studentId,
      createdAt: existingData?.createdAt || now,
      updatedAt: now,
      status,
      version: (existingData?.version || 0) + 1
    };

    // Save the screening data
    localStorage.setItem(`${SCREENING_DATA_PREFIX}${studentId}`, JSON.stringify(storedData));
    
    // Update the screening list
    updateScreeningList(studentId, data, status);
    
    console.log(`Screening data saved for student ${studentId}`, storedData);
  } catch (error) {
    console.error('Error saving screening data:', error);
    throw new Error('Failed to save screening data locally');
  }
};

/**
 * Get screening data for a specific student ID
 */
export const getScreeningData = (studentId: string): StoredScreeningData | null => {
  try {
    const data = localStorage.getItem(`${SCREENING_DATA_PREFIX}${studentId}`);
    if (!data) return null;
    
    const parsedData = JSON.parse(data) as StoredScreeningData;
    console.log(`Screening data retrieved for student ${studentId}`, parsedData);
    return parsedData;
  } catch (error) {
    console.error('Error retrieving screening data:', error);
    return null;
  }
};

/**
 * Delete screening data for a specific student ID
 */
export const deleteScreeningData = (studentId: string): void => {
  try {
    localStorage.removeItem(`${SCREENING_DATA_PREFIX}${studentId}`);
    
    // Remove from screening list
    const list = getScreeningList();
    const updatedList = list.filter(item => item.studentId !== studentId);
    localStorage.setItem(SCREENING_LIST_KEY, JSON.stringify(updatedList));
    
    console.log(`Screening data deleted for student ${studentId}`);
  } catch (error) {
    console.error('Error deleting screening data:', error);
  }
};

/**
 * Get list of all stored screenings
 */
export const getScreeningList = (): ScreeningListItem[] => {
  try {
    const data = localStorage.getItem(SCREENING_LIST_KEY);
    if (!data) return [];
    
    return JSON.parse(data) as ScreeningListItem[];
  } catch (error) {
    console.error('Error retrieving screening list:', error);
    return [];
  }
};

/**
 * Update the screening list with current data
 */
const updateScreeningList = (studentId: string, data: ScreeningData, status: 'in_progress' | 'completed'): void => {
  try {
    const list = getScreeningList();
    const now = new Date().toISOString();
    
    // Determine completed steps
    const completedSteps: string[] = [];
    if (data.patientInfo?.name?.value) completedSteps.push('StudentIdentification');
    if (data.anthropometry?.height?.value || data.anthropometry?.weight?.value) completedSteps.push('Anthropometry');
    if (data.entData?.ear || data.entData?.nose || data.entData?.throat || data.dentalData?.oral) completedSteps.push('SpecializedImaging');
    if (data.faceVitalData || data.stethoscopeData || data.deviceVitals) completedSteps.push('VitalSigns');
    if (data.dermatologyAssessment && Object.keys(data.dermatologyAssessment).length > 0) completedSteps.push('Dermatology');
    if (data.finalReport?.aiSummary) completedSteps.push('ReviewAndExport');
    
    const existingIndex = list.findIndex(item => item.studentId === studentId);
    
    const listItem: ScreeningListItem = {
      studentId,
      studentName: data.patientInfo?.name?.value || undefined,
      createdAt: existingIndex >= 0 ? list[existingIndex].createdAt : now,
      updatedAt: now,
      status,
      completedSteps
    };
    
    if (existingIndex >= 0) {
      list[existingIndex] = listItem;
    } else {
      list.push(listItem);
    }
    
    // Sort by most recently updated
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    localStorage.setItem(SCREENING_LIST_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Error updating screening list:', error);
  }
};

/**
 * Mark screening as uploaded to EMR
 */
export const markScreeningAsUploaded = (studentId: string): void => {
  try {
    const data = getScreeningData(studentId);
    if (data) {
      data.status = 'uploaded';
      data.updatedAt = new Date().toISOString();
      localStorage.setItem(`${SCREENING_DATA_PREFIX}${studentId}`, JSON.stringify(data));
      
      // Update the list
      const list = getScreeningList();
      const item = list.find(item => item.studentId === studentId);
      if (item) {
        item.status = 'uploaded';
        item.updatedAt = data.updatedAt;
        localStorage.setItem(SCREENING_LIST_KEY, JSON.stringify(list));
      }
    }
  } catch (error) {
    console.error('Error marking screening as uploaded:', error);
  }
};

/**
 * Get all completed screenings ready for EMR upload
 */
export const getCompletedScreenings = (): StoredScreeningData[] => {
  try {
    const list = getScreeningList();
    const completedScreenings: StoredScreeningData[] = [];
    
    for (const item of list) {
      if (item.status === 'completed') {
        const data = getScreeningData(item.studentId);
        if (data) {
          completedScreenings.push(data);
        }
      }
    }
    
    return completedScreenings;
  } catch (error) {
    console.error('Error getting completed screenings:', error);
    return [];
  }
};

/**
 * Export screening data in EMR format
 */
export const exportScreeningForEMR = (data: StoredScreeningData): any => {
  return {
    patient: {
      id: data.studentId,
      name: data.patientInfo?.name?.value || '',
      age: data.patientInfo?.age?.value || '',
      gender: data.patientInfo?.gender?.value || '',
      preExistingConditions: data.patientInfo?.preExistingConditions || ''
    },
    screening: {
      id: `screening_${data.studentId}_${data.createdAt}`,
      date: data.createdAt,
      lastUpdated: data.updatedAt,
      status: data.status,
      version: data.version
    },
    anthropometry: {
      height: data.anthropometry?.height?.value ? {
        value: parseFloat(data.anthropometry.height.value),
        unit: 'cm',
        method: data.anthropometry.height.method || 'manual'
      } : null,
      weight: data.anthropometry?.weight?.value ? {
        value: parseFloat(data.anthropometry.weight.value),
        unit: 'kg',
        method: data.anthropometry.weight.method || 'manual'
      } : null,
      bmi: data.anthropometry?.bmi?.value ? {
        value: parseFloat(data.anthropometry.bmi.value),
        interpretation: data.anthropometry.bmi.analysis || ''
      } : null,
      armSpan: data.anthropometry?.armSpan?.value ? {
        value: parseFloat(data.anthropometry.armSpan.value),
        unit: 'cm'
      } : null
    },
    vitalSigns: {
      bloodPressure: data.deviceVitals?.bloodPressure ? {
        systolic: data.deviceVitals.bloodPressure.systolic,
        diastolic: data.deviceVitals.bloodPressure.diastolic,
        unit: 'mmHg'
      } : null,
      spO2: data.deviceVitals?.spO2?.value ? {
        value: parseFloat(data.deviceVitals.spO2.value),
        unit: '%'
      } : null,
      temperature: data.deviceVitals?.temperature?.value ? {
        value: parseFloat(data.deviceVitals.temperature.value),
        unit: '°C'
      } : null,
      hemoglobin: data.deviceVitals?.hemoglobin?.value ? {
        value: parseFloat(data.deviceVitals.hemoglobin.value),
        unit: 'g/dL'
      } : null
    },
    examinations: {
      ent: data.entData ? {
        ear: data.entData.ear?.analysis || null,
        nose: data.entData.nose?.analysis || null,
        throat: data.entData.throat?.analysis || null
      } : null,
      dental: data.dentalData?.oral ? {
        oral: data.dentalData.oral.analysis || null
      } : null,
      dermatology: data.dermatologyAssessment ? Object.entries(data.dermatologyAssessment).map(([area, assessment]) => ({
        area,
        findings: assessment.analysis,
        timestamp: assessment.timestamp
      })) : null
    },
    summary: {
      aiGenerated: data.finalReport?.aiSummary || null,
      nurseObservations: data.nurseGeneralObservations || null,
      preliminaryNotes: data.finalReport?.preliminaryNotesForDoctor || null
    },
    metadata: {
      systemVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      dataVersion: data.version
    }
  };
};

/**
 * Clear all local screening data (use with caution)
 */
export const clearAllScreeningData = (): void => {
  try {
    const list = getScreeningList();
    for (const item of list) {
      localStorage.removeItem(`${SCREENING_DATA_PREFIX}${item.studentId}`);
    }
    localStorage.removeItem(SCREENING_LIST_KEY);
    console.log('All screening data cleared');
  } catch (error) {
    console.error('Error clearing screening data:', error);
  }
};
