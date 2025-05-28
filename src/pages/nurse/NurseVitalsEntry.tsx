import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import ComponentCard from '../../components/common/ComponentCard';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Alert from '../../components/ui/alert/Alert';
import { Vitals, AlertState, ApiError } from './types';
import { format } from 'date-fns';

interface VitalsEntryProps {
  patientAddress: string;
  onVitalsRecorded: () => void;
}

const VitalsEntry: React.FC<VitalsEntryProps> = ({ patientAddress, onVitalsRecorded }) => {
  const { jwt } = useAuth();
  const [vitals, setVitals] = useState<Vitals>({
    height: '', weight: '', bmi: '', bloodPressure: '', heartRate: '', 
    temperature: '', oxygenSaturation: '', respiratoryRate: '', notes: ''
  });
  const [vitalsErrors, setVitalsErrors] = useState<Partial<Vitals>>({});
  const [vitalsLoading, setVitalsLoading] = useState(false);
  const [vitalsAlert, setVitalsAlert] = useState<AlertState | null>(null);
  const [latestVitals, setLatestVitals] = useState<any>(null);
  const [fetchingVitals, setFetchingVitals] = useState(false);

  const handleVitalsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVitals(v => ({ ...v, [name]: value }));
    if (vitalsErrors[name as keyof Vitals]) {
      setVitalsErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Automatically recalculate BMI when height or weight changes
  useEffect(() => {
    const h = parseFloat(vitals.height) / 100;
    const w = parseFloat(vitals.weight);
    if (!Number.isNaN(h) && !Number.isNaN(w) && h > 0) {
      setVitals(v => ({ ...v, bmi: (w / (h * h)).toFixed(1) }));
    } else {
      setVitals(v => ({ ...v, bmi: '' }));
    }
  }, [vitals.height, vitals.weight]);

  // Fetch latest vitals on mount or when patientAddress changes
  useEffect(() => {
    if (!patientAddress) return;
    setFetchingVitals(true);
    api.get(`/patients/${patientAddress}`)
      .then(res => {
        const vitalsArr = res.data.vitals || [];
        if (vitalsArr.length > 0) {
          const sorted = [...vitalsArr].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setLatestVitals(sorted[0]);
        } else {
          setLatestVitals(null);
        }
      })
      .catch(() => setLatestVitals(null))
      .finally(() => setFetchingVitals(false));
  }, [patientAddress]);

  const validateVitals = () => {
    const errors: Partial<Vitals> = {};
    if (!vitals.height || Number.isNaN(Number(vitals.height)) || Number(vitals.height) <= 0) {
      errors.height = 'Height must be a positive number';
    }
    if (!vitals.weight || Number.isNaN(Number(vitals.weight)) || Number(vitals.weight) <= 0) {
      errors.weight = 'Weight must be a positive number';
    }
    if (!vitals.bloodPressure.trim()) {
      errors.bloodPressure = 'Blood Pressure is required';
    }
    if (!vitals.heartRate || Number.isNaN(Number(vitals.heartRate)) || Number(vitals.heartRate) <= 0) {
      errors.heartRate = 'Heart Rate must be a positive number';
    }
    if (!vitals.temperature || Number.isNaN(Number(vitals.temperature))) {
      errors.temperature = 'Temperature must be a number';
    }
    if (!vitals.oxygenSaturation || Number.isNaN(Number(vitals.oxygenSaturation)) || Number(vitals.oxygenSaturation) < 0) {
      errors.oxygenSaturation = 'O₂ Saturation must be a positive number';
    }
    if (!vitals.respiratoryRate || Number.isNaN(Number(vitals.respiratoryRate)) || Number(vitals.respiratoryRate) < 0) {
      errors.respiratoryRate = 'Respiratory Rate must be a positive number';
    }
    return errors;
  };

  const handleVitalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVitalsAlert(null);
    const errors = validateVitals();
    setVitalsErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setVitalsLoading(true);
    try {
      const payload = {
        ...vitals,
        height: Number(vitals.height),
        weight: Number(vitals.weight),
        readbmi: Number(vitals.bmi),
        heartRate: Number(vitals.heartRate),
        temperature: Number(vitals.temperature),
        respiratoryRate: Number(vitals.respiratoryRate),
        oxygenSaturation: Number(vitals.oxygenSaturation)
      };
      await api.patch(`/patients/${patientAddress}/vitals`, payload, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setVitalsAlert({ variant: 'success', title: 'Success', message: 'Vitals recorded.' });
      onVitalsRecorded();
    } catch (err) {
      const error = err as ApiError;
      setVitalsAlert({
        variant: 'error',
        title: 'Error',
        message: error.response?.data?.error || 'Failed to record vitals.'
      });
    } finally {
      setVitalsLoading(false);
    }
  };

  return (
    <ComponentCard title="Vitals Entry">
      {fetchingVitals ? (
        <div className="mb-2 text-gray-500">Loading last vitals...</div>
      ) : latestVitals && latestVitals.timestamp ? (
        <div className="mb-2 text-gray-600 text-sm">
          Last recorded vitals: {format(new Date(latestVitals.timestamp), 'yyyy-MM-dd HH:mm')}
        </div>
      ) : null}
      {vitalsAlert && <Alert variant={vitalsAlert.variant} title={vitalsAlert.title} message={vitalsAlert.message} />}
      <form onSubmit={handleVitalsSubmit} className="space-y-4 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              type="number"
              id="height"
              name="height"
              value={vitals.height}
              onChange={e => { handleVitalsChange(e); }}
              placeholder="e.g., 170"
              error={!!vitalsErrors.height}
              hint={vitalsErrors.height}
            />
          </div>
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              type="number"
              id="weight"
              name="weight"
              value={vitals.weight}
              onChange={e => { handleVitalsChange(e); }}
              placeholder="e.g., 70"
              error={!!vitalsErrors.weight}
              hint={vitalsErrors.weight}
            />
          </div>
          <div>
            <Label htmlFor="nurseBMI">BMI</Label>
            <Input
              type="text"
              id="nurseBMI"
              name="bmi"
              value={vitals.bmi}
              disabled
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
            <Input
              type="text"
              id="bloodPressure"
              name="bloodPressure"
              value={vitals.bloodPressure}
              onChange={handleVitalsChange}
              placeholder="e.g., 120/80"
              error={!!vitalsErrors.bloodPressure}
              hint={vitalsErrors.bloodPressure}
            />
          </div>
          <div>
            <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
            <Input
              type="number"
              id="heartRate"
              name="heartRate"
              value={vitals.heartRate}
              onChange={handleVitalsChange}
              placeholder="e.g., 72"
              error={!!vitalsErrors.heartRate}
              hint={vitalsErrors.heartRate}
            />
          </div>
          <div>
            <Label htmlFor="temperature">Temperature (°C)</Label>
            <Input
              type="number"
              id="temperature"
              name="temperature"
              value={vitals.temperature}
              onChange={handleVitalsChange}
              placeholder="e.g., 37.0"
              step={0.1}
              error={!!vitalsErrors.temperature}
              hint={vitalsErrors.temperature}
            />
          </div>
          <div>
            <Label htmlFor="oxygenSaturation">O₂ Saturation (%)</Label>
            <Input
              type="number"
              id="oxygenSaturation"
              name="oxygenSaturation"
              value={vitals.oxygenSaturation}
              onChange={handleVitalsChange}
              placeholder="e.g., 98"
              error={!!vitalsErrors.oxygenSaturation}
              hint={vitalsErrors.oxygenSaturation}
            />
          </div>
          <div>
            <Label htmlFor="respiratoryRate">Respiratory Rate (breaths/min)</Label>
            <Input
              type="number"
              id="respiratoryRate"
              name="respiratoryRate"
              value={vitals.respiratoryRate}
              onChange={handleVitalsChange}
              placeholder="e.g., 16"
              error={!!vitalsErrors.respiratoryRate}
              hint={vitalsErrors.respiratoryRate}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <textarea
            id="notes"
            name="notes"
            value={vitals.notes}
            onChange={handleVitalsChange}
            className="w-full rounded-lg border border-gray-300 p-2"
            rows={3}
            placeholder="Enter any additional observations or notes..."
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={vitalsLoading}
        >
          {vitalsLoading ? 'Recording...' : 'Record Vitals'}
        </button>
      </form>
    </ComponentCard>
  );
};

export default VitalsEntry; 