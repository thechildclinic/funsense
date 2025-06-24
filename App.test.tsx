import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock the child components to avoid complex rendering
vi.mock('./screens/StartScreeningScreen', () => ({
  default: ({ onScreeningStart }: { onScreeningStart: () => void }) => (
    <div data-testid="start-screening-screen">
      <button onClick={onScreeningStart}>Start Screening</button>
    </div>
  ),
}));

vi.mock('./screens/ScreeningFlow', () => ({
  default: ({ onScreeningEnd }: { onScreeningEnd: () => void }) => (
    <div data-testid="screening-flow">
      <button onClick={onScreeningEnd}>End Screening</button>
    </div>
  ),
}));

vi.mock('./components/Header', () => ({
  default: ({ patient }: { patient: any }) => (
    <div data-testid="header">Header - {patient.name}</div>
  ),
}));

vi.mock('./components/SettingsModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? (
      <div data-testid="settings-modal">
        <button onClick={onClose}>Close Settings</button>
      </div>
    ) : null
  ),
}));

vi.mock('./contexts/ScreeningContext', () => ({
  ScreeningContextProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="screening-context-provider">{children}</div>
  ),
  useScreeningContext: () => ({
    screeningData: {
      patientInfo: {
        name: { value: 'Test Patient' },
        manualId: 'TEST123',
        qrId: '',
      },
    },
  }),
}));

vi.mock('./contexts/SettingsContext', () => ({
  SettingsContextProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="settings-context-provider">{children}</div>
  ),
}));

vi.mock('./services/localStorageService', () => ({
  getActiveScreeningStudentId: vi.fn(() => null),
  loadActiveScreening: vi.fn(() => null),
  setActiveScreeningStudentId: vi.fn(),
}));

describe('App Component', () => {
  it('renders the start screening screen by default', () => {
    render(<App />);
    
    expect(screen.getByTestId('start-screening-screen')).toBeInTheDocument();
    expect(screen.getByText('Start Screening')).toBeInTheDocument();
  });

  it('renders the header on start screen', () => {
    render(<App />);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders the settings button', () => {
    render(<App />);
    
    const settingsButton = screen.getByTitle('Open Settings');
    expect(settingsButton).toBeInTheDocument();
  });

  it('opens settings modal when settings button is clicked', () => {
    render(<App />);
    
    const settingsButton = screen.getByTitle('Open Settings');
    fireEvent.click(settingsButton);
    
    expect(screen.getByTestId('settings-modal')).toBeInTheDocument();
  });

  it('closes settings modal when close button is clicked', () => {
    render(<App />);
    
    // Open settings modal
    const settingsButton = screen.getByTitle('Open Settings');
    fireEvent.click(settingsButton);
    
    // Close settings modal
    const closeButton = screen.getByText('Close Settings');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument();
  });

  it('transitions to screening flow when screening starts', () => {
    render(<App />);
    
    const startButton = screen.getByText('Start Screening');
    fireEvent.click(startButton);
    
    expect(screen.getByTestId('screening-flow')).toBeInTheDocument();
    expect(screen.queryByTestId('start-screening-screen')).not.toBeInTheDocument();
  });

  it('returns to start screen when screening ends', () => {
    render(<App />);
    
    // Start screening
    const startButton = screen.getByText('Start Screening');
    fireEvent.click(startButton);
    
    // End screening
    const endButton = screen.getByText('End Screening');
    fireEvent.click(endButton);
    
    expect(screen.getByTestId('start-screening-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('screening-flow')).not.toBeInTheDocument();
  });

  it('renders the footer with copyright information', () => {
    render(<App />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
    expect(screen.getByText(/School Health Screening System/)).toBeInTheDocument();
  });

  it('wraps components with context providers', () => {
    render(<App />);
    
    expect(screen.getByTestId('settings-context-provider')).toBeInTheDocument();
    expect(screen.getByTestId('screening-context-provider')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(<App />);
    
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('max-w-md', 'mx-auto', 'p-2.5', 'min-h-screen', 'flex', 'flex-col');
  });
});
