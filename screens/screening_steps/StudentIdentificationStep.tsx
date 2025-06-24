import React, { useEffect } from 'react';
import { useScreeningContext } from '../../contexts/ScreeningContext';
import { ScreeningStep } from '../../types';
import { STEP_ICONS } from '../../constants';

const StudentIdentificationStep: React.FC = () => {
  const { screeningData, nextStep, getStudentDisplayName } = useScreeningContext();
  const patient = screeningData.patientInfo;
  
  const studentDisplayName = getStudentDisplayName();
  const IconComponent = STEP_ICONS[ScreeningStep.StudentIdentification];

  return (
    <div className="p-4 bg-white rounded-lg shadow animate-fadeIn">
      <div className="flex items-center gap-3 mb-4 text-slate-700">
        {IconComponent && <IconComponent className="text-2xl text-brand-light-blue" />}
        <h2 className="text-xl font-semibold">Student Identification</h2>
      </div>
      <p className="text-slate-600 mb-2">
        Screening session started for:
      </p>
      <div className="bg-blue-50 p-4 rounded-md space-y-1.5 text-sm text-slate-700">
        <p><strong>Name:</strong> {patient.name?.value || 'N/A'}</p>
        <p><strong>ID:</strong> {patient.manualId || patient.qrId || 'N/A'}</p>
        <p><strong>Age:</strong> {patient.age?.value || 'N/A'}</p>
        <p><strong>Gender:</strong> {patient.gender?.value || 'N/A'}</p>
        {patient.preExistingConditions && (
          <p className="text-sm"><strong>Pre-existing Conditions:</strong> {patient.preExistingConditions}</p>
        )}
        {patient.reasonForManualStudentEntry && (
          <p className="text-xs text-orange-600 mt-1"><strong>Manual Entry Reason:</strong> {patient.reasonForManualStudentEntry}</p>
        )}
      </div>
      <button 
        onClick={nextStep} 
        className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-colors"
      >
        Proceed to Anthropometry
      </button>
    </div>
  );
};

export default StudentIdentificationStep;