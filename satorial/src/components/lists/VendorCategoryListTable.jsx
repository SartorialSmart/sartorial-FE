import { useState, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import VendorCategoryService from "../../services/VendorCategoryService";

const columns = [
  { key: "name", label: "Category" },
  { key: "bill_count", label: "No of Bill" },
];

const VendorCategoryListTable = ({ searchTerm = "" }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await VendorCategoryService.getCategoriesWithBillCount();
        setCategories(data);
      } catch (err) {
        setError(err.message || "Failed to fetch vendor categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const normalized = (searchTerm || "").toString().trim().toLowerCase();
  const filteredCategories = (categories || []).filter((row) => {
    if (!normalized) return true;
    const name = (row.name || "").toString().toLowerCase();
    const billCount = (row.bill_count ?? "").toString().toLowerCase();
    return name.includes(normalized) || billCount.includes(normalized);
  });

  return (
    <div className="p-4 sm:p-6 bg-gray-100">
      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-200 text-left text-sm sm:text-base">
              <th className="p-3 sm:p-4 w-12">
                <input type="checkbox" className="w-4 h-4" />
              </th>
              {columns.map((col, index) => (
                <th key={index} className="p-3 sm:p-4 font-normal">
                  {col.label}
                </th>
              ))}
              <th className="p-3 sm:p-4 w-10">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 2} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length + 2} className="p-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="p-4 text-center text-gray-500">
                  No vendor categories found.
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="p-4 text-center text-gray-500">
                  No categories match your search.
                </td>
              </tr>
            ) : (
              filteredCategories.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3 sm:p-4 w-12">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="p-3 sm:p-4 text-sm sm:text-base">
                      {row[col.key] || "0"}
                    </td>
                  ))}
                  <td className="sm:p-4 w-10 text-gray-600">
                    <div className="border-[1px] border-[#9e9e9e] rounded-md">
                      <MoreVertical size={18} className="cursor-pointer hover:text-gray-800 text-[#9e9e9e] transition m-1" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorCategoryListTable;
