
import React from 'react';
import { AnalysisResult } from '../types'; // AnalysisResult now can have videoSrc
import { FaCheckCircle, FaTimesCircle, FaLightbulb, FaEye, FaRulerCombined } from './icons'; // Added FaEye

interface AnalysisDisplayProps {
  result: AnalysisResult | null;
  title?: string;
}

const ConfidenceMeter: React.FC<{ confidence: number }> = ({ confidence }) => (
  <div className="my-3">
    <div className="flex justify-between text-xs text-slate-600 mb-1">
      <span>Confidence</span>
      <span>{Math.round(confidence * 100)}%</span>
    </div>
    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 transition-width duration-300"
        style={{ width: `${confidence * 100}%` }}
      ></div>
    </div>
  </div>
);

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, title = "Analysis Results" }) => {
  if (!result) return null;

  return (
    <div className="mt-4 p-3 bg-white rounded-xl shadow-lg"> {/* Reduced padding slightly */}
      <h3 className="text-md font-semibold text-slate-700 mb-2">{title}</h3> {/* Reduced margin and size */}
      
      {result.imageUrl && !result.videoSrc && ( // Only show image if no video
        <div className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
          <img src={result.imageUrl} alt="Analyzed content" className="w-full h-auto object-contain max-h-48" /> {/* Reduced max-h */}
        </div>
      )}

      {result.videoSrc && (
         <div className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
            <video src={result.videoSrc} controls className="w-full h-auto object-contain max-h-48"></video>
            {result.imageUrl && <p className="text-xs text-slate-500 p-1 bg-gray-50">Still frame from video below.</p>}
            {result.imageUrl && <img src={result.imageUrl} alt="Video frame" className="w-full h-auto object-contain max-h-32 mt-1"/>}
        </div>
      )}

      {result.text && (
        <div className="prose prose-xs max-w-none p-2 bg-gray-50 rounded-md mb-3 whitespace-pre-wrap"> {/* Reduced padding */}
          <p className="text-slate-700">{result.text}</p>
        </div>
      )}

      {result.confidence !== undefined && <ConfidenceMeter confidence={result.confidence} />}

      {result.constraints && result.constraints.length > 0 && (
        <div className="mt-3"> {/* Reduced margin */}
          <h4 className="text-xs font-semibold text-slate-600 mb-1.5">Image/Frame Quality & Constraints:</h4> {/* Reduced margin */}
          <div className="space-y-1.5"> {/* Reduced spacing */}
            {result.constraints.map((constraint, index) => (
              <div key={index} className="flex items-center p-1.5 rounded-lg bg-blue-500/10 text-xs"> {/* Reduced padding */}
                {React.createElement(constraint.icon || FaLightbulb, { className: `w-3.5 h-3.5 mr-1.5 ${constraint.met ? 'text-green-500' : 'text-red-500'}` })} {/* Reduced size */}
                <span className="flex-grow text-slate-700">{constraint.name}</span>
                <span className={`font-bold ${constraint.met ? 'text-green-500' : 'text-red-500'}`}>
                  {constraint.met ? 'Met' : 'Not Met'}
                </span>
                {constraint.met ? 
                  <FaCheckCircle className="ml-1.5 text-green-500" /> : 
                  <FaTimesCircle className="ml-1.5 text-red-500" /> 
                }
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDisplay;
