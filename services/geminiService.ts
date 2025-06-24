// Calls the Netlify proxy function. API_KEY and AI initialization are handled by the proxy.

const PROXY_ENDPOINT = '/api/gemini-proxy'; // Netlify redirect will route this

async function callProxy(body: any): Promise<string> {
  try {
    const response = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Error from proxy function:", responseData.error || response.statusText, responseData.details);
      // Try to provide a more user-friendly error from the proxy if available
      const message = responseData.error || `AI service request failed with status: ${response.status}`;
      return `Error: ${message}`;
    }
    
    if (responseData.error) {
      console.error("Error field in proxy response data:", responseData.error, responseData.details);
      return `Error from AI service: ${responseData.error}`;
    }
    return responseData.result || "No result text from AI.";

  } catch (error) {
    console.error("Network or other error calling proxy:", error);
    return `Failed to connect to AI service: ${(error as Error).message}`;
  }
}

export const analyzeImageWithGemini = async (
  base64ImageData: string,
  prompt: string,
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  return callProxy({
    action: 'analyzeImage',
    base64ImageData,
    prompt,
    mimeType,
  });
};

export const extractTextWithGeminiOCR = async (
  base64ImageData: string,
  prompt: string,
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  return callProxy({
    action: 'ocr',
    base64ImageData,
    prompt,
    mimeType,
  });
};

export const analyzeAudioWithGemini = async (
  simulatedInputType: string, // e.g., "SIMULATED_HEART_SOUNDS"
  prompt: string, // The educational prompt for Gemini
  mimeType?: string // mimeType is for consistency but not used by proxy for this simulated call
): Promise<string> => {
  console.warn("GeminiService: Stethoscope audio analysis is SIMULATED. Calling proxy with 'analyzeAudio' action using the educational prompt.");
  return callProxy({
    action: 'analyzeAudio', // Specific action for proxy to know it's the audio simulation
    simulatedInputType,
    prompt,
  });
};

export const generateTextWithGemini = async (prompt: string): Promise<string> => {
  return callProxy({
    action: 'generateText',
    prompt,
  });
};
