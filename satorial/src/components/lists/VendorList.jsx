import { useState, useEffect } from "react";
import { MoreVertical, Search, Plus, Filter, ChevronDown, Loader2 } from "lucide-react";
import VendorService from "../../services/VendorService";
import AddVendorFormModal from "../modals/formModals/AddVendorFormModal";

const VendorsList = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Custom Badge Component
  const CustomBadge = ({ variant = 'default', children }) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    const variantClasses = variant === 'default' 
      ? "bg-blue-100 text-blue-800" 
      : "bg-gray-100 text-gray-800 border border-gray-300";
    
    return (
      <span className={`${baseClasses} ${variantClasses}`}>
        {children}
      </span>
    );
  };

  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const dummyData = Array(8).fill({
          vendor_type: "Individual",
          vendor_name: "Lara Adams",
          vendor_email: "lara@example.com",
          vendor_phone: "+2348012345678",
          vendor_country: "Nigeria",
          vendor_category: { name: "Fabric Supplier" },
          vendor_image_url: "https://via.placeholder.com/40",
          is_active: true,
          created_at: "2023-05-15T10:30:00Z"
        }).map((item, index) => ({
          ...item,
          id: index + 1,
          vendor_name: `${item.vendor_name} ${index + 1}`,
          vendor_email: `vendor${index + 1}@example.com`,
          vendor_type: index % 3 === 0 ? "Company" : "Individual",
          is_active: index % 4 !== 0
        }));
        
        setVendors(dummyData);
        // const data = await VendorService.getVendorsList();
        // setVendors(data);
      } catch (err) {
        console.error("Failed to fetch vendors", err);
        setError("Failed to load vendors. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter((vendor) =>
    (selectedFilter === "All" || vendor.vendor_type === selectedFilter) &&
    vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Modal */}
      <AddVendorFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // You would typically refresh the vendors list here
          console.log("New vendor added, refresh list");
        }}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vendors</h1>
          <p className="text-gray-500 text-md">
            Manage your vendors and their information
          </p>
        </div>
        
        {/* Add Vendor Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-md transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Vendor
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Filter Dropdown */}
          <div className="relative w-full md:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={16} className="text-gray-400" />
            </div>
            <select
              className="appearance-none pl-10 pr-8 py-2 border rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 w-full"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Individual">Individual</option>
              <option value="Company">Company</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by vendor name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-gray-500 text-md">Total Vendors</div>
          <div className="text-2xl font-bold text-gray-800">{vendors.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-gray-500 text-md">Individuals</div>
          <div className="text-2xl font-bold text-gray-800">
            {vendors.filter(v => v.vendor_type === "Individual").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-gray-500 text-md">Companies</div>
          <div className="text-2xl font-bold text-gray-800">
            {vendors.filter(v => v.vendor_type === "Company").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-gray-500 text-md">Active Vendors</div>
          <div className="text-2xl font-bold text-gray-800">
            {vendors.filter(v => v.is_active).length}
          </div>
        </div>
      </div>

      {/* Vendor Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-500">
            {error}
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-blue-600 hover:text-blue-800 text-md font-medium"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVendors.length > 0 ? (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={vendor.vendor_image_url || "https://via.placeholder.com/40"}
                              alt={vendor.vendor_name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-md font-medium text-gray-900">
                              {vendor.vendor_name}
                            </div>
                            <div className="text-md text-gray-500">
                              {vendor.vendor_country}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-md text-gray-900">{vendor.vendor_email}</div>
                        <div className="text-md text-gray-500">{vendor.vendor_phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CustomBadge variant={vendor.vendor_type === "Company" ? "default" : "outline"}>
                          {vendor.vendor_type}
                        </CustomBadge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                        {vendor.vendor_category?.name || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          vendor.is_active 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {vendor.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                        {formatDate(vendor.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-md font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Edit
                        </button>
                        <button className="text-gray-500 hover:text-gray-700">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-md text-gray-500">
                      No vendors found matching your criteria.
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm("")}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          Clear search
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination would go here */}
      {filteredVendors.length > 0 && (
        <div className="mt-4 flex justify-between items-center bg-white px-4 py-3 rounded-b-lg shadow-sm">
          <div className="text-md text-gray-500">
            Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
            <span className="font-medium">{filteredVendors.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border rounded-md text-md font-medium text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 border rounded-md text-md font-medium text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsList;