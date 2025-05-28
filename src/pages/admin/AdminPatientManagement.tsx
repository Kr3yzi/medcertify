import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Modal } from '../../components/ui/modal';

const PAGE_SIZE = 10;

interface PatientDemographics {
  fullName?: string;
  myKadNo?: string;
  [key: string]: any;
}

interface Patient {
  address: string;
  demographics?: PatientDemographics;
}

interface PatientTest {
  _id: string;
  testType: string;
  purpose?: string;
  orderedBy?: string;
  status?: string;
  timestamp?: string;
  hasResults?: boolean;
}

interface Certificate {
  _id: string;
  certType: string;
  ipfsCid?: string;
  issuedBy: string;
  issuedAt?: string;
}

const columns = [
  { key: 'address', label: 'Address' },
  { key: 'actions', label: 'Actions' },
];

const AdminPatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    address: '',
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  // For tests/vaccines and certs
  const [tests, setTests] = useState<PatientTest[] | null>(null);
  const [testsLoading, setTestsLoading] = useState(false);
  const [testsError, setTestsError] = useState<string | null>(null);
  const [certs, setCerts] = useState<Certificate[] | null>(null);
  const [certsLoading, setCertsLoading] = useState(false);
  const [certsError, setCertsError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line
  }, [page, pageSize]);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        page,
        pageSize,
        ...filters,
      };
      // Remove empty filters
      Object.keys(params).forEach(k => {
        if (params[k] === '') delete params[k];
      });
      const res = await api.get('/patients', { params });
      setPatients(Array.isArray(res.data.patients) ? res.data.patients : res.data);
      setTotal(res.data.total || (Array.isArray(res.data.patients) ? res.data.patients.length : res.data.length) || 0);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data) {
        setError((err.response.data as { error?: string }).error || 'Failed to fetch patients');
      } else {
        setError('Failed to fetch patients');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const handleView = async (address: string) => {
    setSelectedPatient(null);
    setShowDetail(true);
    setTests(null);
    setCerts(null);
    setTestsError(null);
    setCertsError(null);
    try {
      const res = await api.get(`/patients/${address}`);
      setSelectedPatient(res.data.patient || res.data);
    } catch (err: unknown) {
      setSelectedPatient({ address, demographics: { error: 'Failed to fetch patient details' } });
    }
  };

  const handleViewTests = async (address: string) => {
    setTestsLoading(true);
    setTestsError(null);
    setTests(null);
    try {
      const res = await api.get(`/patients/${address}/tests`);
      setTests(Array.isArray(res.data.tests) ? res.data.tests : []);
    } catch (err: unknown) {
      setTestsError('Failed to fetch tests/vaccines');
    } finally {
      setTestsLoading(false);
    }
  };

  const handleViewCerts = async (address: string) => {
    setCertsLoading(true);
    setCertsError(null);
    setCerts(null);
    try {
      const res = await api.get(`/patients/${address}/certificates`);
      setCerts(Array.isArray(res.data.certificates) ? res.data.certificates : []);
    } catch (err: unknown) {
      setCertsError('Failed to fetch certificates');
    } finally {
      setCertsLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2 items-end">
        <input
          type="text"
          name="address"
          value={filters.address}
          onChange={handleFilterChange}
          className="border px-2 py-1 rounded"
          placeholder="Address"
        />
        <button
          className="bg-yellow-600 text-white px-4 py-2 rounded"
          onClick={() => fetchPatients()}
        >
          Search
        </button>
      </div>
      {/* Table */}
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {patients.length > 0 && (
        <div className="w-full overflow-x-auto">
          <table className="min-w-full text-xs border mb-2">
            <thead className="bg-gray-100">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="px-2 py-1">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.address}>
                  <td className="px-2 py-1 border">{p.address}</td>
                  <td className="px-2 py-1 border">
                    <button onClick={() => handleView(p.address)} className="bg-yellow-500 text-white px-2 py-1 rounded">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-gray-500">
              Page {page} of {totalPages} (Total: {total})
            </div>
            <div className="flex gap-1 items-center">
              <button
                className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              <span className="mx-2">{page}</span>
              <button
                className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="ml-2 border px-2 py-1 rounded"
              >
                {[10, 20, 50, 100].map(size => (
                  <option key={size} value={size}>{size} / page</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      {/* Patient Detail Modal */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        className="max-w-lg p-6"
      >
        <div>
          <h4 className="font-semibold mb-4">Patient Details</h4>
          {selectedPatient ? (
            <>
              {selectedPatient.demographics && selectedPatient.demographics.error ? (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                  {selectedPatient.demographics.error}
                </div>
              ) : (
                <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
                  <div className="mb-2 break-all"><span className="font-semibold">Address:</span> {selectedPatient.address || "N/A"}</div>
                  {selectedPatient.demographics && (
                    <>
                      <div className="mb-2"><span className="font-semibold">Name:</span> {selectedPatient.demographics.fullName || "N/A"}</div>
                      <div className="mb-2"><span className="font-semibold">MyKad/Passport:</span> {selectedPatient.demographics.myKadNo || "N/A"}</div>
                      {Object.entries(selectedPatient.demographics).map(([key, value]) => (
                        key !== 'fullName' && key !== 'myKadNo' && value && (
                          <div className="mb-2 break-all" key={key}><span className="font-semibold">{key}:</span> {String(value)}</div>
                        )
                      ))}
                    </>
                  )}
                </div>
              )}
              <div className="flex gap-2 mb-4">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => handleViewTests(selectedPatient.address)}
                  disabled={testsLoading}
                >
                  {testsLoading ? 'Loading...' : 'View Tests/Vaccines'}
                </button>
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => handleViewCerts(selectedPatient.address)}
                  disabled={certsLoading}
                >
                  {certsLoading ? 'Loading...' : 'View Certificates'}
                </button>
              </div>
              {/* Tests/Vaccines Section */}
              {testsError && <div className="text-red-600 mb-1">{testsError}</div>}
              {tests && (
                <div className="mb-4">
                  <h5 className="font-semibold mb-2">Tests/Vaccines</h5>
                  <div className="overflow-x-auto">
                    {tests.length === 0 ? <div className="text-xs text-gray-500">No tests/vaccines found.</div> : (
                      <table className="min-w-full text-xs border mb-2">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-1">Type</th>
                            <th className="px-2 py-1">Purpose</th>
                            <th className="px-2 py-1">Status</th>
                            <th className="px-2 py-1">Ordered By</th>
                            <th className="px-2 py-1">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tests.map(t => (
                            <tr key={t._id}>
                              <td className="px-2 py-1 border break-all max-w-[120px]">{t.testType}</td>
                              <td className="px-2 py-1 border break-all max-w-[120px]">{t.purpose || '-'}</td>
                              <td className="px-2 py-1 border">{t.status || '-'}</td>
                              <td className="px-2 py-1 border break-all max-w-[160px]">{t.orderedBy || '-'}</td>
                              <td className="px-2 py-1 border">{t.timestamp ? new Date(t.timestamp).toLocaleString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
              {/* Certificates Section */}
              {certsError && <div className="text-red-600 mb-1">{certsError}</div>}
              {certs && (
                <div className="mb-2">
                  <h5 className="font-semibold mb-2">Certificates</h5>
                  <div className="overflow-x-auto">
                    {certs.length === 0 ? <div className="text-xs text-gray-500">No certificates found.</div> : (
                      <table className="min-w-full text-xs border mb-2">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-1">Type</th>
                            <th className="px-2 py-1">CID</th>
                            <th className="px-2 py-1">Issued By</th>
                            <th className="px-2 py-1">Issued At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {certs.map(cert => (
                            <tr key={cert._id}>
                              <td className="px-2 py-1 border break-all max-w-[120px]">{cert.certType}</td>
                              <td className="px-2 py-1 border break-all max-w-[200px]">{cert.ipfsCid || '-'}</td>
                              <td className="px-2 py-1 border break-all max-w-[160px]">{cert.issuedBy}</td>
                              <td className="px-2 py-1 border">{cert.issuedAt ? new Date(cert.issuedAt).toLocaleString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AdminPatientManagement; 