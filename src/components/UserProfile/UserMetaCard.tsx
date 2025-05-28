import { useAuth } from '../../context/AuthContext';
import { MetaMaskAvatar } from 'react-metamask-avatar';

export default function UserMetaCard() {
  const { address, disconnectWallet } = useAuth();
  const safeAddress = address || '';
  const { primaryRole } = useAuth();
  // Helper to truncate address
  function truncateAddress(addr: string) {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }
  return (
    <div className="rounded-2xl border border-gray-300 bg-white p-10 max-w-lg mx-auto shadow-md">
      <div className="flex items-center gap-8">
        <MetaMaskAvatar address={safeAddress} size={88} />
        <div>
          <div className="font-bold text-2xl text-gray-800 flex items-center gap-3">
            {safeAddress ? truncateAddress(safeAddress) : 'Not connected'}
            {safeAddress && (
              <button
                onClick={() => navigator.clipboard.writeText(safeAddress)}
                className="ml-2 px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                Copy
              </button>
            )}
          </div>
          <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
            <svg className="inline w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="12" /></svg>
            Connected with MetaMask
            </div>
          {/* Role badge */}
          <div className="mt-4">
            <span className="inline-block bg-blue-600 text-white text-base font-semibold rounded-full px-5 py-2 capitalize tracking-wide">
              {primaryRole || 'No role assigned'}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-8 text-base text-gray-600 border-t pt-6">
        <strong>Security Tip:</strong> Your wallet is your identity. Never share your private key or seed phrase with anyone.
          </div>
      <button
        onClick={disconnectWallet}
        className="mt-6 w-full bg-red-100 text-red-700 py-3 rounded-lg hover:bg-red-200 text-base font-semibold"
      >
        Disconnect Wallet
      </button>
        </div>
  );
}
