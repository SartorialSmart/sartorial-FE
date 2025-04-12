import { useEffect, useState } from "react";
import PaymentService from "../../services/PaymentService";

const columns = [
  { key: "date", label: "Date" },
  { key: "client_name", label: "Client Name" },
  { key: "amount_paid", label: "Amount Paid" },
];

const formatAmount = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};

const PaymentsListTable = () => {
  const [payments, setPayments] = useState([]); // Ensure payments is an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await PaymentService.getPaymentList();
        console.log("API Response:", response);
    
        const paymentsData = Array.isArray(response)
          ? response.map((item) => ({
              ...item,
              date: new Date(item.payment_date).toLocaleString("en-NG", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
            }))
          : [];
    
        console.log("Formatted Payments Data:", paymentsData);
        setPayments(paymentsData);
      } catch (err) {
        console.error("Error fetching payment list:", err);
        setError("Failed to load payments");
      } finally {
        setLoading(false);
      }
    };
    
    

    fetchPayments();
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-gray-100">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Payments List</h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        {loading ? (
          <div className="p-6 text-center">Loading payments...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : payments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No payments found</div>
        ) : (
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-200 text-left text-sm sm:text-base">
                <th className="p-3 sm:p-4 w-12">
                  <input type="checkbox" className="w-4 h-4" />
                </th>
                {columns.map((col) => (
                  <th key={col.key} className="p-3 sm:p-4 font-medium">
                    {col.label}
                  </th>
                ))}
                <th className="p-3 sm:p-4 w-10"></th>
              </tr>
            </thead>

            <tbody>
              {payments.map((row, index) => (
                <tr key={index} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3 sm:p-4 w-12">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} className="p-3 sm:p-4 text-sm sm:text-base">
                      {col.key === "amount_paid"
                        ? formatAmount(row[col.key])
                        : row[col.key] || "N/A"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentsListTable;
