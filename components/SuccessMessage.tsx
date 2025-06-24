
import React from 'react';
import { FaCheckCircle } from './icons';

interface SuccessMessageProps {
  message: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="bg-green-100 text-green-700 p-4 rounded-xl my-4 text-center font-medium flex items-center justify-center gap-2">
      <FaCheckCircle />
      {message}
    </div>
  );
};

export default SuccessMessage;