import { useState } from "react";
import PropTypes from "prop-types";
import Header from "./NavLayout/Header";
import Sidebar from "./NavLayout/SideBar";
import {
  LayoutGrid,
  ClipboardList,
  FileBarChart,
  HelpCircle,
} from "lucide-react";

const ProductionSideBarLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    {
      icon: <LayoutGrid />,
      label: "Dashboard",
      path: "/production/dashboard",
    },
    {
      icon: <ClipboardList />,
      label: "Production Orders",
      path: "/production/orders-list",
      activeOn: ["/production/detail", "/production/edit"],
    },
    {
      icon: <FileBarChart />,
      label: "Production Report",
      path: "/production/report",
    },
    { icon: <HelpCircle />, label: "Help Centre", path: "/production/help-centre" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        sidebarItems={sidebarItems}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        } md:ml-64`}
      >
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-auto mt-16 md:mt-0 p-6">{children}</main>
      </div>
    </div>
  );
};

ProductionSideBarLayout.propTypes = {
  children: PropTypes.node,
};

export default ProductionSideBarLayout;
