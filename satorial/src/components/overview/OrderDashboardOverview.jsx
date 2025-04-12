import { useState, useEffect } from "react";
import { User, Mail, CheckCircle, Hourglass, ClipboardList, XCircle } from "lucide-react";
import ClientFormModal from "../modals/formModals/ClientFormModal";
import OrderService from "@/services/OrderService"; // Adjust the import path as needed

const OrderDashboardOverview = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await OrderService.getOrderDashboard();
        setDashboardData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Define the cards array with dynamic data
  const cards = [
    { icon: <User size={24} />, value: dashboardData?.total_orders || 0, label: "Total Orders", color: "bg-green-100" },
    { icon: <Mail size={24} />, value: dashboardData?.delivered_orders || 0, label: "Delivered Orders", color: "bg-yellow-100" },
    { icon: <CheckCircle size={24} />, value: dashboardData?.completed_orders || 0, label: "Completed Orders", color: "bg-blue-100" },
    { icon: <Hourglass size={24} />, value: dashboardData?.in_progress_orders || 0, label: "In Progress Orders", color: "bg-purple-100" },
    { icon: <ClipboardList size={24} />, value: dashboardData?.awaiting_delivery_orders || 0, label: "Awaiting Delivery Orders", color: "bg-red-100" },
    { icon: <XCircle size={24} />, value: dashboardData?.not_started_orders || 0, label: "Not Started Orders", color: "bg-teal-100" },
  ];

  if (loading) {
    return <div className="p-4 sm:p-6">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="p-4 sm:p-6">Error fetching dashboard data. Please try again later.</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`p-5 sm:p-6 rounded-lg shadow-md flex flex-col items-start border-2 border-cyan-50 ${card.color}`}
          >
            <div className="p-2 mb-2 text-blue-600 border-[1px] border-blue-500 rounded-full">{card.icon}</div>
            <p className="text-xl py-4 sm:text-2xl font-normal">{card.value}</p>
            <p className="py-4 text-gray-700 text-sm sm:text-base">{card.label}</p>
          </div>
        ))}
      </div>
      <ClientFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default OrderDashboardOverview;