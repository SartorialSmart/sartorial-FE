import React from "react";
import { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from "react";
import PropTypes from "prop-types";
import { 
  MoreVertical, 
  Trash, 
  X, 
  Eye, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Loader2, 
  Search, 
  AlertCircle,
  Building,
  Edit
} from "lucide-react";
import ClientService from "../../services/ClientService";
import { useClient } from "../../contexts/ClientContext";

const ClientsList = forwardRef(({ searchQuery: propSearchQuery, filterBy: propFilterBy, ...props }, ref) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useImperativeHandle(ref, () => ({
    handleExport,
    refreshClients: async () => {
      try {
        const data = await ClientService.getClients();
        const clientsData = Array.isArray(data) ? data : data?.results || [];
        setClients(clientsData);
      } catch (error) {
        console.error("Failed to refresh clients:", error);
      }
    },
  }));

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState(propSearchQuery || "");
  const [filterBy, setFilterBy] = useState(propFilterBy || "all");

  useEffect(() => {
    if (propSearchQuery !== undefined) setSearchQuery(propSearchQuery);
  }, [propSearchQuery]);

  useEffect(() => {
    if (propFilterBy !== undefined) setFilterBy(propFilterBy);
  }, [propFilterBy]);
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState("name");

  const { clients, setClients, needsRefresh, clearRefreshFlag } = useClient();

  const dropdownRefs = useRef({});

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await ClientService.getClients();
        const clientsData = Array.isArray(data) ? data : data?.results || [];
        setClients(clientsData);
        if (needsRefresh) {
          clearRefreshFlag();
        }
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        setError("Failed to load clients. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, [setClients, needsRefresh, clearRefreshFlag]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeDropdown !== null &&
        dropdownRefs.current[activeDropdown] &&
        dropdownRefs.current[activeDropdown].current &&
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

  const handleDropdownClick = async (index, clientId) => {
    const newActive = activeDropdown === index ? null : index;
    setActiveDropdown(newActive);
    
    if (newActive !== null) {
      try {
        const clientData = await ClientService.getClientById(clientId);
        setSelectedClient(clientData);
      } catch (error) {
        console.error("Failed to fetch client details:", error);
      }
    }
  };

  const handleDeleteClick = (clientId, clientName) => {
    setClientToDelete({ id: clientId, name: clientName });
    setShowDeleteModal(true);
    setActiveDropdown(null);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    setLoading(true);
    try {
      await ClientService.deleteClient(clientToDelete.id);
      setClients(clients.filter((client) => client.id !== clientToDelete.id));
      setShowDeleteModal(false);
      setClientToDelete(null);
    } catch (error) {
      console.error("Error deleting client:", error);
      setError("Failed to delete client. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setFilterBy("all");
    setDateFilter("all");
    setSelectedTags([]);
    setSortBy("name");
  };

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    let result = [...clients];

    // Apply text search
    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.toLowerCase().trim();
      result = result.filter(client => {
        const searchableFields = [
          client.first_name,
          client.last_name,
          client.email,
          client.phone_number,
          client.company_name,
          client.notes,
          ...(client.addresses?.[0] ? [
            client.addresses[0].street,
            client.addresses[0].city,
            client.addresses[0].state,
            client.addresses[0].country,
            client.addresses[0].postal_code
          ] : [])
        ].filter(Boolean).join(" ").toLowerCase();

        return searchableFields.includes(normalizedQuery);
      });
    }

    // Apply address filter
    if (filterBy !== "all") {
      result = result.filter(client => {
        const hasAddress = Array.isArray(client.addresses) && client.addresses.length > 0;
        return filterBy === "withAddress" ? hasAddress : !hasAddress;
      });
    }

    // Apply date filter based on client birthdate (created_at not available on client model)
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let startDate;

      switch (dateFilter) {
        case "today":
          startDate = today;
          break;
        case "week":
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay());
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "quarter":
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        result = result.filter(client => {
          const clientDate = client.created_at ? new Date(client.created_at) : null;
          return clientDate && clientDate >= startDate;
        });
      }
    }

    // Apply tag filtering (simulated - you'll need actual tags field)
    if (selectedTags.length > 0) {
      result = result.filter(client => {
        // This is a simulation - you'll need to check actual tags in your data
        return selectedTags.some(tag => 
          (client.first_name + client.last_name + client.company_name).toLowerCase().includes(tag.toLowerCase())
        );
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case "email":
          return (a.email || "").localeCompare(b.email || "");
        case "recent":
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case "oldest":
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [clients, searchQuery, filterBy, dateFilter, selectedTags, sortBy]);

  // Export data function
  const handleExport = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Company", "Address", "Tags"].join(","),
      ...filteredClients.map(client => [
        `"${client.first_name} ${client.last_name}"`,
        `"${client.email}"`,
        `"${client.phone_number}"`,
        `"${client.company_name || ""}"`,
        `"${client.addresses?.[0] ? `${client.addresses[0].street}, ${client.addresses[0].city}` : ""}"`,
        `"${selectedTags.join(", ")}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Loading skeleton
  const SkeletonRow = () => (
    <tr className="border-t animate-pulse">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-300 rounded w-32"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-300 rounded w-40"></div>
      </td>
      <td className="p-4">
        <div className="w-8 h-8 bg-gray-300 rounded-md"></div>
      </td>
    </tr>
  );

  return (
    <div>
        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredClients.length}</span> of{" "}
            <span className="font-semibold">{clients.length}</span> clients
          </p>
          {searchQuery && (
            <p className="text-sm text-gray-500">
              Results for: <span className="font-medium">"{searchQuery}"</span>
            </p>
          )}
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg border">
          {/* Table Header */}
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Client List</h2>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 text-left font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>Client</span>
                    </div>
                  </th>
                  <th className="p-4 text-left font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span>Email</span>
                    </div>
                  </th>
                  <th className="p-4 text-left font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span>Phone</span>
                    </div>
                  </th>
                  <th className="p-4 text-left font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>Address</span>
                    </div>
                  </th>
                  <th className="p-4 text-left font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  // Loading State
                  Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonRow key={index} />
                  ))
                ) : error ? (
                  // Error State
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <AlertCircle size={48} className="text-red-500" />
                        <p className="text-gray-700 font-medium">{error}</p>
                        <button
                          onClick={() => window.location.reload()}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredClients.length > 0 ? (
                  // Data State
                  filteredClients.map((client, index) => {
                    const hasAddress = Array.isArray(client.addresses) && client.addresses.length > 0;
                    const firstAddress = hasAddress
                      ? `${client.addresses[0].house_number || ""} ${client.addresses[0].street || ""}, ${client.addresses[0].city || ""}`
                      : null;

                    return (
                      <tr
                        key={client.id || index}
                        className="border-b hover:bg-blue-50/50 transition-all duration-200 group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {client.first_name?.[0]}{client.last_name?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 group-hover:text-blue-700">
                                {client.first_name} {client.last_name}
                              </p>
                              {client.company_name && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Building size={10} />
                                  {client.company_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-gray-400" />
                            <a
                              href={`mailto:${client.email}`}
                              className="text-gray-700 hover:text-blue-600 hover:underline truncate max-w-[200px]"
                              title={client.email}
                            >
                              {client.email}
                            </a>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            <a
                              href={`tel:${client.phone_number}`}
                              className="text-gray-700 hover:text-blue-600 hover:underline"
                            >
                              {client.phone_number}
                            </a>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className={hasAddress ? "text-green-500" : "text-gray-400"} />
                            <span className={hasAddress ? "text-gray-700" : "text-gray-400 italic"}>
                              {firstAddress || "No address"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={`/client-data/${client.id}`}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="View details"
                            >
                              <Eye size={16} />
                            </a>
                            <a
                              href={`/edit-client/${client.id}`}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                              title="Edit client"
                            >
                              <Edit size={16} />
                            </a>
                            <div className="relative">
                              <button
                                onClick={() => handleDropdownClick(index, client.id)}
                                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                title="More options"
                              >
                                <MoreVertical size={16} />
                              </button>
                              {activeDropdown === index && (
                                <div
                                  className="absolute right-0 top-full mt-1 w-48 bg-white shadow-xl border rounded-lg z-50 py-2"
                                  ref={(el) => (dropdownRefs.current[index] = { current: el })}
                                >
                                  <a
                                    href={`/client-data/${client.id}`}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                                  >
                                    <Eye size={16} />
                                    View Details
                                  </a>
                                  <a
                                    href={`/edit-client/${client.id}`}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                                  >
                                    <Edit size={16} />
                                    Edit Client
                                  </a>
                                  <button
                                    onClick={() => handleDeleteClick(client.id, `${client.first_name} ${client.last_name}`)}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 w-full text-left"
                                  >
                                    <Trash size={16} />
                                    Delete Client
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  // Empty State
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Search size={24} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">No clients found</p>
                          <p className="text-gray-500 mt-1">
                            {searchQuery || filterBy !== "all" || selectedTags.length > 0
                              ? "Try adjusting your search or filters" 
                              : "Get started by adding your first client"}
                          </p>
                        </div>
                        {(searchQuery || filterBy !== "all" || selectedTags.length > 0) && (
                          <button
                            onClick={clearFilters}
                            className="mt-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                          >
                            Clear Filters
                          </button>
                        )}
                        <a
                          href="/add-client"
                          className="mt-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
                        >
                          Add New Client
                        </a>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced Delete Modal */}
        {showDeleteModal && clientToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slideUp">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3">
                    <AlertCircle size={24} className="text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Delete Client</h2>
                  <p className="text-gray-600 mt-1">This action cannot be undone</p>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setClientToDelete(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-800 font-medium">
                  Are you sure you want to delete <span className="font-bold">{clientToDelete.name}</span>?
                </p>
                <p className="text-red-600 text-sm mt-2">
                  All associated data will be permanently removed from our servers.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setClientToDelete(null);
                  }}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash size={18} />
                      Delete Client
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
});

ClientsList.propTypes = {};

export default ClientsList;