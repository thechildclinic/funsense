
import React from 'react';
import { VitalSign } from '../types';

interface VitalCardProps {
  vital: VitalSign;
}

const VitalCard: React.FC<VitalCardProps> = ({ vital }) => {
  let statusColorClass = 'bg-green-500 text-green-500';
  if (vital.status === 'warning') statusColorClass = 'bg-yellow-500 text-yellow-500';
  if (vital.status === 'danger') statusColorClass = 'bg-red-500 text-red-500';

  return (
    <div className="bg-white p-4 rounded-xl text-center shadow-sm transition-all duration-300 ease-in-out relative hover:translate-y-[-3px] hover:shadow-md">
      <div className="flex items-center justify-center mb-2">
        <vital.icon className={`text-2xl mr-2 ${
          vital.status === 'normal' ? 'text-green-500' : 
          vital.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
        }`} />
        <span className="text-sm font-medium text-slate-600">{vital.name}</span>
      </div>
      <div className="text-3xl font-bold text-slate-700 mb-1">{vital.value}</div>
      <div className="text-xs text-gray-500 mb-2">{vital.unit}</div>
      <div className={`inline-block w-3 h-3 rounded-full ml-2 shadow-[0_0_5px_currentColor] ${statusColorClass}`}></div>
    </div>
  );
};

export default VitalCard;