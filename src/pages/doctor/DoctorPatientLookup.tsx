import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import ComponentCard from '../../components/common/ComponentCard';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Alert from '../../components/ui/alert/Alert';

interface PatientLookupProps {
  onFetchPatient: (patient: any, address: string) => void;
}

const DoctorPatientLookup: React.FC<DoctorPatientLookupProps> = ({ onFetchPatient }) => {
  const { jwt } = useAuth();
  const [address, setAddress] = useState('');
  const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null);
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
      // For doctor, backend returns { patient: { ... } }
      const patientData = res.data.patient || res.data;
      if (patientData) {
        onFetchPatient(patientData, address.trim());
      } else {
        setAlert({ variant: 'error', title: 'Not Found', message: 'Patient not found.' });
      }
    } catch (err: any) {
      setAlert({ 
        variant: 'error', 
        title: 'Fetch Failed', 
        message: err.response?.data?.error || 'Could not fetch patient data.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComponentCard title="Patient Lookup">
      {alert && <Alert variant={alert.variant} title={alert.title} message={alert.message} />}
      <form onSubmit={handleFetchPatient} className="space-y-4">
        <Label htmlFor="doctor-patient-address">Patient Ethereum Address</Label>
        <Input
          id="doctor-patient-address"
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

export default DoctorPatientLookup; 