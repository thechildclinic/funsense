import React, { useState, useEffect } from 'react';
import { 
  FaDatabase, 
  FaUpload, 
  FaDownload, 
  FaTrash, 
  FaEye, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaSync,
  FaCog
} from 'react-icons/fa';
import { 
  getScreeningList, 
  getScreeningData, 
  deleteScreeningData, 
  getCompletedScreenings,
  ScreeningListItem,
  StoredScreeningData
} from '../services/screeningStorageService';
import { 
  uploadScreeningToEMR, 
  batchUploadToEMR, 
  testEMRConnection,
  EMRConfig,
  UploadResult
} from '../services/emrIntegrationService';

interface ScreeningDataManagerProps {
  onLoadScreening?: (studentId: string) => void;
  onClose?: () => void;
}

const ScreeningDataManager: React.FC<ScreeningDataManagerProps> = ({ 
  onLoadScreening, 
  onClose 
}) => {
  const [screenings, setScreenings] = useState<ScreeningListItem[]>([]);
  const [selectedScreening, setSelectedScreening] = useState<StoredScreeningData | null>(null);
  const [showEMRConfig, setShowEMRConfig] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0 });
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  
  // EMR Configuration
  const [emrConfig, setEmrConfig] = useState<EMRConfig>({
    endpoint: '',
    format: 'json',
    authType: 'none'
  });

  useEffect(() => {
    loadScreenings();
  }, []);

  const loadScreenings = () => {
    const list = getScreeningList();
    setScreenings(list);
  };

  const handleViewScreening = (studentId: string) => {
    const data = getScreeningData(studentId);
    setSelectedScreening(data);
  };

  const handleLoadScreening = (studentId: string) => {
    if (onLoadScreening) {
      onLoadScreening(studentId);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleDeleteScreening = (studentId: string) => {
    if (confirm(`Are you sure you want to delete screening data for student ${studentId}?`)) {
      deleteScreeningData(studentId);
      loadScreenings();
      if (selectedScreening?.studentId === studentId) {
        setSelectedScreening(null);
      }
    }
  };

  const handleUploadSingle = async (studentId: string) => {
    const data = getScreeningData(studentId);
    if (!data) return;

    setUploading(true);
    try {
      const result = await uploadScreeningToEMR(data, emrConfig);
      setUploadResults([result]);
      if (result.success) {
        loadScreenings(); // Refresh to show updated status
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleBatchUpload = async () => {
    const completedScreenings = getCompletedScreenings();
    if (completedScreenings.length === 0) {
      alert('No completed screenings available for upload.');
      return;
    }

    setUploading(true);
    setUploadProgress({ completed: 0, total: completedScreenings.length });
    
    try {
      const result = await batchUploadToEMR(
        completedScreenings, 
        emrConfig,
        (completed, total) => setUploadProgress({ completed, total })
      );
      
      setUploadResults(result.results);
      loadScreenings(); // Refresh to show updated statuses
    } catch (error) {
      console.error('Batch upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress({ completed: 0, total: 0 });
    }
  };

  const handleTestConnection = async () => {
    try {
      const isConnected = await testEMRConnection(emrConfig);
      alert(isConnected ? 'EMR connection successful!' : 'EMR connection failed. Please check your configuration.');
    } catch (error) {
      alert('EMR connection test failed.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'uploaded':
        return <FaUpload className="text-blue-500" />;
      case 'in_progress':
      default:
        return <FaClock className="text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'uploaded':
        return 'Uploaded to EMR';
      case 'in_progress':
      default:
        return 'In Progress';
    }
  };

  const exportScreeningData = (screening: StoredScreeningData) => {
    const dataStr = JSON.stringify(screening, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `screening_${screening.studentId}_${screening.createdAt.split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FaDatabase className="text-2xl text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Screening Data Manager</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEMRConfig(!showEMRConfig)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FaCog /> EMR Config
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Screenings List */}
          <div className="w-1/2 border-r">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">Stored Screenings ({screenings.length})</h3>
                <div className="flex gap-2">
                  <button
                    onClick={loadScreenings}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Refresh"
                  >
                    <FaSync />
                  </button>
                  <button
                    onClick={handleBatchUpload}
                    disabled={uploading || !emrConfig.endpoint}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    <FaUpload /> Batch Upload
                  </button>
                </div>
              </div>
              
              {uploading && uploadProgress.total > 0 && (
                <div className="mt-2">
                  <div className="text-sm text-gray-600">
                    Uploading: {uploadProgress.completed}/{uploadProgress.total}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(uploadProgress.completed / uploadProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="overflow-y-auto h-full">
              {screenings.map((screening) => (
                <div
                  key={screening.studentId}
                  className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewScreening(screening.studentId)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">
                        {screening.studentName || screening.studentId}
                      </div>
                      <div className="text-sm text-gray-600">
                        ID: {screening.studentId}
                      </div>
                      <div className="text-xs text-gray-500">
                        Updated: {new Date(screening.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Steps: {screening.completedSteps.join(', ')}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 text-sm">
                        {getStatusIcon(screening.status)}
                        {getStatusText(screening.status)}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadScreening(screening.studentId);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Load Screening"
                        >
                          <FaEye className="text-xs" />
                        </button>
                        {screening.status === 'completed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUploadSingle(screening.studentId);
                            }}
                            disabled={uploading || !emrConfig.endpoint}
                            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                            title="Upload to EMR"
                          >
                            <FaUpload className="text-xs" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteScreening(screening.studentId);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {screenings.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <FaDatabase className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>No screening data stored locally</p>
                </div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="w-1/2 flex flex-col">
            {showEMRConfig ? (
              <div className="p-4 h-full overflow-y-auto">
                <h3 className="font-semibold text-gray-700 mb-4">EMR Configuration</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      EMR Endpoint URL
                    </label>
                    <input
                      type="url"
                      value={emrConfig.endpoint}
                      onChange={(e) => setEmrConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="https://your-emr-system.com/api/screenings"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Format
                    </label>
                    <select
                      value={emrConfig.format}
                      onChange={(e) => setEmrConfig(prev => ({ ...prev, format: e.target.value as EMRConfig['format'] }))}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="json">JSON</option>
                      <option value="fhir">FHIR</option>
                      <option value="hl7">HL7</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Authentication Type
                    </label>
                    <select
                      value={emrConfig.authType}
                      onChange={(e) => setEmrConfig(prev => ({ ...prev, authType: e.target.value as EMRConfig['authType'] }))}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="none">None</option>
                      <option value="bearer">Bearer Token</option>
                      <option value="apikey">API Key</option>
                      <option value="basic">Basic Auth</option>
                    </select>
                  </div>

                  {(emrConfig.authType === 'bearer' || emrConfig.authType === 'apikey') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {emrConfig.authType === 'bearer' ? 'Bearer Token' : 'API Key'}
                      </label>
                      <input
                        type="password"
                        value={emrConfig.apiKey || ''}
                        onChange={(e) => setEmrConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder="Enter your API key or token"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleTestConnection}
                      disabled={!emrConfig.endpoint}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <FaSync /> Test Connection
                    </button>
                  </div>
                </div>

                {uploadResults.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-2">Upload Results</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {uploadResults.map((result, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded text-sm ${
                            result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                          }`}
                        >
                          <div className="font-medium">{result.studentId}</div>
                          <div>{result.message}</div>
                          {result.error && <div className="text-xs">{result.error}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : selectedScreening ? (
              <div className="p-4 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">
                    Screening Details: {selectedScreening.patientInfo?.name?.value || selectedScreening.studentId}
                  </h3>
                  <button
                    onClick={() => exportScreeningData(selectedScreening)}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <FaDownload /> Export
                  </button>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <strong>Student ID:</strong> {selectedScreening.studentId}
                  </div>
                  <div>
                    <strong>Status:</strong> {getStatusText(selectedScreening.status)}
                  </div>
                  <div>
                    <strong>Created:</strong> {new Date(selectedScreening.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <strong>Last Updated:</strong> {new Date(selectedScreening.updatedAt).toLocaleString()}
                  </div>
                  <div>
                    <strong>Version:</strong> {selectedScreening.version}
                  </div>

                  {selectedScreening.patientInfo && (
                    <div>
                      <strong>Patient Info:</strong>
                      <div className="ml-4 mt-1">
                        <div>Name: {selectedScreening.patientInfo.name?.value || 'N/A'}</div>
                        <div>Age: {selectedScreening.patientInfo.age?.value || 'N/A'}</div>
                        <div>Gender: {selectedScreening.patientInfo.gender?.value || 'N/A'}</div>
                      </div>
                    </div>
                  )}

                  {selectedScreening.anthropometry && (
                    <div>
                      <strong>Anthropometry:</strong>
                      <div className="ml-4 mt-1">
                        <div>Height: {selectedScreening.anthropometry.height?.value || 'N/A'} cm</div>
                        <div>Weight: {selectedScreening.anthropometry.weight?.value || 'N/A'} kg</div>
                        <div>BMI: {selectedScreening.anthropometry.bmi?.value || 'N/A'}</div>
                      </div>
                    </div>
                  )}

                  {selectedScreening.deviceVitals && (
                    <div>
                      <strong>Vital Signs:</strong>
                      <div className="ml-4 mt-1">
                        {selectedScreening.deviceVitals.bloodPressure && (
                          <div>BP: {selectedScreening.deviceVitals.bloodPressure.systolic}/{selectedScreening.deviceVitals.bloodPressure.diastolic} mmHg</div>
                        )}
                        {selectedScreening.deviceVitals.spO2?.value && (
                          <div>SpO2: {selectedScreening.deviceVitals.spO2.value}%</div>
                        )}
                        {selectedScreening.deviceVitals.temperature?.value && (
                          <div>Temperature: {selectedScreening.deviceVitals.temperature.value}°C</div>
                        )}
                        {selectedScreening.deviceVitals.hemoglobin?.value && (
                          <div>Hemoglobin: {selectedScreening.deviceVitals.hemoglobin.value} g/dL</div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedScreening.dermatologyAssessment && Object.keys(selectedScreening.dermatologyAssessment).length > 0 && (
                    <div>
                      <strong>Dermatology Assessment:</strong>
                      <div className="ml-4 mt-1">
                        {Object.entries(selectedScreening.dermatologyAssessment).map(([area, assessment]) => (
                          <div key={area} className="mb-2">
                            <div className="font-medium">{assessment.area}:</div>
                            <div className="text-xs text-gray-600 ml-2">{assessment.analysis?.substring(0, 100)}...</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">
                <div>
                  <FaEye className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>Select a screening to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreeningDataManager;
