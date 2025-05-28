import { useAuth } from "../context/AuthContext";

export default function SidebarWidget() {
  const { primaryRole, address } = useAuth();

  const getQuickActions = () => {
    switch (primaryRole) {
      case "doctor":
        return [
          { label: "View Today's Patients", path: "/doctor/patients" },
          { label: "Review Test Results", path: "/doctor/test-review" },
        ];
      case "nurse":
        return [
          { label: "Enter Vitals", path: "/nurse/vitals" },
          { label: "Patient Lookup", path: "/nurse/patient-lookup" },
        ];
      case "patient":
        return [
          { label: "Book Appointment", path: "/patient/appointments" },
          { label: "View Records", path: "/patient/records" },
        ];
      default:
        return [];
    }
  };

  const quickActions = getQuickActions();
  
  // Format the address for display
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not Connected';

  return (
    <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center text-white">
          {address ? address[0].toUpperCase() : "?"}
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-gray-900">
            {shortAddress}
          </h3>
          <p className="text-sm text-gray-500 capitalize">
            {primaryRole || "No Role"}
          </p>
        </div>
      </div>

      {quickActions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Quick Actions
          </h4>
          {quickActions.map((action) => (
            <a
              key={action.path}
              href={action.path}
              className="block w-full rounded-lg bg-white p-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {action.label}
            </a>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <a
          href="/help"
          className="flex items-center justify-center p-2 text-sm font-medium text-brand-500 hover:text-brand-600"
        >
          Need Help?
        </a>
      </div>
    </div>
  );
}
