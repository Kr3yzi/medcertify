import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Grid, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../contexts/ApiContext';

const VitalsForm = ({ patientAddress, onSuccess }) => {
  const { token } = useAuth();
  const { api } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [vitals, setVitals] = useState({
    height: '',
    weight: '',
    bmi: '',
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    vision: '',
    hearing: ''
  });

  const [errors, setErrors] = useState({});

  const validateVitals = () => {
    const newErrors = {};
    
    // Height validation (in cm)
    if (!vitals.height || vitals.height <= 0) {
      newErrors.height = 'Height must be a positive number';
    }

    // Weight validation (in kg)
    if (!vitals.weight || vitals.weight <= 0) {
      newErrors.weight = 'Weight must be a positive number';
    }

    // BMI validation
    if (!vitals.bmi || vitals.bmi <= 0) {
      newErrors.bmi = 'BMI must be a positive number';
    }

    // Blood pressure validation (systolic/diastolic)
    if (!vitals.bloodPressure || !/^\d{2,3}\/\d{2,3}$/.test(vitals.bloodPressure)) {
      newErrors.bloodPressure = 'Blood pressure must be in format systolic/diastolic (e.g., 120/80)';
    }

    // Heart rate validation
    if (!vitals.heartRate || vitals.heartRate < 0 || vitals.heartRate > 250) {
      newErrors.heartRate = 'Heart rate must be between 0 and 250';
    }

    // Temperature validation
    if (!vitals.temperature || vitals.temperature < 35 || vitals.temperature > 42) {
      newErrors.temperature = 'Temperature must be between 35 and 42';
    }

    // Respiratory rate validation
    if (!vitals.respiratoryRate || vitals.respiratoryRate < 0 || vitals.respiratoryRate > 60) {
      newErrors.respiratoryRate = 'Respiratory rate must be between 0 and 60';
    }

    // Vision validation
    if (!vitals.vision) {
      newErrors.vision = 'Vision assessment is required';
    }

    // Hearing validation
    if (!vitals.hearing) {
      newErrors.hearing = 'Hearing assessment is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateVitals()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch(`/patients/${patientAddress}/vitals`, vitals, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess(true);
        setVitals({
          height: '',
          weight: '',
          bmi: '',
          bloodPressure: '',
          heartRate: '',
          temperature: '',
          respiratoryRate: '',
          vision: '',
          hearing: ''
        });
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update vitals');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVitals(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Record Patient Vitals
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Vitals recorded successfully!
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Height (cm)"
              name="height"
              type="number"
              value={vitals.height}
              onChange={handleChange}
              error={!!errors.height}
              helperText={errors.height}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Weight (kg)"
              name="weight"
              type="number"
              value={vitals.weight}
              onChange={handleChange}
              error={!!errors.weight}
              helperText={errors.weight}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="BMI"
              name="bmi"
              type="number"
              value={vitals.bmi}
              onChange={handleChange}
              error={!!errors.bmi}
              helperText={errors.bmi}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Blood Pressure (e.g., 120/80)"
              name="bloodPressure"
              value={vitals.bloodPressure}
              onChange={handleChange}
              error={!!errors.bloodPressure}
              helperText={errors.bloodPressure}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Heart Rate (bpm)"
              name="heartRate"
              type="number"
              value={vitals.heartRate}
              onChange={handleChange}
              error={!!errors.heartRate}
              helperText={errors.heartRate}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Temperature (°C)"
              name="temperature"
              type="number"
              value={vitals.temperature}
              onChange={handleChange}
              error={!!errors.temperature}
              helperText={errors.temperature}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Respiratory Rate (breaths/min)"
              name="respiratoryRate"
              type="number"
              value={vitals.respiratoryRate}
              onChange={handleChange}
              error={!!errors.respiratoryRate}
              helperText={errors.respiratoryRate}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Vision Assessment"
              name="vision"
              value={vitals.vision}
              onChange={handleChange}
              error={!!errors.vision}
              helperText={errors.vision}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Hearing Assessment"
              name="hearing"
              value={vitals.hearing}
              onChange={handleChange}
              error={!!errors.hearing}
              helperText={errors.hearing}
              required
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Recording...' : 'Record Vitals'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default VitalsForm; 