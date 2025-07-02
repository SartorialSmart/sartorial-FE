import { useEffect, useState } from "react";
import OrderService from "../../../services/OrderService";
import PropTypes from "prop-types";

export default function ClientOrderHistory({ clientId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    setError("");
    OrderService.getClientOrdersHistory(clientId)
      .then((data) => {
        // If the backend returns an array directly, use it. If it's paginated, use data.results
        const orderList = Array.isArray(data) ? data : data.results || [];
        // Map backend fields to the required fields for display
        setOrders(
          orderList.map((order) => ({
            email: order.email || order.client_email || "-",
            phone:
              order.phone || order.client_phone || order.phone_number || "-",
            role: order.role || order.client_role || "-",
            date: order.date || order.created_at || order.order_date || "-",
          }))
        );
      })
      .catch(() => setError("Failed to load order history."))
      .finally(() => setLoading(false));
  }, [clientId]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Order History</h2>
      {loading ? (
        <div className="p-4 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="p-4 text-red-500">{error}</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4">
                  <input type="checkbox" />
                </th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Phone Number</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Employment Date</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-4">
                      <input type="checkbox" />
                    </td>
                    <td className="p-4">{order.email}</td>
                    <td className="p-4">{order.phone}</td>
                    <td className="p-4">{order.role}</td>
                    <td className="p-4">{order.date}</td>
                    <td className="p-4">
                      <button className="p-2 bg-gray-200 rounded">
                        <span>&#8942;</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

ClientOrderHistory.propTypes = {
  clientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
