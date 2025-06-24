import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useScreeningContext } from '../../contexts/ScreeningContext';
import { AnthropometryData, ScreeningStep, Point } from '../../types';
import CameraCapture from '../../components/CameraCapture';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ResultCard from '../../components/ResultCard';
import { generateTextWithGemini, extractTextWithGeminiOCR, analyzeImageWithGemini } from '../../services/geminiService';
import { PROMPTS, STEP_ICONS, ANTHROPOMETRY_INSTRUCTIONS, OBSERVED_BODY_TYPE_OPTIONS } from '../../constants';
import { FaRulerVertical, FaBalanceScale, FaSave, FaCamera, FaUndo, FaArrowsAltH, FaStreetView, FaCheckCircle, FaBan, FaRedo, FaMousePointer, FaEraser, FaListAlt } from 'react-icons/fa'; // Added FaListAlt

interface AnthropometryStepProps {
    onScreeningEnd: () => void; // Added for "Save & Return to Student List"
}


const AnthropometryStep: React.FC<AnthropometryStepProps> = ({ onScreeningEnd }) => {
  const { screeningData, updateScreeningData, markStepAsSkipped, unskipStep, nextStep } = useScreeningContext(); // nextStep still needed for skip logic
  
  const thisStepKey = ScreeningStep.Anthropometry;
  const isModuleSkipped = screeningData.skippedSteps?.[thisStepKey];

  const initialHeightData = screeningData.anthropometry.heightCm || { value: '', image: '', rulerVisible: false, instructions: ANTHROPOMETRY_INSTRUCTIONS.height, aiSilhouetteObservation: '', referenceLengthCm: '' };
  const initialArmSpanData = screeningData.anthropometry.armSpanCm || { value: '', image: '', instructions: ANTHROPOMETRY_INSTRUCTIONS.armSpan };

  const [heightData, setHeightData] = useState<AnthropometryData['heightCm']>(initialHeightData);
  const [weightData, setWeightData] = useState<AnthropometryData['weightKg']>(
    screeningData.anthropometry.weightKg || { value: '', image: '', ocrAttempt: '' }
  );
  const [armSpanData, setArmSpanData] = useState<AnthropometryData['armSpanCm']>(initialArmSpanData);
  const [bodyTypeData, setBodyTypeData] = useState<AnthropometryData['observedBodyType']>(
     screeningData.anthropometry.observedBodyType || { value: OBSERVED_BODY_TYPE_OPTIONS[0], options: OBSERVED_BODY_TYPE_OPTIONS }
  );
  const [bmiResult, setBmiResult] = useState<AnthropometryData['bmi'] | null>(screeningData.anthropometry.bmi || null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHeightCamera, setShowHeightCamera] = useState(false);
  const [showWeightCamera, setShowWeightCamera] = useState(false);
  const [showArmSpanCamera, setShowArmSpanCamera] = useState(false);
  const [isDataSaved, setIsDataSaved] = useState(false);

  const [showSkipForm, setShowSkipForm] = useState(false);
  const [skipReason, setSkipReason] = useState(isModuleSkipped || '');
  
  type PointKey = 'heightTop' | 'heightBottom' | 'rulerP1' | 'rulerP2' | 'armSpanP1' | 'armSpanP2';
  type AnnotationTarget = 'height' | 'armSpan' | null;

  interface AnnotationState {
    targetImage: AnnotationTarget;
    currentPointKey: PointKey | null;
    points: Partial<Record<PointKey, Point>>;
    message: string;
    referenceLengthCm: string;
    imgDimensions?: { width: number; height: number; naturalWidth: number; naturalHeight: number };
  }
  
  const [annotationState, setAnnotationState] = useState<AnnotationState>({
    targetImage: null,
    currentPointKey: null,
    points: {
        heightTop: initialHeightData.tappedPoints?.top,
        heightBottom: initialHeightData.tappedPoints?.bottom,
        rulerP1: initialHeightData.referencePoints?.p1,
        rulerP2: initialHeightData.referencePoints?.p2,
        armSpanP1: initialArmSpanData.tappedPoints?.p1,
        armSpanP2: initialArmSpanData.tappedPoints?.p2,
    },
    message: '',
    referenceLengthCm: initialHeightData.referenceLengthCm || '',
  });

  const imageRef = useRef<HTMLImageElement>(null);


  useEffect(() => { 
    if (screeningData.anthropometry.heightCm?.instructions !== ANTHROPOMETRY_INSTRUCTIONS.height ||
        screeningData.anthropometry.armSpanCm?.instructions !== ANTHROPOMETRY_INSTRUCTIONS.armSpan) {
        updateScreeningData(prev => ({
            ...prev,
            anthropometry: {
                ...prev.anthropometry,
                heightCm: { ...(prev.anthropometry.heightCm || { value: '' }), instructions: ANTHROPOMETRY_INSTRUCTIONS.height, aiSilhouetteObservation: prev.anthropometry.heightCm?.aiSilhouetteObservation || '' }, 
                armSpanCm: { ...(prev.anthropometry.armSpanCm || { value: '' }), instructions: ANTHROPOMETRY_INSTRUCTIONS.armSpan }
            }
        }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleDataChange = () => {
    setIsDataSaved(false);
    if (isModuleSkipped) { 
        unskipStep(thisStepKey);
    }
  };

  const handleHeightImageCapture = async (imageDataUrl?: string) => {
    setShowHeightCamera(false);
    if (!imageDataUrl) return;
    setHeightData(prev => ({ ...prev, image: imageDataUrl, tappedPoints: {}, referencePoints: {}, calculatedValue: '' }));
    setAnnotationState(prev => ({
        ...prev,
        targetImage: 'height',
        currentPointKey: 'heightTop',
        points: {
            ...prev.points, // Keep armspan points if they exist
            heightTop: undefined, heightBottom: undefined, rulerP1: undefined, rulerP2: undefined,
        },
        message: 'Tap the top of the student\'s head.',
        imgDimensions: undefined,
    }));
    handleDataChange();

    setIsLoading(true);
    setError('');
    try {
        const aiResponse = await analyzeImageWithGemini(imageDataUrl, PROMPTS.HEIGHT_SILHOUETTE_FROM_IMAGE);
        const silhouetteMatch = aiResponse.match(/Silhouette:\s*(.+)/i);
        const visibilityMatch = aiResponse.match(/Visibility:\s*Student:\s*(Yes|No|PartiallyVisible)[\s,]*Ruler:\s*(Yes|No|PartiallyVisible)/i);
        
        let silhouetteObs = "AI could not determine silhouette.";
        if (silhouetteMatch && silhouetteMatch[1]) {
            silhouetteObs = silhouetteMatch[1].trim();
        }
        setHeightData(prev => ({ ...prev, aiSilhouetteObservation: silhouetteObs }));

        if (visibilityMatch) {
            const studentVisible = visibilityMatch[1].toLowerCase() === 'yes';
            const rulerVisibleValue = visibilityMatch[2].toLowerCase() === 'yes' || visibilityMatch[2].toLowerCase() === 'partiallyvisible';
            setHeightData(prev => ({ ...prev, rulerVisible: rulerVisibleValue }));
            if (!studentVisible) setError(prevError => prevError + " AI: Student not clearly visible. ");
            if (!rulerVisibleValue) setError(prevError => prevError + " AI: Ruler not clearly visible/usable. ");
        } else {
             setError(prevError => prevError + " AI: Could not determine image quality for height. ");
        }

    } catch (e) {
        setError('AI analysis for silhouette/image quality failed.');
        console.error(e);
    }
    setIsLoading(false);
  };

  const handleArmSpanImageCapture = async (imageDataUrl?: string) => {
    setShowArmSpanCamera(false);
    if (!imageDataUrl) return;
    setArmSpanData(prev => ({ ...prev, image: imageDataUrl, tappedPoints: {}, calculatedValue: '' }));
    setAnnotationState(prev => ({
        ...prev,
        targetImage: 'armSpan',
        currentPointKey: 'armSpanP1',
        points: { 
            ...prev.points, // Keep height points
            armSpanP1: undefined, 
            armSpanP2: undefined
        }, 
        message: 'Tap the tip of one middle finger.',
        imgDimensions: undefined,
    }));
    handleDataChange();
    setIsLoading(true);
    setError('');
    try {
        const aiResponse = await analyzeImageWithGemini(imageDataUrl, PROMPTS.ARM_SPAN_FROM_IMAGE);
        // Add error/warning based on visibility if needed from aiResponse for armspan
    } catch (e) {
        setError('AI analysis for arm span image quality failed.');
    }
    setIsLoading(false);
  };
  
  const handleWeightImageCapture = async (imageDataUrl?: string) => {
    if (!imageDataUrl) {
      setShowWeightCamera(false);
      return;
    }
    setWeightData(prev => ({ ...prev, image: imageDataUrl }));
    setShowWeightCamera(false);
    setIsLoading(true);
    setError('');
    try {
      const ocrText = await extractTextWithGeminiOCR(imageDataUrl, PROMPTS.WEIGHING_SCALE_OCR);
      setWeightData(prev => ({ ...prev, value: ocrText.replace(/[^\d.]/g, ''), ocrAttempt: ocrText }));
    } catch (e) {
      setError('OCR failed for weight. Please enter manually.');
      console.error(e);
    }
    setIsLoading(false);
    handleDataChange();
  };
  
  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<any>>, 
    field: 'value' | 'reason' | 'rulerVisible' | 'referenceLengthCm' | 'aiSilhouetteObservation', 
    value: string | boolean
  ) => {
    setter((prev: any) => ({ ...prev, [field]: value }));
    handleDataChange();
  };

  const onImageLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.currentTarget;
    setAnnotationState(prev => ({
        ...prev,
        imgDimensions: {
            width: img.offsetWidth,
            height: img.offsetHeight,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
        }
    }));
  };

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!annotationState.currentPointKey || !annotationState.imgDimensions) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = annotationState.imgDimensions.naturalWidth / annotationState.imgDimensions.width;
    const scaleY = annotationState.imgDimensions.naturalHeight / annotationState.imgDimensions.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    const newPoints = { ...annotationState.points, [annotationState.currentPointKey]: { x, y } };
    setAnnotationState(prev => ({ ...prev, points: newPoints }));

    let nextKey: PointKey | null = null;
    let nextMessage = '';

    if (annotationState.targetImage === 'height') {
        if (annotationState.currentPointKey === 'heightTop') { nextKey = 'heightBottom'; nextMessage = 'Tap the bottom of the student\'s feet (or floor mark).'; }
        else if (annotationState.currentPointKey === 'heightBottom') { nextKey = 'rulerP1'; nextMessage = 'Tap a known point on the ruler (e.g., 0cm or 10cm mark).'; }
        else if (annotationState.currentPointKey === 'rulerP1') { nextKey = 'rulerP2'; nextMessage = 'Tap another known point on the ruler (e.g., 50cm or 100cm mark).'; }
        else if (annotationState.currentPointKey === 'rulerP2') { nextMessage = 'Enter the actual distance (cm) between the two tapped ruler points below and click Calculate.'; }
    } else if (annotationState.targetImage === 'armSpan') {
        if (annotationState.currentPointKey === 'armSpanP1') { nextKey = 'armSpanP2'; nextMessage = 'Tap the tip of the other middle finger.'; }
        else if (annotationState.currentPointKey === 'armSpanP2') { nextMessage = 'Ensure ruler reference from Height section is set, then click Calculate Arm Span.';}
    }
    setAnnotationState(prev => ({ ...prev, currentPointKey: nextKey, message: nextMessage }));
  };

  const calculateMeasurement = (measurementType: 'height' | 'armSpan') => {
    const { points, referenceLengthCm } = annotationState;
    if (!points.rulerP1 || !points.rulerP2 || !referenceLengthCm) {
        setError("Please ensure ruler points are tapped on the Height image and reference length is entered.");
        return;
    }
    const refLength = parseFloat(referenceLengthCm);
    if (isNaN(refLength) || refLength <= 0) {
        setError("Invalid reference length. Please enter a positive number for the ruler reference.");
        return;
    }

    const getPixelDist = (p1?: Point, p2?: Point) => {
        if (!p1 || !p2) return 0;
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };

    const refPixelDist = getPixelDist(points.rulerP1, points.rulerP2);
    if (refPixelDist === 0) {
        setError("Ruler reference points are the same or not set. Please tap two distinct points on the ruler in the Height image.");
        return;
    }
    const pixelsPerCm = refPixelDist / refLength;

    if (measurementType === 'height' && points.heightTop && points.heightBottom) {
        const heightPixelDist = getPixelDist(points.heightTop, points.heightBottom);
        const calculatedHeight = (heightPixelDist / pixelsPerCm).toFixed(1);
        setHeightData(prev => ({ ...prev, value: calculatedHeight, calculatedValue: calculatedHeight, tappedPoints: {top: points.heightTop, bottom: points.heightBottom}, referencePoints: {p1: points.rulerP1, p2: points.rulerP2}, referenceLengthCm: referenceLengthCm}));
        setError('');
        setAnnotationState(prev => ({ ...prev, message: `Height calculated: ${calculatedHeight} cm. Confirm or edit.`}));
    } else if (measurementType === 'armSpan' && points.armSpanP1 && points.armSpanP2) {
        const armSpanPixelDist = getPixelDist(points.armSpanP1, points.armSpanP2);
        const calculatedArmSpan = (armSpanPixelDist / pixelsPerCm).toFixed(1);
        setArmSpanData(prev => ({ ...prev, value: calculatedArmSpan, calculatedValue: calculatedArmSpan, tappedPoints: {p1: points.armSpanP1, p2: points.armSpanP2} }));
        setError('');
        setAnnotationState(prev => ({ ...prev, message: `Arm Span calculated: ${calculatedArmSpan} cm. Confirm or edit.`}));
    } else {
        setError(`Not enough points to calculate ${measurementType}. Ensure reference and target points are set.`);
    }
  };
  
  const resetAnnotationPoints = (target: AnnotationTarget) => {
    const newPoints = {...annotationState.points};
    let firstKey: PointKey | null = null;
    let firstMessage = '';

    if (target === 'height') {
        newPoints.heightTop = undefined;
        newPoints.heightBottom = undefined;
        // Keep ruler points if they were set, but allow re-tapping
        // newPoints.rulerP1 = undefined; 
        // newPoints.rulerP2 = undefined;
        firstKey = 'heightTop';
        firstMessage = 'Tap the top of the student\'s head.';
        setHeightData(prev => ({...prev, calculatedValue: undefined, value: prev.value || ''})); 
    } else if (target === 'armSpan') {
        newPoints.armSpanP1 = undefined;
        newPoints.armSpanP2 = undefined;
        firstKey = 'armSpanP1';
        firstMessage = 'Tap the tip of one middle finger.';
        setArmSpanData(prev => ({...prev, calculatedValue: undefined, value: prev.value || ''}));
    }
    setAnnotationState(prev => ({
        ...prev,
        points: newPoints,
        currentPointKey: firstKey,
        message: firstMessage,
        targetImage: target // Ensure targetImage is set for the reset
    }));
  };

  const calculateAndSaveBMI = useCallback(async () => {
    setError('');
    const h = parseFloat(heightData.value);
    const w = parseFloat(weightData.value);

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      setError("Please enter valid positive numbers for confirmed height (cm) and weight (kg).");
      setBmiResult(null);
      return;
    }

    const hMeters = h / 100;
    const bmiValue = parseFloat((w / (hMeters * hMeters)).toFixed(2));
    
    setIsLoading(true);
    let interpretation = "Could not fetch interpretation.";
    try {
      interpretation = await generateTextWithGemini(PROMPTS.BMI_INTERPRETATION(
        bmiValue, 
        screeningData.patientInfo.age?.value,
        screeningData.patientInfo.gender?.value,
        bodyTypeData.value,
        armSpanData.value,
        heightData.aiSilhouetteObservation 
      ));
    } catch (apiError) {
      console.error("BMI Interpretation API Error:", apiError);
      setError("Failed to get BMI interpretation from AI.");
    }
    
    const newBmiResult = { value: bmiValue, interpretation };
    setBmiResult(newBmiResult);
    updateScreeningData(prev => ({ 
      ...prev,
      anthropometry: {
        heightCm: heightData, 
        weightKg: weightData,
        armSpanCm: armSpanData,
        observedBodyType: bodyTypeData,
        bmi: newBmiResult,
      }
    }));
    setIsLoading(false);
    setIsDataSaved(true); 
    setTimeout(() => setIsDataSaved(false), 2000);
    if (isModuleSkipped) unskipStep(thisStepKey);
  }, [heightData, weightData, armSpanData, bodyTypeData, updateScreeningData, screeningData.patientInfo, isModuleSkipped, thisStepKey, unskipStep]);

  const handleSaveData = () => {
    updateScreeningData(prev => ({
     ...prev,
     anthropometry: {
       heightCm: heightData,
       weightKg: weightData,
       armSpanCm: armSpanData,
       observedBodyType: bodyTypeData,
       bmi: bmiResult || prev.anthropometry.bmi, 
     }
   }));
   setIsDataSaved(true);
   setTimeout(() => setIsDataSaved(false), 2000);
   if (isModuleSkipped) unskipStep(thisStepKey);
 };

  const handleSaveAndReturn = () => {
    if (!isModuleSkipped) {
      handleSaveData(); 
    }
    onScreeningEnd(); // Navigate back to student list
  };

  const handleConfirmSkip = () => {
    if (!skipReason.trim()) {
        alert("Please provide a reason for skipping this module.");
        return;
    }
    markStepAsSkipped(thisStepKey, skipReason);
    setShowSkipForm(false);
    nextStep(); // This will navigate to the next available (unskipped) step.
  };
  
  const handleUnskipModule = () => {
    unskipStep(thisStepKey);
    setSkipReason(''); 
    setShowSkipForm(false);
  };

  const renderAnnotationImage = (imageSrc?: string, currentTargetImage?: AnnotationTarget) => {
    if (!imageSrc || annotationState.targetImage !== currentTargetImage) return null;
    const currentPoints = annotationState.points;
    const pointKeysForTarget: PointKey[] = annotationState.targetImage === 'height' 
        ? ['heightTop', 'heightBottom', 'rulerP1', 'rulerP2'] 
        : ['armSpanP1', 'armSpanP2'];

    return (
        <div className="relative inline-block my-2 border border-blue-400 rounded-md overflow-hidden" style={{ maxWidth: '100%', maxHeight: '400px'}}>
            <img 
                ref={imageRef} 
                src={imageSrc} 
                alt={`${annotationState.targetImage} for annotation`} 
                onClick={handleImageClick}
                onLoad={onImageLoad}
                className="max-w-full max-h-[400px] object-contain cursor-crosshair"
            />
            {annotationState.imgDimensions && pointKeysForTarget.map(key => {
                const point = currentPoints[key];
                if (!point) return null;
                const displayX = (point.x / annotationState.imgDimensions!.naturalWidth) * annotationState.imgDimensions!.width;
                const displayY = (point.y / annotationState.imgDimensions!.naturalHeight) * annotationState.imgDimensions!.height;
                return (
                    <div 
                        key={key} 
                        className="absolute w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white -ml-1.25 -mt-1.25 pointer-events-none"
                        style={{ left: `${displayX}px`, top: `${displayY}px` }}
                        title={key}
                    />
                );
            })}
        </div>
    );
  };

  const FieldWrapper: React.FC<{ title: string, icon: React.ElementType, children: React.ReactNode, instructions?: string }> = 
    ({title, icon: Icon, children, instructions}) => (
    <div className="p-3 border border-gray-200 rounded-lg bg-white mb-3 animate-fadeIn">
        <h3 className="text-md font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Icon className="text-brand-cyan"/> {title}
        </h3>
        {instructions && <p className="text-xs text-slate-500 mb-2 whitespace-pre-line">{instructions}</p>}
        {children}
    </div>
  );
  
  const StepIcon = STEP_ICONS[thisStepKey];

  if (isModuleSkipped && !showSkipForm) {
    return (
        <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg shadow text-center">
            <div className="flex items-center gap-3 mb-4 text-slate-700 justify-center">
                {StepIcon && <StepIcon className="text-2xl text-yellow-600" />}
                <h2 className="text-xl font-semibold text-yellow-700">Anthropometry Module Skipped</h2>
            </div>
            <p className="text-slate-600 mb-1"><strong>Reason:</strong> {isModuleSkipped}</p>
            <button
                onClick={handleUnskipModule}
                className="mt-3 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg shadow flex items-center justify-center gap-1.5 mx-auto"
            >
                <FaRedo /> Unskip & Enter Data
            </button>
            <button 
                onClick={onScreeningEnd} // Go back to student list if skipped and they want to exit
                className="mt-2 w-full sm:w-auto bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg shadow"
            >
                Return to Student List
            </button>
        </div>
    );
  }

  return (
    <div className="p-1">
       <div className="flex items-center justify-between gap-3 mb-4 text-slate-700">
            <div className="flex items-center gap-2">
                {StepIcon && <StepIcon className="text-2xl text-brand-light-blue" />}
                <h2 className="text-xl font-semibold">Anthropometry</h2>
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

        {showSkipForm && (
            <div className="p-3 border border-orange-300 rounded-lg bg-orange-50 mb-3 animate-fadeIn">
                <h3 className="text-md font-semibold text-orange-700 mb-2">Skip Anthropometry Module</h3>
                <label htmlFor="skipReasonAnthropometry" className="block text-sm font-medium text-slate-700 mb-1">Reason for skipping*</label>
                <textarea
                    id="skipReasonAnthropometry"
                    value={skipReason}
                    onChange={(e) => setSkipReason(e.target.value)}
                    placeholder="e.g., Equipment unavailable, student refusal"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm min-h-[60px]"
                />
                <div className="mt-2 flex gap-2">
                    <button onClick={handleConfirmSkip} className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-1.5 px-3 rounded text-sm">Confirm Skip</button>
                    <button onClick={() => {setShowSkipForm(false); setSkipReason(isModuleSkipped || '');}} className="bg-gray-300 hover:bg-gray-400 text-slate-700 font-medium py-1.5 px-3 rounded text-sm">Cancel</button>
                </div>
            </div>
        )}

      {error && <ErrorMessage message={error} />}

      {/* Height Measurement Section */}
      <FieldWrapper title="Height Measurement (Tap-to-Measure)" icon={FaRulerVertical} instructions={heightData.instructions}>
        {showHeightCamera ? (
          <CameraCapture onCapture={({imageDataUrl}) => handleHeightImageCapture(imageDataUrl)} captureInstruction="Capture student with ruler at fixed station" captureMode="image"/>
        ) : (
          <>
            {heightData.image && renderAnnotationImage(heightData.image, 'height')}
            <button onClick={() => {setShowHeightCamera(true); setAnnotationState(p => ({...p, targetImage: 'height', currentPointKey: 'heightTop', message: 'Tap top of student\'s head.'}))}} className="text-sm text-blue-600 flex items-center gap-1 mb-2"><FaCamera /> {heightData.image ? 'Retake' : 'Capture'} Height Image</button>
          </>
        )}
        {heightData.image && annotationState.targetImage === 'height' && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-700 flex items-center gap-1.5"><FaMousePointer /> {annotationState.message || "Tap points on image above."}</p>
                <button onClick={() => resetAnnotationPoints('height')} className="text-xs bg-yellow-400 hover:bg-yellow-500 text-black px-2 py-1 rounded mt-1 mr-1 flex items-center gap-1"><FaEraser /> Reset Height Points</button>
                <label className="block text-xs font-medium text-slate-600 mt-2">Known Ruler Reference Length (cm)*</label>
                <input 
                    type="number" 
                    value={annotationState.referenceLengthCm} 
                    onChange={(e) => {setAnnotationState(p => ({...p, referenceLengthCm: e.target.value})); handleDataChange();}}
                    placeholder="e.g., 50 (for 50cm between tapped ruler marks)" 
                    className="w-full p-1.5 border rounded-md text-sm"
                />
                <button onClick={() => calculateMeasurement('height')} disabled={!annotationState.points.rulerP1 || !annotationState.points.rulerP2 || !annotationState.referenceLengthCm || !annotationState.points.heightTop || !annotationState.points.heightBottom}
                    className="text-sm bg-green-500 hover:bg-green-600 text-white px-2.5 py-1.5 rounded mt-2 disabled:opacity-50">
                    Calculate Height from Taps
                </button>
            </div>
        )}
        {heightData.calculatedValue && <p className="text-xs text-green-700 my-1">Tap Calculated Height: {heightData.calculatedValue} cm</p>}
        {heightData.aiSilhouetteObservation && <p className="text-xs italic text-slate-600 my-1">AI Silhouette: {heightData.aiSilhouetteObservation}</p>}
        
        <label className="block text-sm font-medium text-slate-600 mt-1">Confirmed Height (cm)*</label>
        <input type="number" value={heightData.value} onChange={(e) => handleInputChange(setHeightData, 'value', e.target.value)} placeholder="Enter or confirm height" className="w-full p-2 border rounded-md"/>
        <div className="mt-1">
            <input type="checkbox" id="rulerVisible" checked={!!heightData.rulerVisible} onChange={(e) => handleInputChange(setHeightData, 'rulerVisible', e.target.checked)} className="mr-1"/>
            <label htmlFor="rulerVisible" className="text-xs text-slate-500">Ruler reference clearly visible in image (AI Check)</label>
        </div>
        <label className="block text-xs font-medium text-slate-500 mt-1">Reason for manual override/notes</label>
        <input type="text" value={heightData.reason || ''} onChange={(e) => handleInputChange(setHeightData, 'reason', e.target.value)} placeholder="e.g., Corrected tap calculation" className="w-full p-1 border rounded-md text-xs"/>
      </FieldWrapper>

      {/* Arm Span Measurement Section */}
      <FieldWrapper title="Arm Span Measurement (Tap-to-Measure)" icon={FaArrowsAltH} instructions={armSpanData.instructions}>
         {showArmSpanCamera ? (
          <CameraCapture onCapture={({imageDataUrl}) => handleArmSpanImageCapture(imageDataUrl)} captureInstruction="Capture student's extended arms with reference" captureMode="image"/>
        ) : (
          <>
            {armSpanData.image && renderAnnotationImage(armSpanData.image, 'armSpan')}
            <button onClick={() => {setShowArmSpanCamera(true); setAnnotationState(p => ({...p, targetImage: 'armSpan', currentPointKey: 'armSpanP1', message: 'Tap tip of one middle finger.'}))}} className="text-sm text-blue-600 flex items-center gap-1 mb-2"><FaCamera /> {armSpanData.image ? 'Retake' : 'Capture'} Arm Span Image</button>
          </>
        )}
        {armSpanData.image && annotationState.targetImage === 'armSpan' && (
             <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-700 flex items-center gap-1.5"><FaMousePointer /> {annotationState.message || "Tap points on image above."}</p>
                <button onClick={() => resetAnnotationPoints('armSpan')} className="text-xs bg-yellow-400 hover:bg-yellow-500 text-black px-2 py-1 rounded mt-1 mr-1 flex items-center gap-1"><FaEraser /> Reset Arm Span Points</button>
                 <p className="text-xs text-slate-500 mt-1">Uses the ruler reference and length from the Height section. Ensure it's set there before calculating arm span.</p>
                <button onClick={() => calculateMeasurement('armSpan')} disabled={!annotationState.points.rulerP1 || !annotationState.points.rulerP2 || !annotationState.referenceLengthCm || !annotationState.points.armSpanP1 || !annotationState.points.armSpanP2}
                    className="text-sm bg-green-500 hover:bg-green-600 text-white px-2.5 py-1.5 rounded mt-2 disabled:opacity-50">
                    Calculate Arm Span from Taps
                </button>
            </div>
        )}
        {armSpanData.calculatedValue && <p className="text-xs text-green-700 my-1">Tap Calculated Arm Span: {armSpanData.calculatedValue} cm</p>}
        <label className="block text-sm font-medium text-slate-600 mt-1">Confirmed Arm Span (cm)</label>
        <input type="number" value={armSpanData.value} onChange={(e) => handleInputChange(setArmSpanData, 'value', e.target.value)} placeholder="Enter or confirm arm span" className="w-full p-2 border rounded-md"/>
        <label className="block text-xs font-medium text-slate-500 mt-1">Reason for manual override/notes</label>
        <input type="text" value={armSpanData.reason || ''} onChange={(e) => handleInputChange(setArmSpanData, 'reason', e.target.value)} placeholder="e.g., Used direct tape measure" className="w-full p-1 border rounded-md text-xs"/>
      </FieldWrapper>

      <FieldWrapper title="Observed Body Type" icon={FaStreetView}>
        {heightData.aiSilhouetteObservation && <p className="text-xs italic text-slate-600 my-1 mb-2">AI Silhouette Observation (from height image): {heightData.aiSilhouetteObservation}</p>}
        <label className="block text-sm font-medium text-slate-600">Select Observed Body Type (Nurse Assessment)</label>
        <select 
            value={bodyTypeData.value} 
            onChange={(e) => handleInputChange(setBodyTypeData, 'value', e.target.value)}
            className="w-full p-2 border rounded-md bg-white mt-1"
        >
            {(bodyTypeData.options || OBSERVED_BODY_TYPE_OPTIONS).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <label className="block text-xs font-medium text-slate-500 mt-1">Reason (if any specific observation)</label>
        <input type="text" value={bodyTypeData.reason || ''} onChange={(e) => handleInputChange(setBodyTypeData, 'reason', e.target.value)} placeholder="e.g., Appears very lean for height" className="w-full p-1 border rounded-md text-xs"/>
      </FieldWrapper>

      <FieldWrapper title="Weight Measurement" icon={FaBalanceScale}>
        {showWeightCamera ? (
          <CameraCapture onCapture={({imageDataUrl}) => handleWeightImageCapture(imageDataUrl)} captureInstruction="Scan weighing scale display" captureMode="image"/>
        ) : (
          <>
            {weightData.image && <img src={weightData.image} alt="Weight scale capture" className="max-w-full h-auto rounded-md my-2 max-h-40"/>}
            <button onClick={() => setShowWeightCamera(true)} className="text-sm text-blue-600 flex items-center gap-1 mb-2"><FaCamera /> {weightData.image ? 'Retake' : 'Capture'} Scale Image</button>
          </>
        )}
        {weightData.ocrAttempt && <p className="text-xs text-gray-500">OCR Attempt: "{weightData.ocrAttempt}"</p>}
        <label className="block text-sm font-medium text-slate-600 mt-1">Weight (kg)*</label>
        <input type="number" value={weightData.value} onChange={(e) => handleInputChange(setWeightData, 'value', e.target.value)} placeholder="e.g., 45.5" className="w-full p-2 border rounded-md"/>
        <label className="block text-xs font-medium text-slate-500 mt-1">Reason for manual weight</label>
        <input type="text" value={weightData.reason || ''} onChange={(e) => handleInputChange(setWeightData, 'reason', e.target.value)} placeholder="e.g., OCR failed" className="w-full p-1 border rounded-md text-xs"/>
      </FieldWrapper>

      <button
        onClick={calculateAndSaveBMI}
        disabled={isLoading || !heightData.value || !weightData.value}
        className="w-full my-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isLoading && bmiResult === null ? <LoadingSpinner text="Calculating..." size="text-lg"/> : <><FaSave /> Calculate & Interpret BMI</>}
      </button>

      {bmiResult && (
        <ResultCard
          value={bmiResult.value.toString()}
          label="Body Mass Index (BMI)"
          bgColorClass="bg-gradient-to-br from-yellow-300 to-orange-400"
          description={bmiResult.interpretation}
        />
      )}
      {isLoading && bmiResult && <LoadingSpinner text="Fetching interpretation..." />}
      
      <div className="mt-4 flex items-center gap-2">
        <button 
          onClick={handleSaveData}
          className="bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-3 rounded-lg shadow flex items-center justify-center gap-1.5 text-sm"
        >
          <FaSave /> Save Progress
        </button>
        {isDataSaved && <span className="text-green-600 text-sm flex items-center gap-1"><FaCheckCircle /> Saved!</span>}
      </div>

      <button 
        onClick={handleSaveAndReturn}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow flex items-center justify-center gap-2"
        >
            <FaListAlt /> Save & Return to Student List
        </button>
    </div>
  );
};

export default AnthropometryStep;