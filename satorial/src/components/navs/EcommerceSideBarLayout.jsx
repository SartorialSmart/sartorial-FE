import { useState } from "react";
import PropTypes from "prop-types";
import Header from "./NavLayout/Header";
import Sidebar from "./NavLayout/SideBar";
import {
  LayoutGrid,
  Plug,
  HelpCircle,
  Store,
  ShoppingCart,
} from "lucide-react";

const EcommerceSideBarLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    { icon: <LayoutGrid size={18} />, label: "Products", path: "/store/products" },
    { icon: <ShoppingCart size={18} />, label: "Orders", path: "/store/orders" },
    { icon: <Plug size={18} />, label: "Integrations", path: "/store/integrations" },
    { icon: <Store size={18} />, label: "Store Settings", path: "/store/settings", activeOn: ["/store/settings", "/settings/storefront"] },
    { icon: <HelpCircle size={18} />, label: "Help Centre", path: "/help-centre" },
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
        <main className="flex-1 overflow-auto mt-16 md:mt-0 p-6">{children}</main>
      </div>
    </div>
  );
};

EcommerceSideBarLayout.propTypes = {
  children: PropTypes.node,
};

export default EcommerceSideBarLayout;
