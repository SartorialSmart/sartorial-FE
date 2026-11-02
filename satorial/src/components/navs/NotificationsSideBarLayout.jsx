import { useState } from "react";
import PropTypes from "prop-types";
import Header from "./NavLayout/Header";
import Sidebar from "./NavLayout/SideBar";
import { Bell, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const NotificationsSideBarLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sidebarItems = [
    { icon: <Bell size={18} />, label: "Notifications", path: "/notifications" },
    { icon: <Settings size={18} />, label: "Settings", path: "/settings" },
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
        <main className="flex-1 overflow-auto mt-16 md:mt-0 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

NotificationsSideBarLayout.propTypes = {
  children: PropTypes.node,
};

export default NotificationsSideBarLayout;
