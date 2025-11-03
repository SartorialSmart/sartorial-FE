import { useState, useEffect } from "react";
import { User, Mail, CheckCircle, Hourglass, ClipboardList, XCircle, TrendingUp, AlertCircle } from "lucide-react";
import ClientFormModal from "../modals/formModals/ClientFormModal";
import OrderService from "@/services/OrderService";

// Helper function to filter data by date range
const filterDataByDate = (data, dateFilter, customDateRange) => {
  if (!data || dateFilter === "All Time") return data;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let filteredData = { ...data };

  // Filter orders based on date range
  const filterOrders = (orders) => {
    return orders.filter(order => {
      const orderDate = new Date(order.ordered_at);
      
      switch (dateFilter) {
        case "Today":
          return orderDate >= today;
        case "This Week":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          return orderDate >= weekStart;
        case "This Month":
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          return orderDate >= monthStart;
        case "This Year":
          const yearStart = new Date(today.getFullYear(), 0, 1);
          return orderDate >= yearStart;
        case "Custom":
          if (customDateRange?.start && customDateRange?.end) {
            const startDate = new Date(customDateRange.start);
            const endDate = new Date(customDateRange.end);
            endDate.setHours(23, 59, 59, 999);
            return orderDate >= startDate && orderDate <= endDate;
          }
          return true;
        default:
          return true;
      }
    });
  };

  // If we have orders data, filter it
  if (filteredData.orders) {
    const filteredOrders = filterOrders(filteredData.orders);
    
    // Recalculate metrics based on filtered orders
    filteredData.total_orders = filteredOrders.length;
    filteredData.completed_orders = filteredOrders.filter(order => order.order_status === "Completed").length;
    filteredData.delivered_orders = filteredOrders.filter(order => order.order_status === "Delivered").length;
    filteredData.in_progress_orders = filteredOrders.filter(order => order.order_status === "In Progress").length;
    filteredData.awaiting_delivery_orders = filteredOrders.filter(order => order.order_status === "Awaiting Delivery").length;
    filteredData.not_started_orders = filteredOrders.filter(order => order.order_status === "Not Started").length;
    
    // Recalculate financial metrics
    filteredData.total_revenue = filteredOrders.reduce((sum, order) => sum + (Number(order.order_price) || 0), 0);
    filteredData.average_order_value = filteredData.total_orders > 0 ? filteredData.total_revenue / filteredData.total_orders : 0;
    filteredData.completion_rate = filteredData.total_orders > 0 ? (filteredData.completed_orders / filteredData.total_orders) * 100 : 0;
    filteredData.active_orders = filteredOrders.filter(order => 
      ["In Progress", "Awaiting Delivery", "Assigned"].includes(order.order_status)
    ).length;
  }

  return filteredData;
};

const calculateDashboardData = (orders) => {
  const total_orders = orders.length;
  const completed_orders = orders.filter(order => order.order_status === "Completed").length;
  const delivered_orders = orders.filter(order => order.order_status === "Delivered").length;
  const in_progress_orders = orders.filter(order => order.order_status === "In Progress").length;
  const awaiting_delivery_orders = orders.filter(order => order.order_status === "Awaiting Delivery").length;
  const not_started_orders = orders.filter(order => order.order_status === "Not Started").length;
  
  const total_revenue = orders.reduce((sum, order) => sum + (Number(order.order_price) || 0), 0);
  const average_order_value = total_orders > 0 ? total_revenue / total_orders : 0;
  const completion_rate = total_orders > 0 ? (completed_orders / total_orders) * 100 : 0;
  const active_orders = orders.filter(order => 
    ["In Progress", "Awaiting Delivery", "Assigned"].includes(order.order_status)
  ).length;

  return {
    total_orders,
    completed_orders,
    delivered_orders,
    in_progress_orders,
    awaiting_delivery_orders,
    not_started_orders,
    total_revenue,
    average_order_value,
    completion_rate,
    active_orders,
    orders // Include the orders for filtering
  };
};

const OrderDashboardOverview = ({ dateFilter, customDateRange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data with filters
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all orders from the API
        const orders = await OrderService.getOrders();
        
        // Calculate dashboard data from orders
        const allData = calculateDashboardData(orders);
        
        // Apply date filtering
        const filteredData = filterDataByDate(allData, dateFilter, customDateRange);
        
        setDashboardData(filteredData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateFilter, customDateRange]);

  const cards = [
    { 
      icon: <User size={20} />, 
      value: dashboardData?.total_orders || 0, 
      label: "Total Orders", 
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderColor: "border-green-200"
    },
    { 
      icon: <CheckCircle size={20} />, 
      value: dashboardData?.completed_orders || 0, 
      label: "Completed", 
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      borderColor: "border-blue-200"
    },
    { 
      icon: <Mail size={20} />, 
      value: dashboardData?.delivered_orders || 0, 
      label: "Delivered", 
      color: "from-yellow-500 to-amber-600",
      bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50",
      borderColor: "border-yellow-200"
    },
    { 
      icon: <Hourglass size={20} />, 
      value: dashboardData?.in_progress_orders || 0, 
      label: "In Progress", 
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
      borderColor: "border-purple-200"
    },
    { 
      icon: <ClipboardList size={20} />, 
      value: dashboardData?.awaiting_delivery_orders || 0, 
      label: "Awaiting Delivery", 
      color: "from-red-500 to-pink-600",
      bgColor: "bg-gradient-to-br from-red-50 to-pink-50",
      borderColor: "border-red-200"
    },
    { 
      icon: <XCircle size={20} />, 
      value: dashboardData?.not_started_orders || 0, 
      label: "Not Started", 
      color: "from-gray-500 to-slate-600",
      bgColor: "bg-gradient-to-br from-gray-50 to-slate-50",
      borderColor: "border-gray-200"
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">
                ₦{(dashboardData?.total_revenue || 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp size={24} className="text-blue-200" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {Math.round(dashboardData?.completion_rate || 0)}%
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">Avg. Order Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₦{Math.round(dashboardData?.average_order_value || 0).toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">Active Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {dashboardData?.active_orders || 0}
          </p>
        </div>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl border-2 ${card.bgColor} ${card.borderColor} shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-600 mt-1">{card.label}</p>
              </div>
            </div>
            
            {/* Progress bar for completion rate visualization */}
            {card.label === "Completed" && dashboardData?.total_orders > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round((card.value / dashboardData.total_orders) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(card.value / dashboardData.total_orders) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <ClientFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default OrderDashboardOverview;