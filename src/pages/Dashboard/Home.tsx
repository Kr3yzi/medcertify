import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";

// Helper to get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

// Role-specific welcome messages and stats
const roleContent = {
  doctor: {
    stats: [
      { label: "Patients Today", value: "12" },
      { label: "Pending Reviews", value: "5" },
      { label: "Certificates Issued", value: "28" },
    ],
    actions: ["Review Test Results", "Issue Certificate", "View Schedule"],
  },
  nurse: {
    stats: [
      { label: "Vitals Recorded", value: "18" },
      { label: "Tests Administered", value: "7" },
      { label: "Patients Seen", value: "25" },
    ],
    actions: ["Record Vitals", "Enter Test Results", "Patient Lookup"],
  },
  patient: {
    stats: [
      { label: "Medical Records", value: "8" },
      { label: "Certificates", value: "3" },
      { label: "Upcoming Appointments", value: "1" },
    ],
    actions: ["View Records", "Download Certificate", "Book Appointment"],
  },
  admin: {
    stats: [
      { label: "Active Users", value: "156" },
      { label: "System Health", value: "98%" },
      { label: "Pending Issues", value: "2" },
    ],
    actions: ["Manage Users", "View Logs", "System Settings"],
  },
  receptionist: {
    stats: [
      { label: "Appointments Today", value: "23" },
      { label: "Tests Scheduled", value: "15" },
      { label: "New Registrations", value: "4" },
    ],
    actions: ["Register Patient", "Schedule Test", "View Appointments"],
  },
};

const roleMeta = {
  admin: {
    title: "MedCertify | Admin Dashboard",
    description: "Admin dashboard for MedCertify: manage users, roles, and system settings."
  },
  doctor: {
    title: "MedCertify | Doctor Dashboard",
    description: "Doctor dashboard for MedCertify: access patient records, review tests, and issue certificates."
  },
  nurse: {
    title: "MedCertify | Nurse Dashboard",
    description: "Nurse dashboard for MedCertify: manage patient vitals and assist with medical records."
  },
  receptionist: {
    title: "MedCertify | Receptionist Dashboard",
    description: "Receptionist dashboard for MedCertify: register patients and manage appointments."
  },
  patient: {
    title: "MedCertify | Patient Dashboard",
    description: "Patient dashboard for MedCertify: view your medical records and certificates."
  },
  default: {
    title: "MedCertify | Dashboard",
    description: "MedCertify: Secure blockchain-based medical certificate platform."
  }
};

export default function Home() {
  const { address, primaryRole, isPatient } = useAuth();
  const [greeting, setGreeting] = useState(getGreeting());
  const meta = (primaryRole && roleMeta[primaryRole]) ? roleMeta[primaryRole] : roleMeta.default;

  // If not registered, show message
  if (!address || !primaryRole || (primaryRole === 'patient' && !isPatient)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-2xl font-semibold text-gray-700 mb-2">No data found for this user</div>
        <div className="text-gray-500">Please contact the system administrator if you believe this is an error.</div>
      </div>
    );
  }

  // Update greeting every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const content = roleContent[primaryRole as keyof typeof roleContent] || {
    stats: [],
    actions: [],
  };

  return (
    <>
      <PageMeta title={meta.title} description={meta.description} />
      
      {/* Main Content */}
      <div className="space-y-6 p-6">
        {/* Welcome Section */}
        <div className="rounded-xl bg-gradient-to-r from-brand-50 to-brand-100 p-6">
          <h1 className="text-2xl font-semibold text-gray-800 sm:text-3xl">
            {greeting}, {address}
          </h1>
          <p className="mt-2 text-gray-600">
            Welcome to your {primaryRole} dashboard. Here's your overview for today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100"
            >
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-800">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.actions.map((action, index) => (
              <button
                key={index}
                className="rounded-lg bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
          <div className="mt-4 space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-lg bg-gray-50 p-4"
              >
                <div className="h-2 w-2 rounded-full bg-brand-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {primaryRole === "doctor" && "Reviewed test results for Patient #1234"}
                    {primaryRole === "nurse" && "Recorded vitals for Patient #5678"}
                    {primaryRole === "patient" && "Downloaded medical certificate"}
                    {primaryRole === "admin" && "Updated system settings"}
                    {primaryRole === "receptionist" && "Registered new patient"}
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
        </div>
        </div>
      </div>
    </>
  );
}
