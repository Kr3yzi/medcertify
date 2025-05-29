import React, { useState } from 'react';
import api from '../../api';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';

const PatientVerifyCertificate: React.FC = () => {
  const [patientAddress, setPatientAddress] = useState('');
  const [certHash, setCertHash] = useState('');
  const [cid, setCid] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>('');

  const handleVerify = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setDebug('');
    try {
      setDebug(`Request: patientAddress=${patientAddress}, certHash=${certHash}`);
      const response = await api.post('/verify-certificate', {
        patientAddress,
        certHash
      });
      setResult(response.data);
      setDebug(prev => prev + `\nResponse: ${JSON.stringify(response.data, null, 2)}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed');
      setDebug(prev => prev + `\nError: ${JSON.stringify(err.response?.data || err, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={500} mx="auto" mt={6}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Verify Health Certificate
        </Typography>
        <TextField
          label="Patient Address"
          value={patientAddress}
          onChange={e => setPatientAddress(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Certificate Hash"
          value={certHash}
          onChange={e => setCertHash(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="IPFS CID (not required for verification)"
          value={cid}
          onChange={e => setCid(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleVerify}
          disabled={loading || !certHash || !patientAddress}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Verify Certificate'}
        </Button>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
        )}
        {result && (
          <Box mt={3}>
            <Typography variant="subtitle1">Verification Result:</Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
              <Typography>
                <strong>Valid:</strong> {result.isValid ? '✅ Yes' : '❌ No'}
              </Typography>
              <Typography>
                <strong>Hash Match:</strong> {result.hashMatch ? '✅ Yes' : '❌ No'}
              </Typography>
              <Typography>
                <strong>On Blockchain:</strong> {result.foundOnChain ? '✅ Yes' : '❌ No'}
              </Typography>
              <Typography>
                <strong>IPFS Accessible:</strong> {result.ipfsOk ? '✅ Yes' : '❌ No'}
              </Typography>
              <Typography>
                <strong>Blockchain Hash:</strong> {result.certHash || '-'}
              </Typography>
              <Typography>
                <strong>CID:</strong> {result.cid || '-'}
              </Typography>
              {result.reason && (
                <Typography color="error" sx={{ mt: 1 }}>
                  <strong>Debug Reason:</strong> {result.reason}
                </Typography>
              )}
              <Typography sx={{ mt: 2, fontSize: 13, color: '#888' }}>
                Debug: isValid = foundOnChain({String(result.foundOnChain)}) &amp;&amp; hashMatch({String(result.hashMatch)}) &amp;&amp; ipfsOk({String(result.ipfsOk)})
              </Typography>
            </Paper>
          </Box>
        )}
        {debug && (
          <Box mt={2}>
            <Typography variant="body2" sx={{ color: '#888', whiteSpace: 'pre-wrap' }}>
              {debug}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PatientVerifyCertificate;
