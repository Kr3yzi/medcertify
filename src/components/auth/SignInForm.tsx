import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

export default function SignInForm() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleMetaMaskLogin = async () => {
    await login();
    if (localStorage.getItem('jwt')) {
      navigate('/');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="mb-2 font-semibold text-gray-800 text-2xl">Sign In</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Connect your MetaMask wallet to sign in to your account.
        </p>
        <button
          type="button"
          onClick={handleMetaMaskLogin}
          className="inline-flex items-center justify-center gap-3 py-3 text-sm font-medium text-white transition-colors bg-yellow-500 rounded-lg px-7 hover:bg-yellow-600 w-full shadow"
          disabled={loading}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-5 h-5" />
          {loading ? 'Connecting...' : 'Sign in with MetaMask'}
        </button>
      </div>
    </div>
  );
}
