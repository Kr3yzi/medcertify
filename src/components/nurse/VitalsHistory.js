import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../contexts/ApiContext';

const VitalsHistory = ({ patientAddress }) => {
  const { token } = useAuth();
  const { api } = useApi();
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const response = await api.get(`/patients/${patientAddress}/vitals`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setVitals(response.data.vitals);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch vitals history');
      } finally {
        setLoading(false);
      }
    };

    fetchVitals();
  }, [patientAddress, token, api]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (vitals.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No vitals records found for this patient.
      </Alert>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Vitals History
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Height (cm)</TableCell>
              <TableCell>Weight (kg)</TableCell>
              <TableCell>BMI</TableCell>
              <TableCell>Blood Pressure</TableCell>
              <TableCell>Heart Rate</TableCell>
              <TableCell>Temperature (°C)</TableCell>
              <TableCell>Respiratory Rate</TableCell>
              <TableCell>Vision</TableCell>
              <TableCell>Hearing</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vitals
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((vital, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(vital.timestamp)}</TableCell>
                  <TableCell>{vital.height}</TableCell>
                  <TableCell>{vital.weight}</TableCell>
                  <TableCell>{vital.bmi}</TableCell>
                  <TableCell>{vital.bloodPressure}</TableCell>
                  <TableCell>{vital.heartRate}</TableCell>
                  <TableCell>{vital.temperature}</TableCell>
                  <TableCell>{vital.respiratoryRate}</TableCell>
                  <TableCell>{vital.vision}</TableCell>
                  <TableCell>{vital.hearing}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={vitals.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default VitalsHistory; 