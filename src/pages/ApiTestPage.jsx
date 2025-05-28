// @ts-nocheck
import React, { useState } from 'react';
import api from '../api';
import PrivateRoute from '../components/PrivateRoute';
import { useAuth } from '../context/AuthContext';
import Label from '../components/form/Label';
import Input from '../components/form/input/InputField';
import Select from '../components/form/Select';
import DatePicker from '../components/form/date-picker';
import Alert from '../components/ui/alert/Alert';
import ComponentCard from '../components/common/ComponentCard';

// --- TestFormRenderer: Dynamic form for each test/vaccine type ---
function TestFormRenderer({ test, onSubmit, loading, alert, onFieldChange }) {
  // Initialize form state from props only once (on mount)
  const [form, setForm] = React.useState({ ...test });
  // No useEffect needed!
  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (onFieldChange) onFieldChange(field, value);
  };
  // Helper for select
  const select = (label, field, options) => (
    <div className="mb-2">
      <Label>{label}</Label>
      <Select
        options={options.map(o => typeof o === 'string' ? { value: o, label: o.charAt(0).toUpperCase() + o.slice(1) } : o)}
        value={form[field] || ''}
        onChange={v => handleChange(field, v)}
        placeholder={`Select ${label}`}
      />
    </div>
  );
  // Helper for input
  const input = (label, field, type = 'text', extra = {}) => (
    <div className="mb-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={form[field] || ''}
        onChange={e => handleChange(field, e.target.value)}
        {...extra}
      />
    </div>
  );
  // Helper for textarea
  const textarea = (label, field) => (
    <div className="mb-2">
      <Label>{label}</Label>
      <textarea
        className="w-full rounded-lg border border-gray-300 p-2"
        rows={2}
        value={form[field] || ''}
        onChange={e => handleChange(field, e.target.value)}
      />
    </div>
  );
  // Helper for date
  const date = (label, field) => (
    <div className="mb-2">
      <Label>{label}</Label>
      <Input
        type="date"
        value={form[field] || ''}
        onChange={e => handleChange(field, e.target.value)}
      />
    </div>
  );
  // Helper for number
  const number = (label, field, extra = {}) => input(label, field, 'number', extra);

  let fields = null;
  switch (test.testType) {
    case 'Full Blood Count (FBC)':
      fields = <>
        {number('Hemoglobin (g/dL)', 'hemoglobin')}
        {number('WBC (10⁹/L)', 'wbc')}
        {number('Platelets (10⁹/L)', 'platelets')}
        {textarea('Notes', 'notes')}
        {textarea('Summary/Result', 'summary')}
      </>;
      break;
    case 'Urinalysis':
      fields = <>
        {select('Color', 'color', ['clear','cloudy','yellow','amber'])}
        {number('pH', 'ph')}
        {select('Glucose', 'glucose', ['positive','negative'])}
        {select('Protein', 'protein', ['positive','negative'])}
        {select('Ketones', 'ketones', ['positive','negative'])}
        {textarea('Notes', 'notes')}
      </>;
      break;
    case 'Blood Sugar Test':
      fields = <>
        {number('Fasting Glucose (mmol/L)', 'fastingGlucose')}
        {input('Time Taken', 'timeTaken', 'datetime-local')}
        {textarea('Notes', 'notes')}
      </>;
      break;
    case 'Cholesterol Test':
      fields = <>
        {number('Total Cholesterol (mmol/L)', 'totalCholesterol')}
        {number('LDL', 'ldl')}
        {number('HDL', 'hdl')}
        {number('Triglycerides', 'triglycerides')}
        {textarea('Notes', 'notes')}
      </>;
      break;
    case 'HIV Test':
      fields = <>
        {select('Result', 'result', [
          { value: 'Reactive', label: 'Reactive' },
          { value: 'Non-reactive', label: 'Non-reactive' }
        ])}
        {textarea('Notes', 'notes')}
      </>;
      break;
    case 'Hepatitis B Test':
      fields = <>
        {select('HBsAg', 'hbsag', ['Positive','Negative'])}
        {number('Anti-HBs (IU/L)', 'antiHbs')}
        {textarea('Notes', 'notes')}
      </>;
      break;
    case 'TB Test (Mantoux)':
      fields = <>
        {number('Induration (mm)', 'induration')}
        {select('Result', 'result', ['Positive','Negative'])}
        {textarea('Notes', 'notes')}
      </>;
      break;
    case 'Dengue Test':
      fields = <>
        {select('NS1 Antigen', 'ns1', ['Positive','Negative'])}
        {select('IgM Antibody', 'igm', ['Positive','Negative'])}
        {select('IgG Antibody', 'igg', ['Positive','Negative'])}
        {textarea('Notes', 'notes')}
      </>;
      break;
    case 'ECG':
      fields = <>
        {input('Heart Rhythm', 'heartRhythm')}
        {textarea('Abnormal Findings', 'abnormalFindings')}
        {input('ECG Image CID', 'ecgCid')}
        {textarea('Notes', 'notes')}
      </>;
      break;
    case 'Chest X-ray':
      fields = <>
        {textarea('Radiologist Notes', 'radiologistNotes')}
        {textarea('Findings', 'findings')}
        {input('Image CID', 'imageCid')}
        {textarea('Notes', 'notes')}
      </>;
      break;
    case 'COVID-19 PCR Test':
      fields = <>
        {select('Result', 'result', ['Positive','Negative'])}
        {number('Ct Value', 'ctValue')}
        {textarea('Notes', 'notes')}
      </>;
      break;
    case 'Fitness Assessment':
      fields = <>
        {number('BMI', 'bmi')}
        {input('Endurance Level', 'enduranceLevel')}
        {textarea('Comments', 'comments')}
      </>;
      break;
    case 'Mental Health Screening':
      fields = <>
        {number('PHQ-9 Score', 'phq9')}
        {textarea('Summary', 'summary')}
        {select('Referral Needed', 'referralNeeded', ['Yes','No'])}
      </>;
      break;
    // Vaccines (shared structure)
    case 'Hepatitis B Vaccine':
    case 'Typhoid Vaccine':
    case 'MMR Vaccine':
    case 'Tetanus Vaccine':
    case 'Influenza Vaccine':
    case 'Yellow Fever Vaccine':
      fields = <>
        {input('Vaccine Type', 'testType', 'text', { readOnly: true })}
        {input('Batch Number', 'batchNo')}
        {date('Date Given', 'dateGiven')}
        {textarea('Notes / Reaction', 'notes')}
      </>;
      break;
    default:
      fields = <>
        {input('Result', 'result')}
        {textarea('Notes', 'notes')}
      </>;
  }
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-2">
      {fields}
      {alert && <Alert {...alert} />}
      <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded" disabled={loading}>
        {loading ? 'Updating...' : 'Update'}
      </button>
    </form>
  );
}

