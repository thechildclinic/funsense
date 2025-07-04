import React, { useState } from 'react';
import { useScreeningContext } from '../../contexts/ScreeningContext';
import { ScreeningStep, ImageAnalysisItem } from '../../types';
import CameraCapture from '../../components/CameraCapture';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import AnalysisDisplay from '../../components/AnalysisDisplay';
import { generateTextWithGemini } from '../../services/geminiService';
import { PROMPTS, STEP_ICONS } from '../../constants';
import {
  FaEye,
  FaCamera,
  FaSave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHandPaper,
  FaArrowLeft,
  FaArrowRight,
  FaFileMedicalAlt,
  FaUser,
  FaChild
} from 'react-icons/fa';

interface DermatologyStepProps {
  onScreeningEnd: () => void;
}

const DermatologyStep: React.FC<DermatologyStepProps> = ({ onScreeningEnd }) => {
  const { screeningData, updateScreeningData, nextStep, previousStep } = useScreeningContext();

  // Dermatology assessment areas
  const [assessmentAreas] = useState([
    { id: 'face', name: 'Face & Neck', icon: FaEye },
    { id: 'arms', name: 'Arms & Hands', icon: FaHandPaper },
    { id: 'torso', name: 'Torso & Back', icon: FaUser },
    { id: 'legs', name: 'Legs & Feet', icon: FaChild }
  ]);

  const [currentArea, setCurrentArea] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize dermatology data from context
  const [dermatologyData, setDermatologyData] = useState<Record<string, ImageAnalysisItem>>(
    screeningData.dermatologyAssessment || {}
  );

  const currentAreaData = assessmentAreas[currentArea];
  const currentAnalysis = dermatologyData[currentAreaData.id];

  const handleImageCapture = async (imageUrl: string) => {
    setShowCamera(false);
    setLoading(true);
    setError(null);

    try {
      const prompt = `${PROMPTS.DERMATOLOGY_ANALYSIS}

Area being assessed: ${currentAreaData.name}

Please analyze this image for:
1. Skin condition and appearance
2. Any visible lesions, moles, or abnormalities
3. Signs of rashes, irritation, or inflammation
4. Overall skin health assessment
5. Recommendations for follow-up if needed

Provide a professional dermatological assessment suitable for school health screening.`;

      const analysis = await generateTextWithGemini(prompt, imageUrl);
      
      const newAnalysis: ImageAnalysisItem = {
        image: imageUrl,
        analysis: analysis,
        timestamp: new Date().toISOString(),
        area: currentAreaData.name
      };

      const updatedDermatologyData = {
        ...dermatologyData,
        [currentAreaData.id]: newAnalysis
      };

      setDermatologyData(updatedDermatologyData);
      
      // Update screening context
      updateScreeningData({
        dermatologyAssessment: updatedDermatologyData
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndContinue = () => {
    // Ensure all data is saved to context
    updateScreeningData({
      dermatologyAssessment: dermatologyData
    });
    nextStep();
  };

  const getCompletionStatus = () => {
    const completedAreas = Object.keys(dermatologyData).length;
    const totalAreas = assessmentAreas.length;
    return { completed: completedAreas, total: totalAreas };
  };

  const status = getCompletionStatus();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center mb-6">
        <FaEye className="text-3xl text-purple-600 mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dermatology Assessment</h2>
          <p className="text-gray-600">Comprehensive skin health evaluation</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-purple-700">
            Assessment Progress: {status.completed}/{status.total} areas completed
          </span>
          <span className="text-sm text-purple-600">
            {Math.round((status.completed / status.total) * 100)}%
          </span>
        </div>
        <div className="w-full bg-purple-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(status.completed / status.total) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Area Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Assessment Areas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {assessmentAreas.map((area, index) => {
            const Icon = area.icon;
            const isCompleted = dermatologyData[area.id];
            const isCurrent = index === currentArea;
            
            return (
              <button
                key={area.id}
                onClick={() => setCurrentArea(index)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  isCurrent 
                    ? 'border-purple-500 bg-purple-50' 
                    : isCompleted
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-purple-300'
                }`}
              >
                <div className="flex flex-col items-center">
                  <Icon className={`text-2xl mb-1 ${
                    isCurrent ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`} />
                  <span className={`text-xs font-medium ${
                    isCurrent ? 'text-purple-700' : isCompleted ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {area.name}
                  </span>
                  {isCompleted && (
                    <FaCheckCircle className="text-green-500 text-sm mt-1" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Area Assessment */}
      <div className="mb-6 p-4 border-2 border-purple-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Current Area: {currentAreaData.name}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentArea(Math.max(0, currentArea - 1))}
              disabled={currentArea === 0}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50"
            >
              <FaArrowLeft />
            </button>
            <button
              onClick={() => setCurrentArea(Math.min(assessmentAreas.length - 1, currentArea + 1))}
              disabled={currentArea === assessmentAreas.length - 1}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50"
            >
              <FaArrowRight />
            </button>
          </div>
        </div>

        {!currentAnalysis ? (
          <div className="text-center py-8">
            <FaCamera className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Capture an image of the {currentAreaData.name.toLowerCase()} area for dermatological assessment
            </p>
            <button
              onClick={() => setShowCamera(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <FaCamera /> Capture Image
            </button>
          </div>
        ) : (
          <AnalysisDisplay 
            analysis={currentAnalysis}
            title={`${currentAreaData.name} Assessment`}
            onRetake={() => setShowCamera(true)}
          />
        )}
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Capture {currentAreaData.name} Image
            </h3>
            <CameraCapture
              onCapture={handleImageCapture}
              onCancel={() => setShowCamera(false)}
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <LoadingSpinner />
            <p className="mt-4 text-center">Analyzing skin condition...</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError(null)} 
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 pt-6 border-t">
        <button
          onClick={previousStep}
          className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm flex-1 sm:flex-none sm:min-w-[90px]"
        >
          <FaArrowLeft className="text-xs" /> Previous
        </button>

        <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto flex-1 sm:flex-none">
          <button
            onClick={onScreeningEnd}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm flex-1 sm:flex-none sm:min-w-[120px]"
          >
            <FaSave className="text-xs" /> Save & Return
          </button>

          <button
            onClick={handleSaveAndContinue}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm flex-1 sm:flex-none sm:min-w-[90px]"
          >
            Continue <FaArrowRight className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DermatologyStep;
