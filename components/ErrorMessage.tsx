
import React from 'react';
import { FaExclamationTriangle } from './icons';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="bg-red-100 text-red-700 p-4 rounded-xl my-4 text-center font-medium flex items-center justify-center gap-2">
      <FaExclamationTriangle />
      {message}
    </div>
  );
};

export default ErrorMessage;