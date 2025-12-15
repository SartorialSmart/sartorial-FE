import { useState, useEffect } from "react";
import {
  MoreVertical,
  Search,
  Plus,
  Filter,
  ChevronDown,
  Loader2,
  Edit,
  Trash2,
  Eye,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  X,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import VendorService from "../../services/VendorService";
import AddVendorFormModal from "../modals/formModals/AddVendorFormModal";
import EditVendorFormModal from "../modals/formModals/EditVendorFormModal";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";

const VendorsList = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Custom Badge Component
  const CustomBadge = ({ variant = "default", children, className = "" }) => {
    const baseClasses =
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all";
    const variantClasses = {
      default: "bg-blue-100 text-blue-700 border border-blue-200",
      outline: "bg-gray-100 text-gray-700 border border-gray-300",
      success: "bg-green-100 text-green-700 border border-green-200",
      warning: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    };

    return (
      <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
        {children}
      </span>
    );
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await VendorService.getVendorsList();
      console.log("Fetched vendors:", response);
      setVendors(response || []);
    } catch (err) {
      console.error("Failed to fetch vendors", err);
      setError(
        err.message || "Failed to load vendors. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccessNotification = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleVendorAdded = async () => {
    setIsAddModalOpen(false);
    await fetchVendors();
    showSuccessNotification("Vendor created successfully!");
  };

  const handleEditVendor = (vendor) => {
    setSelectedVendor(vendor);
    setIsEditModalOpen(true);
  };

  const handleVendorUpdated = async () => {
    setIsEditModalOpen(false);
    setSelectedVendor(null);
    await fetchVendors();
    showSuccessNotification("Vendor updated successfully!");
  };

  const handleDeleteVendor = (vendor) => {
    setSelectedVendor(vendor);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedVendor) return;

    setActionLoading("delete");
    try {
      await VendorService.deleteVendor(selectedVendor.id);
      await fetchVendors();
      setIsDeleteModalOpen(false);
      setSelectedVendor(null);
      showSuccessNotification("Vendor deleted successfully!");
    } catch (err) {
      console.error("Failed to delete vendor", err);
      setError("Failed to delete vendor. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredVendors = vendors.filter((vendor) => {
    try {
      const nameMatch = vendor.vendor_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const emailMatch = vendor.vendor_email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const phoneMatch = vendor.vendor_phone
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const typeMatch =
        selectedFilter === "All" || vendor.vendor_type === selectedFilter;

      return typeMatch && (nameMatch || emailMatch || phoneMatch);
    } catch (error) {
      console.error("Error filtering vendor:", vendor, error);
      return false;
    }
  });

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const stats = [
    {
      label: "Total Vendors",
      value: vendors.length,
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Individuals",
      value: vendors.filter((v) => v.vendor_type === "Individual").length,
      icon: User,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Companies",
      value: vendors.filter((v) => v.vendor_type === "Company").length,
      icon: Building2,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Active",
      value: vendors.filter((v) => v.is_active).length,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-green-200 p-4 flex items-center gap-3 min-w-80">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Success</h4>
              <p className="text-sm text-gray-600">{successMessage}</p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddVendorFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleVendorAdded}
      />

      <EditVendorFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedVendor(null);
        }}
        vendor={selectedVendor}
        onSuccess={handleVendorUpdated}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedVendor(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Vendor"
        message={`Are you sure you want to delete "${selectedVendor?.vendor_name}"? This action cannot be undone.`}
        isLoading={actionLoading === "delete"}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Vendors
          </h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <Building2 size={16} />
            Manage your vendors and their information
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchVendors}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={18} />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-600 text-sm font-medium mb-1">
                    {stat.label}
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                </div>
                <div className={`${stat.bg} p-3 rounded-xl`}>
                  <Icon className={`${stat.color} w-6 h-6`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Filter Dropdown */}
          <div className="relative w-full lg:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className="text-gray-400" />
            </div>
            <select
              className="appearance-none pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full font-medium transition-all"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Individual">Individual</option>
              <option value="Company">Company</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown size={18} className="text-gray-400" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search vendors by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedFilter !== "All" || searchTerm) && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 font-medium">
              Active filters:
            </span>
            {selectedFilter !== "All" && (
              <CustomBadge variant="default" className="flex items-center gap-1.5">
                Type: {selectedFilter}
                <button
                  onClick={() => setSelectedFilter("All")}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </CustomBadge>
            )}
            {searchTerm && (
              <CustomBadge variant="outline" className="flex items-center gap-1.5">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </CustomBadge>
            )}
          </div>
        )}
      </div>

      {/* Vendor Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center p-16">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-600 font-medium">Loading vendors...</p>
          </div>
        ) : error ? (
          <div className="text-center p-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Vendors
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchVendors}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredVendors.length > 0 ? (
                  filteredVendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {vendor.vendor_image_url ? (
                                <img
                                  className="h-12 w-12 rounded-full object-cover border-2 border-white"
                                  src={vendor.vendor_image_url}
                                  alt={vendor.vendor_name || "Vendor"}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.parentNode.innerHTML = vendor.vendor_name?.charAt(0) || "V";
                                  }}
                                />
                              ) : (
                                vendor.vendor_name?.charAt(0)?.toUpperCase() || "V"
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">
                              {vendor.vendor_name || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin size={12} />
                              {vendor.vendor_country || vendor.vendor_city || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm text-gray-900 flex items-center gap-1.5">
                            <Mail size={14} className="text-gray-400" />
                            {vendor.vendor_email || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1.5">
                            <Phone size={14} className="text-gray-400" />
                            {vendor.vendor_phone || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CustomBadge
                          variant={
                            vendor.vendor_type === "Company"
                              ? "default"
                              : "outline"
                          }
                        >
                          {vendor.vendor_type === "Company" ? (
                            <Building2 size={14} className="mr-1" />
                          ) : (
                            <User size={14} className="mr-1" />
                          )}
                          {vendor.vendor_type || "Individual"}
                        </CustomBadge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 font-medium">
                          {vendor.vendor_category_name || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CustomBadge
                          variant={vendor.is_active ? "success" : "outline"}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mr-1.5 ${
                              vendor.is_active ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                          {vendor.is_active ? "Active" : "Inactive"}
                        </CustomBadge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          {formatDate(vendor.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditVendor(vendor)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-all text-blue-600 hover:text-blue-700 group relative"
                            title="Edit vendor"
                          >
                            <Edit size={18} />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteVendor(vendor)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-all text-red-600 hover:text-red-700 group relative"
                            title="Delete vendor"
                          >
                            <Trash2 size={18} />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Building2 className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No vendors found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || selectedFilter !== "All"
                            ? "No vendors match your current filters."
                            : "Get started by adding your first vendor."}
                        </p>
                        {(searchTerm || selectedFilter !== "All") ? (
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setSelectedFilter("All");
                            }}
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                          >
                            Clear Filters
                          </button>
                        ) : (
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium flex items-center gap-2"
                          >
                            <Plus size={18} />
                            Add Your First Vendor
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {filteredVendors.length > 0 && (
        <div className="mt-4 bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredVendors.length}</span> of{" "}
            <span className="font-semibold text-gray-900">{vendors.length}</span> vendors
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default VendorsList;