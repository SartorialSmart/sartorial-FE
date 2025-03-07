import { useState, useEffect } from "react";
import { User, Mail, CheckCircle, Hourglass, ClipboardList, XCircle } from "lucide-react";
import AddButton from "@/components/buttons/AddButton";
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await ClientService.getClientDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching client dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, []);

  const cards = [
    { icon: <User size={24} />, value: dashboardData.total_clients, label: "All Clients", color: "bg-green-100" },
    { icon: <Mail size={24} />, value: dashboardData.total_orders, label: "All Orders", color: "bg-yellow-100" },
    { icon: <CheckCircle size={24} />, value: dashboardData.completed_orders, label: "Completed Orders", color: "bg-blue-100" },
    { icon: <Hourglass size={24} />, value: dashboardData.in_progress_orders, label: "In Progress Orders", color: "bg-purple-100" },
    { icon: <ClipboardList size={24} />, value: dashboardData.allocated_orders, label: "Allocated Orders", color: "bg-red-100" },
    { icon: <XCircle size={24} />, value: dashboardData.unallocated_orders, label: "Unallocated Orders", color: "bg-teal-100" },
  ];

  return (
    <div className="p-4 sm:p-6 bg-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold">Dashboard</h1>
        <AddButton text="Add Client" onClick={() => setIsModalOpen(true)} />
      </div>

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

export default ClientDashboardOverview;
