import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useAuth } from "../context/AuthContext";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { address, primaryRole } = useAuth();

  // Check if user is registered
  const isUserRegistered = address && primaryRole;

  // Determine sidebar margin based on state
  let sidebarMargin = "ml-0";
  if (isMobileOpen) {
    sidebarMargin = "ml-0";
  } else if (isExpanded || isHovered) {
    sidebarMargin = "lg:ml-[290px]";
  } else {
    sidebarMargin = "lg:ml-[90px]";
  }

  return (
    <div className="min-h-screen xl:flex">
      {isUserRegistered ? (
        <div>
          <AppSidebar />
          <Backdrop />
        </div>
      ) : null}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${sidebarMargin}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {isUserRegistered ? <Outlet /> : (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="text-2xl font-semibold text-gray-700 mb-2">No data found for this user</div>
              <div className="text-gray-500">Please contact the system administrator if you believe this is an error.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
