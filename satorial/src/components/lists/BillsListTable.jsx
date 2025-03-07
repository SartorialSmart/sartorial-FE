import { useState } from "react";
import { MoreVertical } from "lucide-react";

const BillsList = () => {
  const columns = [
    { label: "Date", key: "date" },
    { label: "Vendor Name", key: "vendorName" },
    { label: "Vendor Category", key: "vendorCategory" },
    { label: "Quantity", key: "quantity" },
    { label: "Amount", key: "amount" },
    { label: "Amount Paid", key: "amountPaid" },
    { label: "Balance", key: "balance" },
  ];

  const [selectedBills, setSelectedBills] = useState([]);
  const [bills, setBills] = useState([
    {
      date: "14/04/2024",
      vendorName: "Jumia",
      vendorCategory: "Sewing Machines",
      quantity: 10,
      amount: "1,500,000",
      amountPaid: "1,000,000",
      balance: "500,000",
    },
    {
      date: "14/04/2024",
      vendorName: "Jumia",
      vendorCategory: "Sewing Machines",
      quantity: 10,
      amount: "1,500,000",
      amountPaid: "1,000,000",
      balance: "500,000",
    },
    {
      date: "14/04/2024",
      vendorName: "Jumia",
      vendorCategory: "Sewing Machines",
      quantity: 10,
      amount: "1,500,000",
      amountPaid: "1,000,000",
      balance: "500,000",
    },
  ]);

  const handleSelectAll = (e) => {
    setSelectedBills(e.target.checked ? bills.map((b) => b.date) : []);
  };

  const handleSelect = (date) => {
    setSelectedBills((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Bills List</h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
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
            {bills.map((bill, index) => (
              <tr key={index} className="border-t hover:bg-gray-50 transition">
                <td className="p-3 sm:p-4 w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={selectedBills.includes(bill.date)}
                    onChange={() => handleSelect(bill.date)}
                  />
                </td>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="p-3 sm:p-4 text-sm sm:text-base">
                    {bill[col.key]}
                  </td>
                ))}
                <td className="sm:p-4 w-10 text-gray-600">
                  <div className="border-[1px] border-[#9e9e9e] rounded-md">
                    <MoreVertical
                      size={18}
                      className="cursor-pointer hover:text-gray-800 text-[#9e9e9e] transition m-1"
                    />
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

export default BillsList;
