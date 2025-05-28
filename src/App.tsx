import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard.tsx';
import DoctorDashboard from "./pages/doctor/DoctorDashboard.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import NurseDashboard from "./pages/nurse/NurseDashboard.tsx";
import PatientDashboard from "./pages/patient/PatientDashboard.tsx";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />

            {/* Receptionist Dashboard */}
            <Route path="/receptionist" element={
              <PrivateRoute requiredRole="receptionist">
                <ReceptionistDashboard />
              </PrivateRoute>
            } />
            {/* Nurse Dashboard */}
            <Route path="/nurse" element={
              <PrivateRoute requiredRole="nurse">
                <NurseDashboard />
              </PrivateRoute>
            } />
            {/* Doctor Dashboard */}
            <Route path="/doctor" element={
              <PrivateRoute requiredRole="doctor">
                <DoctorDashboard />
              </PrivateRoute>
            } />
            {/* Admin Dashboard */}
            <Route path="/admin" element={
              <PrivateRoute requiredRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            } />
            {/* Patient Dashboard */}
            <Route path="/patient" element={
              <PrivateRoute requiredRole="patient">
                <PatientDashboard />
              </PrivateRoute>
            } />

            {/* Others Page */}
            <Route path="/profile" element={
              <PrivateRoute>
                <UserProfiles />
              </PrivateRoute>
            } />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
