import { useEffect, useState, useRef } from "react";
import { MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import OrderService from "../../services/OrderService";
import TrackOrderStatusModal from "../modals/formModals/TrackOrderStatusModal";
import OrderInvoiceModal from "../modals/formModals/OrderInvoiceModal";
import AssignOrderModal from "../allocationModals/AssignOrderModal";

const columns = [
  { key: "client_full_name", label: "Client Name" },
  { key: "order_title", label: "Order Name" },
  { key: "order_price", label: "Amount (₦)" },
  { key: "ordered_at", label: "Order Date" },
  { key: "order_status", label: "Status" },
  { key: "assignment_status", label: "Staff Assignment" },
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
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [modalMode, setModalMode] = useState("assign");
  const dropdownRefs = useRef([]);
  const buttonRefs = useRef([]);

  // Fetch orders from the API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await OrderService.getOrders();
        setOrders(data);
        dropdownRefs.current = new Array(data.length).fill(null);
        buttonRefs.current = new Array(data.length).fill(null);
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
        !dropdownRefs.current[activeDropdown].contains(event.target) &&
        buttonRefs.current[activeDropdown] &&
        !buttonRefs.current[activeDropdown].contains(event.target)
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

  // Handle assign order click
  const handleAssignClick = (order) => {
    setSelectedOrder(order);
    setModalMode("assign");
    setShowAssignModal(true);
  };

  // Handle assign order submission
  const handleAssign = async (payload) => {
    try {
      await OrderService.assignOrder(payload);
      // Refresh orders after assignment
      const data = await OrderService.getOrders();
      setOrders(data);
      setShowAssignModal(false);
    } catch (error) {
      console.error("Failed to assign order:", error);
    }
  };

  // Check if order is assigned
  const isOrderAssigned = (order) => {
    return order.order_status === "Assigned";
  };

  // Get dropdown position based on button position
  const getDropdownPosition = (index) => {
    if (!buttonRefs.current[index]) return {};

    const button = buttonRefs.current[index];
    const rect = button.getBoundingClientRect();

    return {
      position: "fixed",
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
      zIndex: 1000,
    };
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
                    ) : col.key === "assignment_status" ? (
                      <div className="flex items-center justify-between">
                        {isOrderAssigned(order) ? (
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-xs text-gray-600">
                              Staff Assigned
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            <span className="text-xs text-gray-600">
                              No Staff Assigned
                            </span>
                          </div>
                        )}
                        {!isOrderAssigned(order) && (
                          <button
                            onClick={() => handleAssignClick(order)}
                            className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    ) : (
                      order[col.key]
                    )}
                  </td>
                ))}
                <td className="sm:p-4 w-10 text-gray-600 relative">
                  <button
                    ref={(el) => (buttonRefs.current[index] = el)}
                    className="border border-gray-400 rounded-md p-1 cursor-pointer hover:text-gray-800 text-gray-500 transition inline-block"
                    onClick={() => toggleDropdown(index)}
                    aria-label="More options"
                  >
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dropdown positioned outside table container */}
      {activeDropdown !== null && (
        <div
          ref={(el) => (dropdownRefs.current[activeDropdown] = el)}
          className="w-44 bg-white shadow-lg border rounded-md"
          style={getDropdownPosition(activeDropdown)}
        >
          <ul className="text-sm text-gray-700">
            <li className="p-2 hover:bg-gray-100 cursor-pointer">
              <Link
                to={`/order/detail/${orders[activeDropdown]?.id}`}
                onClick={() => setActiveDropdown(null)}
                className="block"
              >
                View Order
              </Link>
            </li>
            <li className="p-2 hover:bg-gray-100 cursor-pointer">
              <Link
                to={`/order/edit/${orders[activeDropdown]?.id}`}
                onClick={() => setActiveDropdown(null)}
                className="block"
              >
                Edit Order
              </Link>
            </li>
            <li
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleTrackOrder(orders[activeDropdown])}
            >
              Track Order
            </li>
            <li
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleOrderInvoice(orders[activeDropdown])}
            >
              Generate Invoice
            </li>
          </ul>
        </div>
      )}

      {/* Track Order Modal */}
      {showTrackModal && selectedOrder && (
        <TrackOrderStatusModal
          isOpen={showTrackModal}
          onClose={() => setShowTrackModal(false)}
          billId={selectedOrder.id}
        />
      )}

      {/* Order Invoice Modal */}
      {showOrderInvoiceModal && selectedOrder && (
        <OrderInvoiceModal
          isOpen={showOrderInvoiceModal}
          onClose={() => setShowOrderInvoiceModal(false)}
          order={selectedOrder.id}
        />
      )}

      {/* Assign Order Modal */}
      {showAssignModal && selectedOrder && (
        <AssignOrderModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          order={selectedOrder}
          mode={modalMode}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
};

export default OrderListTable;
