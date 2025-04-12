import React, { useEffect, useState, useRef } from "react";
import { MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import OrderService from "../../services/OrderService";
import TrackOrderStatusModal from "../modals/formModals/TrackOrderStatusModal";
import OrderInvoiceModal from "../modals/formModals/OrderInvoiceModal";

const columns = [
  { key: "client_full_name", label: "Client Name" },
  { key: "order_title", label: "Order Name" },
  { key: "order_price", label: "Amount (₦)" },
  { key: "ordered_at", label: "Order Date" },
  { key: "order_status", label: "Status" },
];

const formatAmount = (amount = 0) => `₦${Number(amount).toLocaleString()}`;


const getStatusClass = (status) => {
  const statusMap = {
    Pending: "bg-yellow-100 text-yellow-700",
    Completed: "bg-green-100 text-green-700",
    "In Progress": "bg-blue-100 text-blue-700",
  };
  return statusMap[status] || "bg-gray-100 text-gray-700";
};

const OrderListTable = () => {
  const [orders, setOrders] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showOrderInvoiceModal, setShowOrderInvoiceModal] = useState(false);
  const dropdownRefs = useRef([]);

  // Fetch orders from the API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await OrderService.getOrders();
        setOrders(data);
        dropdownRefs.current = new Array(data.length).fill(null);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };
    fetchOrders();
  }, []);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeDropdown !== null &&
        dropdownRefs.current[activeDropdown] &&
        !dropdownRefs.current[activeDropdown].contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  // Toggle dropdown visibility
  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  // Handle "Track Order" click
  const handleTrackOrder = (order) => {
    setSelectedOrder(order);
    setShowTrackModal(true);
    setActiveDropdown(null);
  };

  const handleOrderInvoice = (order) => {
    setSelectedOrder(order);
    setShowOrderInvoiceModal(true);
    setActiveDropdown(null);
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">
        Order List
      </h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-200 text-left text-sm sm:text-base">
              <th className="p-3 sm:p-4 w-12">
                <input type="checkbox" className="w-4 h-4" />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-3 sm:p-4 font-medium text-gray-700"
                >
                  {col.label}
                </th>
              ))}
              <th className="p-3 sm:p-4 w-10"></th>
            </tr>
          </thead>
          <tbody>
            
            {orders.map((order, index) => (
              <tr
                key={order.id || index}
                className="border-t hover:bg-gray-50 transition relative"
              >
                <td className="p-3 sm:p-4 w-12">
                  <input type="checkbox" className="w-4 h-4" />
                </td>
                {columns.map((col) => (
                  <td
                    key={`${order.id}-${col.key}`}
                    className="p-3 sm:p-4 text-sm sm:text-base text-gray-800"
                  >
                    {col.key === "order_price" ? (
                      formatAmount(order.order_price)
                    ) : col.key === "order_status" ? (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                          order[col.key]
                        )}`}
                      >
                        {order[col.key]}
                      </span>
                    ) : (
                      order[col.key]
                    )}
                  </td>
                ))}
                <td className="sm:p-4 w-10 text-gray-600 relative">
                  <button
                    className="border border-gray-400 rounded-md p-1 cursor-pointer hover:text-gray-800 text-gray-500 transition inline-block"
                    onClick={() => toggleDropdown(index)}
                    aria-label="More options"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {activeDropdown === index && (
                    <div
                      ref={(el) => (dropdownRefs.current[index] = el)}
                      className="absolute right-0 mt-2 w-44 bg-white shadow-md border rounded-md z-10"
                    >
                      <ul className="text-sm text-gray-700">
                        <li className="p-2 hover:bg-gray-100 cursor-pointer">
                          <Link
                            to={`/order/detail/${order.id}`}
                            onClick={() => setActiveDropdown(null)}
                            className="block"
                          >
                            View Order
                          </Link>
                        </li>
                        <li className="p-2 hover:bg-gray-100 cursor-pointer">
                          <Link
                            to={`/order/edit/${order.id}`}
                            onClick={() => setActiveDropdown(null)}
                            className="block"
                          >
                            Edit Order
                          </Link>
                        </li>
                        <li
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleTrackOrder(order)}
                        >
                          Track Order
                        </li>
                        <li
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleOrderInvoice(order)} // ✅ Fix: Use button instead of <Link>
                        >
                          Generate Invoice
                        </li>
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Track Order Modal */}
      {showTrackModal && selectedOrder && (
        <TrackOrderStatusModal
          isOpen={showTrackModal} // ✅ Ensure modal knows when to be displayed
          onClose={() => setShowTrackModal(false)} // ✅ Properly close modal
          billId={selectedOrder.id} // ✅ Pass the correct bill ID
        />
      )}

      {/* Track Order Modal */}
      {showOrderInvoiceModal && selectedOrder && (
        <OrderInvoiceModal
          isOpen={showOrderInvoiceModal} // ✅ Ensure modal knows when to be displayed
          onClose={() => setShowOrderInvoiceModal(false)} // ✅ Properly close modal
          order={selectedOrder.id} // ✅ Pass the correct bill ID
        />
      )}
    </div>
  );
};

export default OrderListTable;
