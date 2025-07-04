
import React, { useState, useEffect } from 'react';
import { useScreeningContext } from '../../contexts/ScreeningContext';
import { ScreeningData, ImageAnalysisItem, ScreeningStep, PatientInfo, VitalSign, ManualEntryField } from '../../types';
import { generateTextWithGemini } from '../../services/geminiService';
import { PROMPTS, STEP_ICONS } from '../../constants';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaFileMedicalAlt, FaPrint, FaShareSquare, FaRedo, FaBrain, FaNotesMedical, FaSave, FaCheckCircle, FaBan, FaUpload } from 'react-icons/fa';
import { clearActiveScreening, saveActiveScreening } from '../../services/localStorageService';

interface ReviewAndExportStepProps {
    onScreeningComplete: () => void; 
}

export const ReviewAndExportStep: React.FC<ReviewAndExportStepProps> = ({ onScreeningComplete }) => {
  const { screeningData, resetScreening, getStudentDisplayName, updateScreeningData, saveCurrentScreening, currentStudentId } = useScreeningContext();
  
  const [aiSummary, setAiSummary] = useState(screeningData.finalReport?.aiSummary || '');
  const [preliminaryNotesForDoctor, setPreliminaryNotesForDoctor] = useState(screeningData.finalReport?.preliminaryNotesForDoctor || '');
  const [nurseObservations, setNurseObservations] = useState(screeningData.nurseGeneralObservations || 
    "Student appeared [general demeanor, e.g., cheerful, quiet, tired].\nReported [any symptoms, e.g., no specific complaints, occasional cough].\nObserved [any visual cues, e.g., skin clear, slight redness on elbow].\nOverall interaction: [e.g., cooperative, anxious, playful]."
  );
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');


  const studentDisplayName = getStudentDisplayName();

  const handleGenerateAISummary = async () => {
    setIsLoadingSummary(true);
    setAiSummary('');
    setIsDataSaved(false); 
    try {
      const patientDataForPrompt: Partial<PatientInfo> = { ...screeningData.patientInfo };
      
      const dataForPrompt = JSON.parse(JSON.stringify({
        patient: patientDataForPrompt,
        preExistingConditions: screeningData.patientInfo.preExistingConditions, 
        anthropometry: screeningData.anthropometry,
        ent: screeningData.entData,
        dental: screeningData.dentalData,
        vitals: screeningData.deviceVitals, 
        faceObservation: screeningData.faceVitalData?.aiObservation, 
        simulatedStethoscope: { 
            heart: screeningData.stethoscopeData?.heart?.aiAnalysis,
            lungs: screeningData.stethoscopeData?.lungs?.aiAnalysis,
        },
        nurseObservations: nurseObservations, 
        preliminaryNotesForDoctor: preliminaryNotesForDoctor, 
        skippedSteps: screeningData.skippedSteps, 
      }, (key, value) => {
          if (value && typeof value === 'object' && Object.keys(value).length === 0) return undefined; 
          if (['image', 'videoSrc', 'options', 'instructions', 'ocrAttempt', 'confidence', 'constraints', 'analysisType', 'simulatedAudioPrompt', 'deviceImage', 'evidenceImage', 'tappedPoints', 'referencePoints', 'calculatedValue'].includes(key)) return undefined;
          return value === undefined ? null : value;
      } , 2));

      const summary = await generateTextWithGemini(PROMPTS.SCREENING_SUMMARY_REPORT(JSON.stringify(dataForPrompt)));
      setAiSummary(summary);
      updateScreeningData(prev => ({...prev, finalReport: {...prev.finalReport, aiSummary: summary}}));
    } catch (e) {
      console.error("Failed to generate AI summary:", e);
      setAiSummary("Error generating AI summary. Please try again.");
    }
    setIsLoadingSummary(false);
  };

  const handleExportJSON = () => {
    updateScreeningData(prev => ({ 
        ...prev, 
        nurseGeneralObservations: nurseObservations,
        finalReport: { ...prev.finalReport, aiSummary: aiSummary, preliminaryNotesForDoctor: preliminaryNotesForDoctor }
    }));

    setTimeout(() => {
        const fullScreeningDataCopy = { ...screeningData }; 
        fullScreeningDataCopy.nurseGeneralObservations = nurseObservations;
        fullScreeningDataCopy.finalReport = {
            ...fullScreeningDataCopy.finalReport,
            aiSummary: aiSummary,
            preliminaryNotesForDoctor: preliminaryNotesForDoctor
        };

        const jsonData = JSON.stringify(fullScreeningDataCopy, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const studentIdForFilename = screeningData.patientInfo.manualId || screeningData.patientInfo.qrId || 'student';
        const a = document.createElement('a');
        a.href = url;
        a.download = `screening_report_${studentIdForFilename.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100); 
  };

  const handlePrint = () => {
    window.print();
  };
  
  const handleSaveReportData = () => {
     updateScreeningData(prev => ({ 
        ...prev, 
        nurseGeneralObservations: nurseObservations,
        finalReport: { ...prev.finalReport, aiSummary: aiSummary, preliminaryNotesForDoctor: preliminaryNotesForDoctor }
    }));
    setIsDataSaved(true);
    setTimeout(() => setIsDataSaved(false), 2000);
  };

  const handleSubmitToServer = async () => {
    handleSaveReportData();
    setSubmitStatus('submitting');

    // Save as completed in local storage
    if (currentStudentId) {
      saveCurrentScreening('completed');
    }

    console.log("Submitting to server (simulated):", screeningData);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const success = Math.random() > 0.1;

    if (success) {
        setSubmitStatus('success');
        const studentIdToClear = screeningData.patientInfo.manualId || screeningData.patientInfo.qrId;
        if (studentIdToClear) {
            clearActiveScreening(studentIdToClear);
        }
        setTimeout(() => {
            resetScreening();
            onScreeningComplete();
            setSubmitStatus('idle');
        }, 2000);
    } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const renderMedia = (item: Partial<ImageAnalysisItem> | undefined, title: string) => {
    if (!item || (!item.image && !item.videoSrc)) return null; 
    return (
        <>
            {item.image && <img src={item.image} alt={`${title} image`} className="max-w-[150px] my-1 rounded shadow-sm border"/>}
            {item.videoSrc && (
                <div className="my-1">
                    <video src={item.videoSrc} controls className="max-w-[150px] rounded shadow-sm border"></video>
                    <p className="text-xs text-slate-400">Video (analysis from first frame)</p>
                </div>
            )}
             {item.aiAnalysis && <p className="text-[10px] italic bg-gray-100 p-0.5 my-0.5 rounded">AI: {item.aiAnalysis.substring(0,80)}...</p>}
             {item.notes && <p className="text-[10px] bg-yellow-50 p-0.5 my-0.5 rounded">Notes: {item.notes}</p>}
        </>
    );
  };

  const vitalToImageAnalysisItem = (
    vital: VitalSign | (VitalSign & { systolic?: ManualEntryField; diastolic?: ManualEntryField }) | undefined
  ): Partial<ImageAnalysisItem> | undefined => {
    if (!vital) return undefined;
    
    let notes = `Value: ${vital.value || 'N/A'}${vital.unit || ''}. `;
    if (vital.ocrAttempt) notes += `(OCR: "${vital.ocrAttempt}") `;
    if (vital.error) notes += `Error: ${vital.error} `;
    if (vital.manualEntryReason) notes += `Manual Reason: ${vital.manualEntryReason}`;

    return {
        image: vital.deviceImage,
        notes: notes.trim(),
    };
  };

  const DataSection: React.FC<{title: string, data: any, stepKey?: ScreeningStep}> = ({title, data, stepKey}) => {
    const skipReason = stepKey ? screeningData.skippedSteps?.[stepKey] : undefined;

    if (skipReason) {
        return (
            <div className="mb-2 p-2 border border-orange-300 rounded bg-orange-50 text-xs">
                <h4 className="font-semibold text-sm text-orange-700 mb-0.5 flex items-center gap-1.5"><FaBan /> {title} - Module Skipped</h4>
                <p><strong>Reason:</strong> {skipReason}</p>
            </div>
        );
    }
    
    const hasMeaningfulData = (obj: any): boolean => {
        if (!obj || typeof obj !== 'object' || Object.keys(obj).length === 0) return false;
        return Object.values(obj).some(value => {
            if (typeof value === 'string' && value.trim() !== '') return true;
            if (typeof value === 'number') return true;
            if (typeof value === 'boolean' && value === true) return true;
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                const { image, videoSrc, instructions, options, deviceImage, evidenceImage, ...restOfObject } = value as any;
                 if (Object.keys(restOfObject).length > 0 && Object.values(restOfObject).some(v => v !== '' && v !== undefined && v !== null && typeof v !== 'function' && (typeof v !== 'object' || Object.keys(v).length > 0))) return true;
            }
            return false;
        });
    };

    const isMediaSection = (title: string, data: any) => {
      if (title === "Anthropometry" && (data?.heightCm?.image || data?.weightKg?.image || data?.armSpanCm?.image)) return true;
      if (title === "ENT Findings" && (data?.ear?.image || data?.ear?.videoSrc || data?.nose?.image || data?.nose?.videoSrc || data?.throat?.image || data?.throat?.videoSrc)) return true;
      if (title === "Dental Findings" && (data?.oralCavity?.image || data?.oralCavity?.videoSrc)) return true;
      if (title === "Face Wellness (Sim.)" && data?.image) return true;
      if (title === "Stethoscope (Sim.)" && (data?.heart?.image || data?.lungs?.image || data?.placementContextImage)) return true;
      if (title === "Device Vitals" && (data?.bp?.deviceImage || data?.spO2?.deviceImage || data?.temperature?.deviceImage || data?.hemoglobin?.deviceImage )) return true;
      return false;
    }

    if (!hasMeaningfulData(data) && !isMediaSection(title, data) && title !== "Patient Information") return null;

    const dataToDisplay = JSON.stringify(data, (key, value) => {
        if (['image', 'videoSrc', 'options', 'instructions', 'ocrAttempt', 'aiAnalysis', 'notes', 'confidence', 'constraints', 'analysisType', 'simulatedAudioPrompt', 'icon', 'deviceImage', 'evidenceImage', 'tappedPoints', 'referencePoints', 'calculatedValue', 'aiSilhouetteObservation', 'status' ].includes(key)) return undefined; 
        if (value && typeof value === 'object' && Object.keys(value).length === 0) return undefined;
        if (typeof value === 'function') return undefined;
        return value === undefined || value === '' ? null : value; 
    }, 2);
    
    const parsedDataForDisplay = dataToDisplay && dataToDisplay !== '{}' && dataToDisplay !== 'null' ? JSON.parse(dataToDisplay) : null;
    const shouldShowPre = parsedDataForDisplay && Object.keys(parsedDataForDisplay).length > 0;

    return (
    <div className="mb-2 p-2 border rounded bg-gray-50 text-xs">
        <h4 className="font-semibold text-sm text-slate-700 mb-0.5">{title}</h4>
        {shouldShowPre && <pre className="whitespace-pre-wrap break-all text-[11px]">{JSON.stringify(parsedDataForDisplay, null, 2)}</pre>}
        
        {title === "Patient Information" && screeningData.patientInfo?.preExistingConditions && <p className="mt-1 text-xs"><strong>Pre-existing Conditions:</strong> {screeningData.patientInfo.preExistingConditions}</p>}

        {title === "Anthropometry" && screeningData.anthropometry && (
            <div className="flex flex-wrap gap-1 mt-0.5">
                {renderMedia(screeningData.anthropometry.heightCm, "Height")}
                {renderMedia(screeningData.anthropometry.weightKg, "Weight")}
                {renderMedia(screeningData.anthropometry.armSpanCm, "Armspan")}
            </div>
        )}
        {title === "ENT Findings" && screeningData.entData && (
             <div className="flex flex-wrap gap-1 mt-0.5">
                {renderMedia(screeningData.entData.ear, "ENT Ear")}
                {renderMedia(screeningData.entData.nose, "ENT Nose")}
                {renderMedia(screeningData.entData.throat, "ENT Throat")}
            </div>
        )}
        {title === "Dental Findings" && screeningData.dentalData && renderMedia(screeningData.dentalData.oralCavity, "Dental Oral Cavity")}
        {title === "Face Wellness (Sim.)" && screeningData.faceVitalData && renderMedia(screeningData.faceVitalData, "Face Vital")}
        {title === "Stethoscope (Sim.)" && screeningData.stethoscopeData && (
            <div className="flex flex-wrap gap-1 mt-0.5">
                {renderMedia(screeningData.stethoscopeData.heart, "Stethoscope Heart Context")}
                {renderMedia(screeningData.stethoscopeData.lungs, "Stethoscope Lungs Context")}
                {screeningData.stethoscopeData.placementContextImage && 
                    <img src={screeningData.stethoscopeData.placementContextImage} alt="Steth Placement" className="max-w-[150px] my-1 rounded shadow-sm border"/>}
            </div>
        )}
         {title === "Device Vitals" && screeningData.deviceVitals && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {renderMedia(vitalToImageAnalysisItem(screeningData.deviceVitals.bp), "BP Device")}
              {renderMedia(vitalToImageAnalysisItem(screeningData.deviceVitals.spO2), "SpO2 Device")}
              {renderMedia(vitalToImageAnalysisItem(screeningData.deviceVitals.temperature), "Temperature Device")}
              {renderMedia(vitalToImageAnalysisItem(screeningData.deviceVitals.hemoglobin), "Hemoglobin Device")}
            </div>
         )}
    </div>
    )
  };

  const IconComponent = STEP_ICONS[ScreeningStep.ReviewAndExport];

  return (
    <div className="p-1 pb-16 animate-fadeIn"> 
      <div className="flex items-center gap-3 mb-4 text-slate-700">
        {IconComponent && <IconComponent className="text-2xl text-brand-light-blue" />}
        <h2 className="text-xl font-semibold">Review & Export Report: {studentDisplayName}</h2>
      </div>

      <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto p-2 bg-white rounded-lg shadow">
        <DataSection title="Patient Information" data={screeningData.patientInfo} />
        <DataSection title="Anthropometry" data={screeningData.anthropometry} stepKey={ScreeningStep.Anthropometry}/>
        <DataSection title="ENT Findings" data={screeningData.entData} stepKey={ScreeningStep.SpecializedImaging} />
        <DataSection title="Dental Findings" data={screeningData.dentalData} stepKey={ScreeningStep.SpecializedImaging}/>
        <DataSection title="Face Wellness (Sim.)" data={screeningData.faceVitalData} />
        <DataSection title="Stethoscope (Sim.)" data={screeningData.stethoscopeData} />
        <DataSection title="Device Vitals" data={screeningData.deviceVitals} stepKey={ScreeningStep.VitalSigns} />
        
        <div className="p-2 border rounded bg-yellow-50">
            <h4 className="font-semibold text-sm text-slate-700 mb-1 flex items-center gap-1.5"><FaNotesMedical /> Nurse's General Observations</h4>
            <textarea 
                value={nurseObservations}
                onChange={(e) => {setNurseObservations(e.target.value); setIsDataSaved(false);}}
                placeholder="e.g., Student appeared cheerful. Reported no specific complaints. Skin clear. Cooperative during screening."
                className="w-full p-1.5 border rounded text-xs min-h-[70px] focus:ring-brand-light-blue focus:border-brand-light-blue"
            />
        </div>

        <div className="p-2 border rounded bg-sky-50">
            <h4 className="font-semibold text-sm text-slate-700 mb-1 flex items-center gap-1.5"><FaBrain /> AI Generated Summary Draft</h4>
            <button onClick={handleGenerateAISummary} disabled={isLoadingSummary} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-50 mb-1">
                {isLoadingSummary ? <LoadingSpinner text="Generating..." size="text-sm"/> : "Generate/Regenerate Summary"}
            </button>
            {aiSummary ? <p className="text-xs whitespace-pre-wrap">{aiSummary}</p> : <p className="text-xs text-gray-500">Click button to generate AI summary. Ensure nurse's observations are entered first if applicable.</p>}
        </div>

        <div className="p-2 border rounded bg-green-50">
            <h4 className="font-semibold text-sm text-slate-700 mb-1">Preliminary Notes for Doctor / Referral Notes</h4>
            <textarea 
                value={preliminaryNotesForDoctor}
                onChange={(e) => {setPreliminaryNotesForDoctor(e.target.value); setIsDataSaved(false);}}
                placeholder="Any specific notes or flags for the reviewing doctor..."
                className="w-full p-1.5 border rounded text-xs min-h-[70px] focus:ring-brand-light-blue focus:border-brand-light-blue"
            />
        </div>
      </div>
      
      <div className="mt-3 flex items-center gap-2">
        <button 
          onClick={handleSaveReportData}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-3 rounded-lg shadow flex items-center justify-center gap-1.5 text-sm"
        >
          <FaSave /> Save Report Data
        </button>
        {isDataSaved && <span className="text-green-600 text-sm flex items-center gap-1"><FaCheckCircle /> Saved!</span>}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        <button onClick={handleExportJSON} className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-3 rounded shadow flex items-center justify-center gap-1.5"><FaShareSquare/>Export JSON</button>
        <button onClick={handlePrint} className="bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-3 rounded shadow flex items-center justify-center gap-1.5"><FaPrint/>Print View</button>
      </div>
       <button 
            onClick={handleSubmitToServer}
            disabled={submitStatus === 'submitting' || submitStatus === 'success'}
            className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow flex items-center justify-center gap-1.5 disabled:opacity-70"
        >
            {submitStatus === 'submitting' && <LoadingSpinner text="Submitting..." size="text-base"/>}
            {submitStatus === 'success' && <><FaCheckCircle/> Submitted Successfully!</>}
            {submitStatus === 'error' && <><FaBan/> Submission Failed. Retry?</>}
            {submitStatus === 'idle' && <><FaUpload/> Mark Complete & Submit</>}
        </button>
    </div>
  );
};

// No longer default export
// export default ReviewAndExportStep;
