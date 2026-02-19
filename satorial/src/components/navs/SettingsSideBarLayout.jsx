import { useState } from "react";
import PropTypes from "prop-types";
import Header from "./NavLayout/Header";
import Sidebar from "./NavLayout/SideBar";
import { LogOut, Settings } from "lucide-react";

const SettingsSideBarLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    { icon: <Settings size={18} />, label: "Settings", path: "/settings" },
    { icon: <LogOut size={18} />, label: "Log out", path: "" },
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
