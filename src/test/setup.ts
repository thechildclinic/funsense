import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.API_KEY = 'test-api-key';
process.env.GEMINI_API_KEY = 'test-api-key';

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock MediaDevices API for camera/microphone tests
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [
        {
          stop: vi.fn(),
          getSettings: () => ({ width: 640, height: 480 }),
        },
      ],
    }),
    enumerateDevices: vi.fn().mockResolvedValue([
      {
        deviceId: 'camera1',
        kind: 'videoinput',
        label: 'Test Camera',
        groupId: 'group1',
      },
      {
        deviceId: 'mic1',
        kind: 'audioinput',
        label: 'Test Microphone',
        groupId: 'group1',
      },
    ]),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'mock-url'),
});

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4),
  })),
  canvas: {
    toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
  },
})) as any;

// Mock HTMLVideoElement
Object.defineProperty(HTMLVideoElement.prototype, 'play', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

// Suppress console warnings in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = vi.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});
