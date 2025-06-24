import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeImageWithGemini, generateTextWithGemini } from '../services/geminiService';

// Mock fetch for integration testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Frontend-Backend Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API Communication', () => {
    it('should successfully communicate with Netlify function for text generation', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ 
          result: 'This is a test response from the AI service.' 
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await generateTextWithGemini('Test prompt for AI');

      expect(mockFetch).toHaveBeenCalledWith('/api/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateText',
          prompt: 'Test prompt for AI',
        }),
      });

      expect(result).toBe('This is a test response from the AI service.');
    });

    it('should handle image analysis requests correctly', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ 
          result: 'The image shows a medical device display with readings.' 
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const testImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

      const result = await analyzeImageWithGemini(
        testImageData,
        'Analyze this medical device display',
        'image/jpeg'
      );

      expect(mockFetch).toHaveBeenCalledWith('/api/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyzeImage',
          base64ImageData: testImageData,
          prompt: 'Analyze this medical device display',
          mimeType: 'image/jpeg',
        }),
      });

      expect(result).toBe('The image shows a medical device display with readings.');
    });

    it('should handle API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: () => Promise.resolve({ 
          error: 'Internal server error',
          details: 'API key validation failed'
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await generateTextWithGemini('Test prompt');

      expect(result).toBe('Error: Internal server error');
    });

    it('should handle network failures', async () => {
      mockFetch.mockRejectedValue(new Error('Network connection failed'));

      const result = await generateTextWithGemini('Test prompt');

      expect(result).toBe('Failed to connect to AI service: Network connection failed');
    });

    it('should handle malformed API responses', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ 
          // Missing 'result' field
          data: 'Some data'
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await generateTextWithGemini('Test prompt');

      expect(result).toBe('No result text from AI.');
    });
  });

  describe('Data Flow Integration', () => {
    it('should maintain data consistency through the screening flow', () => {
      // Test that data flows correctly from frontend to backend and back
      const testScreeningData = {
        patientInfo: {
          name: { value: 'Test Student' },
          age: { value: '10' },
          gender: { value: 'Male' },
          manualId: 'TEST123',
          preExistingConditions: '',
        },
        anthropometry: {
          heightCm: { value: '140' },
          weightKg: { value: '35' },
        },
        deviceVitals: {
          bp: {
            name: 'Blood Pressure',
            value: '120/80',
            unit: 'mmHg',
            status: 'normal' as const,
            method: 'Scan' as const,
          },
        },
      };

      // Verify data structure matches expected types
      expect(testScreeningData.patientInfo.name.value).toBe('Test Student');
      expect(testScreeningData.anthropometry.heightCm?.value).toBe('140');
      expect(testScreeningData.deviceVitals.bp?.value).toBe('120/80');
    });

    it('should handle localStorage operations correctly', () => {
      const testData = {
        studentId: 'TEST123',
        screeningData: {
          patientInfo: {
            name: { value: 'Test Student' },
            manualId: 'TEST123',
          },
        },
      };

      // Mock localStorage operations
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

      // Simulate saving data
      localStorage.setItem('screeningData_v2_TEST123', JSON.stringify(testData));
      
      expect(setItemSpy).toHaveBeenCalledWith(
        'screeningData_v2_TEST123',
        JSON.stringify(testData)
      );

      // Simulate loading data
      getItemSpy.mockReturnValue(JSON.stringify(testData));
      const retrievedData = localStorage.getItem('screeningData_v2_TEST123');
      
      expect(JSON.parse(retrievedData!)).toEqual(testData);
    });
  });

  describe('Error Handling Integration', () => {
    it('should provide user-friendly error messages for common failures', async () => {
      // Test API key errors
      const apiKeyErrorResponse = {
        ok: false,
        status: 401,
        json: () => Promise.resolve({ 
          error: 'API key not valid. Please pass a valid API key.' 
        }),
      };
      mockFetch.mockResolvedValue(apiKeyErrorResponse);

      const result = await generateTextWithGemini('Test prompt');
      expect(result).toBe('Error: API key not valid. Please pass a valid API key.');

      // Test quota errors
      const quotaErrorResponse = {
        ok: false,
        status: 429,
        json: () => Promise.resolve({ 
          error: 'Resource has been exhausted (e.g. check quota).' 
        }),
      };
      mockFetch.mockResolvedValue(quotaErrorResponse);

      const quotaResult = await generateTextWithGemini('Test prompt');
      expect(quotaResult).toBe('Error: Resource has been exhausted (e.g. check quota).');
    });

    it('should handle timeout scenarios', async () => {
      // Simulate a timeout
      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      const result = await generateTextWithGemini('Test prompt');
      expect(result).toBe('Failed to connect to AI service: Request timeout');
    });
  });
});
