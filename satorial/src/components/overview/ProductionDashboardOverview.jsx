import { useState, useEffect, useMemo } from "react";
import {
  Factory,
  CheckCircle,
  Hourglass,
  ClipboardCheck,
  XCircle,
  Package,
  TrendingUp,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import ProductionService from "../../services/ProductionService";
import { getProductionProgress } from "../../constants/productionConstants";

const ProductionDashboardOverview = ({ dateFilter, customDateRange, location }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const params = {};
        if (location) params.location = location;
        if (dateFilter && dateFilter !== "All Time") {
          if (customDateRange?.start) params.start_date = customDateRange.start;
          if (customDateRange?.end) params.end_date = customDateRange.end;
          if (!customDateRange?.start) params.period = dateFilter;
        }
        const data = await ProductionService.listOrders(params);
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];
        setOrders(list);
      } catch (err) {
        console.error("Error fetching production dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [dateFilter, customDateRange, location]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "Pending").length;
    const inProgress = orders.filter((o) => o.status === "In Progress").length;
    const qa = orders.filter((o) => o.status === "QA Check").length;
    const completed = orders.filter((o) => o.status === "Completed").length;
    const cancelled = orders.filter((o) => o.status === "Cancelled").length;
    const totalUnits = orders.reduce(
      (sum, o) => sum + (Number(o.total_quantity) || 0),
      0
    );
    const completedUnits = orders.reduce(
      (sum, o) =>
        sum +
        (o.completed_quantity != null
          ? Number(o.completed_quantity)
          : o.status === "Completed"
          ? Number(o.total_quantity) || 0
          : 0),
      0
    );
    const activeAssignments = orders.reduce(
      (sum, o) =>
        sum +
        (Array.isArray(o.assignments)
          ? o.assignments.filter((a) => a.status !== "Completed").length
          : 0),
      0
    );
    return {
      total,
      pending,
      inProgress,
      qa,
      completed,
      cancelled,
      totalUnits,
      completedUnits,
      activeAssignments,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      unitCompletionRate:
        totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0,
    };
  }, [orders]);

  const cards = [
    {
      icon: <Factory size={20} />,
      value: stats.total,
      label: "Total Orders",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderColor: "border-green-200",
    },
    {
      icon: <Hourglass size={20} />,
      value: stats.pending,
      label: "Pending",
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      borderColor: "border-amber-200",
    },
    {
      icon: <Package size={20} />,
      value: stats.inProgress,
      label: "In Progress",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
    },
    {
      icon: <ClipboardCheck size={20} />,
      value: stats.qa,
      label: "QA Check",
      color: "from-cyan-500 to-teal-600",
      bgColor: "bg-gradient-to-br from-cyan-50 to-teal-50",
      borderColor: "border-cyan-200",
    },
    {
      icon: <CheckCircle size={20} />,
      value: stats.completed,
      label: "Completed",
      color: "from-purple-500 to-fuchsia-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-fuchsia-50",
      borderColor: "border-purple-200",
    },
    {
      icon: <XCircle size={20} />,
      value: stats.cancelled,
      label: "Cancelled",
      color: "from-red-500 to-rose-600",
      bgColor: "bg-gradient-to-br from-red-50 to-rose-50",
      borderColor: "border-red-200",
    },
  ];

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.order_created_at || 0) - new Date(a.order_created_at || 0)
        )
        .slice(0, 6),
    [orders]
  );

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
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Failed to load dashboard
          </h3>
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
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Units Completed</p>
              <p className="text-2xl font-bold mt-1">
                {stats.completedUnits.toLocaleString()}
                <span className="text-base font-medium text-blue-200">
                  {" "}
                  / {stats.totalUnits.toLocaleString()}
                </span>
              </p>
            </div>
            <Package size={24} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">Order Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats.completionRate}%
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">Unit Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats.unitCompletionRate}%
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm flex items-center gap-1">
            <UserCheck size={14} /> Active Assignments
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats.activeAssignments}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl border-2 ${card.bgColor} ${card.borderColor} shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${card.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {card.icon}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-600 mt-1">{card.label}</p>
              </div>
            </div>
            {card.label === "Completed" && stats.total > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{stats.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={20} />
            Recent Production Orders
          </h3>
          <Link
            to="/production/orders-list"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <Factory className="w-12 h-12 mx-auto mb-3" />
            <p className="font-medium text-gray-500">No production orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => {
              const progress = getProductionProgress(order);
              const staffCount = Array.isArray(order.assignments)
                ? order.assignments.length
                : 0;
              return (
                <Link
                  key={order.id}
                  to={`/production/detail/${order.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white shrink-0">
                    <Factory size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {order.title || `Production #${order.id}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {staffCount > 0
                        ? `${staffCount} staff • ${order.category_name || "General"}`
                        : order.category_name || "General"}
                    </p>
                  </div>
                  <div className="w-28 shrink-0">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      order.status === "Pending"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : order.status === "In Progress"
                        ? "bg-blue-50 text-blue-800 border-blue-200"
                        : order.status === "QA Check"
                        ? "bg-cyan-50 text-cyan-800 border-cyan-200"
                        : order.status === "Completed"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}
                  >
                    {order.status || "Pending"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

ProductionDashboardOverview.propTypes = {
  dateFilter: PropTypes.string,
  customDateRange: PropTypes.shape({
    start: PropTypes.string,
    end: PropTypes.string,
  }),
  location: PropTypes.string,
};

export default ProductionDashboardOverview;
