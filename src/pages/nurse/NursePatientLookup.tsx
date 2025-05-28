import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import ComponentCard from '../../components/common/ComponentCard';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Alert from '../../components/ui/alert/Alert';
import { PatientDemographics, AlertState, ApiError } from './types';

interface PatientLookupProps {
  onPatientFound: (patient: PatientDemographics, address: string) => void;
}

const PatientLookup: React.FC<PatientLookupProps> = ({ onPatientFound }) => {
  const { jwt } = useAuth();
  const [address, setAddress] = useState('');
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFetchPatient = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAlert(null);
    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
      setAlert({ variant: 'error', title: 'Invalid Address', message: 'Please enter a valid Ethereum address.' });
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/patients/${address.trim()}`, { headers: { Authorization: `Bearer ${jwt}` } });
      const patientData = res.data.demographics || res.data.patient?.demographics;
      if (patientData) {
        onPatientFound(patientData, address.trim());
      }
    } catch (err) {
      const error = err as ApiError;
      setAlert({ 
        variant: 'error', 
        title: 'Fetch Failed', 
        message: error.response?.data?.error || 'Could not fetch patient data.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComponentCard title="Patient Lookup">
      {alert && <Alert variant={alert.variant} title={alert.title} message={alert.message} />}
      <form onSubmit={handleFetchPatient} className="space-y-4">
        <Label htmlFor="nurse-patient-address">Patient Ethereum Address</Label>
        <Input
          id="nurse-patient-address"
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="0x..."
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? 'Fetching...' : 'Fetch Patient'}
        </button>
      </form>
    </ComponentCard>
  );
};

export default PatientLookup; 