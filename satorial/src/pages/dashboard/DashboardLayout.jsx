import Navbar from "../../components/navs/NavBar";
import { useAuth } from "../../contexts/AuthContext";
import {
  HelpCircle,
  Archive,
  ShoppingCart,
  Users,
  Clock,
  DollarSign,
  Box,
  Calendar,
  Settings,
  ChevronRight,
} from "lucide-react";
import IconButton from "../../components/buttons/IconButton";
import PATTERN_1 from "../../assets/images/pattern-1.svg";
import PATTERN_2 from "../../assets/images/pattern-2.svg";
import PATTERN_3 from "../../assets/images/pattern-3.svg";
import PATTERN_4 from "../../assets/images/pattern-4.svg";
import PATTERN_5 from "../../assets/images/pattern-5.svg";
import PATTERN_6 from "../../assets/images/pattern-6.svg";

const dashboardItems = [
  {
    title: "Client Management",
    icon: <Users size={20} />,
    img: PATTERN_1,
    button_link: "/client/client-dashboard",
  },
  {
    title: "Order Management",
    icon: <Archive size={20} />,
    img: PATTERN_2,
    button_link: "/order/order-dashboard",
  },
  {
    title: "Staff",
    icon: <Users size={20} />,
    img: PATTERN_3,
    button_link: "/staff/staff-list",
  },
  {
    title: "My Orders",
    icon: <ShoppingCart size={20} />,
    img: PATTERN_4,
    button_link: "/my-orders",
  },
  {
    title: "Report",
    icon: <Clock size={20} />,
    img: PATTERN_5,
    button_link: "/reports/reports/dashboard",
  },
  {
    title: "Expenses",
    icon: <DollarSign size={20} />,
    img: PATTERN_6,
    button_link: "/expenses/overview",
  },
  {
    title: "Inventory",
    icon: <Box size={20} />,
    img: PATTERN_1,
    button_link: "/inventory/list/overview",
  },
  {
    title: "Subscription",
    icon: <Calendar size={20} />,
    img: PATTERN_2,
    button_link: "/subscription/subscription-dashboard",
  },
  {
    title: "Settings",
    icon: <Settings size={20} />,
    img: PATTERN_3,
    button_link: "/settings/settings-dashboard",
  },
];

const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <Navbar />
      <div className="mx-auto max-w-7xl py-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-center md:text-left">
            Hi {user?.first_name || "Kemi"}, what are you doing today?
          </h1>

          <IconButton
            icon={HelpCircle}
            text="Help Centre"
            onClick={() => alert("Help Clicked")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardItems.map((item, index) => (
            <div
              key={index}
              className="relative rounded-lg shadow-md overflow-hidden flex flex-col"
              style={{
                backgroundImage: `url(${item.img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "220px",
              }}
            >
              <div className="absolute top-3 left-3 bg-white px-3 py-2 rounded-lg shadow-md">
                {item.icon}
              </div>

              <div className="absolute top-32 md:top-28 left-3 bg-white px-3 py-2 rounded-lg shadow-md">
                <span className="text-4xl md:text-2xl font-light">
                  {item.title}
                </span>
              </div>

              <a
                href={item.button_link}
                className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white py-3 text-center flex justify-between items-center px-4"
              >
                <span className="text-sm md:text-base">Open Dashboard</span>
                <ChevronRight size={24} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
