import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Search, Filter, ExternalLink } from "lucide-react";
import OrderService from "../../../services/OrderService";
import PropTypes from "prop-types";
import { isReadyMadeOrder } from "../../../../utils/orderUtils";

export default function ClientOrderHistory({ clientId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    setError("");
    OrderService.getClientOrdersHistory(clientId)
      .then((data) => {
        const orderList = Array.isArray(data) ? data : data.results || [];
        setOrders(orderList);
      })
      .catch(() => setError("Failed to load order history."))
      .finally(() => setLoading(false));
  }, [clientId]);

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₦0.00";
    return `₦${Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "delivered") return "bg-green-100 text-green-800";
    if (s === "in_progress" || s === "in progress") return "bg-blue-100 text-blue-800";
    if (s === "pending") return "bg-amber-100 text-amber-800";
    if (s === "on delivery") return "bg-purple-100 text-purple-800";
    if (s === "cancelled") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-700";
  };

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      (order.order_title || "").toLowerCase().includes(term) ||
      (order.order_status || "").toLowerCase().includes(term) ||
      (order.order_type || "").toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading order history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <ShoppingBag size={20} className="mr-2" />
            Order History
            {orders.length > 0 && (
              <span className="ml-3 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </span>
            )}
          </h2>
        </div>

        {/* Search and Filter Bar */}
        {orders.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by title or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center font-medium">
                <Filter size={18} className="mr-2" />
                Filter
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium mb-1">
                        {searchTerm
                          ? "No matching orders found"
                          : "No orders yet"}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Orders will appear here once created"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                          <ShoppingBag size={14} className="text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-gray-900 font-medium block truncate">
                            {order.order_title || "—"}
                          </span>
                          {isReadyMadeOrder(order) && (
                            <span className="text-xs text-teal-600 font-medium">
                              Ready Made
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}
                      >
                        {order.order_status || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {formatCurrency(order.order_price)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {formatDate(order.start_date)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {formatDate(order.end_date)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/order/detail/${order.id}`)}
                        className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                      >
                        <ExternalLink size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

ClientOrderHistory.propTypes = {
  clientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
