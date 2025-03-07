import { useState } from "react";
import Header from "./NavLayout/Header";
import Sidebar from "./NavLayout/SideBar";
import { LayoutGrid, Users, ShoppingBag, Settings, MessageCircle, HelpCircle, Bell } from "lucide-react";

const ClientSideABrLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    { icon: <LayoutGrid />, label: "Dashboard", path: "/client/client-dashboard" },
    { icon: <Users />, label: "Clients", path: "/client/clients-list" },
    { icon: <ShoppingBag />, label: "Orders", path: "/client/orders-list" },
    { icon: <Settings />, label: "Allocations", path: "/client/allocations-list" },
    { icon: <MessageCircle />, label: "Messages", path: "/chat" },
    { icon: <HelpCircle />, label: "Help Centre", path: "/client/help-centre" },
  ];

  return (
    <div className="flex h-screen">

      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
        sidebarItems={sidebarItems} 
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"} md:ml-64`}>
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <main className=" mt-16 md:mt-0 rounded-sm">{children}</main>
      </div>
    </div>
  );
};

export default ClientSideABrLayout;
