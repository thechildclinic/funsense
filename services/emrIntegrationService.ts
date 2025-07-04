import { StoredScreeningData, exportScreeningForEMR, markScreeningAsUploaded } from './screeningStorageService';

export interface EMRConfig {
  endpoint: string;
  apiKey?: string;
  format: 'fhir' | 'hl7' | 'custom' | 'json';
  headers?: Record<string, string>;
  authType?: 'bearer' | 'apikey' | 'basic' | 'none';
}

export interface UploadResult {
  success: boolean;
  studentId: string;
  message: string;
  emrId?: string;
  error?: string;
}

export interface BatchUploadResult {
  totalAttempted: number;
  successful: number;
  failed: number;
  results: UploadResult[];
}

/**
 * Upload a single screening to EMR
 */
export const uploadScreeningToEMR = async (
  screeningData: StoredScreeningData, 
  config: EMRConfig
): Promise<UploadResult> => {
  try {
    // Convert screening data to EMR format
    const emrData = exportScreeningForEMR(screeningData);
    
    // Format data according to EMR requirements
    const formattedData = formatDataForEMR(emrData, config.format);
    
    // Prepare request headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers
    };
    
    // Add authentication
    if (config.authType === 'bearer' && config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    } else if (config.authType === 'apikey' && config.apiKey) {
      headers['X-API-Key'] = config.apiKey;
    }
    
    // Make the upload request
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(formattedData)
    });
    
    if (!response.ok) {
      throw new Error(`EMR upload failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Mark as uploaded in local storage
    markScreeningAsUploaded(screeningData.studentId);
    
    return {
      success: true,
      studentId: screeningData.studentId,
      message: 'Successfully uploaded to EMR',
      emrId: result.id || result.recordId || result.patientId
    };
    
  } catch (error) {
    console.error('EMR upload error:', error);
    return {
      success: false,
      studentId: screeningData.studentId,
      message: 'Failed to upload to EMR',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Upload multiple screenings to EMR in batch
 */
export const batchUploadToEMR = async (
  screenings: StoredScreeningData[],
  config: EMRConfig,
  onProgress?: (completed: number, total: number) => void
): Promise<BatchUploadResult> => {
  const results: UploadResult[] = [];
  let successful = 0;
  let failed = 0;
  
  for (let i = 0; i < screenings.length; i++) {
    const screening = screenings[i];
    
    try {
      const result = await uploadScreeningToEMR(screening, config);
      results.push(result);
      
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
      
      // Call progress callback
      if (onProgress) {
        onProgress(i + 1, screenings.length);
      }
      
      // Add delay between uploads to avoid overwhelming the EMR system
      if (i < screenings.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      const errorResult: UploadResult = {
        success: false,
        studentId: screening.studentId,
        message: 'Upload failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      results.push(errorResult);
      failed++;
      
      if (onProgress) {
        onProgress(i + 1, screenings.length);
      }
    }
  }
  
  return {
    totalAttempted: screenings.length,
    successful,
    failed,
    results
  };
};

/**
 * Format data according to EMR requirements
 */
const formatDataForEMR = (data: any, format: EMRConfig['format']): any => {
  switch (format) {
    case 'fhir':
      return formatToFHIR(data);
    case 'hl7':
      return formatToHL7(data);
    case 'custom':
      return formatToCustom(data);
    case 'json':
    default:
      return data;
  }
};

/**
 * Format data to FHIR standard
 */
const formatToFHIR = (data: any): any => {
  return {
    resourceType: "Bundle",
    id: `screening-${data.screening.id}`,
    type: "document",
    timestamp: data.screening.date,
    entry: [
      {
        resource: {
          resourceType: "Patient",
          id: data.patient.id,
          name: [{
            text: data.patient.name,
            family: data.patient.name.split(' ').slice(-1)[0],
            given: data.patient.name.split(' ').slice(0, -1)
          }],
          gender: data.patient.gender?.toLowerCase(),
          birthDate: calculateBirthDate(data.patient.age)
        }
      },
      {
        resource: {
          resourceType: "Observation",
          id: `height-${data.patient.id}`,
          status: "final",
          category: [{
            coding: [{
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "vital-signs"
            }]
          }],
          code: {
            coding: [{
              system: "http://loinc.org",
              code: "8302-2",
              display: "Body height"
            }]
          },
          subject: { reference: `Patient/${data.patient.id}` },
          valueQuantity: data.anthropometry.height ? {
            value: data.anthropometry.height.value,
            unit: data.anthropometry.height.unit,
            system: "http://unitsofmeasure.org",
            code: "cm"
          } : undefined
        }
      },
      {
        resource: {
          resourceType: "Observation",
          id: `weight-${data.patient.id}`,
          status: "final",
          category: [{
            coding: [{
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "vital-signs"
            }]
          }],
          code: {
            coding: [{
              system: "http://loinc.org",
              code: "29463-7",
              display: "Body weight"
            }]
          },
          subject: { reference: `Patient/${data.patient.id}` },
          valueQuantity: data.anthropometry.weight ? {
            value: data.anthropometry.weight.value,
            unit: data.anthropometry.weight.unit,
            system: "http://unitsofmeasure.org",
            code: "kg"
          } : undefined
        }
      }
      // Add more FHIR resources for vital signs, examinations, etc.
    ]
  };
};

/**
 * Format data to HL7 standard
 */
const formatToHL7 = (data: any): string => {
  // This is a simplified HL7 v2 message format
  // In a real implementation, you would use a proper HL7 library
  const segments = [
    `MSH|^~\\&|SCREENING_SYSTEM|CLINIC|EMR_SYSTEM|HOSPITAL|${new Date().toISOString().replace(/[-:]/g, '').slice(0, 14)}||ADT^A08|${Date.now()}|P|2.5`,
    `PID|1||${data.patient.id}^^^MR||${data.patient.name.replace(' ', '^')}||${calculateBirthDate(data.patient.age)}|${data.patient.gender?.charAt(0)?.toUpperCase()}`,
    `OBX|1|NM|8302-2^Body height^LN||${data.anthropometry.height?.value || ''}|cm|||||F`,
    `OBX|2|NM|29463-7^Body weight^LN||${data.anthropometry.weight?.value || ''}|kg|||||F`,
    `OBX|3|NM|39156-5^Body mass index^LN||${data.anthropometry.bmi?.value || ''}|kg/m2|||||F`
  ];
  
  return segments.join('\r');
};

/**
 * Format data to custom format (placeholder)
 */
const formatToCustom = (data: any): any => {
  // This would be customized based on your specific EMR requirements
  return {
    patient_id: data.patient.id,
    patient_name: data.patient.name,
    screening_date: data.screening.date,
    measurements: {
      height_cm: data.anthropometry.height?.value,
      weight_kg: data.anthropometry.weight?.value,
      bmi: data.anthropometry.bmi?.value
    },
    vital_signs: {
      blood_pressure: data.vitalSigns.bloodPressure ? 
        `${data.vitalSigns.bloodPressure.systolic}/${data.vitalSigns.bloodPressure.diastolic}` : null,
      oxygen_saturation: data.vitalSigns.spO2?.value,
      temperature: data.vitalSigns.temperature?.value,
      hemoglobin: data.vitalSigns.hemoglobin?.value
    },
    examinations: data.examinations,
    summary: data.summary.aiGenerated,
    nurse_notes: data.summary.nurseObservations
  };
};

/**
 * Calculate birth date from age (approximate)
 */
const calculateBirthDate = (age: string): string => {
  if (!age) return '';
  const ageNum = parseInt(age);
  if (isNaN(ageNum)) return '';
  
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - ageNum;
  return `${birthYear}-01-01`; // Approximate birth date
};

/**
 * Test EMR connection
 */
export const testEMRConnection = async (config: EMRConfig): Promise<boolean> => {
  try {
    const testData = {
      test: true,
      timestamp: new Date().toISOString()
    };
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers
    };
    
    if (config.authType === 'bearer' && config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    } else if (config.authType === 'apikey' && config.apiKey) {
      headers['X-API-Key'] = config.apiKey;
    }
    
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(testData)
    });
    
    return response.ok;
  } catch (error) {
    console.error('EMR connection test failed:', error);
    return false;
  }
};
