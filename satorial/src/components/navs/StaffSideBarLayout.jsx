import { useState } from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import Header from "./NavLayout/Header";
import Sidebar from "./NavLayout/SideBar";
import { useAuth } from "../../contexts/AuthContext";
import { Users, LogOut, DollarSign, HelpCircle, ShieldCheck } from "lucide-react";

const ALLOWED_ROLES = ["super_admin", "admin", "organization"];

const StaffSideBarLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  if (loading) return null;

  if (!user || !ALLOWED_ROLES.includes(user?.role?.toLowerCase())) {
    return <Navigate to="/dashboard" replace />;
  }

  const sidebarItems = [
    { icon: <Users size={18} />, label: "Staffs", path: "/staff/staff-list" },
    { icon: <ShieldCheck size={18} />, label: "Users & Roles", path: "/staff/team" },
    { icon: <LogOut size={18} />, label: "Exit Staff", path: "/staff/exited-staffs-list" },
    { icon: <DollarSign size={18} />, label: "Payroll", path: "/staff/payroll-list" },
    { icon: <HelpCircle size={18} />, label: "Help Centre", path: "/client/help-centre" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        sidebarItems={sidebarItems}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        } md:ml-64`}
      >
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-auto mt-16 md:mt-0 p-6">{children}</main>
      </div>
    </div>
  );
};

StaffSideBarLayout.propTypes = {
  children: PropTypes.node
};

export default StaffSideBarLayout;
