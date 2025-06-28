import React, { useState, useEffect } from 'react';
import { useScreeningContext } from '../../contexts/ScreeningContext';
import { SkinLesion, ScreeningStep } from '../../types';
import CameraCapture from '../../components/CameraCapture';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import AnalysisDisplay from '../../components/AnalysisDisplay';
import { generateTextWithGemini } from '../../services/geminiService';
import { 
  PROMPTS, 
  STEP_ICONS, 
  SKIN_LESION_LOCATIONS, 
  SKIN_LESION_NATURE_OPTIONS, 
  SKIN_LESION_SYMPTOMS,
  DERMATOLOGY_PROMPTS 
} from '../../constants';
import { FaBan, FaPlus, FaTrash, FaCamera, FaEye, FaSave } from 'react-icons/fa';
import { saveScreeningDataToLocalStorage } from '../../services/localStorageService';

interface DermatologyStepProps {
  onScreeningEnd: () => void;
}

const DermatologyStep: React.FC<DermatologyStepProps> = ({ onScreeningEnd }) => {
  const { screeningData, updateScreeningData, markStepAsSkipped, unskipStep, nextStep } = useScreeningContext();
  
  const thisStepKey = ScreeningStep.Dermatology;
  const isModuleSkipped = screeningData.skippedSteps?.[thisStepKey];
  
  const [showSkipForm, setShowSkipForm] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const [isDataSaved, setIsDataSaved] = useState(true);
  
  // Lesion management state
  const [showAddLesionForm, setShowAddLesionForm] = useState(false);
  const [editingLesionId, setEditingLesionId] = useState<string | null>(null);
  const [currentLesion, setCurrentLesion] = useState<Partial<SkinLesion>>({
    location: '',
    nature: '',
    symptoms: '',
    nurseNotes: ''
  });
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // General skin observations
  const [generalSkinObservations, setGeneralSkinObservations] = useState(
    screeningData.dermatologyData?.generalSkinObservations || ''
  );

  const StepIcon = STEP_ICONS[ScreeningStep.Dermatology];

  useEffect(() => {
    if (isModuleSkipped) {
      setShowSkipForm(false);
    }
  }, [isModuleSkipped]);

  const handleSkipModule = () => {
    if (skipReason.trim()) {
      markStepAsSkipped(thisStepKey, skipReason);
      setShowSkipForm(false);
      setSkipReason('');
    }
  };

  const handleUnskipModule = () => {
    unskipStep(thisStepKey);
  };

  const generateLesionId = () => {
    return `lesion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddLesion = () => {
    setCurrentLesion({
      location: '',
      nature: '',
      symptoms: '',
      nurseNotes: ''
    });
    setEditingLesionId(null);
    setShowAddLesionForm(true);
    setShowCamera(false);
    setAnalysisError('');
  };

  const handleEditLesion = (lesion: SkinLesion) => {
    setCurrentLesion(lesion);
    setEditingLesionId(lesion.id);
    setShowAddLesionForm(true);
    setShowCamera(false);
    setAnalysisError('');
  };

  const handleDeleteLesion = (lesionId: string) => {
    const currentLesions = screeningData.dermatologyData?.lesions || [];
    const updatedLesions = currentLesions.filter(lesion => lesion.id !== lesionId);
    
    updateScreeningData({
      dermatologyData: {
        ...screeningData.dermatologyData,
        lesions: updatedLesions
      }
    });
    setIsDataSaved(false);
  };

  const handleCameraCapture = async (imageDataUrl: string) => {
    setCurrentLesion(prev => ({ ...prev, image: imageDataUrl }));
    setShowCamera(false);
    
    // Analyze the lesion if we have enough information
    if (currentLesion.location && currentLesion.nature && currentLesion.symptoms) {
      await analyzeLesion(imageDataUrl, currentLesion.location, currentLesion.nature, currentLesion.symptoms);
    }
  };

  const analyzeLesion = async (imageDataUrl: string, location: string, nature: string, symptoms: string) => {
    setIsAnalyzing(true);
    setAnalysisError('');
    
    try {
      const prompt = PROMPTS.SKIN_LESION_ANALYSIS(location, nature, symptoms);
      const analysis = await generateTextWithGemini(imageDataUrl, prompt);
      
      setCurrentLesion(prev => ({
        ...prev,
        aiAnalysis: analysis,
        confidence: Math.random() * 0.3 + 0.7 // Mock confidence score
      }));
    } catch (error) {
      console.error('Error analyzing lesion:', error);
      setAnalysisError(`Failed to analyze lesion: ${(error as Error).message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveLesion = () => {
    if (!currentLesion.location || !currentLesion.nature) {
      alert('Please fill in at least the location and nature of the lesion.');
      return;
    }

    const currentLesions = screeningData.dermatologyData?.lesions || [];
    let updatedLesions;

    if (editingLesionId) {
      // Update existing lesion
      updatedLesions = currentLesions.map(lesion => 
        lesion.id === editingLesionId 
          ? { ...currentLesion, id: editingLesionId } as SkinLesion
          : lesion
      );
    } else {
      // Add new lesion
      const newLesion: SkinLesion = {
        ...currentLesion,
        id: generateLesionId()
      } as SkinLesion;
      updatedLesions = [...currentLesions, newLesion];
    }

    updateScreeningData({
      dermatologyData: {
        ...screeningData.dermatologyData,
        lesions: updatedLesions
      }
    });

    setShowAddLesionForm(false);
    setCurrentLesion({});
    setEditingLesionId(null);
    setIsDataSaved(false);
  };

  const handleSaveGeneralObservations = () => {
    updateScreeningData({
      dermatologyData: {
        ...screeningData.dermatologyData,
        generalSkinObservations
      }
    });
    setIsDataSaved(false);
  };

  const handleSaveProgress = () => {
    handleSaveGeneralObservations();
    saveScreeningDataToLocalStorage(screeningData);
    setIsDataSaved(true);
  };

  const handleSaveAndReturn = () => {
    handleSaveProgress();
    onScreeningEnd();
  };

  const handleNext = () => {
    handleSaveProgress();
    nextStep();
  };

  if (isModuleSkipped) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between gap-3 mb-4 text-slate-700">
          <div className="flex items-center gap-2">
            {StepIcon && <StepIcon className="text-2xl text-brand-light-blue" />}
            <h2 className="text-xl font-semibold">Dermatology / Skin Assessment</h2>
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <p className="text-orange-800 mb-2">
            <strong>This module has been skipped.</strong>
          </p>
          <p className="text-orange-700 text-sm mb-3">
            Reason: {screeningData.skippedSteps?.[thisStepKey]}
          </p>
          <button 
            onClick={handleUnskipModule}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm"
          >
            Resume Module
          </button>
        </div>

        <div className="flex gap-2 mt-6">
          <button 
            onClick={handleSaveAndReturn}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
          >
            <FaSave /> Save & Return to Student List
          </button>
          <button 
            onClick={handleNext}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Next Step
          </button>
        </div>
      </div>
    );
  }

  if (showSkipForm) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          {StepIcon && <StepIcon className="text-2xl text-brand-light-blue" />}
          <h2 className="text-xl font-semibold text-slate-700">Skip Dermatology Module</h2>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-orange-800 mb-2">
            Reason for skipping dermatology assessment:
          </label>
          <textarea
            value={skipReason}
            onChange={(e) => setSkipReason(e.target.value)}
            placeholder="Enter reason for skipping this module..."
            className="w-full p-3 border border-orange-300 rounded-md text-sm min-h-[80px]"
          />
          <div className="flex gap-2 mt-3">
            <button 
              onClick={handleSkipModule}
              disabled={!skipReason.trim()}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Skip Module
            </button>
            <button 
              onClick={() => setShowSkipForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1">
      <div className="flex items-center justify-between gap-3 mb-4 text-slate-700">
        <div className="flex items-center gap-2">
          {StepIcon && <StepIcon className="text-2xl text-brand-light-blue" />}
          <h2 className="text-xl font-semibold">Dermatology / Skin Assessment</h2>
        </div>
        {!showSkipForm && (
          <button 
            onClick={() => setShowSkipForm(true)} 
            className="text-xs bg-orange-100 text-orange-600 hover:bg-orange-200 px-2 py-1 rounded flex items-center gap-1"
            title="Skip this entire module"
          >
            <FaBan/> Skip Module
          </button>
        )}
      </div>

      {/* General Skin Observations */}
      <div className="mb-6 p-3 border border-gray-200 rounded-lg bg-white">
        <h3 className="text-md font-medium text-slate-600 mb-2">General Skin Observations</h3>
        <p className="text-xs text-gray-600 mb-2">{DERMATOLOGY_PROMPTS.generalSkin}</p>
        <textarea
          value={generalSkinObservations}
          onChange={(e) => {
            setGeneralSkinObservations(e.target.value);
            setIsDataSaved(false);
          }}
          placeholder="Record overall skin condition, noting any areas of concern or general skin health observations..."
          className="w-full p-2 border rounded-md text-sm min-h-[80px]"
        />
      </div>

      {/* Skin Lesions Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-medium text-slate-600">Documented Skin Lesions</h3>
          <button
            onClick={handleAddLesion}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center gap-1"
          >
            <FaPlus /> Add Lesion
          </button>
        </div>

        {/* Existing Lesions List */}
        {screeningData.dermatologyData?.lesions && screeningData.dermatologyData.lesions.length > 0 ? (
          <div className="space-y-3 mb-4">
            {screeningData.dermatologyData.lesions.map((lesion) => (
              <div key={lesion.id} className="p-3 border border-gray-200 rounded-lg bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-2">
                      <div><strong>Location:</strong> {lesion.location}</div>
                      <div><strong>Nature:</strong> {lesion.nature}</div>
                      <div><strong>Symptoms:</strong> {lesion.symptoms}</div>
                    </div>
                    {lesion.nurseNotes && (
                      <div className="text-sm mb-2">
                        <strong>Notes:</strong> {lesion.nurseNotes}
                      </div>
                    )}
                    {lesion.image && (
                      <div className="mb-2">
                        <img 
                          src={lesion.image} 
                          alt="Skin lesion" 
                          className="max-w-[200px] max-h-[150px] object-contain border rounded"
                        />
                      </div>
                    )}
                    {lesion.aiAnalysis && (
                      <div className="text-xs bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                        <strong>AI Analysis:</strong> {lesion.aiAnalysis}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleEditLesion(lesion)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 flex items-center gap-1"
                    >
                      <FaEye /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLesion(lesion.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 flex items-center gap-1"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
            <p>No skin lesions documented yet.</p>
            <p className="text-sm">Click "Add Lesion" to document any skin findings.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Lesion Form */}
      {showAddLesionForm && (
        <div className="mb-6 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
          <h4 className="text-md font-medium text-blue-800 mb-3">
            {editingLesionId ? 'Edit Skin Lesion' : 'Add New Skin Lesion'}
          </h4>
          
          {analysisError && <ErrorMessage message={analysisError} />}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-blue-700 mb-1">
                Location *
              </label>
              <select
                value={currentLesion.location || ''}
                onChange={(e) => setCurrentLesion(prev => ({ ...prev, location: e.target.value }))}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">Select location...</option>
                {SKIN_LESION_LOCATIONS.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1">{DERMATOLOGY_PROMPTS.location}</p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-blue-700 mb-1">
                Nature/Type *
              </label>
              <select
                value={currentLesion.nature || ''}
                onChange={(e) => setCurrentLesion(prev => ({ ...prev, nature: e.target.value }))}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">Select type...</option>
                {SKIN_LESION_NATURE_OPTIONS.map(nature => (
                  <option key={nature} value={nature}>{nature}</option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1">{DERMATOLOGY_PROMPTS.nature}</p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-blue-700 mb-1">
                Symptoms
              </label>
              <select
                value={currentLesion.symptoms || ''}
                onChange={(e) => setCurrentLesion(prev => ({ ...prev, symptoms: e.target.value }))}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">Select symptoms...</option>
                {SKIN_LESION_SYMPTOMS.map(symptom => (
                  <option key={symptom} value={symptom}>{symptom}</option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1">{DERMATOLOGY_PROMPTS.symptoms}</p>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-blue-700 mb-1">
              Nurse Notes
            </label>
            <textarea
              value={currentLesion.nurseNotes || ''}
              onChange={(e) => setCurrentLesion(prev => ({ ...prev, nurseNotes: e.target.value }))}
              placeholder="Additional observations about size, color, texture, or other relevant details..."
              className="w-full p-2 border rounded text-sm min-h-[60px]"
            />
            <p className="text-xs text-gray-600 mt-1">{DERMATOLOGY_PROMPTS.nurseNotes}</p>
          </div>

          {/* Camera Section */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs font-medium text-blue-700">Lesion Image</label>
              <button
                onClick={() => setShowCamera(!showCamera)}
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 flex items-center gap-1"
              >
                <FaCamera /> {showCamera ? 'Hide Camera' : 'Take Photo'}
              </button>
            </div>
            
            {showCamera && (
              <CameraCapture 
                onCapture={handleCameraCapture}
                captureInstruction="Position camera to clearly show the skin lesion"
                captureMode="image"
              />
            )}
            
            {currentLesion.image && !showCamera && (
              <div className="mt-2">
                <img 
                  src={currentLesion.image} 
                  alt="Captured lesion" 
                  className="max-w-[300px] max-h-[200px] object-contain border rounded"
                />
              </div>
            )}
          </div>

          {/* AI Analysis Display */}
          {isAnalyzing && <LoadingSpinner text="Analyzing lesion..." />}
          
          {currentLesion.aiAnalysis && (
            <AnalysisDisplay 
              result={{
                text: currentLesion.aiAnalysis,
                imageUrl: currentLesion.image,
                confidence: currentLesion.confidence
              }}
              title="AI Lesion Analysis"
            />
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveLesion}
              disabled={!currentLesion.location || !currentLesion.nature}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <FaSave /> {editingLesionId ? 'Update Lesion' : 'Save Lesion'}
            </button>
            <button
              onClick={() => {
                setShowAddLesionForm(false);
                setCurrentLesion({});
                setEditingLesionId(null);
                setShowCamera(false);
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            {currentLesion.location && currentLesion.nature && currentLesion.symptoms && currentLesion.image && !isAnalyzing && (
              <button
                onClick={() => analyzeLesion(currentLesion.image!, currentLesion.location!, currentLesion.nature!, currentLesion.symptoms!)}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center gap-1"
              >
                <FaEye /> Analyze with AI
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-6">
        <button 
          onClick={handleSaveProgress}
          disabled={isDataSaved}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <FaSave /> {isDataSaved ? 'Progress Saved' : 'Save Progress'}
        </button>
        <button 
          onClick={handleSaveAndReturn}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
        >
          <FaSave /> Save & Return to Student List
        </button>
        <button 
          onClick={handleNext}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};

export default DermatologyStep;
