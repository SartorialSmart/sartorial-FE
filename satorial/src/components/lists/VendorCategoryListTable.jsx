import { MoreVertical } from "lucide-react";

const columns = [
  { key: "category", label: "Category" },
  { key: "num_of_bill", label: "No of Bill" },
];

const data = [
  { category: "Fabric", num_of_bill: 10 },
  { category: "Fabric", num_of_bill: 10 },
  { category: "Fabric", num_of_bill: 10 },
  { category: "Fabric", num_of_bill: 10 },
  { category: "Fabric", num_of_bill: 10 },
  { category: "Fabric", num_of_bill: 10 },
  { category: "Fabric", num_of_bill: 10 },
  { category: "Fabric", num_of_bill: 10 },
  { category: "Fabric", num_of_bill: 10 },
];

const VendorCategoryListTable = () => {
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
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t hover:bg-gray-50 transition">
                <td className="p-3 sm:p-4 w-12">
                  <input type="checkbox" className="w-4 h-4" />
                </td>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="p-3 sm:p-4 text-sm sm:text-base">
                    {row[col.key]}
                  </td>
                ))}
                <td className="sm:p-4 w-10 text-gray-600">
                  <div className="border-[1px] border-[#9e9e9e] rounded-md">
                    <MoreVertical size={18} className="cursor-pointer hover:text-gray-800 text-[#9e9e9e] transition m-1" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorCategoryListTable;