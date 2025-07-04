import React, { useRef, useState, useCallback, useEffect } from 'react';
import { FaCamera, FaSync, FaVideo, FaStopCircle } from 'react-icons/fa';
import { DEFAULT_CAMERA_FACING_MODE } from '../constants';
import ErrorMessage from './ErrorMessage';
import { useSettingsContext } from '../contexts/SettingsContext'; // Added for preferred camera

interface CameraCaptureProps {
  onCapture: (data: { imageDataUrl?: string; videoBlob?: Blob }) => void;
  captureInstruction?: string;
  enableAudio?: boolean;
  captureMode?: 'image' | 'video';
  videoDuration?: number; // milliseconds, e.g., 5000 for 5s
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  captureInstruction = "Align subject and capture",
  enableAudio = false,
  captureMode = 'image',
  videoDuration = 5000,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const currentStreamRef = useRef<MediaStream | null>(null);

  const { settings } = useSettingsContext(); // Get settings from context
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(DEFAULT_CAMERA_FACING_MODE as 'user' | 'environment');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recordedChunksRef = useRef<Blob[]>([]);

  const stopCurrentStream = useCallback(() => {
    if (currentStreamRef.current) {
      currentStreamRef.current.getTracks().forEach(track => track.stop());
      currentStreamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    //setIsCameraReady(false); // Reset ready state when stream stops
  }, []);

  const startCamera = useCallback(async (currentFacingMode: 'user' | 'environment') => {
    stopCurrentStream();
    setError(null);
    setIsCameraReady(false);

    let mediaStreamAttempt: MediaStream | null = null;
    let attemptError: Error | null = null;
    let constraintsToTry: MediaStreamConstraints[] = [];

    // 1. Preferred Device ID (if set and not in user facing mode, as user facing has its own toggle)
    if (settings.preferredCameraId && currentFacingMode === 'environment') { // Only apply preferred if it's for environment, user is explicit
        constraintsToTry.push({
            video: { 
                deviceId: { exact: settings.preferredCameraId },
                width: { ideal: 1280 }, 
                height: { ideal: 720 } 
            },
            audio: captureMode === 'video' ? (settings.preferredMicrophoneId ? { deviceId: { exact: settings.preferredMicrophoneId } } : enableAudio) : false,
        });
    }
    
    // 2. Specific Facing Mode & Resolution
    constraintsToTry.push({
        video: { 
            facingMode: currentFacingMode, 
            width: { ideal: 1280 }, 
            height: { ideal: 720 } 
        },
        audio: captureMode === 'video' ? (settings.preferredMicrophoneId ? { deviceId: { exact: settings.preferredMicrophoneId } } : enableAudio) : false,
    });

    // 3. Lower resolution fallback for USB cameras
    constraintsToTry.push({
        video: {
            facingMode: currentFacingMode,
            width: { ideal: 640 },
            height: { ideal: 480 }
        },
        audio: captureMode === 'video' ? (settings.preferredMicrophoneId ? { deviceId: { exact: settings.preferredMicrophoneId } } : enableAudio) : false,
    });

    // 4. Generic Fallback (any video device)
    constraintsToTry.push({
        video: true,
        audio: captureMode === 'video' ? (settings.preferredMicrophoneId ? { deviceId: { exact: settings.preferredMicrophoneId } } : enableAudio) : false,
    });


    for (const constraints of constraintsToTry) {
        try {
            console.log("Attempting camera with constraints:", JSON.stringify(constraints));
            mediaStreamAttempt = await navigator.mediaDevices.getUserMedia(constraints);
            if (mediaStreamAttempt) {
                console.log("Camera access successful with constraints:", JSON.stringify(constraints));
                attemptError = null; // Clear previous errors if successful
                break; // Exit loop on success
            }
        } catch (err) {
            console.warn("Camera attempt failed with constraints:", JSON.stringify(constraints), "Error:", (err as Error).name, (err as Error).message);
            if (!attemptError || (attemptError.name !== "OverconstrainedError" && attemptError.name !== "ConstraintNotSatisfiedError") || (err as Error).name === "NotAllowedError") {
                 attemptError = err as Error; // Prioritize more specific errors or permission errors
            }
            if ((err as Error).name === "NotAllowedError" || (err as Error).name === "PermissionDeniedError") {
                 break; // Don't try other constraints if permission denied
            }
        }
    }
    
    if (mediaStreamAttempt) {
        currentStreamRef.current = mediaStreamAttempt;
        if (videoRef.current) {
            videoRef.current.srcObject = mediaStreamAttempt;
            videoRef.current.onloadedmetadata = () => {
                setIsCameraReady(true);
                console.log("Camera ready with stream:", mediaStreamAttempt);
            };
        }
    } else if (attemptError) {
        let message = "Could not access camera. Please check permissions and try again.";
        if (attemptError.name === "NotAllowedError" || attemptError.name === "PermissionDeniedError") {
            message = "Camera permission denied. Please enable camera access in your browser settings.";
        } else if (attemptError.name === "NotFoundError" || attemptError.name === "DevicesNotFoundError") {
            message = "No camera found or specified preferred camera not found. Ensure a camera is connected/enabled, or try flipping the camera.";
        } else if (attemptError.name === "OverconstrainedError" || attemptError.name === "ConstraintNotSatisfiedError") {
            message = `The selected camera does not support the required settings (e.g., resolution, facing mode for ${currentFacingMode}, or preferred device ID). Fallback attempts also failed.`;
        } else if (attemptError.name === "SourceUnavailableError" || attemptError.name === "TrackStartError" || attemptError.name === "AbortError" ) { // Added TrackStartError and AbortError
            message = "Camera is currently unavailable (it might be in use by another application/tab, or a hardware issue).";
        } else {
            message = `An unknown error occurred while accessing the camera: ${(attemptError.message || attemptError.name)}`;
        }
        setError(message);
        console.error("Final camera error:", message, attemptError);
    } else {
        const unknownErrorMessage = "An unexpected issue occurred while starting the camera and no specific error was caught after all attempts.";
        setError(unknownErrorMessage);
        console.error(unknownErrorMessage);
    }
  }, [enableAudio, captureMode, stopCurrentStream, settings.preferredCameraId, settings.preferredMicrophoneId]);


  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopCurrentStream();
    };
  }, [facingMode, startCamera, stopCurrentStream]);

  const takePicture = () => {
    if (videoRef.current && canvasRef.current && isCameraReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Flipping for 'user' (front) camera is handled by CSS transform on video element for preview.
        // For actual canvas draw, if we want the image data to be 'unmirrored', we'd draw it normally.
        // If we want the image data to match the mirrored preview, we would scale context.
        // For consistency (what you see is what you get), if preview is mirrored, data should be too.
        // However, standard practice is often to save the unmirrored image.
        // Let's assume we want the unmirrored image data (natural view).
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture({ imageDataUrl });
      }
    } else {
      setError("Camera not ready for picture.");
    }
  };

  const startRecording = () => {
    if (currentStreamRef.current && MediaRecorder.isTypeSupported('video/webm')) {
      mediaRecorderRef.current = new MediaRecorder(currentStreamRef.current, { mimeType: 'video/webm' });
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        
        let firstFrameDataUrl: string | undefined = undefined;
        if (videoRef.current && canvasRef.current && isCameraReady) {
            const videoEl = videoRef.current;
            const canvas = canvasRef.current;
             try {
                // Ensure video is at a drawable state, for some browsers currentTime manipulation can be tricky for first frame
                // A common trick is to draw after a very short delay once video is playing or data is loaded.
                await new Promise(r => setTimeout(r, 100)); // Short delay after recording starts
                
                canvas.width = videoEl.videoWidth;
                canvas.height = videoEl.videoHeight;
                const context = canvas.getContext('2d');
                if (context) {
                    context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                    firstFrameDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                }
            } catch (frameError) {
                 console.warn("Could not capture video frame:", frameError);
            }
        }
        onCapture({ imageDataUrl: firstFrameDataUrl, videoBlob });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, videoDuration);
    } else {
      setError(`Video recording is not supported or stream unavailable.`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      setIsRecording(false); 
    }
  };

  const handleCaptureClick = () => {
    if (!isCameraReady) {
        setError("Camera is not ready. Please wait or try refreshing.");
        return;
    }
    if (captureMode === 'image') {
      takePicture();
    } else if (captureMode === 'video') {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  const toggleFacingMode = () => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="my-3 p-3 border rounded-lg bg-slate-50 shadow-sm">
      <div className="camera-container relative w-full max-w-sm mx-auto bg-black rounded-md overflow-hidden shadow-inner aspect-[4/3]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted 
          className="w-full h-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)' }}
        ></video>
        {!isCameraReady && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                <FaCamera className="animate-pulse text-3xl"/>
                <span className="ml-2">Initializing camera...</span>
            </div>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {error && <ErrorMessage message={error} />}

      <p className="text-xs text-center text-gray-500 my-2">{captureInstruction}</p>

      <div className="flex items-center justify-center space-x-3 mt-2">
        <button
          onClick={toggleFacingMode}
          disabled={!isCameraReady && !!error} 
          className="p-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50"
          title="Flip Camera"
        >
          <FaSync />
        </button>
        <button
          onClick={handleCaptureClick}
          disabled={!isCameraReady}
          className={`p-4 rounded-full text-white transition-all duration-200 shadow-md hover:shadow-lg
            ${isCameraReady ? (isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600') : 'bg-gray-400 cursor-not-allowed'}`}
          title={captureMode === 'image' ? "Take Picture" : (isRecording ? "Stop Recording" : "Start Recording")}
        >
          {captureMode === 'image' ? <FaCamera size={20} /> : (isRecording ? <FaStopCircle size={20} /> : <FaVideo size={20} />)}
        </button>
         <div className="w-12 h-12"> {}</div>
      </div>
    </div>
  );
};

export default CameraCapture;