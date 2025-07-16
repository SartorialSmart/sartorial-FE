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
  HelpCircle,
} from "lucide-react";

const ReportSideABrLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    {
      icon: <LayoutGrid />,
      label: "Dashboard",
      path: "/reports/reports/dashboard",
    },
    {
      icon: <Clock />,
      label: "Monthly Data Report",
      path: "/reports/monthly/data",
    },
    {
      icon: <TrendingUp />,
      label: "Sales Report",
      path: "/reports/sales/report",
    },
    {
      icon: <CreditCard />,
      label: "Payments Report",
      path: "/reports/payments/report",
    },
    {
      icon: <ShoppingBag />,
      label: "Order Report",
      path: "/reports/orders/report",
    },
    {
      icon: <FileText />,
      label: "Bills Report",
      path: "/reports/bills/report",
    },
    {
      icon: <BarChart />,
      label: "Performance Report",
      path: "/reports/staff/performance/report",
    },
    { icon: <HelpCircle />, label: "Help Centre", path: "/help-centre" },
  ];

  return (
    <div className="flex h-screen">
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
        <main className="mt-16 md:mt-0 rounded-sm">{children}</main>
      </div>
    </div>
  );
};

export default ReportSideABrLayout;
