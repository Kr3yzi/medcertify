import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import ComponentCard from '../../components/common/ComponentCard';
import Input from '../../components/form/input/InputField';
import Alert from '../../components/ui/alert/Alert';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface TestOrder {
  _id: string;
  testType: string;
  purpose: string;
  status: string;
  orderedBy: string;
  result?: string;
  interpretedBy?: string;
  interpretation?: string;
  timestamp?: string;
}

const ReceptionistViewOrders: React.FC = () => {
  const { jwt } = useAuth();
  const [address, setAddress] = useState<string>('');
  const [orders, setOrders] = useState<TestOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ variant: AlertVariant; title: string; message: string } | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setAlert(null);
    setOrders([]);
    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
      setAlert({ variant: 'error', title: 'Invalid Address', message: 'Please enter a valid Ethereum address.' });
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/patients/${address}/tests`, { headers: { Authorization: `Bearer ${jwt}` } });
      setOrders(res.data.tests || []);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setAlert({ variant: 'error', title: 'Fetch Failed', message: error.response?.data?.error || 'Failed to fetch test/vaccine orders.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComponentCard title="View All Test/Vaccine Orders">
      {alert && <Alert variant={alert.variant} title={alert.title} message={alert.message} />}
      <div className="flex flex-col md:flex-row gap-2 mb-4 items-end">
        <div className="flex-1">
          <Input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Patient Address (0x...)" />
        </div>
        <button onClick={handleFetch} className="bg-brand-500 text-white px-4 py-2 rounded h-11" disabled={loading}>Fetch</button>
      </div>
      {loading ? <div>Loading...</div> : (
        <ul className="mt-2 space-y-2">
          {orders.map(test => (
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
  );
};

export default ReceptionistViewOrders;