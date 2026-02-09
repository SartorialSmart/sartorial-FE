import { useState } from "react";
import PropTypes from "prop-types";
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

const ExpensesSideABrLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    { icon: <LayoutGrid />, label: "Expenses", path: "/expenses/overview" },
    { icon: <CreditCard />, label: "Expenses Category", path: "/expenses/category/list" },
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

ExpensesSideABrLayout.propTypes = {
  children: PropTypes.node
};

export default ExpensesSideABrLayout;
