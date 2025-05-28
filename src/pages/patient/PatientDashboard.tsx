import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import PatientRecordsTab from './PatientRecordsTab';
import PatientCertificatesTab from './PatientCertificatesTab';
import PageMeta from '../../components/common/PageMeta';

const TABS = [
  { key: 'records', label: 'Medical Records' },
  { key: 'certificates', label: 'Certificates' },
];

interface Demographics {
  fullName?: string;
  myKadNo?: string;
  dob?: string;
  gender?: string;
  nationality?: string;
}

interface TestResult {
  testType: string;
  status: string;
  resultCid?: string;
  orderedBy?: string;
  timestamp?: string;
}

interface Diagnosis {
  condition?: string;
  summary?: string;
  timestamp?: string;
  doctorAddress?: string;
}

interface PatientRecords {
  demographics?: Demographics;
  tests?: TestResult[];
  diagnosis?: Diagnosis[];
}

interface Certificate {
  _id: string;
  certType: string;
  certHash: string;
  ipfsCid?: string;
  issuedBy?: string;
  issuedAt?: string;
}

const PatientDashboard: React.FC = () => {
  const { primaryRole, isPatient, jwt, address } = useAuth() as { primaryRole: string; isPatient: boolean; jwt: string; address: string };
  const [tab, setTab] = useState('records');

  // State for records
  const [records, setRecords] = useState<PatientRecords | null>(null);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  // State for certificates
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [certsLoading, setCertsLoading] = useState(false);
  const [certsError, setCertsError] = useState<string | null>(null);

  // Fetch medical records on mount
  useEffect(() => {
  if (tab === 'records' && !records && jwt && address) {
     console.log("PatientDashboard API address:", address, "length:", address?.length);
      setRecordsLoading(true);
      setRecordsError(null);
      api.get(`/patients/${address}`, { headers: { Authorization: `Bearer ${jwt}` } })
        .then(res => setRecords(res.data.patient || res.data))
        .catch(err => setRecordsError(err.response?.data?.error || 'Failed to fetch records'))
        .finally(() => setRecordsLoading(false));
    }
  }, [tab, jwt, address, records]);

  // Fetch certificates on tab switch
  useEffect(() => {
    if (tab === 'certificates' && certs.length === 0 && jwt && address) {
      setCertsLoading(true);
      setCertsError(null);
      api.get(`/patients/${address}/certificates`, { headers: { Authorization: `Bearer ${jwt}` } })
        .then(res => setCerts(res.data.certificates || []))
        .catch(err => setCertsError(err.response?.data?.error || 'Failed to fetch certificates'))
        .finally(() => setCertsLoading(false));
    }
  }, [tab, jwt, certs.length, address]);

  if (primaryRole === 'patient' && !isPatient) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>You are not registered as a patient.</h2>
        <p>Please contact the clinic to be registered.</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="MedCertify | Patient Dashboard"
        description="Patient dashboard for MedCertify: view your medical records and certificates."
      />
      <div style={{ maxWidth: 800, margin: '2rem auto', padding: '1rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Patient Dashboard</h2>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '0.5rem 1.5rem',
                margin: '0 0.5rem',
                borderRadius: 6,
                border: tab === t.key ? '2px solid #007bff' : '1px solid #ccc',
                background: tab === t.key ? '#e6f0ff' : '#fff',
                fontWeight: tab === t.key ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 24 }}>
          {tab === 'records' && (
            <PatientRecordsTab records={records} loading={recordsLoading} error={recordsError} />
          )}
          {tab === 'certificates' && (
            <PatientCertificatesTab
              certs={certs}
              loading={certsLoading}
              error={certsError}
              demographics={records?.demographics}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default PatientDashboard; 