import { useState, useEffect } from "react";
import {
  CheckCircle,
  Hourglass,
  ClipboardList,
  XCircle,
  TrendingUp,
  Users,
  Package,
  AlertCircle
} from "lucide-react";
import ClientFormModal from "../modals/formModals/ClientFormModal";
import ClientService from "../../services/ClientService";

const ClientDashboardOverview = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    total_clients: 0,
    total_orders: 0,
    completed_orders: 0,
    in_progress_orders: 0,
    allocated_orders: 0,
    unallocated_orders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await ClientService.getClientDashboard();
        setDashboardData(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching client dashboard data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const cards = [
    { 
      icon: <Users size={20} />, 
      value: dashboardData.total_clients, 
      label: "Total Clients", 
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      description: "Active clients in system"
    },
    { 
      icon: <Package size={20} />, 
      value: dashboardData.total_orders, 
      label: "Total Orders", 
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      description: "All orders created"
    },
    { 
      icon: <CheckCircle size={20} />, 
      value: dashboardData.completed_orders, 
      label: "Completed", 
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
      borderColor: "border-emerald-200",
      description: "Successfully delivered orders"
    },
    { 
      icon: <Hourglass size={20} />, 
      value: dashboardData.in_progress_orders, 
      label: "In Progress", 
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      borderColor: "border-amber-200",
      description: "Orders being processed"
    },
    { 
      icon: <ClipboardList size={20} />, 
      value: dashboardData.allocated_orders, 
      label: "Allocated", 
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
      borderColor: "border-purple-200",
      description: "Orders assigned to staff"
    },
    { 
      icon: <XCircle size={20} />, 
      value: dashboardData.unallocated_orders, 
      label: "Unallocated", 
      color: "from-rose-500 to-pink-600",
      bgColor: "bg-gradient-to-br from-rose-50 to-pink-50",
      borderColor: "border-rose-200",
      description: "Orders awaiting assignment"
    },
  ];

  // Calculate completion rate
  const completionRate = dashboardData.total_orders > 0 
    ? Math.round((dashboardData.completed_orders / dashboardData.total_orders) * 100)
    : 0;

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
    <div>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Clients Management</h1>
          <p className="text-gray-600 mt-2">Overview of clients and order statistics</p>
        </div>

      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Clients</p>
              <p className="text-2xl font-bold mt-1">{dashboardData.total_clients}</p>
              <p className="text-blue-200 text-xs mt-2">Active in system</p>
            </div>
            <Users size={24} className="text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completion Rate</p>
              <p className="text-2xl font-bold mt-1">{completionRate}%</p>
              <p className="text-green-200 text-xs mt-2">Orders delivered</p>
            </div>
            <TrendingUp size={24} className="text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Orders</p>
              <p className="text-2xl font-bold mt-1">{dashboardData.in_progress_orders + dashboardData.allocated_orders}</p>
              <p className="text-purple-200 text-xs mt-2">In progress & allocated</p>
            </div>
            <Package size={24} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl border-2 ${card.bgColor} ${card.borderColor} shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group cursor-pointer`}
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
            
            <p className="text-xs text-gray-500 mt-2">{card.description}</p>
            
            {/* Progress bar for completion rate on relevant cards */}
            {(card.label === "Completed" || card.label === "Total Orders") && dashboardData.total_orders > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round((card.value / dashboardData.total_orders) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      card.label === "Completed" 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                        : "bg-gradient-to-r from-blue-500 to-cyan-600"
                    }`}
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

export default ClientDashboardOverview;