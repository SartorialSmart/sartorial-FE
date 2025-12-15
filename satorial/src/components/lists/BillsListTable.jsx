import { useState, useEffect, useRef, useMemo } from "react";
import { MoreVertical } from "lucide-react";
import BillsService from "../../services/BillsService";
import EditBillsFormModal from "../modals/formModals/EditBillsFormModal";

const BillsList = () => {
  const columns = useMemo(
    () => [
      { label: "Date", key: "created_at" },
      { label: "Vendor Name", key: "vendor_name" },
      { label: "Vendor Category", key: "vendor_category" },
      { label: "Quantity", key: "quantity" },
      { label: "Amount", key: "amount" },
      { label: "Amount Paid", key: "amount_paid" },
      { label: "Balance", key: "balance" },
    ],
    []
  );

  const [selectedBills, setSelectedBills] = useState([]);
  const [bills, setBills] = useState([]);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState(null);

  const dropdownRefs = useRef(new Map());

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const data = await BillsService.getBillsList();
        setBills(data);
      } catch (err) {
        console.error("Failed to fetch bills:", err);
        setError(err);
      }
    };

    fetchBills();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen !== null) {
        const dropdownRef = dropdownRefs.current.get(dropdownOpen);
        if (dropdownRef && !dropdownRef.contains(event.target)) {
          setDropdownOpen(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleSelectAll = (e) => {
    if (bills.length > 0 && bills.every((bill) => bill.id)) {
      setSelectedBills(e.target.checked ? bills.map((b) => b.id) : []);
    }
  };

  const handleSelect = (id) => {
    setSelectedBills((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const handleEditBill = (billId) => {
    setSelectedBillId(billId);
    setEditModalOpen(true);
    setDropdownOpen(null);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedBillId(null);
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Bills List</h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        {error && <p className="text-red-500 text-center">Failed to load bills. Please try again later.</p>}

        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-200 text-left text-sm sm:text-base">
              <th className="p-3 sm:p-4 w-12">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  onChange={handleSelectAll}
                  checked={selectedBills.length === bills.length}
                />
              </th>
              {columns.map((col, index) => (
                <th key={index} className="p-3 sm:p-4 font-medium">
                  {col.label}
                </th>
              ))}
              <th className="p-3 sm:p-4 w-10">Actions</th>
            </tr>
          </thead>

          <tbody>
            {bills.map((bill) => (
              <BillRow
                key={bill.id}
                bill={bill}
                selectedBills={selectedBills}
                handleSelect={handleSelect}
                toggleDropdown={toggleDropdown}
                dropdownOpen={dropdownOpen}
                handleEditBill={handleEditBill}
                columns={columns} // Pass columns as a prop
              />
            ))}
          </tbody>
        </table>

        {bills.length === 0 && !error && <p className="text-center text-gray-500 py-4">No bills found.</p>}
      </div>

      {editModalOpen && <EditBillsFormModal isOpen={editModalOpen} onClose={handleCloseEditModal} billId={selectedBillId} />}
    </div>
  );
};

const BillRow = ({ bill, selectedBills, handleSelect, toggleDropdown, dropdownOpen, handleEditBill, columns }) => {
  return (
    <tr className="border-t hover:bg-gray-50 transition relative">
      <td className="p-3 sm:p-4 w-12">
        <input
          type="checkbox"
          className="w-4 h-4"
          checked={selectedBills.includes(bill.id)}
          onChange={() => handleSelect(bill.id)}
        />
      </td>
      {columns.map((col, colIndex) => (
        <td key={colIndex} className="p-3 sm:p-4 text-sm sm:text-base">
          {col.key === "vendor_category"
            ? bill.vendor_category.name
            : col.key === "created_at"
            ? new Date(bill.created_at).toLocaleString()
            : bill[col.key]}
        </td>
      ))}
      <td className="sm:p-4 w-10 text-gray-600 relative">
        <div className="border-[1px] border-[#9e9e9e] rounded-md relative">
          <MoreVertical
            size={18}
            className="cursor-pointer hover:text-gray-800 text-[#9e9e9e] transition m-1"
            onClick={() => toggleDropdown(bill.id)}
            aria-label="Actions"
            aria-expanded={dropdownOpen === bill.id}
          />
        </div>

        {dropdownOpen === bill.id && (
          <div className="absolute right-0 mt-1 w-40 bg-white border rounded shadow-lg z-10">
            <button
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() => handleEditBill(bill.id)}
            >
              Edit Bill
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() => console.log(`Update Payment for Bill ID: ${bill.id}`)}
            >
              Update Payment
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default BillsList;