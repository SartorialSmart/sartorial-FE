import React, { useEffect, useState, useRef } from "react";
import { MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import OrderService from "../../services/OrderService";

const columns = [
  { key: "client_full_name", label: "Client Name" },
  { key: "order_title", label: "Order Name" },
  { key: "order_price", label: "Amount (₦)" },
  { key: "ordered_at", label: "Order Date" },
  { key: "order_status", label: "Status" },
];

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);

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
  const dropdownRefs = useRef([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await OrderService.getOrders();
        setOrders(data);
        dropdownRefs.current = new Array(data.length).fill(null).map(() => React.createRef());
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeDropdown !== null &&
        dropdownRefs.current[activeDropdown] &&
        !dropdownRefs.current[activeDropdown].current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Order List</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-200 text-left text-sm sm:text-base">
              <th className="p-3 sm:p-4 w-12">
                <input type="checkbox" className="w-4 h-4" />
              </th>
              {columns.map((col) => (
                <th key={col.key} className="p-3 sm:p-4 font-medium text-gray-700">
                  {col.label}
                </th>
              ))}
              <th className="p-3 sm:p-4 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.order_id || index} className="border-t hover:bg-gray-50 transition relative">
                <td className="p-3 sm:p-4 w-12">
                  <input type="checkbox" className="w-4 h-4" />
                </td>
                {columns.map((col) => (
                  <td key={`${order.order_id}-${col.key}`} className="p-3 sm:p-4 text-sm sm:text-base text-gray-800">
                    {col.key === "order_price" ? (
                      formatAmount(order.order_price)
                    ) : col.key === "order_status" ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(order[col.key])}`}>
                        {order[col.key]}
                      </span>
                    ) : (
                      order[col.key]
                    )}
                  </td>
                ))}
                <td className="sm:p-4 w-10 text-gray-600 relative">
                  <div
                    className="border border-gray-400 rounded-md p-1 cursor-pointer hover:text-gray-800 text-gray-500 transition inline-block"
                    onClick={() => toggleDropdown(index)}
                  >
                    <MoreVertical size={18} />
                  </div>
                  {activeDropdown === index && (
                    <div
                      ref={dropdownRefs.current[index]}
                      className="absolute right-0 mt-2 w-44 bg-white shadow-md border rounded-md z-10"
                    >
                      <ul className="text-sm text-gray-700">
                        {[
                          { path: "view", label: "View Order" },
                          { path: "edit", label: "Edit Order" },
                          { path: "track", label: "Track Order" },
                          { path: "invoice", label: "Generate Invoice" },
                        ].map(({ path, label }) => (
                          <li key={`${order.order_id}-${path}`} className="p-2 hover:bg-gray-100 cursor-pointer">
                            <Link
                              to={`/orders/${order.order_id}/${path}`}
                              onClick={() => setActiveDropdown(null)}
                              className="block"
                            >
                              {label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderListTable;
