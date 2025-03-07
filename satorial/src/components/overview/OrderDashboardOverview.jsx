import { useState } from "react";
import { User, Mail, CheckCircle, Hourglass, ClipboardList, XCircle } from "lucide-react";
import AddButton from "@/components/buttons/AddButton";
import ClientFormModal from "../modals/formModals/ClientFormModal";

const OrderDashboardOverview = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cards = [
    { icon: <User size={24} />, value: 112, label: "All Clients", color: "bg-green-100" },
    { icon: <Mail size={24} />, value: 112, label: "All Orders", color: "bg-yellow-100" },
    { icon: <CheckCircle size={24} />, value: 112, label: "Completed Orders", color: "bg-blue-100" },
    { icon: <Hourglass size={24} />, value: 112, label: "In Progress Orders", color: "bg-purple-100" },
    { icon: <ClipboardList size={24} />, value: 112, label: "Allocated Orders", color: "bg-red-100" },
    { icon: <XCircle size={24} />, value: 112, label: "Unallocated Orders", color: "bg-teal-100" },
  ];

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
