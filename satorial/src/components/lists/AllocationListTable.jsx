import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import AssignOrderModal from "../allocationModals/AssignOrderModal";
import OrderService from "../../services/OrderService";
import DEFAULT_AVATAR from "../../assets/images/default_avatar.svg";
import { useAuth } from "../../contexts/AuthContext";
import {
  Search,
  Filter,
  MoreVertical,
  Calendar,
  User,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

const columns = [
  { key: "order_details", label: "Order Details" },
  { key: "status", label: "Status" },
  { key: "timeline", label: "Timeline" },
  { key: "assigned_to", label: "Assigned to" },
  { key: "actions", label: "Actions" },
];

// Status badge component
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const config = {
      'Pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      'Assigned': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: User },
      'In Progress': { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Loader2 },
      'On Delivery': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
      'Completed': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      'Cancelled': { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    };
    return config[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle };
  };

  const { color, icon: Icon } = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${color}`}>
      <Icon size={14} />
      {status}
    </span>
  );
};

// Timeline component
const TimelineInfo = ({ startDate, endDate }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Calendar size={14} className="text-gray-400" />
      <span className="text-gray-600">
        {formatDate(startDate)} - {formatDate(endDate)}
      </span>
    </div>
  );
};

const AllocationListTable = ({ searchTerm }) => {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("reassign");
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (searchTerm !== undefined) setSearch(searchTerm);
  }, [searchTerm]);

  const effectiveSearch = search;

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const data = await OrderService.getAllocations();
      setAllocations(Array.isArray(data.results) ? data.results : data);
    } catch {
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
    // eslint-disable-next-line
  }, [user]);

  const handleReassignClick = (allocation) => {
    setSelectedAllocation(allocation);
    setModalMode("reassign");
    setModalOpen(true);
  };

  const handleAssign = async (payload) => {
    await OrderService.assignOrder(payload);
    await fetchAllocations();
  };

  // Get unique statuses for filter
  const statusOptions = [
    "all",
    ...new Set(allocations.map(a => a.order?.status).filter(Boolean))
  ];

  // Filtering logic
  const filteredAllocations = allocations.filter((allocation) => {
    const searchText = (effectiveSearch || "").toLowerCase();
    const statusMatch = statusFilter === "all" || allocation.order?.status === statusFilter;

    if (!statusMatch) return false;

    if (searchText) {
      return (
        allocation.order?.title?.toLowerCase().includes(searchText) ||
        allocation.order?.description?.toLowerCase().includes(searchText) ||
        allocation.staff?.name?.toLowerCase().includes(searchText) ||
        allocation.order?.status?.toLowerCase().includes(searchText)
      );
    }

    return true;
  });

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Allocations</h1>
            <p className="text-gray-600">
              Manage and track order assignments across your team
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">{allocations.length}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-blue-600">
                {allocations.filter(a => a.order?.status === 'In Progress').length}
              </div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-green-600">
                {allocations.filter(a => a.order?.status === 'Completed').length}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-orange-600">
                {allocations.filter(a => a.order?.status === 'Assigned').length}
              </div>
              <div className="text-sm text-gray-500">Assigned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search orders, staff, or status..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
                value={effectiveSearch}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 appearance-none w-full lg:w-40"
              >
                <option value="all">All Status</option>
                {statusOptions.filter(s => s !== "all").map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left">
                <th className="p-6 w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                  />
                </th>
                {columns.map((col, index) => (
                  <th 
                    key={index} 
                    className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <p className="text-gray-500">Loading allocations...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAllocations.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <AlertCircle size={48} />
                      <p className="text-lg">No allocations found</p>
                      <p className="text-sm">
                        {effectiveSearch || statusFilter !== "all" 
                          ? "Try adjusting your search or filters" 
                          : "No orders have been allocated yet"
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAllocations.map((allocation, rowIndex) => (
                  <tr 
                    key={allocation.allocation_id || rowIndex}
                    className="hover:bg-gray-50/50 transition-colors duration-150 group"
                  >
                    <td className="p-6 w-12">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 group-hover:border-gray-400" 
                      />
                    </td>
                    
                    {/* Order Details */}
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={DEFAULT_AVATAR}
                            alt={allocation.order?.title}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {allocation.order?.title || "Untitled Order"}
                          </h3>
                          <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                            {allocation.order?.description || "No description"}
                          </p>
                          {allocation.order?.category && (
                            <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                              {allocation.order.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-6">
                      <StatusBadge status={allocation.order?.status || "Pending"} />
                    </td>

                    {/* Timeline */}
                    <td className="p-6">
                      {allocation.order?.start_date && allocation.order?.end_date ? (
                        <TimelineInfo 
                          startDate={allocation.order.start_date} 
                          endDate={allocation.order.end_date} 
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">No dates set</span>
                      )}
                    </td>

                    {/* Assigned To */}
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={allocation.staff?.avatar || DEFAULT_AVATAR}
                          alt={allocation.staff?.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {allocation.staff?.name || "Unassigned"}
                          </p>
                          {allocation.staff?.email && (
                            <p className="text-gray-500 text-sm truncate">
                              {allocation.staff.email}
                            </p>
                          )}
                          {allocation.staff?.role && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                              {allocation.staff.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleReassignClick(allocation)}
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-150 text-sm font-medium"
                        >
                          Reassign
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Optional) */}
        {filteredAllocations.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{filteredAllocations.length}</span> results
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Previous
                </button>
                <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AssignOrderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        order={selectedAllocation?.order}
        mode={modalMode}
        onSuccess={() => {
          setModalOpen(false);
          fetchAllocations();
        }}
        onAssign={handleAssign}
      />
    </div>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

TimelineInfo.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
};

AllocationListTable.propTypes = {
  searchTerm: PropTypes.string,
};

export default AllocationListTable;