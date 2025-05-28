import React, { useState } from 'react';
import api from '../../api';
import Input from '../../components/form/input/InputField';

const AdminCertificateManagement: React.FC = () => {
  const [certPatientAddr, setCertPatientAddr] = useState('');
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/patients/${certPatientAddr}/certificates`);
      setCerts(res.data.certificates || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const deleteCert = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    try {
      await api.delete(`/certificates/${id}`);
      setCerts(certs => certs.filter(c => c._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete certificate');
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Input type="text" value={certPatientAddr} onChange={e => setCertPatientAddr(e.target.value)} placeholder="Patient Address (0x...)" />
        <button onClick={fetchCerts} className="bg-yellow-600 text-white px-4 py-2 rounded">Fetch Certificates</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {certs.length > 0 && (
        <div className="w-full overflow-x-auto">
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
        </div>
      )}
    </div>
  );
};

export default AdminCertificateManagement; 