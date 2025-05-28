/* eslint-disable react-refresh/only-export-components */
import { useContext, useState, useEffect, ReactNode, createContext } from 'react';
import api from '../api';

// --- Types ---
export interface AuthContextType {
  address: string | null;
  jwt: string | null;
  loading: boolean;
  roles: Record<string, boolean> | null;
  primaryRole: string | null;
  isPatient: boolean;
  login: () => Promise<void>;
  logout: () => void;
  disconnectWallet: () => void;
}

// --- Helpers ---
const rolePriority = ['admin', 'receptionist', 'nurse', 'doctor', 'patient'];

function getErrorMessage(err: unknown): string {
  if (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
  ) {
    return (err as { response: { data: { error: string } } }).response.data.error;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
}

// --- Context ---
export const AuthContext = createContext<AuthContextType>({
  address: null,
  jwt: null,
  loading: false,
  roles: null,
  primaryRole: null,
  isPatient: false,
  login: async () => {},
  logout: () => {},
  disconnectWallet: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Record<string, boolean> | null>(null);
  const [primaryRole, setPrimaryRole] = useState<string | null>(null);
  const [isPatient, setIsPatient] = useState(false);

  useEffect(() => {
    const restoreAuth = async () => {
    const storedJwt = localStorage.getItem('jwt');
    const storedAddress = localStorage.getItem('address');
    if (storedJwt) setJwt(storedJwt);
    if (storedAddress) setAddress(storedAddress);

    if (storedJwt) {
        try {
          const res = await api.get('/check-role');
          setRoles(res.data.roles);
          const userRoles = res.data.roles;
          const foundRole = rolePriority.find(role => userRoles[role]);
          setPrimaryRole(foundRole || null);
          if (foundRole === 'patient') {
            try {
              const patientRes = await api.get('/patient/verify');
              setIsPatient(patientRes.data.isRegistered);
              if (!patientRes.data.isRegistered) {
                setPrimaryRole(null);
              }
            } catch (err) {
              alert('Patient verify failed: ' + getErrorMessage(err));
              setIsPatient(false);
              setPrimaryRole(null);
            }
          } else {
            setIsPatient(false);
          }
        } catch (err) {
          alert('Role check failed: ' + getErrorMessage(err));
          setRoles(null);
          setPrimaryRole(null);
          setIsPatient(false);
        }
    }
      setLoading(false);
    };
    restoreAuth();
  }, []);

  const login = async () => {
    setLoading(true);
    console.log("AuthContext login called");
    try {
      if (!(window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum) {
        alert('MetaMask is not installed!');
        setLoading(false);
        return;
      }
      // 1. Request accounts
      const accounts = await (window as unknown as { ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const userAddress = accounts[0];
      setAddress(userAddress);
      localStorage.setItem('address', userAddress);
      // 2. Get nonce from backend
      const nonceRes = await api.post('/generate-nonce', { address: userAddress });
      const nonce = nonceRes.data.nonce;
      // 3. Ask user to sign the message
      const message = `Sign this message to authenticate with the Health Certificate System. Nonce: ${nonce}`;
      const signature = await (window as unknown as { ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum.request({
        method: 'personal_sign',
        params: [message, userAddress],
      }) as string;
      // 4. Send signature to backend
      const verifyRes = await api.post('/verify-signature', {
        address: userAddress,
        signature,
        nonce,
      });
      const token = verifyRes.data.token;
      setJwt(token);
      localStorage.setItem('jwt', token);
      // 5. Fetch roles
      const roleRes = await api.get('/check-role');
      setRoles(roleRes.data.roles);
      // Determine primaryRole
      const userRoles = roleRes.data.roles;
      const foundRole = rolePriority.find(role => userRoles[role]);
      setPrimaryRole(foundRole || null);

      // Check if user is a registered patient
      if (foundRole === 'patient') {
        const patientRes = await api.get('/patient/verify');
        setIsPatient(patientRes.data.isRegistered);
        if (!patientRes.data.isRegistered) {
          setPrimaryRole(null); // Reset primaryRole if not a registered patient
        }
      } else {
        setIsPatient(false);
      }
    } catch (err: unknown) {
      alert('Login failed: ' + getErrorMessage(err));
      setAddress(null);
      setJwt(null);
      setRoles(null);
      setPrimaryRole(null);
      setIsPatient(false);
      localStorage.removeItem('jwt');
      localStorage.removeItem('address');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAddress(null);
    setJwt(null);
    setRoles(null);
    setPrimaryRole(null);
    setIsPatient(false);
    localStorage.removeItem('jwt');
    localStorage.removeItem('address');
  };

  const disconnectWallet = () => {
    setAddress(null);
    setJwt(null);
    setRoles(null);
    setPrimaryRole(null);
    setIsPatient(false);
    localStorage.removeItem('jwt');
    localStorage.removeItem('address');
    window.location.href = '/signin';
  };

  return (
    <AuthContext.Provider value={{ address, jwt, loading, roles, primaryRole, isPatient, login, logout, disconnectWallet }}>
      {children}
    </AuthContext.Provider>
  );
}; 