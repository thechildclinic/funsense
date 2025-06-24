import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  analyzeImageWithGemini,
  extractTextWithGeminiOCR,
  analyzeAudioWithGemini,
  generateTextWithGemini,
} from './geminiService';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GeminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeImageWithGemini', () => {
    it('should successfully analyze an image', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ result: 'Image analysis result' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await analyzeImageWithGemini(
        'base64-image-data',
        'Analyze this image',
        'image/jpeg'
      );

      expect(result).toBe('Image analysis result');
      expect(mockFetch).toHaveBeenCalledWith('/api/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyzeImage',
          base64ImageData: 'base64-image-data',
          prompt: 'Analyze this image',
          mimeType: 'image/jpeg',
        }),
      });
    });

    it('should handle API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'API Error' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await analyzeImageWithGemini('image-data', 'prompt');

      expect(result).toBe('Error: API Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await analyzeImageWithGemini('image-data', 'prompt');

      expect(result).toBe('Failed to connect to AI service: Network error');
    });
  });

  describe('extractTextWithGeminiOCR', () => {
    it('should successfully extract text from image', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ result: 'Extracted text' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await extractTextWithGeminiOCR(
        'base64-image-data',
        'Extract text from this image'
      );

      expect(result).toBe('Extracted text');
      expect(mockFetch).toHaveBeenCalledWith('/api/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ocr',
          base64ImageData: 'base64-image-data',
          prompt: 'Extract text from this image',
          mimeType: 'image/jpeg',
        }),
      });
    });
  });

  describe('analyzeAudioWithGemini', () => {
    it('should handle simulated audio analysis', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ result: 'Audio analysis result' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await analyzeAudioWithGemini(
        'SIMULATED_HEART_SOUNDS',
        'Analyze heart sounds'
      );

      expect(result).toBe('Audio analysis result');
      expect(mockFetch).toHaveBeenCalledWith('/api/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyzeAudio',
          simulatedInputType: 'SIMULATED_HEART_SOUNDS',
          prompt: 'Analyze heart sounds',
        }),
      });
    });
  });

  describe('generateTextWithGemini', () => {
    it('should successfully generate text', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ result: 'Generated text' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await generateTextWithGemini('Generate some text');

      expect(result).toBe('Generated text');
      expect(mockFetch).toHaveBeenCalledWith('/api/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateText',
          prompt: 'Generate some text',
        }),
      });
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ result: '' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await generateTextWithGemini('prompt');

      expect(result).toBe('No result text from AI.');
    });
  });
});
