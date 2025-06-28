import { HarmCategory, HarmBlockThreshold } from '@google/genai';
import { FaUserMd, FaWeight, FaChartLine, FaHeartbeat, FaFileMedicalAlt, FaAssistiveListeningSystems, FaNotesMedical, FaTooth, FaLungs, FaThermometerFull, FaPercent, FaVial, FaStethoscope, FaChild, FaRulerVertical, FaBalanceScale, FaCameraRetro, FaHeadSideVirus, FaSmileBeam, FaMobileAlt, FaUserNurse, FaArrowsAltH, FaStreetView, FaCog, FaHandPaper } from 'react-icons/fa'; // Added FaHandPaper for dermatology
import { FaUserDoctor, FaEarListen, FaQrcode } from "react-icons/fa6";
import { PatientInfo, ScreeningStep, AppSettings } from './types'; // Added import for ScreeningStep and AppSettings

export const APP_TITLE = "School Health Screening System";
export const GEMINI_API_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

export const DEFAULT_PATIENT_DATA: Partial<PatientInfo> = { 
  name: { value: '' },
  age: { value: '' },
  gender: { value: '' },
  preExistingConditions: '', // Added
};

export const DEFAULT_CAMERA_FACING_MODE = 'environment';
export const DEFAULT_SETTINGS: AppSettings = {
  preferredCameraId: undefined,
  preferredMicrophoneId: undefined,
};

export const GEMINI_SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export const ANTHROPOMETRY_INSTRUCTIONS = {
    height: "Fixed Station Height Measurement:\n1. Student stands straight against a flat wall (shoeless, heels together, looking straight) where a vertical ruler/tape (starting at 0 cm from floor) is permanently fixed.\n2. Camera is at a fixed distance (~1.5-2m) and height (student's mid-section).\n3. Capture full body including the entire ruler. Ensure ruler markings are clear.\n4. After capture, you will tap points on the image to measure height.",
    armSpan: "Arm Span Measurement:\n1. Student stands back against a wall (can be the same height station if wide enough or a dedicated area with horizontal markings).\n2. Arms extended straight out to sides (T-shape), parallel to floor.\n3. Capture image showing full arm span. If using height station's ruler for horizontal reference, ensure it's visible or that other clear horizontal markings are present.\n4. After capture, you will tap points on the image to measure arm span."
};

export const OBSERVED_BODY_TYPE_OPTIONS = ["Not Assessed", "Slim/Linear", "Average/Athletic", "Rounded/Heavier"];

// Dermatology assessment options and prompts
export const SKIN_LESION_LOCATIONS = [
  "Face", "Scalp", "Neck", "Chest", "Back", "Arms", "Hands", "Abdomen",
  "Legs", "Feet", "Other (specify in notes)"
];

export const SKIN_LESION_NATURE_OPTIONS = [
  "Mole/Nevus", "Freckle", "Rash", "Cut/Scratch", "Bruise", "Insect bite",
  "Eczema patch", "Acne", "Wart", "Birthmark", "Other (describe)"
];

export const SKIN_LESION_SYMPTOMS = [
  "None", "Itching", "Pain", "Burning", "Tenderness", "Bleeding",
  "Discharge", "Swelling", "Other (describe)"
];

export const DERMATOLOGY_PROMPTS = {
  location: "Select the body area where the lesion is located. Be as specific as possible.",
  nature: "Choose the type that best describes the lesion's appearance or known nature.",
  symptoms: "Select any symptoms the student reports associated with this lesion.",
  nurseNotes: "Document additional observations about size, color, texture, or any other relevant details.",
  generalSkin: "Record overall skin condition observations, noting any areas of concern or general skin health."
};


