import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveAppSettings,
  loadAppSettings,
  getActiveScreeningStudentId,
  setActiveScreeningStudentId,
  saveActiveScreening,
  loadActiveScreening,
  clearActiveScreening,
  clearAllApplicationData,
  clearAllScreeningSessionData,
} from './localStorageService';
import { ScreeningData, ScreeningStep, AppSettings } from '../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('LocalStorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('App Settings', () => {
    it('should save app settings', () => {
      const settings: AppSettings = {
        preferredCameraId: 'camera1',
        preferredMicrophoneId: 'mic1',
      };

      saveAppSettings(settings);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'appSettings_v2',
        JSON.stringify(settings)
      );
    });

    it('should load app settings', () => {
      const settings: AppSettings = {
        preferredCameraId: 'camera1',
        preferredMicrophoneId: 'mic1',
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(settings));

      const result = loadAppSettings();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('appSettings_v2');
      expect(result).toEqual(settings);
    });

    it('should return null when no settings exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadAppSettings();

      expect(result).toBeNull();
    });

    it('should handle JSON parse errors gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = loadAppSettings();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Active Screening Student ID', () => {
    it('should get active screening student ID', () => {
      localStorageMock.getItem.mockReturnValue('student123');

      const result = getActiveScreeningStudentId();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('activeScreeningStudentId_v2');
      expect(result).toBe('student123');
    });

    it('should set active screening student ID', () => {
      setActiveScreeningStudentId('student456');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'activeScreeningStudentId_v2',
        'student456'
      );
    });

    it('should remove active screening student ID when set to null', () => {
      setActiveScreeningStudentId(null);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('activeScreeningStudentId_v2');
    });
  });

  describe('Screening Data', () => {
    const mockScreeningData: ScreeningData = {
      patientInfo: {
        name: { value: 'Test Student' },
        age: { value: '10' },
        gender: { value: 'Male' },
        manualId: 'student123',
        qrId: '',
        preExistingConditions: '',
      },
      vitals: {},
      bmi: {},
      growthChart: {},
      dental: {},
      ent: {},
      skinLesion: {},
      stethoscope: {},
      ocrDocument: {},
    };

    it('should save active screening data', () => {
      const studentId = 'student123';
      const currentStep = ScreeningStep.Vitals;

      saveActiveScreening(studentId, mockScreeningData, currentStep);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'screeningData_v2_student123',
        expect.stringContaining('"data":')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'activeScreeningStudentId_v2',
        'student123'
      );
    });

    it('should not save screening data without student ID', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      saveActiveScreening('', mockScreeningData, ScreeningStep.Vitals);

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Attempted to save screening data without a student ID.'
      );
      consoleSpy.mockRestore();
    });

    it('should load active screening data', () => {
      const sessionData = {
        data: mockScreeningData,
        currentStep: ScreeningStep.Vitals,
        lastUpdated: '2023-01-01T00:00:00.000Z',
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData));

      const result = loadActiveScreening('student123');

      expect(localStorageMock.getItem).toHaveBeenCalledWith('screeningData_v2_student123');
      expect(result).toEqual({
        data: mockScreeningData,
        currentStep: ScreeningStep.Vitals,
      });
    });

    it('should return null when no screening data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadActiveScreening('student123');

      expect(result).toBeNull();
    });

    it('should clear active screening data', () => {
      localStorageMock.getItem.mockReturnValue('student123');

      clearActiveScreening('student123');

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('screeningData_v2_student123');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('activeScreeningStudentId_v2');
    });
  });

  describe('Clear All Data', () => {
    it('should clear all application data', () => {
      // Mock Object.keys to return some test keys
      const mockKeys = [
        'screeningData_v2_student1',
        'screeningData_v2_student2',
        'otherKey',
        'activeScreeningStudentId_v2',
        'appSettings_v2',
      ];
      Object.defineProperty(Object, 'keys', {
        value: vi.fn().mockReturnValue(mockKeys),
        configurable: true,
      });

      clearAllApplicationData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('screeningData_v2_student1');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('screeningData_v2_student2');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('activeScreeningStudentId_v2');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('appSettings_v2');
    });
  });
});
