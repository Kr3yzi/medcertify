import React, { useState } from 'react';
import DoctorPatientLookup from './DoctorPatientLookup';
import DoctorTestReviewTab from './DoctorTestReviewTab';
import { FaUserCircle } from 'react-icons/fa';
import PageMeta from '../../components/common/PageMeta';

interface Patient {
  address: string;
  demographics: {
    fullName: string;
    myKadNo: string;
    dob: string;
    gender: string;
    nationality: string;
    purpose?: string;
    [key: string]: unknown;
  };
  tests?: unknown[];
  vitals?: unknown[];
  [key: string]: unknown;
}

interface Vitals {
  height?: string;
  weight?: string;
  bmi?: string;
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  oxygenSaturation?: string;
  respiratoryRate?: string;
  notes?: string;
  timestamp?: string;
}

const DoctorDashboard: React.FC = () => {
  const [tab, setTab] = useState<'lookup' | 'tests'>('lookup');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientAddress, setPatientAddress] = useState('');

  // Patient lookup handler (like nurse dashboard)
  const handlePatientFound = (patientData: Patient, address: string) => {
    setPatient(patientData);
    setPatientAddress(address);
  };

  // Demographic fields for sidebar
  const demographicFields = [
    { key: 'dob', label: 'DOB' },
    { key: 'gender', label: 'Gender' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'purpose', label: 'Purpose' },
  ];

  return (
    <>
      <PageMeta
        title="MedCertify | Doctor Dashboard"
        description="Doctor dashboard for MedCertify: access patient records, review tests, and issue certificates."
      />
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Doctor Dashboard</h2>
        <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setTab('lookup')}
            className={`px-4 py-2 rounded ${tab === 'lookup' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          Patient Lookup
        </button>
        <button
          onClick={() => setTab('tests')}
            className={`px-4 py-2 rounded ${tab === 'tests' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          disabled={!patientAddress}
        >
          Test/Vaccine Review
        </button>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Demographic Card */}
        {patient && (
          <div className="bg-white rounded-lg shadow p-4 w-full lg:w-1/3">
            <div className="flex items-center mb-4">
              <FaUserCircle className="text-4xl text-gray-400 mr-3" />
              <div>
                <div className="text-lg font-semibold">{patient.demographics?.fullName || '-'}</div>
                <div className="text-xs text-gray-500">Patient Information</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
              {demographicFields.map(field => (
                <React.Fragment key={field.key}>
                  <div className="font-medium text-gray-600">{field.label}:</div>
                    <div className="text-gray-900">{patient.demographics?.[field.key] as string || <span className="text-gray-400 italic">-</span>}</div>
                </React.Fragment>
              ))}
            </div>
            {/* Latest Vitals */}
            {patient.vitals && patient.vitals.length > 0 && (() => {
              const latestVitals = [...patient.vitals].sort((a, b) => new Date((a as Vitals).timestamp as string).getTime() - new Date((b as Vitals).timestamp as string).getTime())[0] as Vitals;
              return (
                <div className="mt-4">
                  <div className="font-semibold text-gray-700 mb-2">Latest Vitals</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div><span className="font-medium">Height:</span> <span className="text-gray-900">{latestVitals.height || '-'}</span></div>
                    <div><span className="font-medium">Weight:</span> <span className="text-gray-900">{latestVitals.weight || '-'}</span></div>
                    <div><span className="font-medium">BMI:</span> <span className="text-gray-900">{latestVitals.bmi || '-'}</span></div>
                    <div><span className="font-medium">Blood Pressure:</span> <span className="text-gray-900">{latestVitals.bloodPressure || '-'}</span></div>
                    <div><span className="font-medium">Heart Rate:</span> <span className="text-gray-900">{latestVitals.heartRate || '-'}</span></div>
                    <div><span className="font-medium">Temperature:</span> <span className="text-gray-900">{latestVitals.temperature || '-'}</span></div>
                    <div><span className="font-medium">O₂ Saturation:</span> <span className="text-gray-900">{latestVitals.oxygenSaturation || '-'}</span></div>
                    <div><span className="font-medium">Respiratory Rate:</span> <span className="text-gray-900">{latestVitals.respiratoryRate || '-'}</span></div>
                    <div className="col-span-2"><span className="font-medium">Notes:</span> <span className="text-gray-900">{latestVitals.notes || '-'}</span></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Recorded: {latestVitals.timestamp ? new Date(latestVitals.timestamp).toLocaleString() : '-'}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
        {/* Main Content */}
        <div className="w-full lg:w-2/3">
          {tab === 'lookup' && (
            <DoctorPatientLookup onFetchPatient={handlePatientFound} />
          )}
          {tab === 'tests' && patientAddress && patient && (
            <DoctorTestReviewTab tests={patient.tests || []} patientAddress={patientAddress} />
          )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard; 