// Prompts for Gemini
export const PROMPTS = {
  BMI_INTERPRETATION: (bmi: number, age?: string, gender?: string, bodyType?: string, armSpan?: string, silhouetteObs?: string): string => {
    let context = `A student has a BMI of ${bmi.toFixed(2)}. This was calculated from nurse-confirmed height and weight.`;
    if (age) context += ` Age: ${age}.`;
    if (gender) context += ` Gender: ${gender}.`;
    if (silhouetteObs) context += ` AI Silhouette Observation: ${silhouetteObs}.`;
    if (bodyType && bodyType !== "Not Assessed") context += ` Nurse's Observed Body Type: ${bodyType}.`;
    if (armSpan) context += ` Nurse-confirmed Arm Span: ${armSpan} cm.`;
    return `${context} Provide a brief, general interpretation of this BMI value, considering WHO BMI categories (Underweight, Normal weight, Overweight, Obesity). If AI silhouette, body type, or arm span relative to height seems relevant for context (e.g. athletic build, long arms), mention it neutrally. Keep it concise and informative for a health screening report. Do not give medical advice.`;
  },
  HEIGHT_SILHOUETTE_FROM_IMAGE: "Analyze this image for a health screening. Is a student clearly visible? Is a vertical ruler or clear reference scale present and readable in the image? Provide a brief, general description of the student's body outline/silhouette (e.g., 'Silhouette: Slim build, upright posture.'). Respond in the format: 'Visibility: [Student: Yes/No, Ruler: Yes/No/PartiallyVisible]. Silhouette: [description].'",
  ARM_SPAN_FROM_IMAGE: "Analyze this image of a student with arms extended. Are the arms fully extended and fingertips visible? Is a horizontal reference scale or markings visible and potentially usable for measurement? Respond in the format: 'Visibility: [ArmsExtended: Yes/No, Fingertips: Yes/No, ReferenceMarkings: Yes/No/Unclear/NA].'",
  WEIGHING_SCALE_OCR: "Extract the numerical reading from this image of a weighing scale display. If multiple numbers are present, identify the most likely weight reading. Respond with only the number and unit if visible (e.g., '65.5 kg'). If unclear, state 'Reading unclear'.",
  ENT_IMAGE_ANALYSIS: (area: 'ear' | 'nose' | 'throat', analysisSource: 'image' | 'videoFrame'): string => `This is an ${analysisSource} of a patient's ${area} area. Describe any general visual features observable (e.g., color, presence of discharge, swelling, clear passage if applicable). Attempt to describe the approximate location of any notable features if visible (e.g., 'redness on the posterior pharyngeal wall' or 'clear fluid in the lower nasal passage'). Provide general educational points related to ${area} health. State clearly this is not a diagnosis and professional medical consultation is essential. Focus on objective visual description and general education. If this is a frame from a video, note that full video is available for later review.`,
  DENTAL_IMAGE_ANALYSIS: (analysisSource: 'image' | 'videoFrame'): string => `This is an ${analysisSource} of an oral cavity/teeth. Describe general visual characteristics relevant to dental health (e.g., apparent cleanliness, visible discoloration on teeth - try to specify general location like 'upper front teeth' or 'lower molars', general gum appearance if visible - e.g., 'gums appear pink and firm' or 'redness noted near specific teeth'). Provide general dental hygiene educational points. IMPORTANT: This is NOT a dental diagnosis. Advise seeking professional dental consultation. Do not attempt to identify specific dental problems. If this is a frame from a video, note that full video is available for later review.`,
  FACE_WELLNESS_OBSERVATION: "This is a frontal face image. Provide a brief, general wellness observation based on appearance (e.g., 'appears alert'). This is not a diagnostic assessment. Keep it very general and positive if no obvious distress is visible. Note this is a simulated analysis based on visual appearance only.",
  SIMULATED_STETHOSCOPE_ANALYSIS: (area: 'heart' | 'lungs', context: string): string => `This is a simulated ${area} auscultation for educational purposes. Context: ${context}. Describe what clear sounds generally indicate (e.g., 'For lungs, clear sounds suggest good air entry.'). If there were common abnormalities, what might they generally suggest (e.g., 'Crackles in lungs can suggest fluid, wheezes indicate narrowed airways. For heart, murmurs might indicate turbulent blood flow.'). Emphasize this is a SIMULATION and NOT a real finding based on actual audio. This is general educational information.`,
  DEVICE_DISPLAY_OCR: (deviceName: string): string => `Extract the primary reading from this image of a ${deviceName} display. Include units if visible. If multiple values, prioritize the main physiological measurement. If unclear, state 'Reading unclear'.`,
  SKIN_LESION_ANALYSIS: (location: string, nature: string, symptoms: string): string =>
    `Analyze this image of a skin lesion for a health screening. Location: ${location}. Reported nature: ${nature}. Symptoms: ${symptoms}.
    Provide a general visual description including: apparent size (small/medium/large), color characteristics, shape (round/irregular/linear), surface texture (smooth/rough/raised/flat), and any notable features.
    Consider common benign skin conditions in school-age children (e.g., moles, freckles, minor cuts, insect bites, eczema patches).
    IMPORTANT: This is NOT a medical diagnosis. State clearly that professional dermatological evaluation is recommended for any concerning lesions.
    Provide general skin health education points relevant to the observed characteristics.
    Format response as: 'Visual Description: [detailed description]. Educational Notes: [relevant information]. Recommendation: Professional evaluation advised.'`,
  GENERAL_SKIN_ASSESSMENT: "Analyze this image for general skin condition assessment in a school health screening context. Describe overall skin appearance, noting any visible areas of concern, general skin tone and texture. Provide general skin health education points. This is NOT a diagnostic assessment - emphasize that any concerning areas should be evaluated by a healthcare professional.",
  SCREENING_SUMMARY_REPORT: (data: string): string => // data will be a stringified version of ScreeningData
    `Generate a concise health screening summary report based on the following data for a student. This report will be validated by a doctor. Structure it with clear sections: Patient Information (including any Pre-existing Conditions if provided), Anthropometry, ENT Examination, Dental Examination, Dermatology/Skin Assessment, Vital Signs.
    For each section/module: if the data for that module indicates it was skipped (e.g., in a 'skippedSteps' field with a reason), clearly state "This module was skipped. Reason: [provided reason]." and do not attempt to summarize missing data for it. Otherwise, summarize the available data for the module.
    For Dermatology section: Include any documented skin lesions with their locations, characteristics, and nurse observations. Note if general skin assessment was performed.
    Incorporate Nurse's General Observations and Preliminary Notes for Doctor into relevant sections or as general notes.
    Highlight any observations that might warrant further attention based on general parameters, but DO NOT provide a diagnosis or medical advice.
    IMPORTANT: Prioritize directly measured or OCR-scanned vital signs (BP, SpO2, Temp, Hb) over any simulated or visually estimated vitals if both are present. Clearly label the source/method of each vital.
    If video was captured for any imaging, mention that the summary is based on a still frame and the full video is available for detailed review.
    Data: ${data}`,
};

// Icons for steps or specific items
export const STEP_ICONS = {
  [ScreeningStep.StudentIdentification]: FaQrcode,
  [ScreeningStep.Anthropometry]: FaChild,
  'Height': FaRulerVertical,
  'Weight': FaBalanceScale,
  'ArmSpan': FaArrowsAltH,
  'BodyType': FaStreetView,
  [ScreeningStep.SpecializedImaging]: FaCameraRetro,
  'ENT': FaEarListen,
  'Dental': FaSmileBeam,
  [ScreeningStep.Dermatology]: FaHandPaper,
  'SkinLesion': FaHandPaper,
  [ScreeningStep.VitalSigns]: FaHeartbeat,
  'FaceVitals': FaUserNurse,
  'Stethoscope': FaStethoscope,
  'DeviceVitals': FaMobileAlt,
  'BP': FaHeartbeat, // FaTint was used for BP card, FaHeartbeat can be generic for vitals step icon
  'SpO2': FaPercent,
  'Temperature': FaThermometerFull,
  'Hemoglobin': FaVial,
  [ScreeningStep.ReviewAndExport]: FaFileMedicalAlt,
  'Settings': FaCog,
};