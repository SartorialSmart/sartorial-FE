import { useState } from "react";
import PropTypes from "prop-types";
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
    { icon: <ClipboardList />, label: "Orders", path: "/order/orders-list", activeOn: ["/order/detail"] },
    { icon: <CreditCard />, label: "Payments", path: "/order/payments-list" },
    { icon: <FileText />, label: "Bills", path: "/order/bills-list", activeOn: ["/order/bills"] },
    { icon: <Store />, label: "Vendor", path: "/order/vendor-list" },
    { icon: <Store />, label: "Create Vendor", path: "/order/vendor/add" },
    { icon: <Store />, label: "Vendor Category", path: "/order/vendor-category-list" },
    { icon: <HelpCircle />, label: "Help Centre", path: "/order/help-centre" },
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

OrderSideABrLayout.propTypes = {
  children: PropTypes.node
};

export default OrderSideABrLayout;
