import { useEffect, useState } from "react";
import AssignOrderModal from "../allocationModals/AssignOrderModal";
import OrderService from "../../services/OrderService";
import DEFAULT_AVATAR from "../../assets/images/default_avatar.svg";
import { useAuth } from "../../contexts/AuthContext";

const columns = [
  { key: "order_details", label: "Order Details" },
  { key: "assigned_to", label: "Assigned to" },
  { key: "actions", label: "Actions" },
];

const AllocationListTable = ({ searchTerm }) => {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("reassign");
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [search, setSearch] = useState("");
  const effectiveSearch = typeof searchTerm === "string" ? searchTerm : search;

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

  // Filtering logic (search only)
  const filteredAllocations = allocations.filter((allocation) => {
    const searchText = (effectiveSearch || "").toLowerCase();
    if (
      searchText &&
      !(
        allocation.order?.title?.toLowerCase().includes(searchText) ||
        allocation.order?.description?.toLowerCase().includes(searchText) ||
        allocation.staff?.name?.toLowerCase().includes(searchText)
      )
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 bg-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <h2 className="text-2xl font-semibold">Allocations</h2>
        {typeof searchTerm !== "string" && (
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search here..."
                className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="8" cy="8" r="7" />
                  <path d="M15 15l-3.5-3.5" />
                </svg>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        <table className="w-full border-collapse min-w-[700px]">
          <thead className="bg-gray-100">
            <tr className="text-left text-sm">
              <th className="p-3 w-12">
                <input type="checkbox" className="w-4 h-4" />
              </th>
              {columns.map((col, index) => (
                <th key={index} className="p-3 font-medium text-gray-600">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : filteredAllocations.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="p-6 text-center text-gray-400"
                >
                  No allocations found.
                </td>
              </tr>
            ) : (
              filteredAllocations.map((allocation, rowIndex) => (
                <tr
                  key={allocation.allocation_id || rowIndex}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3 w-12">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td className="p-3 flex items-center space-x-3">
                    <img
                      src={DEFAULT_AVATAR}
                      alt={allocation.order?.title}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium">{allocation.order?.title}</p>
                      <p className="text-gray-500 text-sm">
                        {allocation.order?.description}
                      </p>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={allocation.staff?.avatar || DEFAULT_AVATAR}
                        alt={allocation.staff?.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-medium">{allocation.staff?.name}</p>
                        {allocation.staff?.email && (
                          <p className="text-gray-500 text-sm">
                            {allocation.staff.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td
                    className="p-3 text-blue-600 cursor-pointer hover:underline"
                    onClick={() => handleReassignClick(allocation)}
                  >
                    Reassign
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AssignOrderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        order={selectedAllocation?.order}
        mode={modalMode}
        onSuccess={() => setModalOpen(false)}
        onAssign={handleAssign}
      />
    </div>
  );
};

export default AllocationListTable;
