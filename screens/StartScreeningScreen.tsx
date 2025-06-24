import React, { useState } from 'react';
import { useScreeningContext, ScreeningContextProvider } from '../contexts/ScreeningContext'; 
import { PatientInfo, ManualEntryField } from '../types';
import { APP_TITLE, DEFAULT_PATIENT_DATA } from '../constants';
import { FaQrcode, FaKeyboard } from 'react-icons/fa'; 
import { FaUserDoctor } from 'react-icons/fa6';


interface StartScreeningScreenProps {
  onScreeningStart: () => void;
}

const StartScreeningScreenInternal: React.FC<StartScreeningScreenProps> = ({ onScreeningStart }) => {
  const { setStudentInfo } = useScreeningContext(); 
  const [showManualForm, setShowManualForm] = useState(false);
  const [formData, setFormData] = useState<Partial<PatientInfo>>(DEFAULT_PATIENT_DATA);
  const [qrIdInput, setQrIdInput] = useState('');

  const handleInputChange = (
    field: keyof PatientInfo,
    newValue: string, 
    subField: 'value' | 'reason' = 'value' 
  ) => {
    setFormData(prev => {
      if (field === 'manualId' || field === 'qrId' || field === 'reasonForManualStudentEntry' || field === 'preExistingConditions') {
        return { ...prev, [field]: newValue };
      } 
      else if (field === 'name' || field === 'age' || field === 'gender') {
        const currentManualEntryField = prev[field] as ManualEntryField | undefined;
        return {
          ...prev,
          [field]: {
            ...(currentManualEntryField || { value: '' }), 
            [subField]: newValue
          }
        };
      }
      return prev;
    });
  };
  
  const handleStartWithQR = () => {
    if (!qrIdInput.trim()) {
      alert("Please enter a Student ID (simulating QR scan).");
      return;
    }
    const mockStudentData: PatientInfo = {
      qrId: qrIdInput,
      name: { value: `Student ${qrIdInput}` }, 
      age: { value: '10' }, 
      gender: { value: 'Unknown' }, 
      preExistingConditions: 'None reported via QR mock.', // Example
    };
    setStudentInfo(mockStudentData); 
    onScreeningStart();
  };

  const handleStartWithManualEntry = () => {
    if (!formData.name?.value?.trim() || !formData.manualId?.trim()) {
      alert("Please enter at least Student Name and Manual ID.");
      return;
    }
    setStudentInfo({
        manualId: formData.manualId, 
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        reasonForManualStudentEntry: formData.reasonForManualStudentEntry,
        preExistingConditions: formData.preExistingConditions,
    });
    onScreeningStart();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-150px)] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl text-center w-full max-w-md">
        <FaUserDoctor className="text-5xl text-brand-light-blue mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-700 mb-2">{APP_TITLE}</h1>
        <p className="text-sm text-slate-500 mb-6">
          Start a new student health screening session.
        </p>

        {!showManualForm ? (
          <div className="space-y-4">
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <label htmlFor="qrIdInput" className="block text-sm font-medium text-slate-700 mb-1">Student ID (Simulate QR Scan)</label>
                <input
                    type="text"
                    id="qrIdInput"
                    value={qrIdInput}
                    onChange={(e) => setQrIdInput(e.target.value)}
                    placeholder="Enter Student ID"
                    className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-brand-light-blue focus:border-brand-light-blue"
                />
                 <button
                    onClick={handleStartWithQR}
                    className="mt-3 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2"
                >
                    <FaQrcode /> Start with Student ID
                </button>
                <p className="text-xs text-gray-500 mt-2">Enter the student's ID to simulate scanning a QR code.</p>
            </div>
           
            <button
              onClick={() => setShowManualForm(true)}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2"
            >
              <FaKeyboard /> Enter Student Manually
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleStartWithManualEntry(); }} className="space-y-3 text-left">
            <div>
              <label htmlFor="manualId" className="block text-sm font-medium text-slate-700 mb-0.5">Manual Student ID*</label>
              <input type="text" id="manualId" value={formData.manualId || ''} onChange={(e) => handleInputChange('manualId', e.target.value)} placeholder="e.g., S12345" required className="w-full p-2 border border-gray-300 rounded-md"/>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-0.5">Student Name*</label>
              <input type="text" id="name" value={formData.name?.value || ''} onChange={(e) => handleInputChange('name', e.target.value, 'value')} placeholder="e.g., John Doe" required className="w-full p-2 border border-gray-300 rounded-md"/>
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-0.5">Age</label>
              <input type="text" id="age" value={formData.age?.value || ''} onChange={(e) => handleInputChange('age', e.target.value, 'value')} placeholder="e.g., 10" className="w-full p-2 border border-gray-300 rounded-md"/>
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-0.5">Gender</label>
              <select id="gender" value={formData.gender?.value || ''} onChange={(e) => handleInputChange('gender', e.target.value, 'value')} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="preExistingConditions" className="block text-sm font-medium text-slate-700 mb-0.5">Pre-existing Conditions / Known Diseases</label>
              <textarea id="preExistingConditions" value={formData.preExistingConditions || ''} onChange={(e) => handleInputChange('preExistingConditions', e.target.value)} placeholder="e.g., Asthma, Allergy to nuts" className="w-full p-2 border border-gray-300 rounded-md min-h-[60px] text-sm"></textarea>
            </div>
             <div>
              <label htmlFor="reasonForManualEntry" className="block text-sm font-medium text-slate-700 mb-0.5">Reason for Manual Student Entry</label>
              <input type="text" id="reasonForManualEntry" value={formData.reasonForManualStudentEntry || ''} onChange={(e) => handleInputChange('reasonForManualStudentEntry', e.target.value)} placeholder="e.g., QR Code damaged" className="w-full p-2 border border-gray-300 rounded-md"/>
            </div>
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-medium py-2.5 px-4 rounded-lg shadow transition-colors"
                >
                    Back
                </button>
                <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-brand-light-blue text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                    Start Screening
                </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const StartScreeningScreen: React.FC<StartScreeningScreenProps> = (props) => (
    // The ScreeningContextProvider here is for the initial data setting before the main flow's context takes over for that student.
    // This could be refactored if global context was managed differently, but for now it isolates context use.
    <ScreeningContextProvider> 
        <StartScreeningScreenInternal {...props} />
    </ScreeningContextProvider>
);

export default StartScreeningScreen;