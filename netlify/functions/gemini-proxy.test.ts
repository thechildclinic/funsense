import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './gemini-proxy';
import type { HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';

// Mock the Google GenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn(),
    },
  })),
  HarmCategory: {
    HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
    HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
  },
  HarmBlockThreshold: {
    BLOCK_NONE: 'BLOCK_NONE',
  },
}));

describe('Gemini Proxy Function', () => {
  let mockEvent: HandlerEvent;
  let mockContext: HandlerContext;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up environment variable
    process.env.API_KEY = 'test-api-key';
    
    mockContext = {} as HandlerContext;
    
    mockEvent = {
      httpMethod: 'POST',
      headers: {},
      multiValueHeaders: {},
      body: '',
      isBase64Encoded: false,
      path: '',
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      resource: '',
      stageVariables: null,
      rawUrl: '',
      rawQuery: '',
    } as HandlerEvent;
  });

  it('should return 405 for non-POST requests', async () => {
    mockEvent.httpMethod = 'GET';

    const result = await handler(mockEvent, mockContext) as HandlerResponse;

    expect(result.statusCode).toBe(405);
    expect(JSON.parse(result.body!)).toEqual({ error: 'Method Not Allowed' });
  });

  it('should return 400 for missing request body', async () => {
    mockEvent.body = null;

    const result = await handler(mockEvent, mockContext) as HandlerResponse;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body!)).toEqual({
      error: 'Invalid JSON in request body.',
      details: 'Request body is missing.'
    });
  });

  it('should return 400 for invalid JSON', async () => {
    mockEvent.body = 'invalid-json';

    const result = await handler(mockEvent, mockContext) as HandlerResponse;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body!).error).toBe('Invalid JSON in request body.');
  });

  it('should return 500 when API_KEY is not set', async () => {
    delete process.env.API_KEY;

    mockEvent.body = JSON.stringify({
      action: 'generateText',
      prompt: 'Test prompt',
    });

    const result = await handler(mockEvent, mockContext) as HandlerResponse;

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body!)).toEqual({
      error: 'API Key not configured on the server. Please check Netlify environment variables.'
    });
  });

  it('should handle generateText action successfully', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    const mockGenAI = new GoogleGenAI({ apiKey: 'test' });
    mockGenAI.models.generateContent = vi.fn().mockResolvedValue({
      text: 'Generated text response',
    });

    mockEvent.body = JSON.stringify({
      action: 'generateText',
      prompt: 'Test prompt',
    });

    const result = await handler(mockEvent, mockContext) as HandlerResponse;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body!)).toEqual({
      result: 'Generated text response'
    });
  });

  it('should handle analyzeImage action successfully', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    const mockGenAI = new GoogleGenAI({ apiKey: 'test' });
    mockGenAI.models.generateContent = vi.fn().mockResolvedValue({
      text: 'Image analysis result',
    });

    mockEvent.body = JSON.stringify({
      action: 'analyzeImage',
      base64ImageData: 'base64-image-data',
      prompt: 'Analyze this image',
      mimeType: 'image/jpeg',
    });

    const result = await handler(mockEvent, mockContext) as HandlerResponse;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body!)).toEqual({
      result: 'Image analysis result'
    });
  });

  it('should handle OCR action successfully', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    const mockGenAI = new GoogleGenAI({ apiKey: 'test' });
    mockGenAI.models.generateContent = vi.fn().mockResolvedValue({
      text: 'OCR extracted text',
    });

    mockEvent.body = JSON.stringify({
      action: 'ocr',
      base64ImageData: 'base64-image-data',
      prompt: 'Extract text from image',
    });

    const result = await handler(mockEvent, mockContext) as HandlerResponse;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body!)).toEqual({
      result: 'OCR extracted text'
    });
  });

  it('should handle analyzeAudio action successfully', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    const mockGenAI = new GoogleGenAI({ apiKey: 'test' });
    mockGenAI.models.generateContent = vi.fn().mockResolvedValue({
      text: 'Audio analysis result',
    });

    mockEvent.body = JSON.stringify({
      action: 'analyzeAudio',
      simulatedInputType: 'SIMULATED_HEART_SOUNDS',
      prompt: 'Analyze heart sounds',
    });

    const result = await handler(mockEvent, mockContext) as HandlerResponse;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body!)).toEqual({
      result: 'Audio analysis result'
    });
  });

  it('should return 400 for invalid action', async () => {
    mockEvent.body = JSON.stringify({
      action: 'invalidAction',
      prompt: 'Test prompt',
    });

    const result = await handler(mockEvent, mockContext) as HandlerResponse;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body!)).toEqual({
      error: 'Invalid action specified.'
    });
  });

  it('should handle missing required parameters', async () => {
    mockEvent.body = JSON.stringify({
      action: 'generateText',
      // Missing prompt
    });

    const result = await handler(mockEvent, mockContext) as HandlerResponse;

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body!).error).toContain('Prompt is required');
  });
});
