import React, { useState } from 'react';
import { useScreeningContext } from '../../contexts/ScreeningContext';
import { EntData, DentalData, ImageAnalysisItem, ScreeningStep } from '../../types';
import CameraCapture from '../../components/CameraCapture';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import AnalysisDisplay from '../../components/AnalysisDisplay';
import { analyzeImageWithGemini } from '../../services/geminiService';
import { PROMPTS, STEP_ICONS } from '../../constants';
import { FaSmileBeam, FaCamera, FaLightbulb, FaEye, FaRulerCombined, FaSave, FaAssistiveListeningSystems, FaHeadSideVirus, FaVideo, FaCheckCircle, FaListAlt } from 'react-icons/fa'; // Added FaListAlt
import { FaEarListen } from 'react-icons/fa6';

interface SpecializedImagingStepProps {
    onScreeningEnd: () => void; // Added for "Save & Return to Student List"
}

type ImagingArea = 'ear' | 'nose' | 'throat' | 'oralCavity';
type SectionState = Partial<ImageAnalysisItem> & { showCamera?: boolean, error?: string, loading?: boolean, captureMode?: 'image' | 'video' };

const SpecializedImagingStep: React.FC<SpecializedImagingStepProps> = ({ onScreeningEnd }) => {
  const { screeningData, updateScreeningData } = useScreeningContext(); // Removed nextStep

  const [entEar, setEntEar] = useState<SectionState>(screeningData.entData.ear || { captureMode: 'image' });
  const [entNose, setEntNose] = useState<SectionState>(screeningData.entData.nose || { captureMode: 'image' });
  const [entThroat, setEntThroat] = useState<SectionState>(screeningData.entData.throat || { captureMode: 'image' });
  const [dentalOral, setDentalOral] = useState<SectionState>(screeningData.dentalData.oralCavity || { captureMode: 'image' });
  
  const [entSkippedReason, setEntSkippedReason] = useState(screeningData.entData.skippedReason || '');
  const [dentalSkippedReason, setDentalSkippedReason] = useState(screeningData.dentalData.skippedReason || '');
  const [isDataSaved, setIsDataSaved] = useState(false);

  const [activeTab, setActiveTab] = useState<'ent' | 'dental'>('ent');

  const createItemFromState = (state: SectionState): ImageAnalysisItem | undefined => {
    if (!state.image && !state.videoSrc && !state.aiAnalysis && !state.notes && (!state.constraints || state.constraints.length === 0)) {
        return undefined;
    }
    return {
        image: state.image, 
        videoSrc: state.videoSrc,
        analysisType: state.analysisType,
        aiAnalysis: state.aiAnalysis,
        confidence: state.confidence,
        constraints: state.constraints,
        notes: state.notes,
    };
  };

  const handleMediaCapture = async (
    area: ImagingArea, 
    mediaData: { imageDataUrl?: string; videoBlob?: Blob },
    setter: React.Dispatch<React.SetStateAction<SectionState>>
  ) => {
    const { imageDataUrl, videoBlob } = mediaData;
    let videoSrcMain: string | undefined = undefined;
    if (videoBlob) {
        videoSrcMain = URL.createObjectURL(videoBlob);
    }

    setter(prev => ({ 
        ...prev, 
        image: imageDataUrl, 
        videoSrc: videoSrcMain, 
        analysisType: videoBlob ? 'videoFrame' : 'image',
        showCamera: false, 
        loading: true, 
        error: '' 
    }));
    setIsDataSaved(false);

    if (!imageDataUrl) { 
        setter(prev => ({ ...prev, loading: false, error: 'No image frame available for analysis from video.' }));
        return;
    }

    let prompt = '';
    const analysisSourceType = videoBlob ? 'videoFrame' : 'image';
    if (area === 'ear' || area === 'nose' || area === 'throat') {
        prompt = PROMPTS.ENT_IMAGE_ANALYSIS(area, analysisSourceType);
    } else if (area === 'oralCavity') {
        prompt = PROMPTS.DENTAL_IMAGE_ANALYSIS(analysisSourceType);
    }

    try {
      const analysisText = await analyzeImageWithGemini(imageDataUrl, prompt);
      const constraints = [ // Mock constraints, can be improved
          { name: "Adequate Lighting", met: Math.random() > 0.2, icon: FaLightbulb },
          { name: "Clear Focus on Area", met: Math.random() > 0.3, icon: FaEye },
          { name: "Minimal Obstruction", met: Math.random() > 0.15, icon: FaRulerCombined },
      ];
      setter(prev => ({ ...prev, aiAnalysis: analysisText, confidence: Math.random() * 0.3 + 0.65, constraints, loading: false }));
    } catch (e) {
      console.error(`Error analyzing ${area}:`, e);
      setter(prev => ({ ...prev, error: `Failed to analyze ${area} content. ` + (e as Error).message, loading: false }));
    }
  };
  
  const handleSaveData = () => {
    updateScreeningData(prev => ({
      ...prev,
      entData: {
        ear: createItemFromState(entEar),
        nose: createItemFromState(entNose),
        throat: createItemFromState(entThroat),
        skippedReason: entSkippedReason,
      },
      dentalData: {
        oralCavity: createItemFromState(dentalOral),
        skippedReason: dentalSkippedReason,
      }
    }));
    setIsDataSaved(true);
    setTimeout(() => setIsDataSaved(false), 2000);
  };

  const handleSaveAndReturn = () => {
    handleSaveData();
    onScreeningEnd(); // Navigate back to student list
  };

  const renderSection = (
    title: string, 
    area: ImagingArea, 
    state: SectionState, 
    setter: React.Dispatch<React.SetStateAction<SectionState>>,
    IconComponent: React.ElementType
  ) => (
    <div className="p-3 border border-gray-200 rounded-lg mb-3 bg-white animate-fadeIn">
      <h4 className="text-md font-medium text-slate-600 mb-2 flex items-center gap-1.5">
        <IconComponent className="text-brand-cyan"/>
        {title}
      </h4>
      {state.error && <ErrorMessage message={state.error} />}
      {state.showCamera ? (
        <CameraCapture 
            onCapture={(media) => handleMediaCapture(area, media, setter)} 
            captureInstruction={`Capture ${title}`}
            captureMode={state.captureMode} 
        />
      ) : (
        <>
          {state.image && <img src={state.image} alt={`${title} capture`} className="max-w-full h-auto rounded-md my-2 max-h-40"/>}
          {state.videoSrc && (
            <div className="my-2">
                <video src={state.videoSrc} controls className="max-w-full h-auto rounded-md max-h-40"></video>
                <p className="text-xs text-slate-500">Video captured. Analysis based on first frame.</p>
            </div>
          )}
          <div className="flex gap-2 items-center mb-2">
            <button onClick={() => { setter(prev => ({...prev, showCamera: true, error: '', captureMode: 'image'})); setIsDataSaved(false); }} className="text-sm text-blue-600 flex items-center gap-1">
                <FaCamera /> {state.image ? 'Retake Img' : 'Capture Img'}
            </button>
            <button onClick={() => { setter(prev => ({...prev, showCamera: true, error: '', captureMode: 'video'})); setIsDataSaved(false); }} className="text-sm text-blue-600 flex items-center gap-1">
                <FaVideo /> {state.videoSrc ? 'Retake Vid (5s)' : 'Capture Vid (5s)'}
            </button>
          </div>
        </>
      )}
      {state.loading && <LoadingSpinner text={`Analyzing ${title}...`} />}
      {state.aiAnalysis && (
        <AnalysisDisplay 
            result={{text: state.aiAnalysis, imageUrl: state.image, videoSrc: state.videoSrc, confidence: state.confidence, constraints: state.constraints }} 
            title={`${title} AI Observation (${state.analysisType || 'image'})`}
        />
      )}
       <label className="block text-xs font-medium text-slate-500 mt-2">Nurse Notes for {title}</label>
       <textarea 
          value={state.notes || ''} 
          onChange={(e) => {setter(prev => ({...prev, notes: e.target.value})); setIsDataSaved(false);}}
          placeholder={`Enter notes for ${title}...`}
          className="w-full p-1.5 border rounded-md text-sm min-h-[50px]"
        />
    </div>
  );
  
  const IconComponent = STEP_ICONS[ScreeningStep.SpecializedImaging];

  return (
    <div className="p-1 animate-fadeIn">
      <div className="flex items-center gap-3 mb-4 text-slate-700">
        {IconComponent && <IconComponent className="text-2xl text-brand-light-blue" />}
        <h2 className="text-xl font-semibold">Specialized Imaging (ENT & Dental)</h2>
      </div>
      <p className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded-md mb-3">
        Connect your external USB/BT camera (e.g., Anykit). Your browser may ask you to select the camera source. Analysis of video will use the first frame.
      </p>

      <div className="mb-4 border-b border-gray-300">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('ent')}
            className={`${activeTab === 'ent' ? 'border-brand-light-blue text-brand-dark-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
          >
            ENT Examination
          </button>
          <button
            onClick={() => setActiveTab('dental')}
            className={`${activeTab === 'dental' ? 'border-brand-light-blue text-brand-dark-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
          >
            Dental Examination
          </button>
        </nav>
      </div>

      {activeTab === 'ent' && (
        <div className="animate-fadeIn">
          {renderSection("Ear", 'ear', entEar, setEntEar, FaEarListen)}
          {renderSection("Nose", 'nose', entNose, setEntNose, FaAssistiveListeningSystems)}
          {renderSection("Throat", 'throat', entThroat, setEntThroat, FaHeadSideVirus)}
          <div>
            <label className="block text-sm font-medium text-slate-600 mt-1">Reason for skipping ENT (if applicable)</label>
            <input type="text" value={entSkippedReason} onChange={(e) => {setEntSkippedReason(e.target.value); setIsDataSaved(false);}} placeholder="e.g., Student uncooperative" className="w-full p-2 border rounded-md"/>
          </div>
        </div>
      )}

      {activeTab === 'dental' && (
        <div className="animate-fadeIn">
          {renderSection("Oral Cavity / Teeth", 'oralCavity', dentalOral, setDentalOral, FaSmileBeam)}
           <div>
            <label className="block text-sm font-medium text-slate-600 mt-1">Reason for skipping Dental (if applicable)</label>
            <input type="text" value={dentalSkippedReason} onChange={(e) => {setDentalSkippedReason(e.target.value); setIsDataSaved(false);}} placeholder="e.g., Student refused" className="w-full p-2 border rounded-md"/>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button 
          onClick={handleSaveData}
          className="bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-3 rounded-lg shadow flex items-center justify-center gap-1.5 text-sm"
        >
          <FaSave /> Save Imaging Data
        </button>
        {isDataSaved && <span className="text-green-600 text-sm flex items-center gap-1"><FaCheckCircle /> Saved!</span>}
      </div>
      
       <button 
        onClick={handleSaveAndReturn}
        className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow flex items-center justify-center gap-2"
      >
        <FaListAlt /> Save & Return to Student List
      </button>
    </div>
  );
};

export default SpecializedImagingStep;