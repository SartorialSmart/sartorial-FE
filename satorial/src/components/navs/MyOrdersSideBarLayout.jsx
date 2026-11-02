import { useState } from "react";
import PropTypes from "prop-types";
import Header from "./NavLayout/Header";
import Sidebar from "./NavLayout/SideBar";
import {
  LayoutGrid,
  ClipboardList,
  Factory,
  HelpCircle
} from "lucide-react";

/**
 * Chrome for the staff member's own workspace ("My Orders").
 *
 * Deliberately separate from the admin module layouts: this sidebar only
 * offers the signed-in staff member their own assigned work, never the
 * organization-wide management screens.
 */
const MyOrdersSideBarLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    { icon: <LayoutGrid />, label: "Dashboard", path: "/dashboard" },
    { icon: <ClipboardList />, label: "My Orders", path: "/order/my-orders", activeOn: ["/order/my-orders"] },
    { icon: <Factory />, label: "My Production", path: "/order/my-orders?tab=production", activeOn: ["/order/my-orders"] },
    { icon: <HelpCircle />, label: "Help Centre", path: "/help-centre" },
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

MyOrdersSideBarLayout.propTypes = {
  children: PropTypes.node
};

export default MyOrdersSideBarLayout;
