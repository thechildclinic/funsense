
import React from 'react';
import { FaSpinner } from './icons';

interface LoadingSpinnerProps {
  text?: string;
  size?: string; // e.g., 'text-2xl', 'text-4xl'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = "Loading...", size = "text-3xl" }) => {
  return (
    <div className="flex flex-col items-center justify-center p-7 text-gray-500">
      <FaSpinner className={`animate-spin ${size} mb-3 text-brand-light-blue`} />
      <p className="text-sm">{text}</p>
    </div>
  );
};

export default LoadingSpinner;