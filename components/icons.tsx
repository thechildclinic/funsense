
import React from 'react';
import {
  FaHeartbeat, FaWeight, FaChartLine, FaFileMedicalAlt, FaAssistiveListeningSystems, FaStethoscope,
  FaNotesMedical, FaTooth, FaCamera, FaChevronLeft, FaSpinner, FaExclamationTriangle,
  FaCheckCircle, FaUserMd, FaLightbulb, FaRulerCombined, FaMicrophone, FaEye, FaBrain,
  FaLungs, FaThermometerHalf, FaTint, FaQuestionCircle, FaTimesCircle, FaVolumeUp,
  FaChild, FaRulerVertical, FaBalanceScale, FaCameraRetro, FaHeadSideVirus, FaSmileBeam, FaMobileAlt,
  FaUserNurse, FaKeyboard, FaSave, FaEdit, FaUndo, FaPrint, FaShareSquare, FaRedo
} from 'react-icons/fa';
import { FaEarListen, FaQrcode, FaUserDoctor } from 'react-icons/fa6'; // Import FaEarListen from fa6
import { IconType } from 'react-icons';

interface IconProps {
  name: string;
  className?: string;
}

// Consider if this generic Icon component is still needed or if direct imports are cleaner
const iconMap: { [key: string]: IconType } = {
  heartbeat: FaHeartbeat,
  weight: FaWeight, // Used in old BMI
  balanceScale: FaBalanceScale, // New for weight step
  chartLine: FaChartLine,
  fileMedicalAlt: FaFileMedicalAlt,
  earListen: FaEarListen, 
  stethoscope: FaStethoscope,
  notesMedical: FaNotesMedical,
  tooth: FaTooth, // Used in old Dental
  smileBeam: FaSmileBeam, // New for dental step
  camera: FaCamera,
  cameraRetro: FaCameraRetro, // For specialized imaging step
  chevronLeft: FaChevronLeft,
  spinner: FaSpinner,
  exclamationTriangle: FaExclamationTriangle,
  checkCircle: FaCheckCircle,
  userMd: FaUserMd, // Old doctor icon
  userDoctor: FaUserDoctor, // New doctor icon from fa6
  userNurse: FaUserNurse, // For face vitals icon
  lightbulb: FaLightbulb,
  ruler: FaRulerCombined, // Generic ruler
  rulerVertical: FaRulerVertical, // For height step
  microphone: FaMicrophone,
  eye: FaEye,
  brain: FaBrain,
  lungs: FaLungs,
  thermometer: FaThermometerHalf,
  blood: FaTint, // For BP
  questionCircle: FaQuestionCircle,
  timesCircle: FaTimesCircle,
  volumeUp: FaVolumeUp,
  assistiveListening: FaAssistiveListeningSystems, // For ENT Nose
  headSideVirus: FaHeadSideVirus, // For ENT Throat
  child: FaChild, // For Anthropometry step
  mobileAlt: FaMobileAlt, // For Device Vitals step
  qrCode: FaQrcode, // For student ID step
  keyboard: FaKeyboard,
  save: FaSave,
  edit: FaEdit,
  undo: FaUndo,
  print: FaPrint,
  shareSquare: FaShareSquare,
  redo: FaRedo,
};

const Icon: React.FC<IconProps> = ({ name, className }) => {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    console.warn(`Icon not found for name: ${name}`);
    return <FaQuestionCircle className={className} />; 
  }
  return <IconComponent className={className} />;
};

// Re-export for direct use if preferred, add new ones
export {
  FaHeartbeat, FaWeight, FaChartLine, FaFileMedicalAlt, FaAssistiveListeningSystems, FaStethoscope,
  FaNotesMedical, FaTooth, FaCamera, FaChevronLeft, FaSpinner, FaExclamationTriangle,
  FaCheckCircle, FaUserMd, FaLightbulb, FaRulerCombined, FaMicrophone, FaEye, FaBrain,
  FaLungs, FaThermometerHalf, FaTint, FaQuestionCircle, FaTimesCircle, FaVolumeUp,
  FaEarListen, FaQrcode, FaUserDoctor,
  FaChild, FaRulerVertical, FaBalanceScale, FaCameraRetro, FaHeadSideVirus, FaSmileBeam, FaMobileAlt,
  FaUserNurse, FaKeyboard, FaSave, FaEdit, FaUndo, FaPrint, FaShareSquare, FaRedo
};
export default Icon; // Export default for generic use
