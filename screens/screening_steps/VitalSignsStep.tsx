import React, { useState } from 'react';
import { useScreeningContext } from '../../contexts/ScreeningContext';
import { FaceVitalData, StethoscopeData, DeviceVitalData, ImageAnalysisItem, ScreeningStep, VitalSign } from '../../types';
import CameraCapture from '../../components/CameraCapture';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import AnalysisDisplay from '../../components/AnalysisDisplay';
import { generateTextWithGemini, analyzeAudioWithGemini, extractTextWithGeminiOCR } from '../../services/geminiService';
import { PROMPTS, STEP_ICONS } from '../../constants';
import { FaHeartbeat, FaLungs, FaTint, FaUserNurse, FaStethoscope, FaCamera, FaSave, FaBroadcastTower, FaCheckCircle, FaPercent, FaThermometerFull, FaVial, FaFileMedicalAlt } from 'react-icons/fa'; 

interface VitalSignsStepProps {
    onScreeningEnd: () => void; // Added for "Save & Return to Student List"
}

const VitalSignsStep: React.FC<VitalSignsStepProps> = ({ onScreeningEnd }) => {
  const { screeningData, updateScreeningData } = useScreeningContext(); // Removed nextStep as it's handled by ScreeningFlow now

  const [faceVital, setFaceVital] = useState<FaceVitalData>(screeningData.faceVitalData || {});
  const [showFaceCamera, setShowFaceCamera] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);

  const initialStethoscopeData = screeningData.stethoscopeData;
  const [stethoscope, setStethoscope] = useState<StethoscopeData>({
      heart: initialStethoscopeData?.heart ?? { image: '', simulatedAudioPrompt: '' },
      lungs: initialStethoscopeData?.lungs ?? { image: '', simulatedAudioPrompt: '' },
      placementContextImage: initialStethoscopeData?.placementContextImage,
  });
  const [showStethPlacementCamera, setShowStethPlacementCamera] = useState(false);
  const [stethLoading, setStethLoading] = useState(false);
  
  // Initialize device vitals from context or with defaults
  const [bpData, setBpData] = useState<DeviceVitalData['bp']>(
    screeningData.deviceVitals.bp || { name: "Blood Pressure", unit:"mmHg", value:"", icon: FaTint, status: 'info', systolic: {value:''}, diastolic: {value:''} }
  );
  const [spO2Data, setSpO2Data] = useState<DeviceVitalData['spO2']>(
    screeningData.deviceVitals.spO2 || { name: "SpO2", unit:"%", value:"", icon: FaPercent, status: 'info' }
  );
  const [temperatureData, setTemperatureData] = useState<DeviceVitalData['temperature']>(
    screeningData.deviceVitals.temperature || { name: "Temperature", unit:"°C", value:"", icon: FaThermometerFull, status: 'info' }
  );
  const [hemoglobinData, setHemoglobinData] = useState<DeviceVitalData['hemoglobin']>(
    screeningData.deviceVitals.hemoglobin || { name: "Hemoglobin", unit:"g/dL", value:"", icon: FaVial, status: 'info' }
  );

  const [showCameraFor, setShowCameraFor] = useState<null | 'bp' | 'spO2' | 'temperature' | 'hemoglobin'>(null);
  const [loadingFor, setLoadingFor] = useState<null | 'bp' | 'spO2' | 'temperature' | 'hemoglobin'>(null);
  const [inputMethodFor, setInputMethodFor] = useState<Record<string, 'Scan' | 'Manual'>>({
      bp: 'Scan', spO2: 'Scan', temperature: 'Scan', hemoglobin: 'Scan'
  });
  const [isDataSaved, setIsDataSaved] = useState(false);

  const getSetterForVital = (vitalKey: 'bp' | 'spO2' | 'temperature' | 'hemoglobin') => {
    switch(vitalKey) {
        case 'bp': return setBpData;
        case 'spO2': return setSpO2Data;
        case 'temperature': return setTemperatureData;
        case 'hemoglobin': return setHemoglobinData;
        default: return () => {};
    }
  };


  const handleFaceVitalCapture = async (mediaData: { imageDataUrl?: string }) => {
    if (!mediaData.imageDataUrl) return;
    setShowFaceCamera(false);
    setFaceLoading(true);
    setFaceVital(prev => ({ ...prev, image: mediaData.imageDataUrl, error: undefined }));
    setIsDataSaved(false);
    try {
      const observation = await generateTextWithGemini(PROMPTS.FACE_WELLNESS_OBSERVATION);
      setFaceVital(prev => ({ ...prev, aiObservation: observation }));
    } catch (e) {
      setFaceVital(prev => ({ ...prev, error: 'AI observation for face failed.' }));
    }
    setFaceLoading(false);
  };

  const handleStethPlacementCapture = (mediaData: { imageDataUrl?: string }) => {
    if (!mediaData.imageDataUrl) return;
    setShowStethPlacementCamera(false);
    setStethoscope(prev => ({ ...prev, placementContextImage: mediaData.imageDataUrl }));
    setIsDataSaved(false);
  };

  const simulateStethAnalysis = async (area: 'heart' | 'lungs') => {
    if (!stethoscope.placementContextImage) {
        alert("Please capture stethoscope placement image first.");
        return;
    }
    setStethLoading(true);
    const currentAreaState = stethoscope[area];
    setIsDataSaved(false);
    try {
        const educationalPrompt = PROMPTS.SIMULATED_STETHOSCOPE_ANALYSIS(area, "area shown in placement image (this is an educational simulation, not real audio analysis)");
        const analysisText = await analyzeAudioWithGemini("SIMULATED_AUSCULTATION_INPUT", educationalPrompt); 
        
        setStethoscope(prev => ({ 
            ...prev, 
            [area]: { 
                ...(currentAreaState || { image: '', simulatedAudioPrompt: '' }), 
                aiAnalysis: analysisText, 
                confidence: Math.random() * 0.3 + 0.5, 
             } as ImageAnalysisItem & { simulatedAudioPrompt?: string} 
        }));
    } catch (e) {
        console.error(`Error simulating ${area} analysis:`, e);
        setStethoscope(prev => ({ ...prev, [area]: { ...currentAreaState, aiAnalysis: `Error generating educational text for ${area}.` } }));
    }
    setStethLoading(false);
  };

 const handleDeviceImageCapture = async (
    vitalKey: 'bp' | 'spO2' | 'temperature' | 'hemoglobin', 
    mediaData: { imageDataUrl?: string }
  ) => {
    if (!mediaData.imageDataUrl) return;
    setIsDataSaved(false);
    setShowCameraFor(null);
    setLoadingFor(vitalKey);

    const setter = getSetterForVital(vitalKey);
    const currentVital = screeningData.deviceVitals[vitalKey] || { name: vitalKey, unit:"", value:"", icon: FaFileMedicalAlt, status: 'info' };

    setter(prev => ({...(prev || currentVital), deviceImage: mediaData.imageDataUrl, error: undefined}));
    
    try {
        const ocrPrompt = PROMPTS.DEVICE_DISPLAY_OCR(currentVital.name);
        const ocrText = await extractTextWithGeminiOCR(mediaData.imageDataUrl, ocrPrompt);
        
        if (vitalKey === 'bp') {
            const parts = ocrText.match(/(\d+)\s*\/\s*(\d+)/);
            if (parts && parts.length === 3) {
                 setBpData(prev => ({
                    ...(prev || {} as NonNullable<DeviceVitalData['bp']>), 
                    systolic: { ...(prev?.systolic), value: parts[1]},
                    diastolic: { ...(prev?.diastolic), value: parts[2]},
                    value: `${parts[1]}/${parts[2]}`,
                    ocrAttempt: ocrText
                }));
            } else {
                 setBpData(prev => ({...(prev || {} as NonNullable<DeviceVitalData['bp']>), error: "Complex OCR for BP - enter manually or check image.", ocrAttempt: ocrText}));
            }
        } else {
            // For SpO2, Temp, Hb - simple value extraction
            const numericValue = ocrText.match(/[\d.]+/)?.[0] || '';
            setter(prev => ({...(prev || currentVital), value: numericValue, ocrAttempt: ocrText}));
        }
    } catch (e) {
        setter(prev => ({...(prev || currentVital), error: `OCR failed for ${currentVital.name}. Please enter manually.`}));
    }
    setLoadingFor(null);
  };
  
  const handleDeviceManualInput = (
    vitalKey: 'bp' | 'spO2' | 'temperature' | 'hemoglobin', 
    field: 'value' | 'systolic' | 'diastolic' | 'reason' | 'manualEntryReason', // Added 'manualEntryReason'
    subField: 'value' | undefined, // Only for systolic/diastolic which are ManualEntryField
    val: string
  ) => {
    setIsDataSaved(false);
    const setter = getSetterForVital(vitalKey);
    
    setter(prev => {
        const updatedVital = {...(prev || { name: vitalKey, unit:"", value:"", icon: FaFileMedicalAlt, status: 'info' }) } as VitalSign & { systolic?: any, diastolic?: any}; // Temp any for subfields
        
        if (vitalKey === 'bp' && (field === 'systolic' || field === 'diastolic')) {
            updatedVital[field] = { ...(updatedVital[field] || {value: ''}), value: val };
            const sys = field === 'systolic' ? val : updatedVital.systolic?.value;
            const dia = field === 'diastolic' ? val : updatedVital.diastolic?.value;
            if (sys && dia) updatedVital.value = `${sys}/${dia}`;
            else if (sys && !dia) updatedVital.value = `${sys}/?`;
            else if (!sys && dia) updatedVital.value = `?/${dia}`;
            else updatedVital.value = '?/?';
        } else if (field === 'value') {
            updatedVital.value = val;
        } else if (field === 'manualEntryReason') { // Use 'manualEntryReason' to match VitalSign type
            updatedVital.manualEntryReason = val;
        }
        updatedVital.method = 'Manual';
        return updatedVital;
    });
  };

  const handleSaveData = () => {
    updateScreeningData(prev => ({
      ...prev,
      faceVitalData: faceVital,
      stethoscopeData: stethoscope,
      deviceVitals: {
          ...prev.deviceVitals, 
          bp: bpData,
          spO2: spO2Data,
          temperature: temperatureData,
          hemoglobin: hemoglobinData,
      }
    }));
    setIsDataSaved(true);
    setTimeout(() => setIsDataSaved(false), 2000);
  };

  const handleSaveAndReturn = () => {
    handleSaveData();
    onScreeningEnd(); // Navigate back to student list
  };
  
  const Section: React.FC<{title: string, icon: React.ElementType, children: React.ReactNode, note?: string}> = ({title, icon: Icon, children, note}) => (
    <div className="p-3 border border-gray-200 rounded-lg mb-3 bg-white animate-fadeIn">
        <h3 className="text-md font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Icon className="text-brand-cyan"/> {title}</h3>
        {note && <p className="text-xs text-yellow-700 bg-yellow-100 p-1.5 rounded-md mb-2">{note}</p>}
        {children}
    </div>
  );

  const DeviceVitalSection: React.FC<{
    vitalKey: 'bp' | 'spO2' | 'temperature' | 'hemoglobin';
    vitalData: VitalSign | undefined; // Make it VitalSign for SpO2, Temp, Hb
    title: string;
    icon: React.ElementType;
    unit: string;
  }> = ({ vitalKey, vitalData, title, icon: Icon, unit }) => (
    <Section title={title} icon={Icon}>
        <div className="flex border-b mb-2">
            <button onClick={() => setInputMethodFor(prev => ({...prev, [vitalKey]: 'Scan'}))} className={`flex-1 py-1 text-sm ${inputMethodFor[vitalKey] === 'Scan' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Scan Device</button>
            <button onClick={() => setInputMethodFor(prev => ({...prev, [vitalKey]: 'Manual'}))} className={`flex-1 py-1 text-sm ${inputMethodFor[vitalKey] === 'Manual' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Manual Entry</button>
        </div>

        {inputMethodFor[vitalKey] === 'Scan' && (
          <>
            {showCameraFor === vitalKey ? (
              <CameraCapture onCapture={(media) => handleDeviceImageCapture(vitalKey, media)} captureInstruction={`Scan ${title} monitor display`} captureMode="image"/>
            ) : (
              <>
                {vitalData?.deviceImage && <img src={vitalData.deviceImage} alt={`${title} device`} className="max-w-xs h-auto rounded-md my-2"/>}
                <button onClick={() => {setShowCameraFor(vitalKey); setIsDataSaved(false);}} className="text-sm text-blue-600 my-1 flex items-center gap-1"><FaCamera /> {vitalData?.deviceImage ? `Retake Scan for ${title}` : `Scan ${title} Device`}</button>
              </>
            )}
            {loadingFor === vitalKey && <LoadingSpinner text={`Processing ${title} image...`} />}
            {vitalData?.error && <ErrorMessage message={vitalData.error}/>}
            {vitalData?.ocrAttempt && <p className="text-xs text-gray-500">OCR Attempt: "{vitalData.ocrAttempt}"</p>}
          </>
        )}
        
        {vitalKey === 'bp' && bpData ? ( // Specific UI for BP due to systolic/diastolic
             <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                    <label className="text-xs font-medium">Systolic (mmHg)</label>
                    <input type="number" value={bpData.systolic?.value || ''} onChange={(e) => handleDeviceManualInput('bp', 'systolic', 'value', e.target.value)} className="w-full p-1.5 border rounded"/>
                </div>
                <div>
                    <label className="text-xs font-medium">Diastolic (mmHg)</label>
                    <input type="number" value={bpData.diastolic?.value || ''} onChange={(e) => handleDeviceManualInput('bp', 'diastolic', 'value', e.target.value)} className="w-full p-1.5 border rounded"/>
                </div>
           </div>
        ) : ( // Generic UI for SpO2, Temp, Hb
            <div>
                <label className="text-xs font-medium">{title} Value ({unit})</label>
                <input type="number" value={vitalData?.value || ''} onChange={(e) => handleDeviceManualInput(vitalKey, 'value', undefined, e.target.value)} className="w-full p-1.5 border rounded"/>
            </div>
        )}

       {inputMethodFor[vitalKey] === 'Manual' && 
         <>
            <label className="text-xs font-medium mt-1">Reason for manual {title}</label>
            <input type="text" value={vitalData?.manualEntryReason || ''}  onChange={(e) => handleDeviceManualInput(vitalKey, 'manualEntryReason', undefined, e.target.value)} className="w-full p-1 border rounded text-xs"/>
         </>
       }
    </Section>
  );

  const StepIcon = STEP_ICONS[ScreeningStep.VitalSigns];

  return (
    <div className="p-1">
      <div className="flex items-center gap-3 mb-4 text-slate-700">
        {StepIcon && <StepIcon className="text-2xl text-brand-light-blue" />}
        <h2 className="text-xl font-semibold">Vital Signs</h2>
      </div>

      <Section title="Face Wellness Observation (Simulated)" icon={FaUserNurse}>
        {showFaceCamera ? (
          <CameraCapture onCapture={handleFaceVitalCapture} captureInstruction="Capture clear frontal face image" captureMode="image"/>
        ) : (
          <>
            {faceVital.image && <img src={faceVital.image} alt="Face capture" className="max-w-xs h-auto rounded-md my-2"/>}
            <button onClick={() => {setShowFaceCamera(true); setIsDataSaved(false);}} className="text-sm text-blue-600 my-1 flex items-center gap-1"><FaCamera /> {faceVital.image ? 'Retake' : 'Capture'} Face Image</button>
          </>
        )}
        {faceLoading && <LoadingSpinner text="Analyzing face..." />}
        {faceVital.aiObservation && <p className="text-sm bg-blue-50 p-2 rounded mt-1">AI Observation: {faceVital.aiObservation}</p>}
        {faceVital.error && <ErrorMessage message={faceVital.error}/>}
      </Section>

      <Section title="Stethoscope Auscultation (Educational Simulation)" icon={FaStethoscope}
        note="This feature provides general educational text about heart/lung sounds based on a simulated scenario. It does NOT analyze real audio. For clinical auscultation, use a dedicated medical device."
      >
        {showStethPlacementCamera ? (
            <CameraCapture onCapture={handleStethPlacementCapture} captureInstruction="Capture stethoscope placement context" captureMode="image"/>
        ) : (
            <>
                {stethoscope.placementContextImage && <img src={stethoscope.placementContextImage} alt="Stethoscope placement" className="max-w-xs h-auto rounded-md my-2"/>}
                <button onClick={() => {setShowStethPlacementCamera(true); setIsDataSaved(false);}} className="text-sm text-blue-600 my-1 flex items-center gap-1"><FaCamera /> {stethoscope.placementContextImage ? 'Retake' : 'Capture'} Placement Image</button>
            </>
        )}
        {stethLoading && <LoadingSpinner text="Generating educational text..." />}
        {stethoscope.placementContextImage && (
            <div className="flex gap-2 mt-2">
                <button onClick={() => simulateStethAnalysis('heart')} className="text-sm bg-pink-100 text-pink-700 p-2 rounded flex-1 flex items-center justify-center gap-1"><FaHeartbeat/>Sim. Heart Edu-Text</button>
                <button onClick={() => simulateStethAnalysis('lungs')} className="text-sm bg-teal-100 text-teal-700 p-2 rounded flex-1 flex items-center justify-center gap-1"><FaLungs/>Sim. Lungs Edu-Text</button>
            </div>
        )}
        {stethoscope.heart?.aiAnalysis && <AnalysisDisplay result={{text: stethoscope.heart.aiAnalysis, imageUrl: stethoscope.heart.image}} title="Simulated Heart Sounds (Educational)"/>}
        {stethoscope.lungs?.aiAnalysis && <AnalysisDisplay result={{text: stethoscope.lungs.aiAnalysis, imageUrl: stethoscope.lungs.image}} title="Simulated Lung Sounds (Educational)"/>}
         <div className="mt-3 p-2 border-t border-gray-200">
            <p className="text-xs text-gray-600 flex items-center gap-1">
                <FaBroadcastTower className="text-sky-500" /> 
                Future Integration: Option to connect SDK-enabled stethoscopes (e.g., AyuSync) for real audio analysis.
            </p>
        </div>
      </Section>

      <DeviceVitalSection vitalKey="bp" vitalData={bpData} title="Blood Pressure (BP)" icon={FaTint} unit="mmHg" />
      <DeviceVitalSection vitalKey="spO2" vitalData={spO2Data} title="Oxygen Saturation (SpO2)" icon={FaPercent} unit="%" />
      <DeviceVitalSection vitalKey="temperature" vitalData={temperatureData} title="Temperature" icon={FaThermometerFull} unit="°C" />
      <DeviceVitalSection vitalKey="hemoglobin" vitalData={hemoglobinData} title="Hemoglobin (Hb)" icon={FaVial} unit="g/dL" />
      
      <div className="mt-4 flex items-center gap-2">
        <button 
          onClick={handleSaveData}
          className="bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-3 rounded-lg shadow flex items-center justify-center gap-1.5 text-sm"
        >
          <FaSave /> Save Vital Signs
        </button>
        {isDataSaved && <span className="text-green-600 text-sm flex items-center gap-1"><FaCheckCircle /> Saved!</span>}
      </div>

      <button 
        onClick={handleSaveAndReturn}
        className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow flex items-center justify-center gap-2"
      >
        <FaSave /> Save & Return to Student List
      </button>
    </div>
  );
};

export default VitalSignsStep;