import { useState } from "react";
import PropTypes from "prop-types";
import Header from "./NavLayout/Header";
import Sidebar from "./NavLayout/SideBar";
import {
  CreditCard,
  FileText,
  Store,
  HelpCircle
} from "lucide-react";

const AccountingSideBarLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    { icon: <FileText />, label: "Bills", path: "/accounting/bills-list", activeOn: ["/accounting/bill-detail"] },
    { icon: <CreditCard />, label: "Payments", path: "/accounting/payments-list" },
    { icon: <Store />, label: "Vendor", path: "/accounting/vendor-list" },
    { icon: <Store />, label: "Create Vendor", path: "/accounting/vendor/add" },
    { icon: <Store />, label: "Vendor Category", path: "/accounting/vendor-category-list" },
    { icon: <HelpCircle />, label: "Help Centre", path: "/accounting/help-centre" },
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

AccountingSideBarLayout.propTypes = {
  children: PropTypes.node
};

export default AccountingSideBarLayout;
