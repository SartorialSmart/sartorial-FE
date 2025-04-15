import { useState, useEffect } from "react";
import { MoreVertical, Search, Plus } from "lucide-react";
import VendorService from "../../services/VendorService";
import AddVendorFormModal from "../modals/formModals/AddVendorFormModal";

const VendorsList = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const dummyData = Array(8).fill({
          vendor_type: "Individual",
          vendor_name: "Lara Adams",
          vendor_email: "lara@example.com",
          vendor_phone: "+2348012345678",
          vendor_country: "Nigeria",
          vendor_category: { name: "Fabric Supplier" },
          vendor_image_url: "https://via.placeholder.com/40",
        });
        setVendors(dummyData);
        // const data = await VendorService.getVendorsList();
        // setVendors(data);
      } catch (err) {
        console.error("Failed to fetch vendors", err);
      }
    };

    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter((vendor) =>
    (selectedFilter === "All" || vendor.vendor_type === selectedFilter) &&
    vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
      {/* Modal */}
      <AddVendorFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        {/* Filter Dropdown */}
        <select
          className="border rounded-md px-3 py-2 text-gray-700 bg-white"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Individual">Individual</option>
          <option value="Company">Company</option>
        </select>

        {/* Search Bar */}
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search vendor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Add Vendor Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
        >
          <Plus size={16} />
          Add Vendor
        </button>
      </div>

      {/* Vendor Table */}
      <div className="bg-white rounded-lg shadow overflow-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-600 text-left">
            <tr>
              <th className="p-3">
                <input type="checkbox" />
              </th>
              {[
                "Image",
                "Name",
                "Email",
                "Phone",
                "Type",
                "Category",
                "Country",
                "Actions",
              ].map((header, idx) => (
                <th key={idx} className="p-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredVendors.map((vendor, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <input type="checkbox" />
                </td>
                <td className="p-3">
                  <img
                    src={vendor.vendor_image_url || "https://via.placeholder.com/40"}
                    alt="Vendor"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </td>
                <td className="p-3 font-medium">{vendor.vendor_name}</td>
                <td className="p-3">{vendor.vendor_email}</td>
                <td className="p-3">{vendor.vendor_phone}</td>
                <td className="p-3">{vendor.vendor_type}</td>
                <td className="p-3">{vendor.vendor_category?.name || "—"}</td>
                <td className="p-3">{vendor.vendor_country}</td>
                <td className="p-3">
                  <button className="p-2 rounded-full hover:bg-gray-200">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredVendors.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center p-6 text-gray-500">
                  No vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorsList;
