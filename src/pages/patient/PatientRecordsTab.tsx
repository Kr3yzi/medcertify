import React from 'react';

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

interface Props {
  records: PatientRecords | null;
  loading: boolean;
  error: string | null;
}

// Helper to truncate long CIDs
function truncateMiddle(str: string, frontLen = 6, backLen = 4) {
  if (!str || str.length <= frontLen + backLen + 3) return str;
  return str.slice(0, frontLen) + '...' + str.slice(-backLen);
}

const PatientRecordsTab: React.FC<Props> = ({ records, loading, error }) => {
  return (
    <div>
      <h3>Medical Records</h3>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : records && (
        <>
          <h4>Demographics</h4>
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-sm border rounded mb-4">
              <tbody>
                <tr><td className="font-semibold px-3 py-2 border bg-gray-50">Name</td><td className="px-3 py-2 border">{records.demographics?.fullName}</td></tr>
                <tr><td className="font-semibold px-3 py-2 border bg-gray-50">MyKad/Passport</td><td className="px-3 py-2 border">{records.demographics?.myKadNo}</td></tr>
                <tr><td className="font-semibold px-3 py-2 border bg-gray-50">DOB</td><td className="px-3 py-2 border">{records.demographics?.dob}</td></tr>
                <tr><td className="font-semibold px-3 py-2 border bg-gray-50">Gender</td><td className="px-3 py-2 border">{records.demographics?.gender}</td></tr>
                <tr><td className="font-semibold px-3 py-2 border bg-gray-50">Nationality</td><td className="px-3 py-2 border">{records.demographics?.nationality}</td></tr>
              </tbody>
            </table>
          </div>
          <h4>Test Results</h4>
          {records.tests && records.tests.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <table className="min-w-full text-xs border mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1">Type</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">Result CID</th>
                    <th className="px-2 py-1">Ordered By</th>
                    <th className="px-2 py-1">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {records.tests.map((t, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1 border">{t.testType}</td>
                      <td className="px-2 py-1 border">{t.status}</td>
                      <td className="px-2 py-1 border break-all">
                        {t.resultCid ? (
                          <span title={t.resultCid} className="cursor-pointer">
                            {truncateMiddle(t.resultCid)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-2 py-1 border">{t.orderedBy}</td>
                      <td className="px-2 py-1 border">{t.timestamp ? new Date(t.timestamp).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div>No test results found.</div>}
          <h4>Diagnosis History</h4>
          {records.diagnosis && records.diagnosis.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <table className="min-w-full text-xs border mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1">Diagnosis</th>
                    <th className="px-2 py-1">Date</th>
                    <th className="px-2 py-1">Doctor</th>
                  </tr>
                </thead>
                <tbody>
                  {records.diagnosis.map((d, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1 border">{d.condition || d.summary || '-'}</td>
                      <td className="px-2 py-1 border">{d.timestamp ? new Date(d.timestamp).toLocaleDateString() : ''}</td>
                      <td className="px-2 py-1 border">{d.doctorAddress || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div>No diagnosis history found.</div>}
        </>
      )}
    </div>
  );
};

export default PatientRecordsTab; 