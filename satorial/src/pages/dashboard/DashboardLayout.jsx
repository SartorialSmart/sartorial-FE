import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navs/NavBar";
import { useAuth } from "../../contexts/AuthContext";
import { useSubscription } from "../../contexts/SubscriptionContext";
import ClientService from "../../services/ClientService";
import OrderService from "../../services/OrderService";
import StaffService from "../../services/staffServices/StaffService";
import ExpensesService from "../../services/expensesServices/ExpensesService";
import InventoryService from "../../services/InventoryService";
import {
  HelpCircle,
  Archive,
  Users,
  Clock,
  DollarSign,
  Box,
  Calendar,
  Settings,
  TrendingUp,
  Activity,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import IconButton from "../../components/buttons/IconButton";
import PATTERN_1 from "../../assets/images/pattern-1.svg";
import PATTERN_2 from "../../assets/images/pattern-2.svg";
import PATTERN_3 from "../../assets/images/pattern-3.svg";
import PATTERN_5 from "../../assets/images/pattern-5.svg";
import PATTERN_6 from "../../assets/images/pattern-6.svg";

const VIEW_KEY_MAP = {
  "/client/client-dashboard": "clients",
  "/order/order-dashboard": "orders",
  "/staff/staff-list": "staff",
  "/reports/reports/dashboard": "reports",
  "/expenses/overview": "expenses",
  "/inventory/list/overview": "inventory",
  "/subscriptions/panel": "subscriptions",
  "/settings": "settings",
};

const formatCurrency = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

const getDashboardItems = (stats) => [
  {
    title: "Clients Management",
    description: "Manage clients and customer relationships",
    icon: <Users size={24} />,
    img: PATTERN_1,
    button_link: "/client/client-dashboard",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-200",
    stats: stats.clients !== null ? `${stats.clients} Clients` : "—",
    textColor: "text-blue-900"
  },
  {
    title: "Orders Management",
    description: "Track and manage all orders",
    icon: <Archive size={24} />,
    img: PATTERN_2,
    button_link: "/order/order-dashboard",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-200",
    stats: stats.pendingOrders !== null ? `${stats.pendingOrders} Pending` : "—",
    textColor: "text-purple-900"
  },
  {
    title: "Staff Management",
    description: "Manage team members and assignments",
    icon: <Users size={24} />,
    img: PATTERN_3,
    button_link: "/staff/staff-list",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-200",
    stats: stats.activeStaff !== null ? `${stats.activeStaff} Active` : "—",
    textColor: "text-green-900"
  },
  {
    title: "Reports & Analytics",
    description: "View insights and performance metrics",
    icon: <Clock size={24} />,
    img: PATTERN_5,
    button_link: "/reports/reports/dashboard",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-200",
    stats: "Analytics",
    textColor: "text-orange-900"
  },
  {
    title: "Expenses",
    description: "Track and manage business expenses",
    icon: <DollarSign size={24} />,
    img: PATTERN_6,
    button_link: "/expenses/overview",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-200",
    stats: stats.expenses !== null ? `${formatCurrency(stats.expenses)} Total` : "—",
    textColor: "text-indigo-900"
  },
  {
    title: "Inventory Management",
    description: "Manage stock and materials",
    icon: <Box size={24} />,
    img: PATTERN_1,
    button_link: "/inventory/list/overview",
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-200",
    stats: stats.inventoryItems !== null ? `${stats.inventoryItems} Items` : "—",
    textColor: "text-pink-900"
  },
  {
    title: "Subscription",
    description: "Manage subscriptions and billing",
    icon: <Calendar size={24} />,
    img: PATTERN_2,
    button_link: "/subscriptions/panel",
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-200",
    stats: stats.subscriptionStatus || "No Plan",
    textColor: "text-teal-900"
  },
  {
    title: "Settings",
    description: "Configure system preferences",
    icon: <Settings size={24} />,
    img: PATTERN_3,
    button_link: "/settings",
    color: "from-gray-500 to-gray-600",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-200",
    stats: "Configure",
    textColor: "text-gray-900"
  },
];

const ALLOWED_ROLES = ["super_admin", "admin", "organization"];

const DashboardLayout = () => {
  const { user, fetchAuthenticatedUser } = useAuth();
  const { subscription } = useSubscription();
  const isAdmin = ALLOWED_ROLES.includes(user?.role?.toLowerCase());
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState("");
  const refreshed = useRef(false);
  const [stats, setStats] = useState({
    clients: null,
    pendingOrders: null,
    activeStaff: null,
    expenses: null,
    inventoryItems: null,
    subscriptionStatus: null,
  });

  useEffect(() => {
    if (user && !isAdmin && !user?.staff_permissions && !refreshed.current) {
      refreshed.current = true;
      fetchAuthenticatedUser();
    }
  }, [user, isAdmin, fetchAuthenticatedUser]);
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const results = await Promise.allSettled([
        ClientService.getClientDashboard(),
        OrderService.getOrders(),
        StaffService.listStaff(),
        ExpensesService.getExpenseSummary(),
        InventoryService.listInventory(),
      ]);

      const [clientsRes, ordersRes, staffRes, expensesRes, inventoryRes] = results;

      const clientCount = clientsRes.status === "fulfilled"
        ? (clientsRes.value?.total_clients ?? clientsRes.value?.count ?? null)
        : null;

      const pendingOrders = ordersRes.status === "fulfilled"
        ? (Array.isArray(ordersRes.value)
            ? ordersRes.value.filter(o => o.order_status === "Not Started" || o.order_status === "Pending").length
            : null)
        : null;

      const activeStaff = staffRes.status === "fulfilled"
        ? (staffRes.value?.count ?? (Array.isArray(staffRes.value?.results) ? staffRes.value.results.length : null))
        : null;

      const totalExpenses = expensesRes.status === "fulfilled"
        ? (expensesRes.value?.total_expense_amount ?? expensesRes.value?.total ?? expensesRes.value?.amount ?? null)
        : null;

      const inventoryCount = inventoryRes.status === "fulfilled"
        ? (Array.isArray(inventoryRes.value) ? inventoryRes.value.length : inventoryRes.value?.count ?? null)
        : null;

      setStats({
        clients: clientCount,
        pendingOrders,
        activeStaff,
        expenses: totalExpenses,
        inventoryItems: inventoryCount,
        subscriptionStatus: null,
      });
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (subscription) {
      const status = subscription.status || subscription.plan?.status || null;
      const label = status === "active" ? "Active"
        : status === "trialing" ? "Trial"
        : status === "cancelled" ? "Cancelled"
        : status === "past_due" ? "Past Due"
        : status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
        : "No Plan";
      setStats(prev => ({ ...prev, subscriptionStatus: label }));
    }
  }, [subscription]);

  const handleHelpClick = () => {
    navigate("/help-centre");
  };

  const handleCardClick = (link) => {
    navigate(link);
  };

  const userPermissions = user?.staff_permissions;
  // Accept both the legacy view keys ("staff") and the RBAC catalog keys
  // ("staff.view_staff") that the permissions UI now saves.
  const hasModule = (moduleKey) => {
    if (!userPermissions || !moduleKey) return true;
    return (
      userPermissions.includes(moduleKey) ||
      userPermissions.some(
        (p) => p === moduleKey || p.startsWith(`${moduleKey}.`)
      )
    );
  };
  const dashboardItems = getDashboardItems(stats);
  const visibleItems = isAdmin || !userPermissions
    ? dashboardItems
    : dashboardItems.filter((item) => hasModule(VIEW_KEY_MAP[item.button_link]));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 rounded-full shadow-sm">
                Good {getTimeOfDay()}, {user?.first_name || "User"}!
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Welcome to Your Dashboard
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl">
              Everything you need to manage your business efficiently in one place. 
              {currentTime && <span className="font-semibold text-blue-600"> It's {currentTime}</span>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <IconButton
              icon={HelpCircle}
              text="Help Centre"
              onClick={handleHelpClick}
              className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 shadow-sm hover:shadow-md transition-all hover:border-blue-300"
            />
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Access</h2>
            <p className="text-blue-600 text-sm font-medium">All your tools in one place</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(item.button_link)}
                className="group relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] cursor-pointer overflow-hidden border-2 border-transparent hover:border-opacity-50"
                style={{ 
                  borderColor: `rgba(99, 102, 241, 0.3)`,
                  background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%), url(${item.img}) center/cover`
                }}
              >
                {/* Content Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/10 to-white/10 group-hover:from-white/15 group-hover:via-white/10 group-hover:to-white/70 bg-transparent transition-all duration-500" />
                
                {/* Content */}
                <div className="relative z-10 p-6 h-full flex flex-col">
                  {/* Icon and Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-xl`}>
                      {item.icon}
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold ${item.textColor} bg-white/80 px-3 py-1 rounded-full border border-gray-200 backdrop-blur-sm`}>
                        {item.stats}
                      </span>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="flex-grow">
                    <h3 className={`text-lg font-bold ${item.textColor} mb-2 group-hover:scale-105 transition-transform duration-300`}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>

                  {/* Action Indicator */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/50">
                    <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                      Open module
                    </span>
                    <div className={`p-2 rounded-full bg-gradient-to-r ${item.color} text-white shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </div>

                {/* Animated Background Pattern */}
                <div 
                  className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                  style={{ backgroundImage: `url(${item.img})` }}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper function to get time of day greeting
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export default DashboardLayout;