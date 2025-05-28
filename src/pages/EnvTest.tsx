import React from 'react';

const EnvTest: React.FC = () => {
  // Get all environment variables
  const envVars = {
    // Smart Contract
    contractAddress: import.meta.env.VITE_HEALTH_CERTIFICATE_RBAC_ADDRESS,
    
    // API
    apiUrl: import.meta.env.VITE_API_URL,
    apiTimeout: import.meta.env.VITE_API_TIMEOUT,
    
    // IPFS
    ipfsGateway: import.meta.env.VITE_IPFS_GATEWAY,
    ipfsBackupGateway: import.meta.env.VITE_IPFS_BACKUP_GATEWAY,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Smart Contract</h2>
          <p>Contract Address: {envVars.contractAddress || 'Not set'}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">API Configuration</h2>
          <p>API URL: {envVars.apiUrl || 'Not set'}</p>
          <p>API Timeout: {envVars.apiTimeout || 'Not set'}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">IPFS Configuration</h2>
          <p>IPFS Gateway: {envVars.ipfsGateway || 'Not set'}</p>
          <p>IPFS Backup Gateway: {envVars.ipfsBackupGateway || 'Not set'}</p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Raw Environment Variables</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
          {JSON.stringify(import.meta.env, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default EnvTest; 