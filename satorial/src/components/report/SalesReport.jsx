import { useState, useEffect } from "react";
import { Search, Download, MoreVertical, Eye } from "lucide-react";
import ReportService from "../../services/ReportService";
import OrderService from "../../services/OrderService";

const SalesReport = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalSales, setTotalSales] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch total sales
        const salesData = await ReportService.getSalesByDuration();
        setTotalSales(
          salesData.total_sales ?? salesData.total_sales_amount ?? "-"
        );
        // Fetch orders for table
        const ordersData = await OrderService.getOrders();
        setOrders(
          Array.isArray(ordersData) ? ordersData : ordersData.orders || []
        );
      } catch {
        setError("Failed to load sales data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    {
      title: "Total Sales Amount",
      value:
        totalSales !== null ? `₦${Number(totalSales).toLocaleString()}` : "-",
      icon: <Eye />,
      bg: "bg-purple-200",
    },
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="my-6">
        <div className="flex items-start">
          <div>
            <h2 className="text-[22px] font-semibold mb-4 text-gray-900">
              Sales Report
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg shadow-md flex flex-col w-96 ${card.bg}`}
                >
                  <div className="flex items-center mb-2 text-gray-600 border border-blue-600 w-10 h-10 rounded-full justify-center">
                    {card.icon}
                  </div>
                  <p className="my-10 font-light">{card.value}</p>
                  <p className="text-gray-700">{card.title}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex space-x-2 flex-end bg-white p-1 rounded-lg">
            {[
              "All Time",
              "Today",
              "This Week",
              "This Month",
              "This Year",
              "Custom Date",
            ].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-[6px] text-sm rounded-md border transition ${
                  selectedFilter === filter
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end items-center mt-6 space-x-3">
          <div className="relative w-[300px]">
            <input
              type="text"
              placeholder="Search here..."
              className="border border-gray-300 rounded-lg px-4 py-[9px] pl-10 w-full bg-white text-sm focus:ring focus:ring-gray-200 outline-none"
            />
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          </div>
          <button className="flex items-center px-4 py-[9px] border border-gray-300 rounded-lg bg-white text-sm text-gray-700">
            <Download className="w-5 h-5 mr-2 text-gray-600" />
            Export
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#E0E4EA] text-gray-700 text-sm">
              <tr className="h-[50px]">
                <th className="px-4 text-left w-[40px]">
                  <input type="checkbox" />
                </th>
                <th className="px-4 text-left">Client Name</th>
                <th className="px-4 text-left">Order Name</th>
                <th className="px-4 text-left">Amount</th>
                <th className="px-4 text-left">Order Date</th>
                <th className="px-4 w-[50px]"></th>
              </tr>
            </thead>
            <tbody className="text-gray-900]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No sales found.
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-300 h-[50px] hover:bg-gray-50 transition"
                  >
                    <td className="px-4">
                      <input type="checkbox" />
                    </td>
                    <td className="px-4">{order.client_full_name || "-"}</td>
                    <td className="px-4">{order.order_title || "-"}</td>
                    <td className="px-4">
                      ₦{Number(order.order_price).toLocaleString()}
                    </td>
                    <td className="px-4">
                      {order.ordered_at ? order.ordered_at.slice(0, 10) : "-"}
                    </td>
                    <td className="px-4">
                      <button>
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SalesReport;
