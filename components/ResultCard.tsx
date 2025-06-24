
import React from 'react';

interface ResultCardProps {
  value: string;
  label: string;
  description?: string;
  bgColorClass?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ value, label, description, bgColorClass = "bg-gradient-to-br from-green-300 to-blue-300" }) => {
  return (
    <div className={`p-5 rounded-2xl my-4 text-center shadow-md ${bgColorClass}`}>
      <div className="text-4xl font-bold text-slate-800 mb-1">{value}</div>
      <div className="text-slate-700 text-sm font-medium">{label}</div>
      {description && <p className="text-xs text-slate-600 mt-1">{description}</p>}
    </div>
  );
};

export default ResultCard;