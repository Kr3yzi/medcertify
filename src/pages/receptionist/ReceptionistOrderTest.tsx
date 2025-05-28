import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import ComponentCard from '../../components/common/ComponentCard';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import Alert from '../../components/ui/alert/Alert';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface Order {
  category: string;
  type: string;
  purpose: string;
}

const categoryOptions = [
  { value: 'test', label: 'Test' },
  { value: 'vaccine', label: 'Vaccine' },
];

const testTypeOptions = [
  { value: 'Full Blood Count (FBC)', label: 'Full Blood Count (FBC)' },
  { value: 'Urinalysis', label: 'Urinalysis' },
  { value: 'Chest X-ray', label: 'Chest X-ray' },
  { value: 'TB Test (Mantoux)', label: 'TB Test (Mantoux)' },
  { value: 'Hepatitis B Surface Antigen (HBsAg)', label: 'Hepatitis B Surface Antigen (HBsAg)' },
  { value: 'HIV Test', label: 'HIV Test' },
  { value: 'Syphilis (VDRL/RPR)', label: 'Syphilis (VDRL/RPR)' },
  { value: 'Typhoid Test', label: 'Typhoid Test' },
  { value: 'Pregnancy Test (Urine hCG)', label: 'Pregnancy Test (Urine hCG)' },
  { value: 'COVID-19 PCR Test', label: 'COVID-19 PCR Test' },
  { value: 'Fitness Assessment', label: 'Fitness Assessment' },
];
const vaccineTypeOptions = [
  { value: 'Hepatitis B Vaccine', label: 'Hepatitis B Vaccine' },
  { value: 'Typhoid Vaccine', label: 'Typhoid Vaccine' },
  { value: 'Tetanus Vaccine', label: 'Tetanus Vaccine' },
  { value: 'MMR Vaccine', label: 'MMR Vaccine' },
  { value: 'COVID-19 Vaccine', label: 'COVID-19 Vaccine' },
];

const ReceptionistOrderTest: React.FC = () => {
  const { jwt } = useAuth();
  const [address, setAddress] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([
    { category: '', type: '', purpose: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ variant: AlertVariant; title: string; message: string } | null>(null);

  const handleOrderChange = (idx: number, field: keyof Order, value: string) => {
    setOrders(orders => orders.map((o, i) => i === idx ? { ...o, [field]: value } : o));
  };
  const handleAddOrder = () => {
    setOrders(orders => [...orders, { category: '', type: '', purpose: '' }]);
  };
  const handleRemoveOrder = (idx: number) => {
    setOrders(orders => orders.length === 1 ? orders : orders.filter((_, i) => i !== idx));
  };
  const validate = () => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) return 'Valid patient address required.';
    for (let i = 0; i < orders.length; ++i) {
      if (!orders[i].category) return `Select a category for row ${i + 1}`;
      if (!orders[i].type) return `Select a type for row ${i + 1}`;
    }
    return null;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setLoading(true);
    const validation = validate();
    if (validation) {
      setAlert({ variant: 'error', title: 'Validation Error', message: validation });
      setLoading(false);
      return;
    }
    try {
      await api.post(`/patients/${address}/tests`, { tests: orders }, { headers: { Authorization: `Bearer ${jwt}` } });
      setAlert({ variant: 'success', title: 'Order Success', message: 'All tests/vaccines ordered successfully.' });
      setOrders([{ category: '', type: '', purpose: '' }]);
      setAddress('');
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setAlert({ variant: 'error', title: 'Order Failed', message: error.response?.data?.error || 'Failed to order test/vaccine.' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <ComponentCard title="Order Test/Vaccine for Patient (Multiple)">
      {alert && <Alert variant={alert.variant} title={alert.title} message={alert.message} />}
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Patient Address</Label>
            <Input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="0x..." />
          </div>
        </div>
        <div className="space-y-4">
          {orders.map((order, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end border-b pb-4 mb-2">
              <div>
                <Label>Category</Label>
                <Select
                  options={categoryOptions}
                  value={order.category}
                  onChange={(v: string) => handleOrderChange(idx, 'category', v)}
                  placeholder="Select Category"
                />
              </div>
              <div>
                {order.category === 'test' && (
                  <>
                    <Label>Test Type</Label>
                    <Select
                      options={testTypeOptions}
                      value={order.type}
                      onChange={(v: string) => handleOrderChange(idx, 'type', v)}
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
                      onChange={(v: string) => handleOrderChange(idx, 'type', v)}
                      placeholder="Select Vaccine"
                    />
                  </>
                )}
              </div>
              <div>
                <Label>Purpose (optional)</Label>
                <Input type="text" value={order.purpose} onChange={e => handleOrderChange(idx, 'purpose', e.target.value)} placeholder="e.g. Food Handler Certificate" />
              </div>
              <button type="button" onClick={() => handleRemoveOrder(idx)} className="text-red-500 hover:text-red-700 px-2 py-1" disabled={orders.length === 1}>Remove</button>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <button type="button" onClick={handleAddOrder} className="bg-brand-100 text-brand-700 px-4 py-2 rounded hover:bg-brand-200">+ Add Another Test/Vaccine</button>
          <button type="submit" disabled={loading} className="bg-brand-500 text-white px-4 py-2 rounded w-full md:w-auto">{loading ? 'Ordering...' : 'Order Test/Vaccine(s)'}</button>
        </div>
      </form>
    </ComponentCard>
  );
};

export default ReceptionistOrderTest; 