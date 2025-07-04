import { GoogleGenAI, GenerateContentResponse, Part, HarmCategory, HarmBlockThreshold } from "@google/genai";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const API_KEY = process.env.API_KEY;
const GEMINI_API_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

const GEMINI_SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.error("API_KEY environment variable is not set. Gemini API calls will fail.");
}

interface RequestBody {
  action: 'generateText' | 'analyzeImage' | 'ocr' | 'analyzeAudio';
  prompt?: string;
  base64ImageData?: string;
  mimeType?: string;
  simulatedInputType?: string; // For analyzeAudio simulation
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (!API_KEY || !ai) {
    console.error("Gemini API Key not configured or AI client not initialized on the server.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API Key not configured on the server. Please check Netlify environment variables." }),
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let requestBody: RequestBody;
  try {
    if (!event.body) {
      throw new Error("Request body is missing.");
    }
    requestBody = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON in request body.", details: (error as Error).message }),
    };
  }

  const { action, prompt, base64ImageData, mimeType, simulatedInputType } = requestBody;

  try {
    let resultText: string = "";
    let genAIResponse: GenerateContentResponse;

    switch (action) {
      case 'generateText':
        if (!prompt) throw new Error("Prompt is required for generateText action.");
        genAIResponse = await ai.models.generateContent({
          model: GEMINI_API_MODEL_TEXT,
          contents: prompt,
          config: { safetySettings: GEMINI_SAFETY_SETTINGS }
        });
        resultText = genAIResponse.text || "";
        break;

      case 'analyzeImage':
      case 'ocr': 
        if (!base64ImageData || !prompt) throw new Error("Image data and prompt are required for image analysis/OCR.");
        const imagePart: Part = {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: base64ImageData.startsWith('data:') ? base64ImageData.split(',')[1] : base64ImageData,
          },
        };
        const textPart: Part = { text: prompt };
        genAIResponse = await ai.models.generateContent({
          model: GEMINI_API_MODEL_TEXT,
          contents: { parts: [imagePart, textPart] },
          config: { safetySettings: GEMINI_SAFETY_SETTINGS }
        });
        resultText = genAIResponse.text || "";
        break;
      
      case 'analyzeAudio': 
        if (!prompt || !simulatedInputType) throw new Error("Prompt and simulatedInputType are required for analyzeAudio action.");
        console.warn(`Proxy: Simulating audio analysis for: ${simulatedInputType}. No real audio processed.`);
        genAIResponse = await ai.models.generateContent({
            model: GEMINI_API_MODEL_TEXT,
            contents: prompt,
            config: { safetySettings: GEMINI_SAFETY_SETTINGS }
        });
        resultText = genAIResponse.text || "";
        break;

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Invalid action specified." }),
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ result: resultText }),
    };

  } catch (error) {
    console.error(`Error processing Gemini API request (action: ${action}):`, error);
    let errorMessage = "Failed to process request with AI.";
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            errorMessage = "API Key is invalid. Please check server configuration.";
        } else if (error.message.includes("quota")) {
            errorMessage = "API quota exceeded. Please check your Gemini plan.";
        } else {
            errorMessage = error.message;
        }
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage, details: (error as Error).stack }),
    };
  }
};

export { handler };
