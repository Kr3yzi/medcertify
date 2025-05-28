import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/modal';
import api from '../../api';
import { ethers } from 'ethers';
import { fetchFromIPFS, decodeIPFSData } from '../../utils/ipfs';

interface Test {
  _id: string;
  testType: string;
  status: string;
  orderedBy: string;
  resultCid?: string;
  timestamp?: string;
  diagnosed?: boolean;
  certified?: boolean;
}

interface DoctorTestReviewTabProps {
  tests: Test[];
  patientAddress: string;
}

const DoctorTestReviewTab: React.FC<DoctorTestReviewTabProps> = ({ tests, patientAddress }) => {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [diagnosisSummary, setDiagnosisSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [attestChecked, setAttestChecked] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  interface TestDetails {
    testType?: string;
    status?: string;
    orderedBy?: string;
    timestamp?: string;
    resultData?: Record<string, unknown> | string;
    resultDataError?: string;
    error?: string;
  }
  const [testDetails, setTestDetails] = useState<TestDetails | null>(null);

  // Handle menu open/close
  const handleMenuClick = (testId: string) => {
    setActionMenuOpen(actionMenuOpen === testId ? null : testId);
  };

  // Fetch test details when opening diagnose modal
  const fetchTestDetails = async (test: Test, patientAddress: string) => {
    setDetailsLoading(true);
    setTestDetails(null);
    try {
      const res = await api.get(`/patients/${patientAddress}/tests/${test._id}`);
      setTestDetails(res.data);
    } catch {
      setTestDetails({ error: 'Failed to fetch test details.' });
    } finally {
      setDetailsLoading(false);
    }
  };

  // Update openCertModal to fetch test details and prefill attestation
  const openCertModal = (test: Test) => {
    setSelectedTest(test);
    setCertModalOpen(true);
    setActionMenuOpen(null);
    setError(null);
    // Prefill attestation
    if (diagnosisTemplates[test.testType]) {
      setDiagnosisSummary(diagnosisTemplates[test.testType]);
    } else {
      setDiagnosisSummary("");
    }
    fetchTestDetails(test, patientAddress);
  };

  // Update handleCertSubmit to call /api/issue-certificate to get certHash
  const handleCertSubmit = async () => {
    if (!selectedTest) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!window.ethereum) {
        setError('MetaMask is not available. Please install MetaMask.');
        setLoading(false);
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      // 1. Submit form data to backend (no signature)
      const res = await api.post('/issue-certificate', {
        patient: patientAddress,
        issuedBy: signer.address,
        certType: selectedTest.testType,
        attestation: diagnosisSummary,
        testId: selectedTest._id,
      });
      const { certHash } = res.data;
      // 2. Sign the certHash with MetaMask
      const msg = `Cert CID: ${certHash}`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [msg, signer.address],
      });
      // 3. PATCH the signature to backend
      await api.patch(`/issue-certificate/${certHash}/signature`, { signature });
      // 4. Call the smart contract to issue the certificate on-chain
      const contractAddress = import.meta.env.VITE_HEALTH_CERTIFICATE_RBAC_ADDRESS;
      const contractAbi = (await import('../../../abi/HealthCertificateRBAC.json')).abi;
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      // Helper type guard for error with code and message
      function hasCodeAndMessage(err: unknown): err is { code: number; message: string } {
        return typeof err === 'object' && err !== null && 'code' in err && 'message' in err;
      }
      try {
        const tx = await contract.issueCertificate(patientAddress, certHash);
        await tx.wait();
        await api.patch(`/certificates/${certHash}/tx`, { transactionHash: tx.hash });
        setSuccess('Certificate issued, signed, and recorded on-chain successfully!');
        setCertModalOpen(false);
      } catch (txErr: unknown) {
        if (hasCodeAndMessage(txErr) && txErr.code === 4001) {
          setError('On-chain transaction was rejected by the user.');
        } else if (hasCodeAndMessage(txErr)) {
          setError('Failed to record certificate on-chain: ' + txErr.message);
        } else {
          setError('Failed to record certificate on-chain: ' + String(txErr));
        }
        return;
      }
    } catch (err) {
      setError('Failed to issue certificate: ' + (err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Diagnosis templates for each test/vaccine type
  const diagnosisTemplates: Record<string, string> = {
    "Full Blood Count (FBC)": `This is to certify that the patient's blood test results are within normal limits.`,
    "MMR Vaccine": `This is to certify that the above-named patient has received the MMR vaccine and is fit for school attendance.`,
    "Urinalysis": `This is to certify that the patient's urinalysis results are within normal limits.`,
    // Add more as needed
  };

  // Auto-fill template when modal opens or selectedTest changes
  useEffect(() => {
    if (certModalOpen && selectedTest && diagnosisTemplates[selectedTest.testType]) {
      setDiagnosisSummary(diagnosisTemplates[selectedTest.testType]);
    } else if (certModalOpen) {
      setDiagnosisSummary("");
    }
    // eslint-disable-next-line
  }, [certModalOpen, selectedTest]);

  // Update the fetchTestResults function
  useEffect(() => {
    const fetchTestResults = async () => {
      if (!tests || tests.length === 0) return;
      
      const results = {};
      const loading = {};
      const errors = {};
      
      for (const test of tests) {
        if (!test.resultCid) continue;
        
        loading[test._id] = true;
        setDetailsLoading(prev => ({ ...prev, [test._id]: true }));
        
        try {
          const data = await fetchFromIPFS(test.resultCid);
          results[test._id] = decodeIPFSData(data);
          setTestDetails(prev => ({ ...prev, [test._id]: results[test._id] }));
        } catch (error) {
          errors[test._id] = 'Failed to fetch or decode result data';
          setTestDetails(prev => ({ ...prev, [test._id]: errors[test._id] }));
        } finally {
          loading[test._id] = false;
          setDetailsLoading(prev => ({ ...prev, [test._id]: false }));
        }
      }
    };

    fetchTestResults();
  }, [tests]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-2">Test/Vaccine Review</h3>
      <div className="w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Ordered By</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map(test => (
              <tr key={test._id}>
                <td className="px-4 py-2">{test.testType}</td>
                <td className="px-4 py-2">{test.status}</td>
                <td className="px-4 py-2">
                  <span title={test.orderedBy} style={{ cursor: 'pointer', wordBreak: 'break-all' }}>
                    {test.orderedBy.length > 16
                      ? `${test.orderedBy.slice(0, 6)}...${test.orderedBy.slice(-4)}`
                      : test.orderedBy}
                  </span>
                </td>
                <td className="px-4 py-2 relative">
                  {(test.status === 'completed' && !test.certified) && (
                    <div className="inline-block text-left">
                      <button
                        className="p-1 rounded hover:bg-gray-200 focus:outline-none"
                        onClick={() => handleMenuClick(test._id)}
                        aria-label="Actions"
                      >
                        <span className="text-2xl">⋮</span>
                      </button>
                      {actionMenuOpen === test._id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-10">
                          <ul className="py-1">
                            <li>
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                onClick={() => openCertModal(test)}
                              >
                                Issue Certificate
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Issue Certificate Modal */}
      <Modal isOpen={certModalOpen} onClose={() => setCertModalOpen(false)} className="max-w-lg w-full" showCloseButton={true}>
        <div className="p-8 bg-white rounded-2xl shadow-2xl">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Issue Certificate</h3>
          {detailsLoading ? (
            <div className="mb-4 text-gray-700">Loading test details...</div>
          ) : testDetails && !testDetails.error ? (
            <div className="mb-4 border rounded-lg p-3 bg-gray-50">
              <div className="mb-1 text-gray-700"><span className="font-semibold">Type:</span> {testDetails.testType || selectedTest?.testType}</div>
              <div className="mb-1 text-gray-700"><span className="font-semibold">Status:</span> {testDetails.status || selectedTest?.status}</div>
              <div className="mb-1 text-gray-700"><span className="font-semibold">Ordered By:</span> {testDetails.orderedBy || selectedTest?.orderedBy}</div>
              {testDetails.resultData && (
                <div className="mb-1">
                  <span className="font-semibold text-gray-700">Result:</span>
                  <div className="mt-1 border rounded p-2 bg-white">
                    {typeof testDetails.resultData === 'object' ? (
                      <ul className="list-disc ml-5">
                        {Object.entries(testDetails.resultData).map(([k, v]) => (
                          <li key={k}><span className="font-semibold">{k}:</span> {String(v)}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>{String(testDetails.resultData)}</span>
                    )}
                  </div>
                </div>
              )}
              {testDetails.resultDataError && (
                <div className="text-red-600 text-sm">{testDetails.resultDataError}</div>
              )}
              {testDetails.timestamp && (
                <div className="mb-1 text-gray-700"><span className="font-semibold">Timestamp:</span> {new Date(testDetails.timestamp).toLocaleString()}</div>
              )}
            </div>
          ) : testDetails && testDetails.error ? (
            <div className="mb-4 text-red-600">{testDetails.error}</div>
          ) : null}
          <div className="mb-4">
            <label className="block font-semibold text-gray-700 mb-1">Certificate Statement / Attestation</label>
            <textarea
              className="w-full border border-gray-300 rounded p-2 text-gray-800 bg-white"
              rows={3}
              value={diagnosisSummary}
              onChange={e => setDiagnosisSummary(e.target.value)}
              placeholder="Enter certificate statement..."
            />
          </div>
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="attest"
              checked={attestChecked}
              onChange={e => setAttestChecked(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="attest" className="text-sm text-gray-700">
              I, as the attending doctor, attest that the above statement is true.
            </label>
          </div>
          {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
          {success && <div className="text-green-600 mb-2 text-sm">{success}</div>}
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
            onClick={handleCertSubmit}
            disabled={loading || !diagnosisSummary.trim() || !attestChecked}
          >
            {loading ? 'Issuing...' : 'Issue Certificate'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorTestReviewTab;   