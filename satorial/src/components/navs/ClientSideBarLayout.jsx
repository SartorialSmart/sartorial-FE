import { useState } from "react";
import PropTypes from "prop-types";
import Header from "./NavLayout/Header";
import Sidebar from "./NavLayout/SideBar";
import Breadcrumbs from "./NavLayout/Breadcrumbs";
import {
  LayoutGrid,
  Users,
  ShoppingBag,
  Settings,
  MessageCircle,
  HelpCircle,
  UserCog
} from "lucide-react";

const ClientSideABrLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    { icon: <LayoutGrid size={20} />, label: "Dashboard", path: "/client/client-dashboard" },
    { icon: <Users size={20} />, label: "Clients", path: "/client/clients-list" },
    { icon: <ShoppingBag size={20} />, label: "Orders", path: "/client/orders-list" },
    { icon: <UserCog size={20} />, label: "Allocations", path: "/client/allocations-list" },
    { icon: <MessageCircle size={20} />, label: "Messages", path: "/chat" },
    { icon: <HelpCircle size={20} />, label: "Help Centre", path: "/client/help-centre" },
    { icon: <Settings size={20} />, label: "Settings", path: "/client/settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        sidebarItems={sidebarItems}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"} md:ml-64`}>
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-auto mt-16 md:mt-0 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

ClientSideABrLayout.propTypes = {
  children: PropTypes.node
};

export default ClientSideABrLayout;