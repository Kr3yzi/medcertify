import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ReceptionistRegisterPatient from './ReceptionistRegisterPatient';
import ReceptionistOrderTest from './ReceptionistOrderTest';
import ReceptionistViewOrders from './ReceptionistViewOrders.tsx';

const tabMap: Record<string, string> = {
  register: 'register',
  order: 'order',
  view: 'view',
  appointments: 'view',
};

const ReceptionistDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const getTabFromQuery = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return tabMap[tab || ''] || 'register';
  }, [location.search]);
  const [tab, setTab] = useState<string>(getTabFromQuery());

  useEffect(() => {
    setTab(getTabFromQuery());
  }, [location.search, getTabFromQuery]);

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    const params = new URLSearchParams(location.search);
    params.set('tab', newTab);
    navigate({ pathname: '/receptionist', search: params.toString() }, { replace: true });
  };

  return (
    <>
      <PageMeta
        title="MedCertify | Receptionist Dashboard"
        description="Receptionist dashboard for MedCertify: register patients, order tests, and manage appointments."
      />
      <PageBreadcrumb pageTitle="Receptionist Dashboard" />
      <div className="flex gap-2 mb-6 mt-4">
        <button
          onClick={() => handleTabChange('register')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${tab === 'register' ? 'bg-brand-500 text-white shadow' : 'bg-white text-gray-700 border border-gray-200'}`}
        >
          Register New Patient
        </button>
        <button
          onClick={() => handleTabChange('order')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${tab === 'order' ? 'bg-brand-500 text-white shadow' : 'bg-white text-gray-700 border border-gray-200'}`}
        >
          Order Test/Vaccine
        </button>
        <button
          onClick={() => handleTabChange('view')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${tab === 'view' ? 'bg-brand-500 text-white shadow' : 'bg-white text-gray-700 border border-gray-200'}`}
        >
          View Test/Vaccine Orders
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {tab === 'register' && <ReceptionistRegisterPatient />}
        {tab === 'order' && <ReceptionistOrderTest />}
        {tab === 'view' && <ReceptionistViewOrders />}
      </div>
    </>
  );
};

export default ReceptionistDashboard;