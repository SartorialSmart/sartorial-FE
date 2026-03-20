import { useState, useEffect } from "react";
import { MoreVertical, Search, Download, Plus } from "lucide-react";
import InventoryService from "../../services/InventoryService";
import AddInventoryFormModal from "../modals/formModals/AddInventoryFormModal";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

const InventoryList = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, item: null });
  const [categoryMap, setCategoryMap] = useState({});

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await InventoryService.listInventory();
      setInventoryItems(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    // Fetch all categories for mapping
    const fetchCategories = async () => {
      try {
        const data = await InventoryService.listInventoryCategory();
        const arr = Array.isArray(data) ? data : [];
        const obj = {};
        arr.forEach((cat) => {
          obj[cat.id] = cat.name || cat.category || cat.id;
        });
        setCategoryMap(obj);
      } catch {
        setCategoryMap({});
      }
    };
    fetchCategories();
  }, []);

  // Filter and search inventory items
  const filteredItems = inventoryItems.filter((item) => {
    // Filter by category
    let categoryMatch = true;
    if (selectedFilter !== "All") {
      categoryMatch =
        (item.category || "").toLowerCase() === selectedFilter.toLowerCase();
    }

    // Filter by search term
    let searchMatch = true;
    if (searchTerm.trim()) {
      const normalizedSearch = searchTerm.toLowerCase().trim();
      const itemName = (item.item_name || item.itemName || "").toLowerCase();
      const categoryName = (
        categoryMap[item.category] ||
        item.category ||
        ""
      ).toLowerCase();
      const quantity = (item.quantity || "").toString().toLowerCase();
      const date = formatDate(item.date || item.created_at).toLowerCase();

      searchMatch =
        itemName.includes(normalizedSearch) ||
        categoryName.includes(normalizedSearch) ||
        quantity.includes(normalizedSearch) ||
        date.includes(normalizedSearch);
    }

    return categoryMatch && searchMatch;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddInventoryFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchInventory}
      />
      {/* Edit Inventory Modal */}
      <AddInventoryFormModal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, item: null })}
        onSuccess={() => {
          setEditModal({ open: false, item: null });
          fetchInventory();
        }}
        initialValues={editModal.item}
        title="Edit Inventory"
      />
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Inventory</h2>
        <div className="flex items-center gap-3">
          {/* Add Inventory Button */}
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-all"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} />
            Add Inventory
          </button>

          {/* Export Button */}
          <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition-all">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between mb-4">
        {/* Dropdown Filter */}
        <select
          className="border rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Fabric">Fabric</option>
          <option value="Accessories">Accessories</option>
        </select>

        {/* Search Input */}
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search inventory items..."
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {(searchTerm.trim() || selectedFilter !== "All") && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredItems.length} of {inventoryItems.length} items
          {searchTerm.trim() && ` matching "${searchTerm}"`}
          {selectedFilter !== "All" && ` in ${selectedFilter} category`}
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4"></div>
            Loading inventory...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr className="text-left text-gray-600">
                <th className="p-3">
                  <input type="checkbox" />
                </th>
                {[
                  "Date",
                  "Item Name",
                  "Inventory Category",
                  "Qty In Stock",
                  "Actions",
                ].map((header, idx) => (
                  <th key={idx} className="p-3 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-3">
                      <input type="checkbox" />
                    </td>
                    <td className="p-3">
                      {formatDate(item.date || item.created_at)}
                    </td>
                    <td className="p-3">
                      {item.item_name || item.itemName || "-"}
                    </td>
                    <td className="p-3">
                      {categoryMap[item.category] || item.category || "-"}
                    </td>
                    <td className="p-3">
                      <span className="font-medium">{item.quantity ?? "-"}</span>
                      {item.is_low_stock && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          Low Stock
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <Menu.Button className="p-2 rounded-full hover:bg-gray-200">
                          <MoreVertical size={18} />
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-10">
                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    className={`${
                                      active ? "bg-gray-100" : ""
                                    } w-full text-left px-4 py-2 text-sm text-gray-700`}
                                    onClick={() =>
                                      setEditModal({ open: true, item })
                                    }
                                  >
                                    Edit
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    className={`${
                                      active ? "bg-gray-100" : ""
                                    } w-full text-left px-4 py-2 text-sm text-red-600`}
                                    onClick={() =>
                                      alert("Delete action coming soon")
                                    }
                                  >
                                    Delete
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    {searchTerm.trim() || selectedFilter !== "All"
                      ? "No inventory items match your search criteria"
                      : "No inventory items found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InventoryList;
