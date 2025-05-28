export interface PatientDemographics {
  fullName: string;
  myKadNo: string;
  dob: string;
  gender: string;
  nationality: string;
}

export interface Vitals {
  height: string;
  weight: string;
  bmi: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  oxygenSaturation: string;
  respiratoryRate: string;
  notes: string;
}

export interface TestOrder {
  _id: string;
  testType: string;
  purpose: string;
  status: string;
  orderedBy: string;
  resultCid?: string;
  timestamp?: string;
}

export interface AlertState {
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
} 