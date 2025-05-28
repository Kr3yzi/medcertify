import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/ui/alert/Alert';
import PatientLookup from './NursePatientLookup';
import VitalsEntry from './NurseVitalsEntry';
import TestResults from './NurseTestResults';
import { PatientDemographics } from './types';
import { FaUserCircle } from "react-icons/fa";
import PageMeta from '../../components/common/PageMeta';

const NurseDashboard: React.FC = () => {
  const { primaryRole } = useAuth();
  const [tab, setTab] = useState<'lookup' | 'vitals' | 'tests'>('lookup');
  const [patientAddress, setPatientAddress] = useState('');
  const [patient, setPatient] = useState<PatientDemographics | null>(null);

  const handlePatientFound = (patientData: PatientDemographics, address: string) => {
    setPatient(patientData);
    setPatientAddress(address);
  };

  const demographicFields = [
    { key: 'dob', label: 'DOB' },
    { key: 'gender', label: 'Gender' },
    { key: 'nationality', label: 'Nationality' },
  ];

    return (
    <>
      <PageMeta
        title="MedCertify | Nurse Dashboard"
        description="Nurse dashboard for MedCertify: manage patient vitals, test results, and records."
        />
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Nurse Dashboard</h2>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('lookup')}
            className={`px-4 py-2 rounded ${tab === 'lookup' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          Patient Lookup
        </button>
        <button
          onClick={() => setTab('vitals')}
            className={`px-4 py-2 rounded ${tab === 'vitals' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          disabled={!patientAddress}
        >
          Vitals Entry
        </button>
        <button
          onClick={() => setTab('tests')}
            className={`px-4 py-2 rounded ${tab === 'tests' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          disabled={!patientAddress}
        >
          Test/Vaccine Results
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Demographic Card */}
        {patient && (
          <div className="bg-white rounded-lg shadow p-4 w-full lg:w-1/3">
            <div className="flex items-center mb-4">
              <FaUserCircle className="text-4xl text-gray-400 mr-3" />
              <div>
                <div className="text-lg font-semibold">{patient.fullName}</div>
                <div className="text-xs text-gray-500">Patient Information</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {demographicFields.map(field => (
                <React.Fragment key={field.key}>
                  <div className="font-medium text-gray-600">{field.label}:</div>
                  <div>{(patient as Partial<PatientDemographics>)[field.key as keyof PatientDemographics] || <span className="text-gray-400 italic">-</span>}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="w-full lg:w-2/3">
          {tab === 'lookup' && (
            <PatientLookup onPatientFound={handlePatientFound} />
          )}

          {tab === 'vitals' && patientAddress && (
            <VitalsEntry
              patientAddress={patientAddress}
              onVitalsRecorded={() => {/* Optionally refresh patient data */}}
            />
          )}

          {tab === 'tests' && patientAddress && (
            <TestResults patientAddress={patientAddress} />
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default NurseDashboard; 