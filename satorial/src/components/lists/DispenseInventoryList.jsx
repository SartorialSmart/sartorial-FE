import { useState, useEffect } from "react";
import { MoreVertical, Search, Plus, Download } from "lucide-react";
import InventoryService from "../../services/InventoryService";
import AddDispenseInventoryFormModal from "../modals/formModals/AddDispenseInventoryFormModal";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState as useReactState } from "react";
import StaffService from "../../services/staffServices/StaffService";

const DispenseInventoryList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dispensedItems, setDispensedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModal, setEditModal] = useReactState({ open: false, item: null });
  const [staffMap, setStaffMap] = useState({});
  const [itemMap, setItemMap] = useState({});

  const fetchDispensed = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await InventoryService.listDispenseInventory();
      setDispensedItems(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load dispensed inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispensed();
    // Fetch all staff and inventory items for mapping
    const fetchStaffAndItems = async () => {
      try {
        const staffData = await StaffService.listStaff();
        const staffArr = Array.isArray(staffData.results)
          ? staffData.results
          : staffData;
        const staffObj = {};
        staffArr.forEach((s) => {
          const name =
            s.first_name && s.last_name
              ? `${s.first_name} ${s.last_name}`
              : s.email || s.username || s.name;
          staffObj[s.id] = name;
        });
        setStaffMap(staffObj);
      } catch {
        setStaffMap({});
      }
      try {
        const itemData = await InventoryService.listInventory();
        const itemArr = Array.isArray(itemData) ? itemData : [];
        const itemObj = {};
        itemArr.forEach((i) => {
          itemObj[i.id] = i.item_name || i.name || i.title || i.id;
        });
        setItemMap(itemObj);
      } catch {
        setItemMap({});
      }
    };
    fetchStaffAndItems();
  }, []);

  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Optionally filter by searchTerm here
  const filteredItems = dispensedItems.filter((item) => {
    if (!searchTerm) return true;
    return (
      (item.item_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.dispense_to || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Dispense Inventory</h2>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            Dispense Item
          </button>
          <button className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-end mb-4">
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* Dispensed Inventory Table */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
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
                  "Dispensed to",
                  "Quantity Dispensed",
                  "Reason",
                ].map((header, idx) => (
                  <th key={idx} className="p-3 font-medium">
                    {header}
                  </th>
                ))}
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item.id || index} className="border-t">
                  <td className="p-3">
                    <input type="checkbox" />
                  </td>
                  <td className="p-3">
                    {formatDate(
                      item.dispensed_at || item.date || item.created_at
                    )}
                  </td>
                  <td className="p-3">
                    {itemMap[item.item_name] || item.item_name || "-"}
                  </td>
                  <td className="p-3">
                    {staffMap[item.dispense_to] || item.dispense_to || "-"}
                  </td>
                  <td className="p-3">
                    {item.quantity_dispensed || item.quantity || "-"}
                  </td>
                  <td className="p-3">{item.reason || "-"}</td>
                  <td className="p-3">
                    <Menu as="div" className="relative inline-block text-left">
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
              ))}
            </tbody>
          </table>
        )}
      </div>
      <AddDispenseInventoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDispensed}
      />
      <AddDispenseInventoryFormModal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, item: null })}
        onSuccess={() => {
          setEditModal({ open: false, item: null });
          fetchDispensed();
        }}
        initialValues={editModal.item}
        title="Edit Dispense Inventory"
      />
    </div>
  );
};

export default DispenseInventoryList;
