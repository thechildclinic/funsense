import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from './Header';

describe('Header Component', () => {
  const mockPatient = {
    name: 'John Doe',
    id: 'STU123',
    age: 10,
    gender: 'Male' as const,
  };

  it('renders the app title', () => {
    render(<Header patient={mockPatient} />);
    
    expect(screen.getByText('School Health Screening System')).toBeInTheDocument();
  });

  it('displays patient information when provided', () => {
    render(<Header patient={mockPatient} />);
    
    expect(screen.getByText(/Current Student:/)).toBeInTheDocument();
    expect(screen.getByText(/John Doe \(ID: STU123\)/)).toBeInTheDocument();
    expect(screen.getByText(/Age: 10/)).toBeInTheDocument();
    expect(screen.getByText(/Gender: Male/)).toBeInTheDocument();
  });

  it('does not display patient info when patient data is N/A', () => {
    const naPatient = {
      name: 'N/A',
      id: 'N/A',
    };
    
    render(<Header patient={naPatient} />);
    
    expect(screen.queryByText(/Current Student:/)).not.toBeInTheDocument();
  });

  it('displays partial patient information when some fields are missing', () => {
    const partialPatient = {
      name: 'Jane Smith',
      id: 'STU456',
    };
    
    render(<Header patient={partialPatient} />);
    
    expect(screen.getByText(/Current Student:/)).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith \(ID: STU456\)/)).toBeInTheDocument();
    expect(screen.queryByText(/Age:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Gender:/)).not.toBeInTheDocument();
  });

  it('renders with minimal patient data', () => {
    const minimalPatient = {
      name: 'Test Student',
      id: 'TEST001',
    };
    
    render(<Header patient={minimalPatient} />);
    
    expect(screen.getByText('School Health Screening System')).toBeInTheDocument();
    expect(screen.getByText(/Test Student \(ID: TEST001\)/)).toBeInTheDocument();
  });

  it('handles empty patient name gracefully', () => {
    const emptyNamePatient = {
      name: '',
      id: 'STU789',
    };
    
    render(<Header patient={emptyNamePatient} />);
    
    expect(screen.getByText('School Health Screening System')).toBeInTheDocument();
    expect(screen.getByText(/Current Student:/)).toBeInTheDocument();
  });

  it('applies correct CSS classes for styling', () => {
    const { container } = render(<Header patient={mockPatient} />);
    
    const headerDiv = container.firstChild as HTMLElement;
    expect(headerDiv).toHaveClass('bg-white/95', 'backdrop-blur-md', 'rounded-xl');
  });

  it('renders the doctor icon', () => {
    render(<Header patient={mockPatient} />);
    
    // The FaUserDoctor icon should be present
    const titleElement = screen.getByText('School Health Screening System');
    expect(titleElement.parentElement).toContainHTML('svg');
  });
});
