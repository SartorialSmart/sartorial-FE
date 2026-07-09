import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import Header from "./NavLayout/Header";
import Sidebar from "./NavLayout/SideBar";
import { LogOut, Settings, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const SettingsSideBarLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sidebarItems = [
    { icon: <Settings size={18} />, label: "Settings", path: "/settings" },
    { icon: <Shield size={18} />, label: "Staff Roles", path: "/settings/roles" },
    { icon: <LogOut size={18} />, label: "Log out", path: "#", onClick: handleLogout },
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

SettingsSideBarLayout.propTypes = {
  children: PropTypes.node
};

export default SettingsSideBarLayout;
