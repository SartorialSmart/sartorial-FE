import { MoreVertical } from "lucide-react";

const columns = [
  { key: "date", label: "Date" },
  { key: "client_name", label: "Client Name" },
  { key: "amount_paid", label: "Amount Paid" },
];

const data = [
  {
    date: "14/04/2024",
    client_name: "Kemi Johnson",
    amount_paid: 200000,
  },
  {
    date: "14/04/2024",
    client_name: "Kemi Johnson",
    amount_paid: 200000,
  },
  {
    date: "14/04/2024",
    client_name: "Kemi Johnson",
    amount_paid: 200000,
  },
  {
    date: "14/04/2024",
    client_name: "Kemi Johnson",
    amount_paid: 200000,
  },
  {
    date: "14/04/2024",
    client_name: "Kemi Johnson",
    amount_paid: 200000,
  },
  {
    date: "14/04/2024",
    client_name: "Kemi Johnson",
    amount_paid: 200000,
  },
  {
    date: "14/04/2024",
    client_name: "Kemi Johnson",
    amount_paid: 200000,
  },
  {
    date: "14/04/2024",
    client_name: "Kemi Johnson",
    amount_paid: 200000,
  },
  {
    date: "14/04/2024",
    client_name: "Kemi Johnson",
    amount_paid: 200000,
  },
];

const formatAmount = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};

const PaymentsListTable = () => {
  return (
    <div className="p-4 sm:p-6 bg-gray-100">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Payments List</h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-200 text-left text-sm sm:text-base">
              <th className="p-3 sm:p-4 w-12">
                <input type="checkbox" className="w-4 h-4" />
              </th>
              {columns.map((col, index) => (
                <th key={index} className="p-3 sm:p-4 font-medium">
                  {col.label}
                </th>
              ))}
              <th className="p-3 sm:p-4 w-10"></th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-3 sm:p-4 w-12">
                  <input type="checkbox" className="w-4 h-4" />
                </td>
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="p-3 sm:p-4 text-sm sm:text-base"
                  >
                    {col.key === "amount_paid" ? formatAmount(row[col.key]) : row[col.key]}
                  </td>
                ))}
               
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsListTable;
