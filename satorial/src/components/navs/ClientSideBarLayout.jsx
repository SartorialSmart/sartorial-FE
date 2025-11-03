import { useState } from "react";
import Header from "./NavLayout/Header";
import Sidebar from "./NavLayout/SideBar";
import Breadcrumbs from "./NavLayout/BreadCrumbs";
import { 
  LayoutGrid, 
  Users, 
  ShoppingBag, 
  Settings, 
  MessageCircle, 
  HelpCircle,
  UserCog,
  BarChart3
} from "lucide-react";

const ClientSideABrLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    { icon: <LayoutGrid size={20} />, label: "Dashboard", path: "/client/client-dashboard" },
    { icon: <Users size={20} />, label: "Clients", path: "/client/clients-list" },
    { icon: <ShoppingBag size={20} />, label: "Orders", path: "/client/orders-list" },
    { icon: <UserCog size={20} />, label: "Allocations", path: "/client/allocations-list" },
    { icon: <BarChart3 size={20} />, label: "Reports", path: "/client/reports" },
    { icon: <MessageCircle size={20} />, label: "Messages", path: "/chat" },
    { icon: <HelpCircle size={20} />, label: "Help Centre", path: "/client/help-centre" },
    { icon: <Settings size={20} />, label: "Settings", path: "/client/settings" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50/20">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
        sidebarItems={sidebarItems} 
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"} md:ml-64`}>
        {/* Header */}
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto mt-16 md:mt-0 p-6">
          {/* Breadcrumbs */}
          <Breadcrumbs />
          
          {/* Page Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 min-h-[calc(100vh-200px)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientSideABrLayout;