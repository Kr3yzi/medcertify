import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import ComponentCard from '../../components/common/ComponentCard';
import Alert from '../../components/ui/alert/Alert';
import { TestOrder, AlertState, ApiError } from './types';
import { FaUserCircle } from "react-icons/fa";

interface TestResultsProps {
  patientAddress: string;
}

// Updated testResultTemplates with all test/vaccine types
const testResultTemplates: { [testType: string]: { name: string; label: string; type: string }[] } = {
  "Full Blood Count (FBC)": [
    { name: "hemoglobin", label: "Hemoglobin (g/dL)", type: "number" },
    { name: "wbc", label: "White Blood Cells (10^9/L)", type: "number" },
    { name: "platelets", label: "Platelets (10^9/L)", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" }
  ],
  "Urinalysis": [
    { name: "appearance", label: "Appearance", type: "text" },
    { name: "ph", label: "pH", type: "number" },
    { name: "protein", label: "Protein", type: "text" },
    { name: "glucose", label: "Glucose", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" }
  ],
  "Chest X-ray": [
    { name: "result", label: "Result", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" }
  ],
  "TB Test (Mantoux)": [
    { name: "induration", label: "Induration (mm)", type: "number" },
    { name: "result", label: "Result", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" }
  ],
  "Hepatitis B Surface Antigen (HBsAg)": [
    { name: "result", label: "Result", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" }
  ],
  "HIV Test": [
    { name: "result", label: "Result", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" }
  ],
  "Syphilis (VDRL/RPR)": [
    { name: "result", label: "Result", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" }
  ],
  "Typhoid Test": [
    { name: "result", label: "Result", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" }
  ],
  "Pregnancy Test (Urine hCG)": [
    { name: "result", label: "Result", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" }
  ],
  "COVID-19 PCR Test": [
    { name: "result", label: "Result", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" }
  ],
  "Fitness Assessment": [
    { name: "result", label: "Result", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" }
  ],
  "Hepatitis B Vaccine": [
    { name: "batchNo", label: "Batch No.", type: "text" },
    { name: "adminDate", label: "Administration Date", type: "date" },
    { name: "site", label: "Injection Site", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" }
  ],
  "Typhoid Vaccine": [
    { name: "batchNo", label: "Batch No.", type: "text" },
    { name: "adminDate", label: "Administration Date", type: "date" },
    { name: "site", label: "Injection Site", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" }
  ],
  "Tetanus Vaccine": [
    { name: "batchNo", label: "Batch No.", type: "text" },
    { name: "adminDate", label: "Administration Date", type: "date" },
    { name: "site", label: "Injection Site", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" }
  ],
  "MMR Vaccine": [
    { name: "batchNo", label: "Batch No.", type: "text" },
    { name: "adminDate", label: "Administration Date", type: "date" },
    { name: "site", label: "Injection Site", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" }
  ],
  "COVID-19 Vaccine": [
    { name: "batchNo", label: "Batch No.", type: "text" },
    { name: "adminDate", label: "Administration Date", type: "date" },
    { name: "site", label: "Injection Site", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" }
  ]
};

// Updated exampleData with all test/vaccine types
const exampleData: { [testType: string]: { [field: string]: string } } = {
  "Full Blood Count (FBC)": {
    hemoglobin: "13.5",
    wbc: "6.2",
    platelets: "250",
    notes: "All values within normal range."
  },
  "Urinalysis": {
    appearance: "Clear",
    ph: "6.0",
    protein: "Negative",
    glucose: "Negative",
    notes: "No abnormalities detected."
  },
  "Chest X-ray": {
    result: "No active lung lesion.",
    notes: "Normal chest x-ray."
  },
  "TB Test (Mantoux)": {
    induration: "0",
    result: "Negative",
    notes: "No induration observed after 72 hours."
  },
  "Hepatitis B Surface Antigen (HBsAg)": {
    result: "Negative",
    notes: "No HBsAg detected."
  },
  "HIV Test": {
    result: "Negative",
    notes: "No HIV antibodies detected."
  },
  "Syphilis (VDRL/RPR)": {
    result: "Non-reactive",
    notes: "No syphilis antibodies detected."
  },
  "Typhoid Test": {
    result: "Negative",
    notes: "No typhoid antibodies detected."
  },
  "Pregnancy Test (Urine hCG)": {
    result: "Negative",
    notes: "No hCG detected."
  },
  "COVID-19 PCR Test": {
    result: "Negative",
    notes: "No SARS-CoV-2 RNA detected."
  },
  "Fitness Assessment": {
    result: "Fit",
    notes: "Patient cleared for physical activity."
  },
  "Hepatitis B Vaccine": {
    batchNo: "HBV-2024-001",
    adminDate: "2024-06-01",
    site: "Left deltoid",
    notes: "No immediate adverse reaction."
  },
  "Typhoid Vaccine": {
    batchNo: "TY-2024-002",
    adminDate: "2024-06-02",
    site: "Right deltoid",
    notes: "Patient observed for 30 minutes post-injection."
  },
  "Tetanus Vaccine": {
    batchNo: "TET-2024-003",
    adminDate: "2024-06-03",
    site: "Left deltoid",
    notes: "No immediate adverse reaction."
  },
  "MMR Vaccine": {
    batchNo: "MMR-2024-004",
    adminDate: "2024-06-04",
    site: "Right deltoid",
    notes: "Patient observed for 30 minutes post-injection."
  },
  "COVID-19 Vaccine": {
    batchNo: "COV-2024-005",
    adminDate: "2024-06-05",
    site: "Left deltoid",
    notes: "No immediate adverse reaction."
  }
};

// Add this above the test/vaccine results list, after fetching demographics
type PatientDemographics = {
  fullName: string;
  dob: string;
  gender: string;
  nationality: string;
};

const TestResults: React.FC<TestResultsProps> = ({ patientAddress }) => {
  const { jwt } = useAuth();
  const [testOrders, setTestOrders] = useState<TestOrder[]>([]);
  const [testOrdersLoading, setTestOrdersLoading] = useState(false);
  const [testOrdersAlert, setTestOrdersAlert] = useState<AlertState | null>(null);
  const [resultInputs, setResultInputs] = useState<{ [testId: string]: { [field: string]: string } }>({});
  const [patientDemographics, setPatientDemographics] = useState<PatientDemographics | null>(null);

  const handleFetchTestOrders = async () => {
    setTestOrdersLoading(true);
    setTestOrdersAlert(null);
    try {
      const res = await api.get(`/patients/${patientAddress.toLowerCase()}/tests`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setTestOrders(res.data.tests || []);
      setPatientDemographics(res.data.demographics);
    } catch (err) {
      const error = err as ApiError;
      setTestOrdersAlert({
        variant: 'error',
        title: 'Fetch Failed',
        message: error.response?.data?.error || 'Failed to fetch test/vaccine orders.'
      });
    } finally {
      setTestOrdersLoading(false);
    }
  };

  const handleResultSubmit = async (testId: string) => {
    const result = resultInputs[testId];
    if (!result) return;
    setTestOrdersLoading(true);
    setTestOrdersAlert(null);
    try {
      await api.patch(`/patients/${patientAddress.toLowerCase()}/tests/${testId}`, { resultData: result }, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setTestOrdersAlert({ variant: 'success', title: 'Success', message: 'Result recorded.' });
      setResultInputs(inputs => ({ ...inputs, [testId]: {} }));
      handleFetchTestOrders();
    } catch (err) {
      const error = err as ApiError;
      setTestOrdersAlert({
        variant: 'error',
        title: 'Error',
        message: error.response?.data?.error || 'Failed to record result.'
      });
    } finally {
      setTestOrdersLoading(false);
    }
  };

  return (
    <ComponentCard title="Test/Vaccine Results">
      {/* Demographic Card */}
      {patientDemographics && (
        <div className="bg-white rounded-lg shadow p-4 max-w-md mb-6">
          <div className="flex items-center mb-4">
            <FaUserCircle className="text-4xl text-gray-400 mr-3" />
            <div>
              <div className="text-lg font-semibold">{patientDemographics.fullName}</div>
              <div className="text-xs text-gray-500">Patient Information</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="font-medium text-gray-600">DOB:</div>
            <div>{patientDemographics.dob}</div>
            <div className="font-medium text-gray-600">Gender:</div>
            <div>{patientDemographics.gender}</div>
            <div className="font-medium text-gray-600">Nationality:</div>
            <div>{patientDemographics.nationality}</div>
          </div>
        </div>
      )}
      {testOrdersAlert && (
        <Alert
          variant={testOrdersAlert.variant}
          title={testOrdersAlert.title}
          message={testOrdersAlert.message}
        />
      )}
      <button
        onClick={handleFetchTestOrders}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-2"
        disabled={testOrdersLoading}
      >
        Refresh List
      </button>
      {testOrdersLoading ? (
        <div>Loading...</div>
      ) : (
        <ul className="mt-2 space-y-4">
          {testOrders.map(test => {
            const template = testResultTemplates[test.testType];
            return (
            <li key={test._id} className="p-4 bg-gray-100 rounded shadow">
              <b>{test.testType}</b> - Status: <b>{test.status}</b>
              <br />
              Ordered By: {test.orderedBy}
              <br />
              <span className="text-xs text-gray-500">{test.timestamp}</span>
                {(test.status === 'ordered' || test.status === 'pending') && (
                  <form
                    onSubmit={async e => {
                      e.preventDefault();
                      await handleResultSubmit(test._id);
                    }}
                    className="mt-2"
                  >
                    {template ? template.map(field => (
                      <div key={field.name} className="mb-2">
                        <label className="block font-medium mb-1">{field.label}</label>
                        {field.type === "textarea" ? (
                          <textarea
                            value={resultInputs[test._id]?.[field.name] || ""}
                            onChange={e =>
                              setResultInputs(inputs => ({
                                ...inputs,
                                [test._id]: {
                                  ...inputs[test._id],
                                  [field.name]: e.target.value
                                }
                              }))
                            }
                            className="w-full p-2 border rounded"
                            rows={2}
                            placeholder={exampleData[test.testType]?.[field.name] || ""}
                          />
                        ) : (
                          <input
                            type={field.type}
                            value={resultInputs[test._id]?.[field.name] || ""}
                            onChange={e =>
                              setResultInputs(inputs => ({
                                ...inputs,
                                [test._id]: {
                                  ...inputs[test._id],
                                  [field.name]: e.target.value
                                }
                              }))
                            }
                            className="w-full p-2 border rounded"
                            placeholder={exampleData[test.testType]?.[field.name] || ""}
                          />
                        )}
                      </div>
                    )) : (
                      <textarea
                        value={resultInputs[test._id]?.notes || ""}
                        onChange={e =>
                          setResultInputs(inputs => ({
                            ...inputs,
                            [test._id]: { notes: e.target.value }
                          }))
                        }
                        placeholder="Enter result..."
                        className="w-full p-2 border rounded"
                        rows={3}
                      />
                    )}
                    <button
                      type="submit"
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
                      disabled={testOrdersLoading}
                    >
                      Submit Result
                    </button>
                  </form>
                )}
            </li>
            );
          })}
        </ul>
      )}
    </ComponentCard>
  );
};

export default TestResults; 