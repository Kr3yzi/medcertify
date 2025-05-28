import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import ComponentCard from '../../components/common/ComponentCard';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import Alert from '../../components/ui/alert/Alert';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface RegisterForm {
  address: string;
  fullName: string;
  myKadNo: string;
  dob: string;
  gender: string;
  nationality: string;
}

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const nationalityOptions = [
  { value: 'malaysian', label: 'Malaysian' },
  { value: 'foreigner', label: 'Foreigner' },
];

const ReceptionistRegisterPatient: React.FC = () => {
  const { jwt } = useAuth();
  const [form, setForm] = useState<RegisterForm>({
    address: '',
    fullName: '',
    myKadNo: '',
    dob: '',
    gender: '',
    nationality: '',
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ variant: AlertVariant; title: string; message: string } | null>(null);
  const [errors, setErrors] = useState<Partial<RegisterForm>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name as keyof RegisterForm]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSelect = (name: keyof RegisterForm, value: string) => {
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Partial<RegisterForm> = {};
    if (!form.address.trim() || !/^0x[a-fA-F0-9]{40}$/.test(form.address.trim())) newErrors.address = 'Valid Ethereum address required';
    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name required';
    } else if (!/^[A-Za-z\s\-'.]+$/.test(form.fullName.trim())) {
      newErrors.fullName = 'Name can only contain letters, spaces, hyphens, apostrophes, and periods';
    }
    if (!form.myKadNo.trim()) newErrors.myKadNo = 'MyKad/Passport required';
    if (!form.dob) newErrors.dob = 'Date of birth required';
    if (!form.gender) newErrors.gender = 'Gender required';
    if (!form.nationality) newErrors.nationality = 'Nationality required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    if (!validate()) {
      setAlert({ variant: 'error', title: 'Validation Error', message: 'Please check the form for errors.' });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        address: form.address.trim(),
        demographics: {
          fullName: form.fullName.trim(),
          myKadNo: form.myKadNo.trim(),
          dob: form.dob,
          gender: form.gender,
          nationality: form.nationality,
        },
      };
      await api.post('/register-patient', payload, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setAlert({ variant: 'success', title: 'Success', message: 'Patient registered.' });
      setForm({ address: '', fullName: '', myKadNo: '', dob: '', gender: '', nationality: '' });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setAlert({ variant: 'error', title: 'Error', message: error.response?.data?.message || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComponentCard title="Register New Patient">
      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
        />
      )}
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="address">Ethereum Address</Label>
            <Input type="text" id="address" name="address" value={form.address} onChange={handleChange} error={!!errors.address} hint={errors.address} />
          </div>
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input type="text" id="fullName" name="fullName" value={form.fullName} onChange={handleChange} error={!!errors.fullName} hint={errors.fullName} />
          </div>
          <div>
            <Label htmlFor="myKadNo">MyKad/Passport No.</Label>
            <Input type="text" id="myKadNo" name="myKadNo" value={form.myKadNo} onChange={handleChange} error={!!errors.myKadNo} hint={errors.myKadNo} />
          </div>
          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <input
              type="date"
              id="dob"
              name="dob"
              className={`h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 ${errors.dob ? 'border-error-500' : ''}`}
              value={form.dob}
              onChange={e => handleSelect('dob', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.dob && <p className="mt-1.5 text-xs text-error-500">{errors.dob}</p>}
          </div>
          <div>
            <Label>Gender</Label>
            <Select options={genderOptions} value={form.gender} onChange={(v: string) => handleSelect('gender', v)} className={errors.gender ? 'border-error-500' : ''} />
            {errors.gender && <p className="mt-1.5 text-xs text-error-500">{errors.gender}</p>}
          </div>
          <div>
            <Label>Nationality</Label>
            <Select options={nationalityOptions} value={form.nationality} onChange={(v: string) => handleSelect('nationality', v)} className={errors.nationality ? 'border-error-500' : ''} />
            {errors.nationality && <p className="mt-1.5 text-xs text-error-500">{errors.nationality}</p>}
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register Patient'}
          </button>
        </div>
      </form>
    </ComponentCard>
  );
};

export default ReceptionistRegisterPatient;