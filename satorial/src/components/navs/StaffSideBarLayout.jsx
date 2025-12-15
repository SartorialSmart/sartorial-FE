import { useState } from "react";
import Header from "./NavLayout/Header";
import Sidebar from "./NavLayout/SideBar";
import { Users, LogOut, DollarSign, LifeBuoy, HelpCircle } from "lucide-react";

const StaffSideBarLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    { icon: <Users size={18} />, label: "Staffs", path: "/staff/staff-list" },
    { icon: <LogOut size={18} />, label: "Exit Staff", path: "/staff/exited-staffs-list" },
    { icon: <DollarSign size={18} />, label: "Payroll", path: "/staff/payroll-list" },
    { icon: <HelpCircle size={18} />, label: "Help Centre", path: "/client/help-centre" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        sidebarItems={sidebarItems}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="p-4 mt-16 md:mt-0 rounded-sm">{children}</main>
      </div>
    </div>
  );
};

export default StaffSideBarLayout;
