import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminAuditLogs from './AdminAuditLogs';
import AdminPatientManagement from './AdminPatientManagement';
import AdminRoleManagement from './AdminRoleManagement';
import PageMeta from '../../components/common/PageMeta';

const adminTabs = [
  { key: 'logs', label: 'Audit Logs' },
  { key: 'patients', label: 'Patient Management' },
  { key: 'roles', label: 'Role Management' },
];

const AdminDashboard: React.FC = () => {
  const { primaryRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const initialTab = query.get('tab') || 'logs';
  const [adminTab, setAdminTab] = useState(initialTab);

  useEffect(() => {
    setAdminTab(query.get('tab') || 'logs');
  }, [location.search]);

  const handleTabChange = (key: string) => {
    navigate(`/admin?tab=${key}`);
  };

  return (
    <>
      <PageMeta
        title="MedCertify | Admin Dashboard"
        description="Admin dashboard for MedCertify: manage users, roles, and system settings."
      />
    <div>
      <div className="flex gap-2 mb-6">
        {adminTabs.map(t => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${adminTab === t.key ? 'bg-yellow-600 text-white shadow' : 'bg-white text-gray-700 border border-gray-200'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {adminTab === 'logs' && <AdminAuditLogs />}
      {adminTab === 'patients' && <AdminPatientManagement />}
      {adminTab === 'roles' && <AdminRoleManagement />}
    </div>
    </>
  );
};

export default AdminDashboard;