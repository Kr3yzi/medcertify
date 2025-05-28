import React, { useState } from 'react';
import api from '../../api';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';

const roleOptions = [
  { value: 'RECEPTIONIST', label: 'Receptionist' },
  { value: 'NURSE', label: 'Nurse' },
  { value: 'DOCTOR', label: 'Doctor' },
];

const roleColors: Record<string, string> = {
  admin: 'bg-green-600',
  receptionist: 'bg-blue-500',
  nurse: 'bg-purple-500',
  doctor: 'bg-yellow-600',
  patient: 'bg-gray-400',
};

const AdminRoleManagement: React.FC = () => {
  const [roleAddress, setRoleAddress] = useState('');
  const [roleInfo, setRoleInfo] = useState<any>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [assignRole, setAssignRole] = useState('');
  const [revokeRole, setRevokeRole] = useState('');
  const [roleActionLoading, setRoleActionLoading] = useState(false);
  const [roleActionMsg, setRoleActionMsg] = useState<any>(null);
  const [showAuditLog, setShowAuditLog] = useState(false);

  const fetchRoleInfo = async () => {
    setRoleLoading(true); setRoleError(null);
    try {
      const res = await api.get('/check-role', { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }, params: { address: roleAddress } });
      setRoleInfo(res.data);
    } catch (err: any) {
      setRoleError(err.response?.data?.error || 'Failed to fetch role info');
    } finally {
      setRoleLoading(false);
    }
  };
  const handleAssignRole = async () => {
    setRoleActionLoading(true); setRoleActionMsg(null);
    try {
      const res = await api.post('/assign-role', { address: roleAddress, role: assignRole }, { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } });
      setRoleActionMsg({ type: 'success', msg: `Role assigned. Tx: ${res.data.transactionHash}` });
      fetchRoleInfo();
    } catch (err: any) {
      setRoleActionMsg({ type: 'error', msg: err.response?.data?.error || 'Failed to assign role' });
    } finally {
      setRoleActionLoading(false);
    }
  };
  const handleRevokeRole = async () => {
    setRoleActionLoading(true); setRoleActionMsg(null);
    try {
      const res = await api.post('/revoke-role', { address: roleAddress, role: revokeRole }, { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } });
      setRoleActionMsg({ type: 'success', msg: `Role revoked. Tx: ${res.data.transactionHash}` });
      fetchRoleInfo();
    } catch (err: any) {
      setRoleActionMsg({ type: 'error', msg: err.response?.data?.error || 'Failed to revoke role' });
    } finally {
      setRoleActionLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex gap-2 mb-4">
        <Input type="text" value={roleAddress} onChange={e => setRoleAddress(e.target.value)} placeholder="Ethereum Address (0x...)" />
        <button onClick={fetchRoleInfo} className="bg-yellow-600 text-white px-4 py-2 rounded">Check Roles</button>
        <button
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded border border-gray-300"
          onClick={() => setRoleAddress('')}
        >
          Clear
        </button>
      </div>
      {roleLoading ? <div>Loading...</div> : roleError ? <div className="text-red-600 mb-2">{roleError}</div> : roleInfo && (
        <div className="mb-4">
          <div className="mb-2 font-semibold">Roles for <span className="break-all">{roleInfo.address}</span>:</div>
          <div className="flex flex-wrap gap-2 mb-2">
            {Object.entries(roleInfo.roles).map(([role, hasRole]) => (
              <span
                key={role}
                className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${hasRole ? roleColors[role] || 'bg-gray-500' : 'bg-gray-300 text-gray-500'}`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)} {hasRole ? '✓' : ''}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Select
          options={roleOptions}
          value={assignRole}
          onChange={v => setAssignRole(v)}
          placeholder="Assign Role"
        />
        <button onClick={handleAssignRole} className="bg-green-600 text-white px-4 py-2 rounded" disabled={roleActionLoading || !roleAddress || !assignRole}>Assign</button>
        <Select
          options={roleOptions}
          value={revokeRole}
          onChange={v => setRevokeRole(v)}
          placeholder="Revoke Role"
        />
        <button onClick={handleRevokeRole} className="bg-red-600 text-white px-4 py-2 rounded" disabled={roleActionLoading || !roleAddress || !revokeRole}>Revoke</button>
      </div>
      {roleActionMsg && (
        <div className={`mb-4 text-sm ${roleActionMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{roleActionMsg.msg}</div>
      )}
      {roleInfo && (
        <button
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded border border-gray-300 mb-2"
          onClick={() => setShowAuditLog(true)}
        >
          View Role Change Logs for this Address
        </button>
      )}
      {/* Placeholder for audit log modal or section */}
      {showAuditLog && (
        <div className="bg-white border border-gray-200 rounded p-4 mt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Role Change Logs (Coming Soon)</span>
            <button className="text-gray-500 hover:text-gray-800" onClick={() => setShowAuditLog(false)}>&times;</button>
          </div>
          <div className="text-xs text-gray-500">This will show audit logs filtered for this address and role changes.</div>
        </div>
      )}
    </div>
  );
};

export default AdminRoleManagement; 