const ApiTestPage = () => {
  const [result, setResult] = useState(null);
  const [roleResult, setRoleResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roleError, setRoleError] = useState(null);
  const [tab, setTab] = useState('public');
  const [primaryRoleTest, setPrimaryRoleTest] = useState(null);
  const { primaryRole, jwt, address: doctorAddress } = useAuth();

  // Patient registration test state
  const [patientFormData, setPatientFormData] = useState({
    address: '',
    fullName: '',
    myKadNo: '',
    dob: '',
    gender: '',
    nationality: ''
  });
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientAlert, setPatientAlert] = useState(null);

  // Nurse test state
  const [nursePatientAddress, setNursePatientAddress] = useState('');
  const [nursePatientInfo, setNursePatientInfo] = useState(null);
  const [nurseFile, setNurseFile] = useState(null);
  const [nurseFileError, setNurseFileError] = useState(null);
  const [nurseUploading, setNurseUploading] = useState(false);
  const [nurseAlert, setNurseAlert] = useState(null);
  const [nurseCid, setNurseCid] = useState(null);
  const [nurseEntryMode, setNurseEntryMode] = useState('file');
  const [nurseManualVitals, setNurseManualVitals] = useState({
    height: '',
    weight: '',
    bmi: '',
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    oxygenSaturation: '',
    respiratoryRate: '',
    vision: '',
    hearing: '',
    notes: ''
  });
  const [nurseManualErrors, setNurseManualErrors] = useState({});

  // Doctor test state
  const [doctorPatientAddress, setDoctorPatientAddress] = useState('');
  const [doctorPatientInfo, setDoctorPatientInfo] = useState(null);
  const [doctorVitals, setDoctorVitals] = useState(null);
  const [doctorAlert, setDoctorAlert] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [doctorDiagnosis, setDoctorDiagnosis] = useState('');
  const [doctorDiagnosisLoading, setDoctorDiagnosisLoading] = useState(false);
  const [doctorCertLoading, setDoctorCertLoading] = useState(false);
  const [doctorCertHash, setDoctorCertHash] = useState('');
  const [doctorSignature, setDoctorSignature] = useState('');

  // --- Receptionist Test/Vaccine Order State ---
  const [recTestOrder, setRecTestOrder] = useState({ address: '', testType: '', purpose: '' });
  const [recTestOrderLoading, setRecTestOrderLoading] = useState(false);
  const [recTestOrderAlert, setRecTestOrderAlert] = useState(null);
  const [recTestOrderFetchAddr, setRecTestOrderFetchAddr] = useState('');
  const [recTestOrderList, setRecTestOrderList] = useState([]);
  const [recTestOrderListLoading, setRecTestOrderListLoading] = useState(false);
  const [recTestOrderListAlert, setRecTestOrderListAlert] = useState(null);

  // --- Receptionist Multi-Test/Vaccine Order State ---
  const [recMultiOrderAddress, setRecMultiOrderAddress] = useState('');
  const categoryOptions = [
    { value: 'test', label: 'Test' },
    { value: 'vaccine', label: 'Vaccine' }
  ];
  const [recMultiOrders, setRecMultiOrders] = useState([
    { category: '', type: '', purpose: '' }
  ]);
  const [recMultiOrderLoading, setRecMultiOrderLoading] = useState(false);
  const [recMultiOrderAlert, setRecMultiOrderAlert] = useState(null);

  // --- Nurse Test/Vaccine Order State ---
  const [nurseTestOrder, setNurseTestOrder] = useState({ testType: '', purpose: '' });
  const [nurseTestOrderLoading, setNurseTestOrderLoading] = useState(false);
  const [nurseTestOrderAlert, setNurseTestOrderAlert] = useState(null);
  const [nurseTestOrderList, setNurseTestOrderList] = useState([]);
  const [nurseTestOrderListLoading, setNurseTestOrderListLoading] = useState(false);
  const [nurseTestOrderListAlert, setNurseTestOrderListAlert] = useState(null);
  const [nurseTestPatchLoading, setNurseTestPatchLoading] = useState({});
  const [nurseTestPatchAlert, setNurseTestPatchAlert] = useState({});

  // 1. Add nurseTab state for navigation after patient fetch
  const [nurseTab, setNurseTab] = useState('vitals');

  const labTestMap = {
    Employment: ['FBC', 'Urinalysis', 'Hep B', 'HIV', 'Chest X-ray', 'BMI'],
    'Travel (e.g. Saudi)': ['TB', 'COVID-19', 'Yellow Fever', 'Chest X-ray'],
    'Sports / Fitness': ['ECG', 'BP', 'BMI', 'Blood Sugar'],
    'University Admission': ['FBC', 'Urinalysis', 'Chest X-ray'],
    'General Screening': ['Sugar', 'Cholesterol', 'BMI', 'BP'],
    'Work w/ Children': ['Hep B', 'TB', 'Mental Health'],
    'Manual Labor': ['Chest X-ray', 'BP', 'Fitness'],
  };

  const purposeOptions = Object.keys(labTestMap).map(purpose => ({
    value: purpose,
    label: purpose,
  }));

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const nationalityOptions = [
    { value: 'malaysian', label: 'Malaysian' },
    { value: 'foreigner', label: 'Foreigner' },
  ];

  
  

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post('/generate-nonce', { address: "0x1234567890abcdef1234567890abcdef12345678" });
      setResult(res.data);
      console.log('API Response:', res.data);
    } catch (err) {
      setError(err.message || 'Error');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckRole = async () => {
    setRoleLoading(true);
    setRoleError(null);
    setRoleResult(null);
    try {
      const res = await api.get('/check-role');
      setRoleResult(res.data);
      console.log('Role Response:', res.data);
    } catch (err) {
      setRoleError(err.message || 'Error');
      console.error('Role API Error:', err);
    } finally {
      setRoleLoading(false);
    }
  };

  const handleTestPrimaryRole = () => {
    setPrimaryRoleTest(primaryRole || 'No primaryRole set');
  };

  // Validate test form
  const validatePatientTestForm = () => {
    const errors = {};
    if (!patientFormData.address.trim()) {
      errors.address = 'Ethereum address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(patientFormData.address.trim())) {
      errors.address = 'Invalid Ethereum address format';
    }
    if (!patientFormData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (!/^[A-Za-z\s\-'.]+$/.test(patientFormData.fullName.trim())) {
      errors.fullName = 'Name can only contain letters, spaces, hyphens, apostrophes, and periods';
    }
    if (!patientFormData.myKadNo.trim()) {
      errors.myKadNo = 'MyKad/Passport number is required';
    } else if (!/^[A-Za-z0-9-]+$/.test(patientFormData.myKadNo.trim())) {
      errors.myKadNo = 'Invalid MyKad/Passport number format';
    }
    if (!patientFormData.dob) {
      errors.dob = 'Date of birth is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(patientFormData.dob)) {
      errors.dob = 'Date of birth must be in YYYY-MM-DD format';
    }
    if (!patientFormData.gender) {
      errors.gender = 'Gender is required';
    }
    if (!patientFormData.nationality) {
      errors.nationality = 'Nationality is required';
    }
    return errors;
  };

  // Handle patient registration test
  const handlePatientRegistrationTest = async (e) => {
    e.preventDefault();
    setPatientLoading(true);
    setPatientAlert(null);

    // Validate
    const errors = validatePatientTestForm();
    if (Object.keys(errors).length > 0) {
      setPatientAlert({
        variant: 'error',
        title: 'Validation Error',
        message: Object.values(errors).join(' | ')
      });
      setPatientLoading(false);
      return;
    }

    try {
      const { address, ...demographics } = patientFormData;
      const payload = { address: address.trim(), demographics };
      const response = await api.post('/register-patient', payload, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });
      setPatientAlert({
        variant: 'success',
        title: 'Test Success',
        message: 'Patient registration test successful! Response: ' + JSON.stringify(response.data)
      });
      setPatientFormData({
        address: '',
        fullName: '',
        myKadNo: '',
        dob: '',
        gender: '',
        nationality: ''
      });
    } catch (error) {
      setPatientAlert({
        variant: 'error',
        title: 'Test Failed',
        message: error.response?.data?.message || 'Failed to test patient registration. Please try again.'
      });
    } finally {
      setPatientLoading(false);
    }
  };

  // Handle patient form input changes
  const handlePatientInputChange = (e) => {
    const { name, value } = e.target;
    setPatientFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle patient form select changes
  const handlePatientSelectChange = (name, value) => {
    setPatientFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch patient info for nurse
  const handleNurseFetchPatient = async () => {
    setNurseAlert(null);
    setNursePatientInfo(null);
    setNurseCid(null);
    if (!/^0x[a-fA-F0-9]{40}$/.test(nursePatientAddress.trim())) {
      setNurseAlert({
        variant: 'error',
        title: 'Invalid Address',
        message: 'Please enter a valid Ethereum address.',
      });
      return;
    }
    try {
      const res = await api.get(`/patients/${nursePatientAddress.trim()}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      // Accept any of the possible response shapes
      if (res.data.patient) {
        setNursePatientInfo(res.data.patient);
      } else if (res.data.demographics) {
        setNursePatientInfo({
          demographics: res.data.demographics,
          vitals: res.data.vitals,
          address: nursePatientAddress.trim()
        });
      } else {
        setNurseAlert({
          variant: 'error',
          title: 'Fetch Failed',
          message: 'No patient data found.',
        });
      }
    } catch (err) {
      setNurseAlert({
        variant: 'error',
        title: 'Fetch Failed',
        message: err.response?.data?.error || 'Could not fetch patient info.',
      });
    }
  };

  // File input handler for nurse
  const handleNurseFileChange = (e) => {
    setNurseFileError(null);
    setNurseFile(null);
    setNurseCid(null);
    if (!e.target.files || e.target.files.length === 0) return;
    const f = e.target.files[0];
    if (!['text/plain', 'application/json', 'text/csv'].includes(f.type) &&
        !f.name.endsWith('.txt') && !f.name.endsWith('.csv') && !f.name.endsWith('.json')) {
      setNurseFileError('Only .txt, .csv, or .json files are allowed.');
      return;
    }
    if (f.size > 1024 * 1024) {
      setNurseFileError('File size must be less than 1MB.');
      return;
    }
    setNurseFile(f);
  };

  // Upload handler for nurse
  const handleNurseUpload = async (e) => {
    e.preventDefault();
    setNurseAlert(null);
    setNurseCid(null);
    if (!nursePatientInfo) {
      setNurseAlert({
        variant: 'error',
        title: 'No Patient',
        message: 'Please fetch and select a patient first.',
      });
      return;
    }
    if (!nurseFile) {
      setNurseFileError('Please select a file.');
      return;
    }
    setNurseUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = btoa(reader.result);
        const payload = {
          address: nursePatientInfo.address,
          vitalsFile: base64,
        };
        try {
          const res = await api.patch(`/patients/${nursePatientInfo.address}/vitals`, payload, {
            headers: { Authorization: `Bearer ${jwt}` },
          });
          setNurseCid(res.data.cid);
          setNurseAlert({
            variant: 'success',
            title: 'Upload Success',
            message: 'Vitals file uploaded and pinned to IPFS.',
          });
        } catch (err) {
          setNurseAlert({
            variant: 'error',
            title: 'Upload Failed',
            message: err.response?.data?.error || 'Failed to upload vitals.',
          });
        } finally {
          setNurseUploading(false);
        }
      };
      reader.readAsBinaryString(nurseFile);
    } catch (err) {
      setNurseAlert({
        variant: 'error',
        title: 'Upload Error',
        message: 'Could not read or upload file.',
      });
      setNurseUploading(false);
    }
  };

  const handleNurseManualVitalsChange = (e) => {
    const { name, value } = e.target;
    setNurseManualVitals(prev => ({ ...prev, [name]: value }));
  };

  const calculateNurseBMI = (height, weight) => {
    if (height && weight) {
      const h = parseFloat(height) / 100;
      const w = parseFloat(weight);
      if (!isNaN(h) && !isNaN(w) && h > 0) {
        setNurseManualVitals(prev => ({ ...prev, bmi: (w / (h * h)).toFixed(1) }));
      }
    }
  };

  const handleNurseHeightWeightChange = (e) => {
    const { name, value } = e.target;
    setNurseManualVitals(prev => {
      const newVitals = { ...prev, [name]: value };
      if (name === 'height' || name === 'weight') {
        calculateNurseBMI(
          name === 'height' ? value : prev.height,
          name === 'weight' ? value : prev.weight
        );
      }
      return newVitals;
    });
  };

  const validateNurseManualVitals = () => {
    const errors = {};
    if (!nurseManualVitals.height || isNaN(nurseManualVitals.height) || Number(nurseManualVitals.height) <= 0) errors.height = 'Height must be a positive number';
    if (!nurseManualVitals.weight || isNaN(nurseManualVitals.weight) || Number(nurseManualVitals.weight) <= 0) errors.weight = 'Weight must be a positive number';
    if (!nurseManualVitals.bloodPressure.trim()) errors.bloodPressure = 'Blood Pressure is required';
    if (!nurseManualVitals.heartRate || isNaN(nurseManualVitals.heartRate) || Number(nurseManualVitals.heartRate) <= 0) errors.heartRate = 'Heart Rate must be a positive number';
    if (!nurseManualVitals.temperature || isNaN(nurseManualVitals.temperature)) errors.temperature = 'Temperature must be a number';
    if (!nurseManualVitals.oxygenSaturation || isNaN(nurseManualVitals.oxygenSaturation) || Number(nurseManualVitals.oxygenSaturation) < 0) errors.oxygenSaturation = 'O₂ Saturation must be a positive number';
    if (!nurseManualVitals.respiratoryRate || isNaN(nurseManualVitals.respiratoryRate) || Number(nurseManualVitals.respiratoryRate) < 0) errors.respiratoryRate = 'Respiratory Rate must be a positive number';
    if (!nurseManualVitals.vision.trim()) errors.vision = 'Vision is required';
    if (!nurseManualVitals.hearing.trim()) errors.hearing = 'Hearing is required';
    // Sanitize notes (basic)
    if (nurseManualVitals.notes && /[<>]/.test(nurseManualVitals.notes)) errors.notes = 'Notes cannot contain < or >';
    return errors;
  };

  const handleNurseManualUpload = async (e) => {
    e.preventDefault();
    setNurseAlert(null);
    setNurseCid(null);
    const errors = validateNurseManualVitals();
    setNurseManualErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!nursePatientInfo) {
      setNurseAlert({ variant: 'error', title: 'No Patient', message: 'Please fetch and select a patient first.' });
      return;
    }
    setNurseUploading(true);
    try {
      // Convert number fields to numbers
      const payload = {
        ...nurseManualVitals,
        height: Number(nurseManualVitals.height),
        weight: Number(nurseManualVitals.weight),
        bmi: Number(nurseManualVitals.bmi),
        heartRate: Number(nurseManualVitals.heartRate),
        temperature: Number(nurseManualVitals.temperature),
        respiratoryRate: Number(nurseManualVitals.respiratoryRate),
        oxygenSaturation: nurseManualVitals.oxygenSaturation !== '' ? Number(nurseManualVitals.oxygenSaturation) : undefined,
      };
      console.log('Submitting vitals:', payload);
      const res = await api.patch(`/patients/${nursePatientInfo.address}/vitals`, payload, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setNurseCid(res.data.cid);
      setNurseAlert({ variant: 'success', title: 'Upload Success', message: 'Vitals uploaded and pinned to IPFS.' });
      setNurseManualVitals({ height: '', weight: '', bmi: '', bloodPressure: '', heartRate: '', temperature: '', oxygenSaturation: '', respiratoryRate: '', vision: '', hearing: '', notes: '' });
    } catch (err) {
      setNurseAlert({ variant: 'error', title: 'Upload Failed', message: err.response?.data?.error || 'Failed to upload vitals.' });
    } finally {
      setNurseUploading(false);
    }
  };

  const handleExportNurseVitals = () => {
    const data = JSON.stringify(nurseManualVitals, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vitals.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Validate Ethereum address
  const isValidEthAddress = addr => /^0x[a-fA-F0-9]{40}$/.test(addr.trim());

  // Fetch patient data (demographics + latest vitals)
  const handleDoctorFetchPatient = async e => {
    e.preventDefault();
    setDoctorAlert(null);
    setDoctorPatientInfo(null);
    setDoctorVitals(null);
    if (!isValidEthAddress(doctorPatientAddress)) {
      setDoctorAlert({ variant: 'error', title: 'Invalid Address', message: 'Please enter a valid Ethereum address.' });
      return;
    }
    setDoctorLoading(true);
    try {
      const res = await api.get(`/patient-data/${doctorPatientAddress.trim()}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setDoctorPatientInfo(res.data.demographics);
      // Fetch and decode vitals from IPFS
      if (res.data.vitals && res.data.vitals.cid) {
        const ipfsRes = await fetch(`https://gateway.pinata.cloud/ipfs/${res.data.vitals.cid}`);
        const base64 = await ipfsRes.text();
        if (/^[A-Za-z0-9+/=\s]+$/.test(base64)) {
          try {
            const decoded = atob(base64);
            setDoctorVitals(JSON.parse(decoded));
            setDoctorCertHash(res.data.vitals.cid);
          } catch (err) {
            setDoctorVitals(null);
            setDoctorAlert({ variant: 'error', title: 'Vitals Error', message: 'Could not decode or parse vitals file.' });
          }
        } else {
          setDoctorVitals(null);
          setDoctorAlert({ variant: 'error', title: 'Vitals Error', message: 'Vitals file is not valid base64.' });
        }
      } else {
        setDoctorVitals(null);
        setDoctorAlert({ variant: 'info', title: 'No Vitals', message: 'No vitals found for this patient.' });
      }
    } catch (err) {
      setDoctorAlert({ variant: 'error', title: 'Fetch Failed', message: err.response?.data?.error || 'Could not fetch patient data.' });
    } finally {
      setDoctorLoading(false);
    }
  };

  // Submit diagnosis
  const handleDoctorSubmitDiagnosis = async e => {
    e.preventDefault();
    setDoctorDiagnosisLoading(true);
    setDoctorAlert(null);
    try {
      await api.post('/submit-diagnosis', {
        address: doctorPatientAddress.trim(),
        diagnosis: { summary: doctorDiagnosis },
      }, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setDoctorAlert({ variant: 'success', title: 'Diagnosis Submitted', message: 'Diagnosis submitted successfully.' });
    } catch (err) {
      setDoctorAlert({ variant: 'error', title: 'Submit Failed', message: err.response?.data?.error || 'Failed to submit diagnosis.' });
    } finally {
      setDoctorDiagnosisLoading(false);
    }
  };

  // Issue certificate (MetaMask sign)
  const handleDoctorIssueCertificate = async () => {
    setDoctorCertLoading(true);
    setDoctorAlert(null);
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');
      const msg = `Cert CID: ${doctorCertHash}`;
      const from = doctorAddress;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [msg, from],
      });
      setDoctorSignature(signature);
      await api.post('/issue-certificate', {
        address: doctorPatientAddress.trim(),
        certHash: doctorCertHash,
        signature,
      }, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setDoctorAlert({ variant: 'success', title: 'Certificate Issued', message: 'Certificate issued and signed.' });
    } catch (err) {
      setDoctorAlert({ variant: 'error', title: 'Certificate Error', message: err.message || 'Failed to issue certificate.' });
    } finally {
      setDoctorCertLoading(false);
    }
  };

  // --- Receptionist: Order Test/Vaccine ---
  const handleRecTestOrderChange = e => {
    const { name, value } = e.target;
    setRecTestOrder(prev => ({ ...prev, [name]: value }));
  };
  const handleRecTestOrder = async e => {
    e.preventDefault();
    setRecTestOrderLoading(true);
    setRecTestOrderAlert(null);
    try {
      const res = await api.post(`/patients/${recTestOrder.address}/tests`, {
        testType: recTestOrder.testType,
        purpose: recTestOrder.purpose
      }, { headers: { Authorization: `Bearer ${jwt}` } });
      setRecTestOrderAlert({ variant: 'success', title: 'Order Success', message: 'Test/vaccine order created.' });
      setRecTestOrder({ address: '', testType: '', purpose: '' });
    } catch (err) {
      setRecTestOrderAlert({ variant: 'error', title: 'Order Failed', message: err.response?.data?.error || 'Failed to order test/vaccine.' });
    } finally {
      setRecTestOrderLoading(false);
    }
  };
  // --- Receptionist: Fetch Test/Vaccine Orders ---
  const handleRecTestOrderFetch = async () => {
    setRecTestOrderListLoading(true);
    setRecTestOrderListAlert(null);
    setRecTestOrderList([]);
    try {
      const res = await api.get(`/patients/${recTestOrderFetchAddr}/tests`, { headers: { Authorization: `Bearer ${jwt}` } });
      setRecTestOrderList(res.data.tests || []);
    } catch (err) {
      setRecTestOrderListAlert({ variant: 'error', title: 'Fetch Failed', message: err.response?.data?.error || 'Failed to fetch test/vaccine orders.' });
    } finally {
      setRecTestOrderListLoading(false);
    }
  };
  // --- Nurse: Fetch Test/Vaccine Orders ---
  const handleNurseTestOrderFetch = async (address) => {
    setNurseTestOrderListLoading(true);
    setNurseTestOrderListAlert(null);
    setNurseTestOrderList([]);
    try {
      const res = await api.get(`/patients/${address}/tests`, { headers: { Authorization: `Bearer ${jwt}` } });
      setNurseTestOrderList(res.data.tests || []);
    } catch (err) {
      setNurseTestOrderListAlert({ variant: 'error', title: 'Fetch Failed', message: err.response?.data?.error || 'Failed to fetch test/vaccine orders.' });
    } finally {
      setNurseTestOrderListLoading(false);
    }
  };
  // --- Nurse: Order Test/Vaccine ---
  const handleNurseTestOrderChange = e => {
    const { name, value } = e.target;
    setNurseTestOrder(prev => ({ ...prev, [name]: value }));
  };
  const handleNurseTestOrder = async e => {
    e.preventDefault();
    if (!nursePatientInfo) return;
    setNurseTestOrderLoading(true);
    setNurseTestOrderAlert(null);
    try {
      await api.post(`/patients/${nursePatientInfo.address}/tests`, {
        testType: nurseTestOrder.testType,
        purpose: nurseTestOrder.purpose
      }, { headers: { Authorization: `Bearer ${jwt}` } });
      setNurseTestOrderAlert({ variant: 'success', title: 'Order Success', message: 'Test/vaccine order created.' });
      setNurseTestOrder({ testType: '', purpose: '' });
      handleNurseTestOrderFetch(nursePatientInfo.address);
    } catch (err) {
      setNurseTestOrderAlert({ variant: 'error', title: 'Order Failed', message: err.response?.data?.error || 'Failed to order test/vaccine.' });
    } finally {
      setNurseTestOrderLoading(false);
    }
  };
  // --- Nurse: Patch Test/Vaccine ---
  const handleNurseTestPatchChange = (testId, field, value) => {
    setNurseTestOrderList(list => list.map(t => t._id === testId ? { ...t, [field]: value } : t));
  };
  const handleNurseTestPatch = async (testId, address, resultData) => {
    setNurseTestPatchLoading(l => ({ ...l, [testId]: true }));
    setNurseTestPatchAlert(l => ({ ...l, [testId]: null }));
    try {
      await api.patch(`/patients/${address}/tests/${testId}`, { resultData }, { headers: { Authorization: `Bearer ${jwt}` } });
      setNurseTestPatchAlert(l => ({ ...l, [testId]: { variant: 'success', title: 'Update Success', message: 'Test/vaccine updated.' } }));
      handleNurseTestOrderFetch(address);
    } catch (err) {
      setNurseTestPatchAlert(l => ({ ...l, [testId]: { variant: 'error', title: 'Update Failed', message: err.response?.data?.error || 'Failed to update test/vaccine.' } }));
    } finally {
      setNurseTestPatchLoading(l => ({ ...l, [testId]: false }));
    }
  };

  const [receptionistTab, setReceptionistTab] = useState('register');

  const handleRecMultiOrderChange = (idx, field, value) => {
    setRecMultiOrders(orders => orders.map((o, i) => {
      if (i !== idx) return o;
      if (field === 'category') {
        // Reset type when category changes
        return { ...o, category: value, type: '' };
      }
      return { ...o, [field]: value };
    }));
  };
  const handleRecMultiOrderAdd = () => {
    setRecMultiOrders(orders => [...orders, { category: '', type: '', purpose: '' }]);
  };
  const handleRecMultiOrderRemove = idx => {
    setRecMultiOrders(orders => orders.length === 1 ? orders : orders.filter((_, i) => i !== idx));
  };
  const validateRecMultiOrder = () => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(recMultiOrderAddress.trim())) return 'Valid patient address required.';
    for (let i = 0; i < recMultiOrders.length; ++i) {
      if (!recMultiOrders[i].category) return `Select a category for row ${i + 1}`;
      if (!recMultiOrders[i].type) return `Select a type for row ${i + 1}`;
    }
    return null;
  };
  const handleRecMultiOrderSubmit = async e => {
    e.preventDefault();
    setRecMultiOrderAlert(null);
    setRecMultiOrderLoading(true);
    const validation = validateRecMultiOrder();
    if (validation) {
      setRecMultiOrderAlert({ variant: 'error', title: 'Validation Error', message: validation });
      setRecMultiOrderLoading(false);
      return;
    }
    try {
      const res = await api.post(`/patients/${recMultiOrderAddress}/tests`, { tests: recMultiOrders }, { headers: { Authorization: `Bearer ${jwt}` } });
      setRecMultiOrderAlert({ variant: 'success', title: 'Order Success', message: 'All tests/vaccines ordered successfully.' });
      setRecMultiOrders([{ category: '', type: '', purpose: '' }]);
      setRecMultiOrderAddress('');
    } catch (err) {
      setRecMultiOrderAlert({ variant: 'error', title: 'Order Failed', message: err.response?.data?.error || 'Failed to order test/vaccine.' });
    } finally {
      setRecMultiOrderLoading(false);
    }
  };

  // Test and Vaccine type options for Malaysia clinics
  const testTypeOptions = [
    { value: 'Full Blood Count (FBC)', label: 'Full Blood Count (FBC)' },
    { value: 'Urinalysis', label: 'Urinalysis' },
    { value: 'Blood Sugar Test', label: 'Blood Sugar Test' },
    { value: 'Cholesterol Test', label: 'Cholesterol Test' },
    { value: 'HIV Test', label: 'HIV Test' },
    { value: 'Hepatitis B Test', label: 'Hepatitis B Test' },
    { value: 'TB Test (Mantoux)', label: 'TB Test (Mantoux)' },
    { value: 'Dengue Test', label: 'Dengue Test' },
    { value: 'ECG', label: 'ECG' },
    { value: 'Chest X-ray', label: 'Chest X-ray' },
    { value: 'COVID-19 PCR Test', label: 'COVID-19 PCR Test' },
    { value: 'Fitness Assessment', label: 'Fitness Assessment' },
    { value: 'Mental Health Screening', label: 'Mental Health Screening' }
  ];
  const vaccineTypeOptions = [
    { value: 'Hepatitis B Vaccine', label: 'Hepatitis B Vaccine' },
    { value: 'Typhoid Vaccine', label: 'Typhoid Vaccine' },
    { value: 'MMR Vaccine', label: 'MMR Vaccine' },
    { value: 'Tetanus Vaccine', label: 'Tetanus Vaccine' },
    { value: 'Influenza Vaccine', label: 'Influenza Vaccine' },
    { value: 'Yellow Fever Vaccine', label: 'Yellow Fever Vaccine' }
  ];

  // Config: allow 'reviewed' status?
  const allowReviewedStatus = true; // set to false if not allowed

  // Remove the useTestResultData hook and add new state
  const [testResults, setTestResults] = React.useState({});
  const [testResultsLoading, setTestResultsLoading] = React.useState({});
  const [testResultsError, setTestResultsError] = React.useState({});

  // Add effect to fetch test results
  React.useEffect(() => {
    const fetchTestResults = async () => {
      if (!nurseTestOrderList || nurseTestOrderList.length === 0) return;
      
      const results = {};
      const loading = {};
      const errors = {};
      
      for (const test of nurseTestOrderList) {
        if (!test.resultCid) continue;
        
        loading[test._id] = true;
        setTestResultsLoading(prev => ({ ...prev, [test._id]: true }));
        
        try {
          const response = await fetch(`https://gateway.pinata.cloud/ipfs/${test.resultCid}`);
          const base64 = await response.text();
          const decoded = atob(base64);
          results[test._id] = JSON.parse(decoded);
          setTestResults(prev => ({ ...prev, [test._id]: results[test._id] }));
        } catch (error) {
          errors[test._id] = 'Failed to fetch or decode result data';
          setTestResultsError(prev => ({ ...prev, [test._id]: errors[test._id] }));
        } finally {
          loading[test._id] = false;
          setTestResultsLoading(prev => ({ ...prev, [test._id]: false }));
        }
      }
    };

    fetchTestResults();
  }, [nurseTestOrderList]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">API Test Page</h2>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('public')} className={`px-4 py-2 rounded ${tab === 'public' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Public</button>
        <button onClick={() => setTab('auth')} className={`px-4 py-2 rounded ${tab === 'auth' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Authenticated</button>
        <button onClick={() => setTab('admin')} className={`px-4 py-2 rounded ${tab === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Admin Only</button>
        <button onClick={() => setTab('nurse')} className={`px-4 py-2 rounded ${tab === 'nurse' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Nurse Only</button>
        <button onClick={() => setTab('receptionist')} className={`px-4 py-2 rounded ${tab === 'receptionist' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Receptionist Only</button>
        <button onClick={() => setTab('doctor')} className={`px-4 py-2 rounded ${tab === 'doctor' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Doctor Only</button>
      </div>

      <button
        onClick={handleTestPrimaryRole}
        className="px-4 py-2 bg-indigo-600 text-white rounded mb-4"
      >
        Test primaryRole
      </button>
      {primaryRoleTest && (
        <div className="mt-2 text-lg font-semibold text-indigo-700 dark:text-indigo-300">
          Current primaryRole: {primaryRoleTest}
        </div>
      )}

      {tab === 'public' && (
        <div>
          <p className="mb-4">This section is always visible (public).</p>
          <button
            onClick={handleTest}
            className="px-4 py-2 bg-blue-600 text-white rounded mb-4"
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test /generate-nonce'}
          </button>
          {result && (
            <pre className="bg-gray-800 text-white p-4 rounded mt-4">{JSON.stringify(result, null, 2)}</pre>
          )}
          {error && (
            <div className="text-red-500 mt-4">{error}</div>
          )}
          <button
            onClick={handleCheckRole}
            className="px-4 py-2 bg-green-600 text-white rounded mb-4 ml-4"
            disabled={roleLoading}
          >
            {roleLoading ? 'Checking...' : 'Test /check-role'}
          </button>
          {roleResult && (
            <pre className="bg-gray-800 text-white p-4 rounded mt-4">{JSON.stringify(roleResult, null, 2)}</pre>
          )}
          {roleError && (
            <div className="text-red-500 mt-4">{roleError}</div>
          )}
        </div>
      )}

      {tab === 'receptionist' && (
        <PrivateRoute requiredRole="receptionist">
          <div className="bg-brand-50 dark:bg-brand-500/15 p-6 rounded">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white/90">Receptionist API Tests</h3>
            {/* Receptionist Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setReceptionistTab('register')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${receptionistTab === 'register' ? 'bg-brand-500 text-white shadow' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}
              >
                Register New Patient
              </button>
              <button
                onClick={() => setReceptionistTab('order')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${receptionistTab === 'order' ? 'bg-brand-500 text-white shadow' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}
              >
                Order Test/Vaccine
              </button>
              <button
                onClick={() => setReceptionistTab('view')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${receptionistTab === 'view' ? 'bg-brand-500 text-white shadow' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}
              >
                View Test/Vaccine Orders
              </button>
            </div>
            {/* Register New Patient Tab */}
            {receptionistTab === 'register' && (
              <ComponentCard title="Register New Patient">
                {patientAlert && (
                  <Alert
                    variant={patientAlert.variant}
                    title={patientAlert.title}
                    message={patientAlert.message}
                  />
                )}
                <form onSubmit={handlePatientRegistrationTest} className="space-y-6 mt-4">
                  <div>
                    <Label htmlFor="testAddress">Ethereum Address</Label>
                    <Input
                      type="text"
                      id="testAddress"
                      name="address"
                      value={patientFormData.address}
                      onChange={handlePatientInputChange}
                      autoComplete="off"
                      error={!!patientFormData.errors?.address}
                      hint={patientFormData.errors?.address}
                    />
                  </div>
                  <div>
                    <Label htmlFor="testName">Full Name</Label>
                    <Input
                      type="text"
                      id="testName"
                      name="fullName"
                      value={patientFormData.fullName}
                      onChange={handlePatientInputChange}
                      autoComplete="off"
                      error={!!patientFormData.errors?.fullName}
                      hint={patientFormData.errors?.fullName}
                    />
                  </div>
                  <div>
                    <Label htmlFor="testPassport">MyKad/Passport No.</Label>
                    <Input
                      type="text"
                      id="testPassport"
                      name="myKadNo"
                      value={patientFormData.myKadNo}
                      onChange={handlePatientInputChange}
                      autoComplete="off"
                      error={!!patientFormData.errors?.myKadNo}
                      hint={patientFormData.errors?.myKadNo}
                    />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {/* Year Selection */}
                      <div>
                        <Select
                          options={Array.from({ length: 100 }, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return { value: year.toString(), label: year.toString() };
                          })}
                          value={patientFormData.dobYear}
                          onChange={v => {
                            const newYear = v;
                            const month = patientFormData.dobMonth || '01';
                            const day = patientFormData.dobDay || '01';
                            handlePatientSelectChange('dobYear', newYear);
                            handlePatientSelectChange('dob', `${newYear}-${month}-${day}`);
                          }}
                          placeholder="Year"
                          className={patientFormData.errors?.dob ? 'border-error-500' : ''}
                        />
                      </div>
                      {/* Month Selection */}
                      <div>
                        <Select
                          options={[
                            { value: '01', label: 'January' },
                            { value: '02', label: 'February' },
                            { value: '03', label: 'March' },
                            { value: '04', label: 'April' },
                            { value: '05', label: 'May' },
                            { value: '06', label: 'June' },
                            { value: '07', label: 'July' },
                            { value: '08', label: 'August' },
                            { value: '09', label: 'September' },
                            { value: '10', label: 'October' },
                            { value: '11', label: 'November' },
                            { value: '12', label: 'December' }
                          ]}
                          value={patientFormData.dobMonth}
                          onChange={v => {
                            const year = patientFormData.dobYear || new Date().getFullYear().toString();
                            const newMonth = v;
                            const day = patientFormData.dobDay || '01';
                            handlePatientSelectChange('dobMonth', newMonth);
                            handlePatientSelectChange('dob', `${year}-${newMonth}-${day}`);
                          }}
                          placeholder="Month"
                          className={patientFormData.errors?.dob ? 'border-error-500' : ''}
                        />
                      </div>
                      {/* Day Selection */}
                      <div>
                        <Select
                          options={Array.from({ length: 31 }, (_, i) => {
                            const day = (i + 1).toString().padStart(2, '0');
                            return { value: day, label: day };
                          })}
                          value={patientFormData.dobDay}
                          onChange={v => {
                            const year = patientFormData.dobYear || new Date().getFullYear().toString();
                            const month = patientFormData.dobMonth || '01';
                            const newDay = v;
                            handlePatientSelectChange('dobDay', newDay);
                            handlePatientSelectChange('dob', `${year}-${month}-${newDay}`);
                          }}
                          placeholder="Day"
                          className={patientFormData.errors?.dob ? 'border-error-500' : ''}
                        />
                      </div>
                    </div>
                    {patientFormData.errors?.dob && <p className="mt-1.5 text-xs text-error-500">{patientFormData.errors.dob}</p>}
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select
                      options={genderOptions}
                      value={patientFormData.gender}
                      onChange={v => handlePatientSelectChange('gender', v)}
                      className={patientFormData.errors?.gender ? 'border-error-500' : ''}
                    />
                    {patientFormData.errors?.gender && <p className="mt-1.5 text-xs text-error-500">{patientFormData.errors.gender}</p>}
                  </div>
                  <div>
                    <Label>Nationality</Label>
                    <Select
                      options={nationalityOptions}
                      value={patientFormData.nationality}
                      onChange={v => handlePatientSelectChange('nationality', v)}
                      className={patientFormData.errors?.nationality ? 'border-error-500' : ''}
                    />
                    {patientFormData.errors?.nationality && <p className="mt-1.5 text-xs text-error-500">{patientFormData.errors.nationality}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={patientLoading}
                    className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {patientLoading ? 'Registering...' : 'Register Patient'}
                  </button>
                </form>
              </ComponentCard>
            )}
            {/* Order Test/Vaccine Tab */}
            {receptionistTab === 'order' && (
              <ComponentCard title="Order Test/Vaccine for Patient (Multiple)">
                {recMultiOrderAlert && <Alert {...recMultiOrderAlert} />}
                <form onSubmit={handleRecMultiOrderSubmit} className="space-y-4 mt-4">
                  <Label>Patient Address</Label>
                  <Input type="text" value={recMultiOrderAddress} onChange={e => setRecMultiOrderAddress(e.target.value)} placeholder="0x..." />
                  <div className="space-y-4">
                    {recMultiOrders.map((order, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-2 items-end border-b pb-4 mb-2">
                        <div className="flex-1">
                          <Label>Category</Label>
                          <Select
                            options={categoryOptions}
                            value={order.category}
                            onChange={v => handleRecMultiOrderChange(idx, 'category', v)}
                            placeholder="Select Category"
                          />
                        </div>
                        <div className="flex-1">
                          {order.category === 'test' && (
                            <>
                              <Label>Test Type</Label>
                              <Select
                                options={testTypeOptions}
                                value={order.type}
                                onChange={v => handleRecMultiOrderChange(idx, 'type', v)}
                                placeholder="Select Test"
                              />
                            </>
                          )}
                          {order.category === 'vaccine' && (
                            <>
                              <Label>Vaccine Type</Label>
                              <Select
                                options={vaccineTypeOptions}
                                value={order.type}
                                onChange={v => handleRecMultiOrderChange(idx, 'type', v)}
                                placeholder="Select Vaccine"
                              />
                            </>
                          )}
                        </div>
                        <div className="flex-1">
                          <Label>Purpose (optional)</Label>
                          <Input type="text" value={order.purpose} onChange={e => handleRecMultiOrderChange(idx, 'purpose', e.target.value)} placeholder="e.g. Food Handler Certificate" />
                        </div>
                        <button type="button" onClick={() => handleRecMultiOrderRemove(idx)} className="text-red-500 hover:text-red-700 px-2 py-1" disabled={recMultiOrders.length === 1}>Remove</button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={handleRecMultiOrderAdd} className="bg-brand-100 text-brand-700 px-4 py-2 rounded hover:bg-brand-200">+ Add Another Test/Vaccine</button>
                  <button type="submit" disabled={recMultiOrderLoading} className="bg-brand-500 text-white px-4 py-2 rounded w-full md:w-auto">{recMultiOrderLoading ? 'Ordering...' : 'Order Test/Vaccine(s)'}</button>
                </form>
              </ComponentCard>
            )}
            {/* View Test/Vaccine Orders Tab */}
            {receptionistTab === 'view' && (
              <ComponentCard title="View All Test/Vaccine Orders">
                {recTestOrderListAlert && <Alert {...recTestOrderListAlert} />}
                <div className="flex gap-2 mb-2">
                  <Input type="text" value={recTestOrderFetchAddr} onChange={e => setRecTestOrderFetchAddr(e.target.value)} placeholder="Patient Address (0x...)" />
                  <button onClick={handleRecTestOrderFetch} className="bg-brand-500 text-white px-4 py-2 rounded" disabled={recTestOrderListLoading}>Fetch</button>
                </div>
                {recTestOrderListLoading ? <div>Loading...</div> : (
                  <ul className="mt-2 space-y-2">
                    {recTestOrderList.map(test => (
                      <li key={test._id} className="p-2 bg-gray-100 rounded">
                        <b>{test.testType}</b> ({test.purpose}) - Status: <b>{test.status}</b><br />
                        Ordered By: {test.orderedBy}<br />
                        Result: {test.result}<br />
                        {test.interpretedBy && <span>Interpreted By: {test.interpretedBy}<br /></span>}
                        {test.interpretation && <span>Interpretation: {test.interpretation}<br /></span>}
                        <span className="text-xs text-gray-500">{test.timestamp}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </ComponentCard>
            )}
          </div>
        </PrivateRoute>
      )}

      {tab === 'auth' && (
        <PrivateRoute>
          <div className="bg-green-100 dark:bg-green-900 p-6 rounded">
            <h3 className="text-lg font-semibold mb-2">Authenticated Section</h3>
            <p>If you see this, you are logged in!</p>
          </div>
        </PrivateRoute>
      )}

      {tab === 'admin' && (
        <PrivateRoute requiredRole="admin">
          <div className="bg-yellow-100 dark:bg-yellow-900 p-6 rounded">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white/90">Admin Dashboard</h3>
            <AdminDashboardUI />
          </div>
        </PrivateRoute>
      )}

      {tab === 'nurse' && (
        <PrivateRoute requiredRole="nurse">
          <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white/90">Nurse API Tests</h3>
            {/* Step 1: Patient Lookup (default state) */}
            <ComponentCard title="Patient Lookup (Test)">
              {nurseAlert && (
                <Alert
                  variant={nurseAlert.variant}
                  title={nurseAlert.title}
                  message={nurseAlert.message}
                />
              )}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleNurseFetchPatient();
                }}
                className="space-y-4"
              >
                <Label htmlFor="nursePatientAddress">Patient Wallet Address</Label>
                <Input
                  type="text"
                  id="nursePatientAddress"
                  name="nursePatientAddress"
                  value={nursePatientAddress}
                  onChange={e => setNursePatientAddress(e.target.value)}
                  placeholder="0x..."
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  Fetch Patient
                </button>
              </form>
              {/* Show demographics and tabs only after patient is fetched */}
              {nursePatientInfo && nursePatientInfo.demographics && (
                <div className="mt-4 p-4 rounded bg-gray-50 dark:bg-gray-800">
                  <div><b>Name:</b> {nursePatientInfo.demographics.fullName}</div>
                  <div><b>MyKad/Passport:</b> {nursePatientInfo.demographics.myKadNo}</div>
                  <div><b>DOB:</b> {nursePatientInfo.demographics.dob}</div>
                  <div><b>Gender:</b> {nursePatientInfo.demographics.gender}</div>
                  <div><b>Nationality:</b> {nursePatientInfo.demographics.nationality}</div>
                  {/* Tabs for Vitals/Test-Vaccine only after fetch */}
                  <div className="flex gap-2 mt-6">
                    <button onClick={() => setNurseTab('vitals')} className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${nurseTab === 'vitals' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}>Vitals Upload</button>
                    <button onClick={() => setNurseTab('tests')} className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${nurseTab === 'tests' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}>Test/Vaccine Results</button>
                  </div>
                </div>
              )}
            </ComponentCard>
            {/* Step 2: Vitals Upload Tab */}
            {nursePatientInfo && nursePatientInfo.demographics && nurseTab === 'vitals' && (
              <ComponentCard title="Vitals Entry">
                {/* Only show manual entry, remove entry mode toggle */}
                <form onSubmit={handleNurseManualUpload} className="space-y-4 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nurseHeight">Height (cm)</Label>
                      <Input
                        type="number"
                        id="nurseHeight"
                        name="height"
                        value={nurseManualVitals.height}
                        onChange={handleNurseHeightWeightChange}
                        placeholder="e.g., 170"
                        autoComplete="off"
                        error={!!nurseManualErrors.height}
                        hint={nurseManualErrors.height}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nurseWeight">Weight (kg)</Label>
                      <Input
                        type="number"
                        id="nurseWeight"
                        name="weight"
                        value={nurseManualVitals.weight}
                        onChange={handleNurseHeightWeightChange}
                        placeholder="e.g., 70"
                        autoComplete="off"
                        error={!!nurseManualErrors.weight}
                        hint={nurseManualErrors.weight}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nurseBMI">BMI</Label>
                      <Input
                        type="text"
                        id="nurseBMI"
                        name="bmi"
                        value={nurseManualVitals.bmi}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nurseBP">Blood Pressure (mmHg)</Label>
                      <Input
                        type="text"
                        id="nurseBP"
                        name="bloodPressure"
                        value={nurseManualVitals.bloodPressure}
                        onChange={handleNurseManualVitalsChange}
                        placeholder="e.g., 120/80"
                        autoComplete="off"
                        error={!!nurseManualErrors.bloodPressure}
                        hint={nurseManualErrors.bloodPressure}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nurseHR">Heart Rate (bpm)</Label>
                      <Input
                        type="number"
                        id="nurseHR"
                        name="heartRate"
                        value={nurseManualVitals.heartRate}
                        onChange={handleNurseManualVitalsChange}
                        placeholder="e.g., 72"
                        autoComplete="off"
                        error={!!nurseManualErrors.heartRate}
                        hint={nurseManualErrors.heartRate}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nurseTemp">Temperature (°C)</Label>
                      <Input
                        type="number"
                        id="nurseTemp"
                        name="temperature"
                        value={nurseManualVitals.temperature}
                        onChange={handleNurseManualVitalsChange}
                        placeholder="e.g., 37.0"
                        step="0.1"
                        autoComplete="off"
                        error={!!nurseManualErrors.temperature}
                        hint={nurseManualErrors.temperature}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nurseO2">O₂ Saturation (%)</Label>
                      <Input
                        type="number"
                        id="nurseO2"
                        name="oxygenSaturation"
                        value={nurseManualVitals.oxygenSaturation}
                        onChange={handleNurseManualVitalsChange}
                        placeholder="e.g., 98"
                        autoComplete="off"
                        error={!!nurseManualErrors.oxygenSaturation}
                        hint={nurseManualErrors.oxygenSaturation}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nurseRespRate">Respiratory Rate (breaths/min)</Label>
                      <Input
                        type="number"
                        id="nurseRespRate"
                        name="respiratoryRate"
                        value={nurseManualVitals.respiratoryRate}
                        onChange={handleNurseManualVitalsChange}
                        placeholder="e.g., 16"
                        autoComplete="off"
                        error={!!nurseManualErrors.respiratoryRate}
                        hint={nurseManualErrors.respiratoryRate}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nurseVision">Vision</Label>
                      <Input
                        type="text"
                        id="nurseVision"
                        name="vision"
                        value={nurseManualVitals.vision}
                        onChange={handleNurseManualVitalsChange}
                        placeholder="e.g., 6/6"
                        autoComplete="off"
                        error={!!nurseManualErrors.vision}
                        hint={nurseManualErrors.vision}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nurseHearing">Hearing</Label>
                      <Input
                        type="text"
                        id="nurseHearing"
                        name="hearing"
                        value={nurseManualVitals.hearing}
                        onChange={handleNurseManualVitalsChange}
                        placeholder="e.g., Normal"
                        autoComplete="off"
                        error={!!nurseManualErrors.hearing}
                        hint={nurseManualErrors.hearing}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="nurseNotes">Additional Notes</Label>
                    <textarea
                      id="nurseNotes"
                      name="notes"
                      value={nurseManualVitals.notes}
                      onChange={handleNurseManualVitalsChange}
                      className="w-full rounded-lg border border-gray-300 p-2"
                      rows={3}
                      placeholder="Enter any additional observations or notes..."
                    />
                    {nurseManualErrors.notes && <div className="text-error-500 text-xs">{nurseManualErrors.notes}</div>}
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Record Vitals
                  </button>
                  {/* Show CID if uploaded */}
                  {nurseCid && (
                    <div className="mt-2 text-xs text-green-700">CID: {nurseCid}</div>
                  )}
                </form>
              </ComponentCard>
            )}
            {/* Step 3: Test/Vaccine Results Tab */}
            {nursePatientInfo && nursePatientInfo.demographics && nurseTab === 'tests' && (
              <ComponentCard title="Test/Vaccine Results">
                <button onClick={() => handleNurseTestOrderFetch(nursePatientInfo.address)} className="bg-blue-600 text-white px-4 py-2 rounded mb-2" disabled={nurseTestOrderListLoading}>Refresh List</button>
                {nurseTestOrderListLoading ? <div>Loading...</div> : (
                  <ul className="mt-2 space-y-4">
                    {nurseTestOrderList.map(test => {
                      const resultData = testResults[test._id];
                      const resultLoading = testResultsLoading[test._id];
                      const resultError = testResultsError[test._id];
                      
                      return (
                        <li key={test._id} className="p-4 bg-gray-100 rounded shadow">
                          <b>{test.testType}</b> ({test.purpose}) - Status: <b>{test.status}</b><br />
                          Ordered By: {test.orderedBy}<br />
                          <span className="text-xs text-gray-500">{test.timestamp}</span>
                          {resultLoading && <div className="text-blue-600 mt-2">Loading result data from IPFS...</div>}
                          {resultError && <div className="text-red-600 mt-2">{resultError}</div>}
                          {resultData && (
                            <div className="mt-2 p-2 bg-white rounded border text-xs">
                              <pre>{JSON.stringify(resultData, null, 2)}</pre>
                            </div>
                          )}
                          <TestFormRenderer
                            key={test._id || test.testType}
                            test={resultData || { testType: test.testType }}
                            onSubmit={formData => handleNurseTestPatch(test._id, nursePatientInfo.address, formData)}
                            loading={nurseTestPatchLoading[test._id]}
                            alert={nurseTestPatchAlert[test._id]}
                            onFieldChange={(field, value) => handleNurseTestPatchChange(test._id, field, value)}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </ComponentCard>
            )}
          </div>
        </PrivateRoute>
      )}

      {tab === 'doctor' && (
        <PrivateRoute requiredRole="doctor">
          <div className="bg-pink-100 dark:bg-pink-900 p-6 rounded">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white/90">Doctor Dashboard</h3>
            <DoctorTabUI />
          </div>
        </PrivateRoute>
      )}
    </div>
  );
};

export default ApiTestPage; 

// --- DoctorTabUI: New tabbed layout for doctor role ---
function DoctorTabUI() {
  const { jwt, address: doctorAddress } = useAuth();
  const [tab, setTab] = React.useState('records');

  // Shared state
  const [address, setAddress] = React.useState('');
  const [patient, setPatient] = React.useState(null);
  const [fetching, setFetching] = React.useState(false);
  const [fetchError, setFetchError] = React.useState(null);

  // Lab Results state
  const [selectedTestId, setSelectedTestId] = React.useState('');
  const [selectedTest, setSelectedTest] = React.useState(null);
  const [labLoading, setLabLoading] = React.useState(false);
  const [labError, setLabError] = React.useState(null);

  // Diagnosis state
  const [diagnosis, setDiagnosis] = React.useState('');
  const [diagnosisNotes, setDiagnosisNotes] = React.useState('');
  const [diagnosisLoading, setDiagnosisLoading] = React.useState(false);
  const [diagnosisAlert, setDiagnosisAlert] = React.useState(null);

  // Certificate state
  const [certHash, setCertHash] = React.useState('');
  const [certType, setCertType] = React.useState('');
  const [ipfsCid, setIpfsCid] = React.useState('');
  const [signature, setSignature] = React.useState('');
  const [certLoading, setCertLoading] = React.useState(false);
  const [certAlert, setCertAlert] = React.useState(null);

  // Fetch patient handler
  const handleFetchPatient = async () => {
    setFetching(true);
    setFetchError(null);
    setPatient(null);
    setSelectedTestId('');
    setSelectedTest(null);
    try {
      const res = await api.get(`/patients/${address.trim()}`, { headers: { Authorization: `Bearer ${jwt}` } });
      setPatient(res.data.patient || res.data);
    } catch (err) {
      setFetchError(err.response?.data?.error || 'Failed to fetch patient');
    } finally {
      setFetching(false);
    }
  };

  // Lab Results: fetch test details
  const handleSelectTest = async (testId) => {
    setSelectedTestId(testId);
    setSelectedTest(null);
    setLabError(null);
    if (!testId) return;
    setLabLoading(true);
    try {
      const res = await api.get(`/patients/${address.trim()}/tests/${testId}`, { headers: { Authorization: `Bearer ${jwt}` } });
      setSelectedTest(res.data);
    } catch (err) {
      setLabError(err.response?.data?.error || 'Failed to fetch test details');
    } finally {
      setLabLoading(false);
    }
  };

  // Diagnosis submit
  const handleSubmitDiagnosis = async (e) => {
    e.preventDefault();
    setDiagnosisLoading(true);
    setDiagnosisAlert(null);
    try {
      await api.post('/submit-diagnosis', {
        address: address.trim(),
        diagnosis: { summary: diagnosis, notes: diagnosisNotes },
      }, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setDiagnosisAlert({ variant: 'success', title: 'Success', message: 'Diagnosis submitted successfully.' });
      setDiagnosis('');
      setDiagnosisNotes('');
      // Optionally refetch patient
      handleFetchPatient();
    } catch (err) {
      setDiagnosisAlert({ variant: 'error', title: 'Error', message: err.response?.data?.error || 'Failed to submit diagnosis.' });
    } finally {
      setDiagnosisLoading(false);
    }
  };

  // Certificate issue
  const handleSignAndIssueCertificate = async (e) => {
    e.preventDefault();
    setCertLoading(true);
    setCertAlert(null);
    try {
      let sig = signature;
      if (!sig) {
        if (!window.ethereum) throw new Error('MetaMask not found');
        const msg = `Cert CID: ${certHash}`;
        sig = await window.ethereum.request({ method: 'personal_sign', params: [msg, doctorAddress] });
        setSignature(sig);
      }
      await api.post('/issue-certificate', {
        address: address.trim(),
        certHash,
        signature: sig,
        certType,
        ipfsCid,
      }, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setCertAlert({ variant: 'success', title: 'Success', message: 'Certificate issued and signed.' });
      setCertHash(''); setCertType(''); setIpfsCid(''); setSignature('');
    } catch (err) {
      setCertAlert({ variant: 'error', title: 'Error', message: err.message || 'Failed to issue certificate.' });
    } finally {
      setCertLoading(false);
    }
  };

  // Tab bar
  const tabList = [
    { key: 'records', label: 'Patient Records' },
    { key: 'lab', label: 'Lab Results' },
    { key: 'diagnosis', label: 'Submit Diagnosis' },
    { key: 'cert', label: 'Issue Certificate' },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {tabList.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${tab === t.key ? 'bg-pink-600 text-white shadow' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Shared patient address input */}
      <div className="mb-4 flex gap-2 items-end">
        <div className="flex-1">
          <Label htmlFor="doctor-patient-address">Patient Ethereum Address</Label>
          <Input
            id="doctor-patient-address"
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="0x..."
          />
        </div>
        <button onClick={handleFetchPatient} className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded font-semibold" disabled={fetching || !address.trim()}>
          {fetching ? 'Fetching...' : 'Fetch'}
        </button>
      </div>
      {fetchError && <Alert variant="error" title="Fetch Error" message={fetchError} />}
      {/* Tab content */}
      {tab === 'records' && (
        <ComponentCard title="Patient Records">
          {!patient ? <div className="text-gray-500">No patient loaded.</div> : (
            <div className="space-y-6">
              {/* Demographics */}
              <div>
                <h4 className="font-semibold mb-2 text-gray-700 dark:text-white">Demographics</h4>
                <table className="min-w-full text-sm border rounded">
                  <tbody>
                    <tr><td className="font-semibold px-3 py-2 border bg-gray-50">Name</td><td className="px-3 py-2 border">{patient.demographics?.fullName}</td></tr>
                    <tr><td className="font-semibold px-3 py-2 border bg-gray-50">MyKad/Passport</td><td className="px-3 py-2 border">{patient.demographics?.myKadNo}</td></tr>
                    <tr><td className="font-semibold px-3 py-2 border bg-gray-50">DOB</td><td className="px-3 py-2 border">{patient.demographics?.dob}</td></tr>
                    <tr><td className="font-semibold px-3 py-2 border bg-gray-50">Gender</td><td className="px-3 py-2 border">{patient.demographics?.gender}</td></tr>
                    <tr><td className="font-semibold px-3 py-2 border bg-gray-50">Nationality</td><td className="px-3 py-2 border">{patient.demographics?.nationality}</td></tr>
                  </tbody>
                </table>
              </div>
              {/* Vitals */}
              <div>
                <h4 className="font-semibold mb-2 text-gray-700 dark:text-white">Latest Vitals</h4>
                {patient.vitals && patient.vitals.length > 0 ? (
                  <table className="min-w-full text-xs border rounded">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-1">Date</th>
                        <th className="px-2 py-1">Height</th>
                        <th className="px-2 py-1">Weight</th>
                        <th className="px-2 py-1">BMI</th>
                        <th className="px-2 py-1">BP</th>
                        <th className="px-2 py-1">HR</th>
                        <th className="px-2 py-1">Temp</th>
                        <th className="px-2 py-1">Resp</th>
                        <th className="px-2 py-1">Vision</th>
                        <th className="px-2 py-1">Hearing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.vitals.map((v, i) => (
                        <tr key={i}>
                          <td className="px-2 py-1 border">{v.timestamp ? new Date(v.timestamp).toLocaleString() : ''}</td>
                          <td className="px-2 py-1 border">{v.height}</td>
                          <td className="px-2 py-1 border">{v.weight}</td>
                          <td className="px-2 py-1 border">{v.bmi}</td>
                          <td className="px-2 py-1 border">{v.bloodPressure}</td>
                          <td className="px-2 py-1 border">{v.heartRate}</td>
                          <td className="px-2 py-1 border">{v.temperature}</td>
                          <td className="px-2 py-1 border">{v.respiratoryRate}</td>
                          <td className="px-2 py-1 border">{v.vision}</td>
                          <td className="px-2 py-1 border">{v.hearing}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <div className="text-gray-500">No vitals recorded.</div>}
              </div>
              {/* Tests metadata */}
              <div>
                <h4 className="font-semibold mb-2 text-gray-700 dark:text-white">Test/Procedure Metadata</h4>
                {patient.tests && patient.tests.length > 0 ? (
                  <table className="min-w-full text-xs border rounded">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-1">Type</th>
                        <th className="px-2 py-1">Status</th>
                        <th className="px-2 py-1">Ordered By</th>
                        <th className="px-2 py-1">Date</th>
                        <th className="px-2 py-1">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.tests.map((test, i) => (
                        <tr key={test._id || i} className="border-b">
                          <td className="px-2 py-1 border">{test.testType || 'N/A'}</td>
                          <td className="px-2 py-1 border">
                            <span className={`px-2 py-1 rounded text-white ${test.status === 'completed' ? 'bg-green-500' : test.status === 'ordered' ? 'bg-yellow-500' : 'bg-gray-400'}`}>{test.status || 'N/A'}</span>
                          </td>
                          <td className="px-2 py-1 border">{test.orderedBy || 'N/A'}</td>
                          <td className="px-2 py-1 border">{test.timestamp ? new Date(test.timestamp).toLocaleString() : ''}</td>
                          <td className="px-2 py-1 border">{test.resultCid ? <span className="text-green-600">Available</span> : <span className="text-gray-400">Pending</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <div className="text-gray-500">No tests recorded.</div>}
              </div>
            </div>
          )}
        </ComponentCard>
      )}
      {tab === 'lab' && (
        <ComponentCard title="Lab Results">
          {!patient ? <div className="text-gray-500">No patient loaded.</div> : (
            <div className="space-y-4">
              <Label htmlFor="doctor-lab-test-select">Select Test/Procedure</Label>
              <Select
                options={patient.tests?.map(t => ({ value: t._id, label: `${t.testType} (${t.status})` })) || []}
                value={selectedTestId}
                onChange={handleSelectTest}
                placeholder="Select a test/procedure"
              />
              {labLoading && <div className="text-blue-600">Loading...</div>}
              {labError && <Alert variant="error" title="Error" message={labError} />}
              {selectedTest && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2 text-gray-700 dark:text-white">Lab Result Data</h4>
                  <table className="min-w-full text-sm border rounded mb-2">
                    <tbody>
                      <tr><td className="font-semibold px-3 py-2 border bg-gray-50">Status</td><td className="px-3 py-2 border">{selectedTest.status}</td></tr>
                      <tr><td className="font-semibold px-3 py-2 border bg-gray-50">Ordered By</td><td className="px-3 py-2 border">{selectedTest.orderedBy}</td></tr>
                      <tr><td className="font-semibold px-3 py-2 border bg-gray-50">Date</td><td className="px-3 py-2 border">{selectedTest.timestamp ? new Date(selectedTest.timestamp).toLocaleString() : ''}</td></tr>
                      <tr><td className="font-semibold px-3 py-2 border bg-gray-50">Result CID</td><td className="px-3 py-2 border">{selectedTest.resultCid || 'N/A'}</td></tr>
                    </tbody>
                  </table>
                  <h5 className="font-semibold mb-1 text-gray-700 dark:text-white">Decoded Result Data</h5>
                  {selectedTest.resultData ? (
                    <div className="overflow-x-auto">
                      <RenderObjectTable data={selectedTest.resultData} />
                    </div>
                  ) : <div className="text-gray-500">No result data available.</div>}
                  {selectedTest.resultDataError && (
                    <div className="text-red-500 mt-2">{selectedTest.resultDataError}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </ComponentCard>
      )}
      {tab === 'diagnosis' && (
        <ComponentCard title="Submit Diagnosis">
          <form onSubmit={handleSubmitDiagnosis} className="space-y-4 max-w-lg">
            <div>
              <Label htmlFor="doctor-diagnosis-summary">Diagnosis Summary</Label>
              <Input
                id="doctor-diagnosis-summary"
                type="text"
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="Short summary"
                required
              />
            </div>
            <div>
              <Label htmlFor="doctor-diagnosis-notes">Notes (optional)</Label>
              <Input
                id="doctor-diagnosis-notes"
                type="text"
                value={diagnosisNotes}
                onChange={e => setDiagnosisNotes(e.target.value)}
                placeholder="Additional notes"
              />
            </div>
            <button type="submit" disabled={diagnosisLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold">
              {diagnosisLoading ? 'Submitting...' : 'Submit Diagnosis'}
            </button>
            {diagnosisAlert && <Alert {...diagnosisAlert} />}
          </form>
          {/* Diagnosis history */}
          {patient && patient.diagnosis && patient.diagnosis.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-2 text-gray-700 dark:text-white">Diagnosis History</h4>
              <table className="min-w-full text-xs border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1">Diagnosis</th>
                    <th className="px-2 py-1">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.diagnosis.map((d, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1 border">{d.diagnosis}</td>
                      <td className="px-2 py-1 border">{d.timestamp ? new Date(d.timestamp).toLocaleDateString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      )}
      {tab === 'cert' && (
        <ComponentCard title="Issue Certificate">
          <form onSubmit={handleSignAndIssueCertificate} className="space-y-4 max-w-lg">
            <div>
              <Label htmlFor="doctor-cert-hash">Certificate Hash (CID)</Label>
              <Input
                id="doctor-cert-hash"
                type="text"
                value={certHash}
                onChange={e => setCertHash(e.target.value)}
                placeholder="IPFS CID (from lab result)"
                required
              />
            </div>
            <div>
              <Label htmlFor="doctor-cert-type">Certificate Type</Label>
              <Input
                id="doctor-cert-type"
                type="text"
                value={certType}
                onChange={e => setCertType(e.target.value)}
                placeholder="e.g. COVID-19 PCR Test"
                required
              />
            </div>
            <div>
              <Label htmlFor="doctor-cert-ipfs">IPFS CID (optional)</Label>
              <Input
                id="doctor-cert-ipfs"
                type="text"
                value={ipfsCid}
                onChange={e => setIpfsCid(e.target.value)}
                placeholder="(optional, for extra metadata)"
              />
            </div>
            <div>
              <Label htmlFor="doctor-cert-signature">Signature (auto-filled if using MetaMask)</Label>
              <Input
                id="doctor-cert-signature"
                type="text"
                value={signature}
                onChange={e => setSignature(e.target.value)}
                placeholder="MetaMask signature or paste manually"
              />
            </div>
            <button type="submit" disabled={certLoading} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold">
              {certLoading ? 'Issuing...' : 'Issue Certificate'}
            </button>
            {certAlert && <Alert {...certAlert} />}
          </form>
        </ComponentCard>
      )}
    </div>
  );
}

// --- Doctor Dashboard Test Component ---
function DoctorDashboardTest() {
  const { jwt } = useAuth();
  const [tab, setTab] = React.useState('lookup');
  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('lookup')} className={tab === 'lookup' ? 'bg-pink-600 text-white px-4 py-2 rounded font-semibold' : 'bg-gray-200 text-gray-800 px-4 py-2 rounded'}>Patient Lookup</button>
        <button onClick={() => setTab('certs')} className={tab === 'certs' ? 'bg-pink-600 text-white px-4 py-2 rounded font-semibold' : 'bg-gray-200 text-gray-800 px-4 py-2 rounded'}>Issued Certificates</button>
      </div>
      {tab === 'lookup' && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Patient Lookup</h2>
          <PatientLookupTabForDoctor jwt={jwt} />
        </div>
      )}
      {tab === 'certs' && <IssuedCertificatesTabForDoctor jwt={jwt} />}
    </div>
  );
}

function IssuedCertificatesTabForDoctor({ jwt }) {
  const [certs, setCerts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  React.useEffect(() => {
    setLoading(true);
    setError(null);
    api.get('/doctors/my-certificates', { headers: { Authorization: `Bearer ${jwt}` } })
      .then(res => setCerts(res.data.certificates || []))
      .catch(err => setError(err.response?.data?.error || 'Failed to fetch certificates'))
      .finally(() => setLoading(false));
  }, [jwt]);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Issued Certificates</h2>
      {loading ? <div className="text-blue-600">Loading...</div> : error ? <div className="text-red-600">{error}</div> : (
        certs.length > 0 ? (
          <table className="min-w-full text-xs border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1">Patient Address</th>
                <th className="px-2 py-1">Procedure Type</th>
                <th className="px-2 py-1">CID</th>
                <th className="px-2 py-1">Tx Hash</th>
                <th className="px-2 py-1">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {certs.map(cert => (
                <tr key={cert._id}>
                  <td className="px-2 py-1 border">{cert.patient}</td>
                  <td className="px-2 py-1 border">{cert.certType || cert.procedureType}</td>
                  <td className="px-2 py-1 border">
                    {cert.ipfsCid ? (
                      <a href={`https://gateway.pinata.cloud/ipfs/${cert.ipfsCid}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{cert.ipfsCid}</a>
                    ) : cert.certHash ? (
                      <a href={`https://gateway.pinata.cloud/ipfs/${cert.certHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{cert.certHash}</a>
                    ) : 'N/A'}
                  </td>
                  <td className="px-2 py-1 border">
                    {cert.txHash ? (
                      <a href={`https://sepolia.etherscan.io/tx/${cert.txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{cert.txHash}</a>
                    ) : 'N/A'}
                  </td>
                  <td className="px-2 py-1 border">{cert.issuedAt ? new Date(cert.issuedAt).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="text-gray-500">No certificates issued yet.</div>
      )}
    </div>
  );
}

function PatientLookupTabForDoctor({ jwt }) {
  const [address, setAddress] = React.useState('');
  const [patient, setPatient] = React.useState(null);
  const [selectedTest, setSelectedTest] = React.useState(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState(null);
  const [diagnosis, setDiagnosis] = React.useState('');
  const [diagnosisLoading, setDiagnosisLoading] = React.useState(false);
  const [diagnosisAlert, setDiagnosisAlert] = React.useState(null);
  const [certLoading, setCertLoading] = React.useState(false);
  const [certAlert, setCertAlert] = React.useState(null);
  const { address: doctorAddress } = useAuth();

  const fetchPatient = async () => {
    const res = await api.get(`/patients/${address}`, { headers: { Authorization: `Bearer ${jwt}` } });
    setPatient(res.data.patient || res.data);
  };

  const handleViewDetails = async (test) => {
    setDetailLoading(true);
    setDetailError(null);
    setSelectedTest(null);
    try {
      const res = await api.get(`/patients/${address}/tests/${test._id}`, { headers: { Authorization: `Bearer ${jwt}` } });
      setSelectedTest(res.data);
    } catch (err) {
      setDetailError(err.response?.data?.error || 'Failed to fetch test details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedTest(null);
    setDetailError(null);
    setCertAlert(null);
  };

  // Submit diagnosis
  const handleSubmitDiagnosis = async (e) => {
    e.preventDefault();
    setDiagnosisLoading(true);
    setDiagnosisAlert(null);
    try {
      await api.post('/submit-diagnosis', {
        address: address.trim(),
        diagnosis: { summary: diagnosis },
      }, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setDiagnosisAlert({ type: 'success', message: 'Diagnosis submitted successfully.' });
      setDiagnosis('');
    } catch (err) {
      setDiagnosisAlert({ type: 'error', message: err.response?.data?.error || 'Failed to submit diagnosis.' });
    } finally {
      setDiagnosisLoading(false);
    }
  };

  // Issue certificate for a test
  const handleIssueCertificate = async () => {
    if (!selectedTest || selectedTest.status !== 'completed' || !selectedTest.resultCid) {
      setCertAlert({ type: 'error', message: 'Certificate can only be issued for completed tests with results.' });
      return;
    }
    if (!window.confirm('Are you sure you want to issue a certificate for this test? This action is irreversible.')) {
      return;
    }
    setCertLoading(true);
    setCertAlert(null);
    try {
      if (!window.ethereum) throw new Error('MetaMask is not installed.');
      const certHash = selectedTest.resultCid;
      const msg = `Cert CID: ${certHash}`;
      const from = doctorAddress;
      let signature;
      try {
        signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [msg, from],
        });
      } catch (err) {
        if (err.code === 4001) {
          setCertAlert({ type: 'error', message: 'Signature request was rejected.' });
          setCertLoading(false);
          return;
        } else {
          setCertAlert({ type: 'error', message: err.message || 'MetaMask error.' });
          setCertLoading(false);
          return;
        }
      }
      const res = await api.post('/issue-certificate', {
        address: address.trim(),
        certHash,
        signature,
        certType: selectedTest.testType,
        ipfsCid: certHash,
      }, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setCertAlert({
        type: 'success',
        message: (
          <>
            Certificate issued and signed.<br />
            {res.data.txHash && (
              <a href={`https://sepolia.etherscan.io/tx/${res.data.txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                View on Etherscan
              </a>
            )}
          </>
        )
      });
      fetchPatient();
    } catch (err) {
      setCertAlert({ type: 'error', message: err.message || 'Failed to issue certificate.' });
    } finally {
      setCertLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 max-w-3xl mx-auto">
      <div className="flex gap-2 mb-6">
        <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Patient address" className="border border-gray-300 rounded px-3 py-2 flex-1" />
        <button onClick={fetchPatient} className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded font-semibold">Fetch</button>
      </div>
      {patient && (
        <div className="space-y-8">
          {/* Demographics */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-white">Demographics</h3>
            <table className="min-w-full text-sm border rounded">
              <tbody>
                <tr><td className="font-semibold px-3 py-2 border bg-gray-50">Name</td><td className="px-3 py-2 border">{patient.demographics?.fullName}</td></tr>
                <tr><td className="font-semibold px-3 py-2 border bg-gray-50">MyKad/Passport</td><td className="px-3 py-2 border">{patient.demographics?.myKadNo}</td></tr>
                <tr><td className="font-semibold px-3 py-2 border bg-gray-50">DOB</td><td className="px-3 py-2 border">{patient.demographics?.dob}</td></tr>
                <tr><td className="font-semibold px-3 py-2 border bg-gray-50">Gender</td><td className="px-3 py-2 border">{patient.demographics?.gender}</td></tr>
                <tr><td className="font-semibold px-3 py-2 border bg-gray-50">Nationality</td><td className="px-3 py-2 border">{patient.demographics?.nationality}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Vitals */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-white">Vitals</h3>
            {patient.vitals && patient.vitals.length > 0 ? (
              <table className="min-w-full text-xs border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1">Date</th>
                    <th className="px-2 py-1">Height</th>
                    <th className="px-2 py-1">Weight</th>
                    <th className="px-2 py-1">BMI</th>
                    <th className="px-2 py-1">BP</th>
                    <th className="px-2 py-1">HR</th>
                    <th className="px-2 py-1">Temp</th>
                    <th className="px-2 py-1">Resp</th>
                    <th className="px-2 py-1">Vision</th>
                    <th className="px-2 py-1">Hearing</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.vitals.map((v, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1 border">{v.timestamp ? new Date(v.timestamp).toLocaleString() : ''}</td>
                      <td className="px-2 py-1 border">{v.height}</td>
                      <td className="px-2 py-1 border">{v.weight}</td>
                      <td className="px-2 py-1 border">{v.bmi}</td>
                      <td className="px-2 py-1 border">{v.bloodPressure}</td>
                      <td className="px-2 py-1 border">{v.heartRate}</td>
                      <td className="px-2 py-1 border">{v.temperature}</td>
                      <td className="px-2 py-1 border">{v.respiratoryRate}</td>
                      <td className="px-2 py-1 border">{v.vision}</td>
                      <td className="px-2 py-1 border">{v.hearing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-gray-500">No vitals recorded.</div>
            )}
          </div>

          {/* Tests / Procedures */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-white">Tests / Procedures</h3>
            {patient.tests && patient.tests.length > 0 ? (
              <table className="min-w-full text-xs border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1">Type</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">Ordered By</th>
                    <th className="px-2 py-1">Date</th>
                    <th className="px-2 py-1">Result</th>
                    <th className="px-2 py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {patient.tests.map((test, i) => (
                    <tr key={test._id || i} className="border-b">
                      <td className="px-2 py-1 border">{test.testType || 'N/A'}</td>
                      <td className="px-2 py-1 border">
                        <span className={`px-2 py-1 rounded text-white ${test.status === 'completed' ? 'bg-green-500' : test.status === 'ordered' ? 'bg-yellow-500' : 'bg-gray-400'}`}>{test.status || 'N/A'}</span>
                      </td>
                      <td className="px-2 py-1 border">{test.orderedBy || 'N/A'}</td>
                      <td className="px-2 py-1 border">{test.timestamp ? new Date(test.timestamp).toLocaleString() : ''}</td>
                      <td className="px-2 py-1 border">{test.resultCid ? <span className="text-green-600">Available</span> : <span className="text-gray-400">Pending</span>}</td>
                      <td className="px-2 py-1 border">
                        {test.status === 'completed' && test.resultCid ? (
                          <button
                            className="bg-green-600 text-white px-2 py-1 rounded"
                            onClick={() => handleViewDetails(test)}
                          >
                            View Details
                          </button>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="text-gray-500">No tests recorded.</div>}
          </div>

          {/* Test Detail Modal/Expandable */}
          {selectedTest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-2xl relative overflow-y-auto max-h-[90vh]">
                {/* Close Button */}
                <button
                  onClick={closeDetail}
                  className="absolute top-4 right-4 text-gray-400 hover:text-pink-600 text-3xl font-bold focus:outline-none"
                  aria-label="Close"
                >
                  &times;
                </button>
                {/* Modal Header */}
                <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">{selectedTest.testType || 'Test Details'}</h2>
                <hr className="mb-4 border-gray-200 dark:border-gray-700" />

                {/* Test Metadata */}
                <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-white">Test Metadata</h3>
                <table className="min-w-full text-sm border rounded mb-6 bg-gray-50 dark:bg-gray-800">
                  <tbody>
                    <tr><td className="font-semibold px-3 py-2 border bg-gray-100 dark:bg-gray-700">Status</td><td className="px-3 py-2 border">{selectedTest.status}</td></tr>
                    <tr><td className="font-semibold px-3 py-2 border bg-gray-100 dark:bg-gray-700">Ordered By</td><td className="px-3 py-2 border">{selectedTest.orderedBy}</td></tr>
                    <tr><td className="font-semibold px-3 py-2 border bg-gray-100 dark:bg-gray-700">Date</td><td className="px-3 py-2 border">{selectedTest.timestamp ? new Date(selectedTest.timestamp).toLocaleString() : ''}</td></tr>
                    <tr><td className="font-semibold px-3 py-2 border bg-gray-100 dark:bg-gray-700">Result CID</td><td className="px-3 py-2 border break-all">{selectedTest.resultCid || 'N/A'}</td></tr>
                  </tbody>
                </table>

                {/* Decoded Result Data */}
                <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-white">Decoded Result Data</h3>
                {selectedTest.resultData ? (
                  <div className="overflow-x-auto mb-4">
                    <RenderObjectTable data={selectedTest.resultData} />
                  </div>
                ) : (
                  <span className="text-gray-500">No result data available.</span>
                )}
                {selectedTest.resultDataError && (
                  <div className="text-red-500 mt-2">{selectedTest.resultDataError}</div>
                )}

                {detailLoading && <div className="text-blue-600">Loading...</div>}
                {detailError && <div className="text-red-600">{detailError}</div>}
                <button
                  onClick={closeDetail}
                  className="mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          )}
          {/* Diagnosis Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-white">Diagnosis</h3>
            <form onSubmit={handleSubmitDiagnosis} className="flex gap-2 mb-2">
              <input
                type="text"
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis summary"
                className="border border-gray-300 rounded px-3 py-2 flex-1"
                required
              />
              <button type="submit" disabled={diagnosisLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold">
                {diagnosisLoading ? 'Submitting...' : 'Submit Diagnosis'}
              </button>
            </form>
            {diagnosisAlert && (
              <div className={`mb-2 text-sm ${diagnosisAlert.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{diagnosisAlert.message}</div>
            )}
            {patient.diagnosis && patient.diagnosis.length > 0 ? (
              <table className="min-w-full text-xs border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1">Diagnosis</th>
                    <th className="px-2 py-1">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.diagnosis.map((d, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1 border">{d.diagnosis}</td>
                      <td className="px-2 py-1 border">{d.timestamp ? new Date(d.timestamp).toLocaleDateString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="text-gray-500">No diagnosis recorded.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function PendingCertificationsTabForDoctor({ jwt, doctorAddress }) {
  const [pending, setPending] = React.useState([]);
  React.useEffect(() => {
    async function fetchPending() {
      // For demo: fetch all patients, flatten, filter
      const res = await api.get('/patients', { headers: { Authorization: `Bearer ${jwt}` } });
      const allProcedures = res.data.flatMap(p => (p.tests || []).map(t => ({ ...t, patient: p.address })));
      setPending(allProcedures.filter(proc =>
        proc.status === 'completed' && proc.resultCid && !proc.certified
      ));
    }
    fetchPending();
  }, [jwt]);
  return (
    <div>
      {pending.map(proc => (
        <ProcedureCardForDoctor procedure={proc} key={proc._id} patientAddress={proc.patient} doctorAddress={doctorAddress} />
      ))}
    </div>
  );
}

// --- ProcedureCardForDoctor ---
function ProcedureCardForDoctor({ procedure, patientAddress, doctorAddress }) {
  const [result, setResult] = React.useState(null);
  const [form, setForm] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [alert, setAlert] = React.useState(null);
  React.useEffect(() => {
    if (procedure.resultCid) {
      fetch(`https://gateway.pinata.cloud/ipfs/${procedure.resultCid}`)
        .then(res => res.text())
        .then(base64 => setResult(JSON.parse(atob(base64))));
    }
  }, [procedure.resultCid]);
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleCertify = async () => {
    setLoading(true);
    setAlert(null);
    try {
      // 1. Build cert metadata
      const certMeta = {
        patient: patientAddress,
        procedureType: procedure.testType,
        ...form,
        interpretedBy: doctorAddress,
        timestamp: new Date().toISOString(),
      };
      // 2. Upload to IPFS (Pinata, via backend or direct)
      const base64 = btoa(JSON.stringify(certMeta));
      // For demo: upload via backend
      const ipfsRes = await api.post('/pinata-upload', { base64 });
      const cid = ipfsRes.data.cid;
      // 3. Sign CID with MetaMask
      const msg = `Cert CID: ${cid}`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [msg, doctorAddress],
      });
      // 4. POST /issue-certificate
      await api.post('/issue-certificate', {
        address: patientAddress,
        certHash: cid,
        signature,
        certType: procedure.testType,
        ipfsCid: cid,
      });
      setAlert({ variant: 'success', title: 'Certificate Issued', message: 'Certificate issued and signed.' });
    } catch (err) {
      setAlert({ variant: 'error', title: 'Certificate Error', message: err.message || 'Failed to issue certificate.' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="border p-4 mb-4 bg-white dark:bg-gray-800 rounded">
      <h4 className="font-bold">{procedure.testType}</h4>
      {result && (
        <div>
          <b>Result from IPFS:</b>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      <DoctorInputForm procedureType={procedure.testType} onChange={handleChange} values={form} />
      {alert && <Alert {...alert} />}
      <button onClick={handleCertify} disabled={loading} className="bg-green-600 text-white px-3 py-1 rounded mt-2">
        {loading ? 'Certifying...' : 'Issue Certificate'}
      </button>
    </div>
  );
}

// --- DoctorInputForm ---
function DoctorInputForm({ procedureType, onChange, values }) {
  switch (procedureType) {
    case 'COVID-19 PCR Test':
      return (
        <>
          <select name="result" value={values.result || ''} onChange={onChange} className="border p-1 mr-2">
            <option value="">Result</option>
            <option value="Negative">Negative</option>
            <option value="Positive">Positive</option>
          </select>
          <input name="lab" placeholder="Lab Name" value={values.lab || ''} onChange={onChange} className="border p-1 mr-2" />
          <input name="date" type="date" value={values.date || ''} onChange={onChange} className="border p-1 mr-2" />
          <textarea name="interpretation" placeholder="Interpretation" value={values.interpretation || ''} onChange={onChange} className="border p-1 w-full mt-2" />
        </>
      );
    case 'Fitness Assessment':
      return (
        <>
          <input name="height" placeholder="Height (cm)" value={values.height || ''} onChange={onChange} className="border p-1 mr-2" />
          <input name="weight" placeholder="Weight (kg)" value={values.weight || ''} onChange={onChange} className="border p-1 mr-2" />
          <input name="bmi" placeholder="BMI" value={values.bmi || ''} onChange={onChange} className="border p-1 mr-2" />
          <input name="bp" placeholder="Blood Pressure" value={values.bp || ''} onChange={onChange} className="border p-1 mr-2" />
          <select name="fit" value={values.fit || ''} onChange={onChange} className="border p-1 mr-2">
            <option value="">Fit/Unfit</option>
            <option value="Fit">Fit</option>
            <option value="Unfit">Unfit</option>
          </select>
        </>
      );
    case 'Yellow Fever Vaccine':
    case 'Typhoid Vaccine':
    case 'Hepatitis B Vaccine':
    case 'MMR Vaccine':
    case 'Tetanus Vaccine':
    case 'Influenza Vaccine':
      return (
        <>
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">Pre-Vaccination Assessment</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Blood Pressure</label>
                <input 
                  name="bloodPressure" 
                  value={values.bloodPressure || ''} 
                  onChange={onChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="e.g., 120/80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Heart Rate</label>
                <input 
                  name="heartRate" 
                  value={values.heartRate || ''} 
                  onChange={onChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="e.g., 72"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Temperature</label>
                <input 
                  name="temperature" 
                  value={values.temperature || ''} 
                  onChange={onChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="e.g., 37.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fit for Vaccination</label>
                <select 
                  name="fitForVaccination" 
                  value={values.fitForVaccination || ''} 
                  onChange={onChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Assessment Notes</label>
              <textarea 
                name="assessmentNotes" 
                value={values.assessmentNotes || ''} 
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Enter any special instructions or contraindications..."
                rows={3}
              />
            </div>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">Vaccine Administration Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                <input 
                  name="batchNo" 
                  value={values.batchNo || ''} 
                  onChange={onChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Enter batch number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Administration Date</label>
                <input 
                  name="adminDate" 
                  type="date" 
                  value={values.adminDate || ''} 
                  onChange={onChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Post-Vaccination Notes</label>
              <textarea 
                name="postVaccinationNotes" 
                value={values.postVaccinationNotes || ''} 
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Enter any observations or reactions..."
                rows={3}
              />
            </div>
          </div>
        </>
      );
    // Add more cases for other procedures...
    default:
      return <div className="text-gray-500">No doctor input required for this procedure.</div>;
  }
} 

// Add a new tab for Doctor Review
function DoctorReviewTab() {
  const { jwt } = useAuth();
  const [address, setAddress] = React.useState('');
  const [patient, setPatient] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleFetch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPatient(null);
    try {
      const res = await api.get(`/patients/${address}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setPatient(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleFetch} className="mb-4 flex gap-2">
        <Input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Patient Ethereum Address"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Fetch</button>
      </form>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {patient && (
        <div className="space-y-4">
          <ComponentCard title="Demographics">
            <pre>{JSON.stringify(patient.demographics, null, 2)}</pre>
          </ComponentCard>
          <ComponentCard title="Diagnosis">
            <pre>{JSON.stringify(patient.diagnosis, null, 2)}</pre>
          </ComponentCard>
          <ComponentCard title="Tests">
            <pre>{JSON.stringify(patient.tests, null, 2)}</pre>
          </ComponentCard>
          <ComponentCard title="Vitals">
            <pre>{JSON.stringify(patient.vitals, null, 2)}</pre>
          </ComponentCard>
        </div>
      )}
    </div>
  );
}

// Recursive table renderer for objects/arrays
function RenderObjectTable({ data }) {
  if (Array.isArray(data)) {
    return (
      <table className="min-w-full text-xs border mb-2">
        <thead>
          <tr>
            {Object.keys(data[0] || {}).map(key => (
              <th key={key} className="font-semibold px-2 py-1 border bg-gray-100">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {Object.values(row).map((val, i) => (
                <td key={i} className="px-2 py-1 border">
                  <RenderObjectTable data={val} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else if (typeof data === 'object' && data !== null) {
    return (
      <table className="min-w-full text-xs border mb-2">
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key}>
              <td className="font-semibold px-2 py-1 border bg-gray-100">{key}</td>
              <td className="px-2 py-1 border">
                {typeof value === 'object' && value !== null
                  ? <RenderObjectTable data={value} />
                  : String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else {
    return <span>{String(data)}</span>;
  }
}

// --- AdminDashboardUI ---
function AdminDashboardUI() {
  const { jwt } = useAuth();
  const [adminTab, setAdminTab] = React.useState('logs');

  // --- Audit Logs ---
  const [logs, setLogs] = React.useState('');
  const [logsLoading, setLogsLoading] = React.useState(false);
  const [logsError, setLogsError] = React.useState(null);
  const fetchLogs = async () => {
    setLogsLoading(true); setLogsError(null);
    try {
      const res = await api.get('/audit-logs', { headers: { Authorization: `Bearer ${jwt}` } });
      setLogs(res.data || res);
    } catch (err) {
      setLogsError(err.response?.data?.error || 'Failed to fetch logs');
    } finally {
      setLogsLoading(false);
    }
  };

  // --- Patient Management ---
  const [patients, setPatients] = React.useState([]);
  const [patientsLoading, setPatientsLoading] = React.useState(false);
  const [patientsError, setPatientsError] = React.useState(null);
  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const fetchPatients = async () => {
    setPatientsLoading(true); setPatientsError(null);
    try {
      const res = await api.get('/patients', { headers: { Authorization: `Bearer ${jwt}` } });
      setPatients(res.data);
    } catch (err) {
      setPatientsError(err.response?.data?.error || 'Failed to fetch patients');
    } finally {
      setPatientsLoading(false);
    }
  };
  const fetchPatientDetails = async (address) => {
    setSelectedPatient(null);
    try {
      const res = await api.get(`/patients/${address}`, { headers: { Authorization: `Bearer ${jwt}` } });
      setSelectedPatient(res.data.patient || res.data);
    } catch (err) {
      setSelectedPatient({ error: err.response?.data?.error || 'Failed to fetch patient details' });
    }
  };

  // --- Certificate Management ---
  const [certPatientAddr, setCertPatientAddr] = React.useState('');
  const [certs, setCerts] = React.useState([]);
  const [certsLoading, setCertsLoading] = React.useState(false);
  const [certsError, setCertsError] = React.useState(null);
  const fetchCerts = async () => {
    setCertsLoading(true); setCertsError(null);
    try {
      const res = await api.get(`/patients/${certPatientAddr}/certificates`, { headers: { Authorization: `Bearer ${jwt}` } });
      setCerts(res.data.certificates || []);
    } catch (err) {
      setCertsError(err.response?.data?.error || 'Failed to fetch certificates');
    } finally {
      setCertsLoading(false);
    }
  };
  const deleteCert = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    try {
      await api.delete(`/certificates/${id}`, { headers: { Authorization: `Bearer ${jwt}` } });
      setCerts(certs => certs.filter(c => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete certificate');
    }
  };

  // --- Role Management ---
  const [roleAddress, setRoleAddress] = React.useState('');
  const [roleInfo, setRoleInfo] = React.useState(null);
  const [roleLoading, setRoleLoading] = React.useState(false);
  const [roleError, setRoleError] = React.useState(null);
  const [assignRole, setAssignRole] = React.useState('');
  const [revokeRole, setRevokeRole] = React.useState('');
  const [roleActionLoading, setRoleActionLoading] = React.useState(false);
  const [roleActionMsg, setRoleActionMsg] = React.useState(null);
  const fetchRoleInfo = async () => {
    setRoleLoading(true); setRoleError(null);
    try {
      const res = await api.get('/check-role', { headers: { Authorization: `Bearer ${jwt}` } });
      setRoleInfo(res.data);
    } catch (err) {
      setRoleError(err.response?.data?.error || 'Failed to fetch role info');
    } finally {
      setRoleLoading(false);
    }
  };
  const handleAssignRole = async () => {
    setRoleActionLoading(true); setRoleActionMsg(null);
    try {
      const res = await api.post('/assign-role', { address: roleAddress, role: assignRole }, { headers: { Authorization: `Bearer ${jwt}` } });
      setRoleActionMsg({ type: 'success', msg: `Role assigned. Tx: ${res.data.transactionHash}` });
      fetchRoleInfo();
    } catch (err) {
      setRoleActionMsg({ type: 'error', msg: err.response?.data?.error || 'Failed to assign role' });
    } finally {
      setRoleActionLoading(false);
    }
  };
  const handleRevokeRole = async () => {
    setRoleActionLoading(true); setRoleActionMsg(null);
    try {
      const res = await api.post('/revoke-role', { address: roleAddress, role: revokeRole }, { headers: { Authorization: `Bearer ${jwt}` } });
      setRoleActionMsg({ type: 'success', msg: `Role revoked. Tx: ${res.data.transactionHash}` });
      fetchRoleInfo();
    } catch (err) {
      setRoleActionMsg({ type: 'error', msg: err.response?.data?.error || 'Failed to revoke role' });
    } finally {
      setRoleActionLoading(false);
    }
  };

  // --- UI ---
  const adminTabs = [
    { key: 'logs', label: 'Audit Logs' },
    { key: 'patients', label: 'Patient Management' },
    { key: 'certs', label: 'Certificate Management' },
    { key: 'roles', label: 'Role Management' },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {adminTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setAdminTab(t.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${adminTab === t.key ? 'bg-yellow-600 text-white shadow' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Audit Logs */}
      {adminTab === 'logs' && (
        <ComponentCard title="Audit Logs">
          <button onClick={fetchLogs} className="bg-yellow-600 text-white px-4 py-2 rounded mb-2">Fetch Logs</button>
          {logsLoading ? <div>Loading...</div> : logsError ? <div className="text-red-600">{logsError}</div> : (
            <pre className="bg-gray-900 text-white p-4 rounded overflow-x-auto max-h-96 whitespace-pre-wrap">{logs && typeof logs === 'string' ? logs : JSON.stringify(logs, null, 2)}</pre>
          )}
        </ComponentCard>
      )}
      {/* Patient Management */}
      {adminTab === 'patients' && (
        <ComponentCard title="Patient Management">
          <button onClick={fetchPatients} className="bg-yellow-600 text-white px-4 py-2 rounded mb-2">Fetch All Patients</button>
          {patientsLoading ? <div>Loading...</div> : patientsError ? <div className="text-red-600">{patientsError}</div> : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border mb-2">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1">Address</th>
                    <th className="px-2 py-1">Name</th>
                    <th className="px-2 py-1">MyKad/Passport</th>
                    <th className="px-2 py-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.address}>
                      <td className="px-2 py-1 border">{p.address}</td>
                      <td className="px-2 py-1 border">{p.demographics?.fullName}</td>
                      <td className="px-2 py-1 border">{p.demographics?.myKadNo}</td>
                      <td className="px-2 py-1 border">
                        <button onClick={() => fetchPatientDetails(p.address)} className="bg-yellow-500 text-white px-2 py-1 rounded">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {selectedPatient && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Patient Details</h4>
              {selectedPatient.error ? <div className="text-red-600">{selectedPatient.error}</div> : (
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(selectedPatient, null, 2)}</pre>
              )}
            </div>
          )}
        </ComponentCard>
      )}
      {/* Certificate Management */}
      {adminTab === 'certs' && (
        <ComponentCard title="Certificate Management">
          <div className="flex gap-2 mb-2">
            <Input type="text" value={certPatientAddr} onChange={e => setCertPatientAddr(e.target.value)} placeholder="Patient Address (0x...)" />
            <button onClick={fetchCerts} className="bg-yellow-600 text-white px-4 py-2 rounded">Fetch Certificates</button>
          </div>
          {certsLoading ? <div>Loading...</div> : certsError ? <div className="text-red-600">{certsError}</div> : (
            <table className="min-w-full text-xs border mb-2">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-1">Type</th>
                  <th className="px-2 py-1">CID</th>
                  <th className="px-2 py-1">Issued By</th>
                  <th className="px-2 py-1">Issued At</th>
                  <th className="px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certs.map(cert => (
                  <tr key={cert._id}>
                    <td className="px-2 py-1 border">{cert.certType}</td>
                    <td className="px-2 py-1 border break-all">{cert.ipfsCid || cert.certHash}</td>
                    <td className="px-2 py-1 border">{cert.issuedBy}</td>
                    <td className="px-2 py-1 border">{cert.issuedAt ? new Date(cert.issuedAt).toLocaleString() : ''}</td>
                    <td className="px-2 py-1 border">
                      <button onClick={() => deleteCert(cert._id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ComponentCard>
      )}
      {/* Role Management */}
      {adminTab === 'roles' && (
        <ComponentCard title="Role Management">
          <div className="flex gap-2 mb-2">
            <Input type="text" value={roleAddress} onChange={e => setRoleAddress(e.target.value)} placeholder="Ethereum Address (0x...)" />
            <button onClick={fetchRoleInfo} className="bg-yellow-600 text-white px-4 py-2 rounded">Check Roles</button>
          </div>
          {roleLoading ? <div>Loading...</div> : roleError ? <div className="text-red-600">{roleError}</div> : roleInfo && (
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(roleInfo, null, 2)}</pre>
          )}
          <div className="flex gap-2 mt-4">
            <Select
              options={[{ value: 'ADMIN', label: 'Admin' }, { value: 'RECEPTIONIST', label: 'Receptionist' }, { value: 'NURSE', label: 'Nurse' }, { value: 'DOCTOR', label: 'Doctor' }, { value: 'PATIENT', label: 'Patient' }]}
              value={assignRole}
              onChange={v => setAssignRole(v)}
              placeholder="Assign Role"
            />
            <button onClick={handleAssignRole} className="bg-green-600 text-white px-4 py-2 rounded" disabled={roleActionLoading}>Assign</button>
            <Select
              options={[{ value: 'ADMIN', label: 'Admin' }, { value: 'RECEPTIONIST', label: 'Receptionist' }, { value: 'NURSE', label: 'Nurse' }, { value: 'DOCTOR', label: 'Doctor' }, { value: 'PATIENT', label: 'Patient' }]}
              value={revokeRole}
              onChange={v => setRevokeRole(v)}
              placeholder="Revoke Role"
            />
            <button onClick={handleRevokeRole} className="bg-red-600 text-white px-4 py-2 rounded" disabled={roleActionLoading}>Revoke</button>
          </div>
          {roleActionMsg && (
            <div className={`mt-2 text-sm ${roleActionMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{roleActionMsg.msg}</div>
          )}
        </ComponentCard>
      )}
    </div>
  );
}