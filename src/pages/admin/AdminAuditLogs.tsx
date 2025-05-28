import React, { useState, useEffect } from 'react';
import api from '../../api';
import Modal from '../../components/Modal';

const PAGE_SIZE = 10;

const columns = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'role', label: 'Role' },
  { key: 'type', label: 'Type' },
  { key: 'action', label: 'Action' },
  { key: 'address', label: 'Address' },
  { key: 'message', label: 'Message' },
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'ACTION', label: 'Action' },
  { value: 'AUDIT_ACCESS', label: 'Audit Access' },
];

interface AuditLog {
  timestamp?: string;
  role?: string;
  type?: string;
  action?: string;
  address?: string;
  message?: string;
  raw?: string;
}

const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'idle'|'logs'>('idle');
  const [filters, setFilters] = useState({
    type: '',
    action: '',
    role: '',
    address: '',
    start: '',
    end: '',
  });
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  useEffect(() => {
    if (step === 'logs') fetchLogs();
    // eslint-disable-next-line
  }, [page, pageSize, sortBy, sortDir]);

  const fetchLogs = async () => {
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
      const res = await api.get('/audit-logs', { params });
      setLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
      setTotal(res.data.total || 0);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data) {
        setError((err.response.data as { error?: string }).error || 'Failed to fetch logs');
      } else {
        setError('Failed to fetch logs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const handleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(col);
      setSortDir(col === 'timestamp' ? 'desc' : 'asc');
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div>
      {step === 'idle' && (
        <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded">
          <b>Warning:</b> Audit logs may contain sensitive information. Admin access will be logged. <br />
          <button
            onClick={() => setShowModal(true)}
            className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Proceed to View Logs
          </button>
          <Modal
            open={showModal}
            title="View Audit Logs"
            message="Are you sure you want to view audit logs? This action will be logged."
            onConfirm={() => {
              setShowModal(false);
              setStep('logs');
              setPage(1);
              fetchLogs();
            }}
            onCancel={() => setShowModal(false)}
            confirmText="Yes, View Logs"
            cancelText="Cancel"
          />
        </div>
      )}
      {step === 'logs' && (
        <>
          {/* Filters */}
          <div className="mb-4 flex flex-wrap gap-2 items-end">
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="border px-2 py-1 rounded"
            >
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              type="text"
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="border px-2 py-1 rounded"
              placeholder="Action"
            />
            <input
              type="text"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="border px-2 py-1 rounded"
              placeholder="Role"
            />
            <input
              type="text"
              name="address"
              value={filters.address}
              onChange={handleFilterChange}
              className="border px-2 py-1 rounded"
              placeholder="Address"
            />
            <input
              type="date"
              name="start"
              value={filters.start}
              onChange={handleDateChange}
              className="border px-2 py-1 rounded"
              placeholder="Start Date"
            />
            <input
              type="date"
              name="end"
              value={filters.end}
              onChange={handleDateChange}
              className="border px-2 py-1 rounded"
              placeholder="End Date"
            />
            <button
              className="bg-gray-200 px-4 py-2 rounded"
              onClick={() => setStep('idle')}
            >
              Back
            </button>
          </div>
          {/* Table */}
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border mb-2">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  {columns.map(col => (
                    <th
                      key={col.key}
                      className="px-3 py-2 cursor-pointer select-none whitespace-nowrap text-left"
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      {sortBy === col.key && (
                        <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? logs.map((log, i) => (
                  <tr
                    key={i}
                    className={
                      `hover:bg-yellow-50 ${i % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`
                    }
                  >
                    <td className="px-3 py-2 border whitespace-nowrap">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
                    <td className="px-3 py-2 border">{log.role || '-'}</td>
                    <td className="px-3 py-2 border">{log.type || '-'}</td>
                    <td className="px-3 py-2 border">{log.action || '-'}</td>
                    <td className="px-3 py-2 border">{log.address || '-'}</td>
                    <td className="px-3 py-2 border break-all max-w-xs truncate" title={log.message || log.raw || '-'}>
                      {log.message && log.message.length > 60
                        ? log.message.slice(0, 60) + '...'
                        : (log.message || log.raw || '-')}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={columns.length} className="text-center text-gray-500 py-4">No logs found.</td></tr>
                )}
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
        </>
      )}
    </div>
  );
};

export default AdminAuditLogs; 