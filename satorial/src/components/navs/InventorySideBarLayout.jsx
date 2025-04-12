import { useState } from "react";
import Header from "./NavLayout/Header";
import Sidebar from "./NavLayout/SideBar";
import { 
  LayoutGrid, 
  Clock, 
  TrendingUp, 
  CreditCard, 
  ShoppingBag, 
  FileText, 
  BarChart, 
  HelpCircle 
} from "lucide-react";

const InventorySideBarLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    { icon: <LayoutGrid />, label: "Inventory", path: "/inventory/list/overview" },
    { icon: <CreditCard />, label: "Inventory Category", path: "/inventory/category/list" },
    { icon: <CreditCard />, label: "Dispense Inventory", path: "/inventory/dispense/list" },
    { icon: <HelpCircle />, label: "Help Centre", path: "/help-centre" },
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
        <main className="mt-16 md:mt-0 rounded-sm">{children}</main>
      </div>
    </div>
  );
};

export default InventorySideBarLayout;
