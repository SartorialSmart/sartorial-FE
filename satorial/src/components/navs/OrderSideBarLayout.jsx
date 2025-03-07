import { useState } from "react";
import Header from "./NavLayout/Header";
import Sidebar from "./NavLayout/SideBar";
import Navigation from "./NavLayout/Navigation";
import { 
  LayoutGrid, 
  ClipboardList, 
  CreditCard, 
  FileText, 
  Store, 
  HelpCircle 
} from "lucide-react";

const OrderSideABrLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    { icon: <LayoutGrid />, label: "Dashboard", path: "/order/order-dashboard" },
    { icon: <ClipboardList />, label: "Orders", path: "/order/orders-list" },
    { icon: <CreditCard />, label: "Payments", path: "/order/payments-list" },
    { icon: <FileText />, label: "Bills", path: "/order/bills-list" },
    { icon: <Store />, label: "Vendor Category", path: "/order/vendor-category-list" },
    { icon: <HelpCircle />, label: "Help Centre", path: "/order/help-centre" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
        sidebarItems={sidebarItems} 
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"} md:ml-64`}>
        <Header className="" toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="">{children}</main>
      </div>
    </div>
  );
};

export default OrderSideABrLayout;
