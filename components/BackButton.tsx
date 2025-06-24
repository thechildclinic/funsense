
import React from 'react';
import { FaChevronLeft } from './icons';

interface BackButtonProps {
  onClick: () => void;
  text?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, text = "Back to Home" }) => {
  return (
    <button
      onClick={onClick}
      className="bg-gray-500 hover:bg-gray-600 text-white border-none rounded-full py-2.5 px-5 text-sm cursor-pointer mb-5 flex items-center justify-center gap-2 transition-all duration-200 ease-in-out w-full sm:w-auto"
    >
      <FaChevronLeft />
      {text}
    </button>
  );
};

export default BackButton;