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
    color: "bg-blue-100",
    textColor: "text-blue-800",
  },
  {
    title: "Order Management",
    icon: <Archive size={20} />,
    img: PATTERN_2,
    button_link: "/order/order-dashboard",
    color: "bg-purple-100",
    textColor: "text-purple-800",
  },
  {
    title: "Staff",
    icon: <Users size={20} />,
    img: PATTERN_3,
    button_link: "/staff/staff-list",
    color: "bg-green-100",
    textColor: "text-green-800",
  },
  {
    title: "My Orders",
    icon: <ShoppingCart size={20} />,
    img: PATTERN_4,
    button_link: "/my-orders",
    color: "bg-yellow-100",
    textColor: "text-yellow-800",
  },
  {
    title: "Report",
    icon: <Clock size={20} />,
    img: PATTERN_5,
    button_link: "/reports/reports/dashboard",
    color: "bg-red-100",
    textColor: "text-red-800",
  },
  {
    title: "Expenses",
    icon: <DollarSign size={20} />,
    img: PATTERN_6,
    button_link: "/expenses/overview",
    color: "bg-indigo-100",
    textColor: "text-indigo-800",
  },
  {
    title: "Inventory",
    icon: <Box size={20} />,
    img: PATTERN_1,
    button_link: "/inventory/list/overview",
    color: "bg-pink-100",
    textColor: "text-pink-800",
  },
  {
    title: "Subscription",
    icon: <Calendar size={20} />,
    img: PATTERN_2,
    button_link: "/subscriptions/panel",
    color: "bg-teal-100",
    textColor: "text-teal-800",
  },
  {
    title: "Settings",
    icon: <Settings size={20} />,
    img: PATTERN_3,
    button_link: "/settings",
    color: "bg-gray-100",
    textColor: "text-gray-800",
  },
];

const DashboardLayout = () => {
  const { user } = useAuth();

  const handleHelpClick = () => {
    return (window.location.href = "/help-centre");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome back, {user?.first_name || "User"}!
            </h1>
            <p className="text-gray-600 mt-1">
              What would you like to do today?
            </p>
          </div>

          <IconButton
            icon={HelpCircle}
            text="Help Centre"
            onClick={handleHelpClick}
            className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
          />
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <div
              key={index}
              className="relative rounded-xl shadow-sm overflow-hidden flex flex-col border border-gray-200 hover:shadow-md transition-shadow duration-300"
            >
              {/* Card Background with Overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${item.img})` }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              </div>

              {/* Card Content */}
              <div className="relative z-10 flex flex-col h-full p-5">
                {/* Icon */}
                <div
                  className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4`}
                >
                  {item.icon}
                </div>

                {/* Title - Updated styling */}
                <div className="flex">
                  <h3
                    className={`text-xl font-semibold rounded-lg py-2 px-4 ${item.color} ${item.textColor} whitespace-nowrap`}
                  >
                    {item.title}
                  </h3>
                </div>

                {/* Spacer to push button to bottom */}
                <div className="flex-grow"></div>

                {/* Action Button */}
                <a
                  href={item.button_link}
                  className={`mt-4 flex items-center justify-between px-4 py-3 rounded-lg ${item.color} ${item.textColor} hover:opacity-90 transition-opacity`}
                >
                  <span className="font-medium">Open Dashboard</span>
                  <ChevronRight size={20} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats Section (optional) */}
        <div className="mt-12 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Add your quick stats widgets here */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Total Clients</p>
              <p className="text-2xl font-bold text-blue-800">42</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">Pending Orders</p>
              <p className="text-2xl font-bold text-green-800">15</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-yellow-800">$8,250</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600">Active Staff</p>
              <p className="text-2xl font-bold text-purple-800">7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
