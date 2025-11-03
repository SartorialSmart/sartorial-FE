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

const PaymentsListTable = ({ searchTerm, dateFilter, customDateRange }) => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
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
              date: new Date(item.paid_at).toLocaleString("en-NG", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
              // Store the original date for filtering
              paid_at: item.paid_at,
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

  // Filter payments based on search term and date filter
  useEffect(() => {
    let filtered = [...payments];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.client_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          payment.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.amount_paid?.toString().includes(searchTerm)
      );
    }

    // Apply date filter
    if (dateFilter && dateFilter !== "All Time") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.paid_at);

        switch (dateFilter) {
          case "Today":
            return paymentDate >= today;
          case "This Week":
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return paymentDate >= weekStart;
          case "This Month":
            const monthStart = new Date(
              today.getFullYear(),
              today.getMonth(),
              1
            );
            return paymentDate >= monthStart;
          case "This Year":
            const yearStart = new Date(today.getFullYear(), 0, 1);
            return paymentDate >= yearStart;
          case "Custom":
            if (customDateRange?.start && customDateRange?.end) {
              const startDate = new Date(customDateRange.start);
              const endDate = new Date(customDateRange.end);
              endDate.setHours(23, 59, 59, 999); // Include the entire end date
              return paymentDate >= startDate && paymentDate <= endDate;
            }
            return true;
          default:
            return true;
        }
      });
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, dateFilter, customDateRange]);

  // Calculate total amount for filtered payments
  const totalAmount = filteredPayments.reduce(
    (sum, payment) => sum + (payment.amount_paid || 0),
    0
  );

  return (
    <div className="p-4 sm:p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Payments List
        </h2>
        {/* <div className="text-sm text-gray-600">
          Showing {filteredPayments.length} of {payments.length} payments
          {filteredPayments.length > 0 && (
            <span className="ml-2 font-semibold">
              Total: {formatAmount(totalAmount)}
            </span>
          )}
        </div> */}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        {loading ? (
          <div className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Loading payments...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : filteredPayments.length === 0 && payments.length > 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              No payments match your current filters.
            </p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No payments found</p>
          </div>
        ) : (
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-200 text-left text-sm sm:text-base">
                <th className="p-3 sm:p-4 w-12">
                  <input type="checkbox" className="w-4 h-4" />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="p-3 sm:p-4 font-medium text-gray-700"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="p-3 sm:p-4 w-10"></th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((row, index) => (
                <tr
                  key={row.id || index}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3 sm:p-4 w-12">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="p-3 sm:p-4 text-sm sm:text-base text-gray-800"
                    >
                      {col.key === "amount_paid" ? (
                        <span className="font-medium text-green-600">
                          {formatAmount(row[col.key])}
                        </span>
                      ) : (
                        row[col.key] || "N/A"
                      )}
                    </td>
                  ))}
                  <td className="p-3 sm:p-4 w-10">
                    {/* Space for future actions */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary Footer
      {filteredPayments.length > 0 && (
        <div className="mt-4 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {filteredPayments.length} payment
              {filteredPayments.length !== 1 ? "s" : ""} shown
            </span>
            <span className="text-lg font-semibold text-gray-800">
              Total: {formatAmount(totalAmount)}
            </span>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default PaymentsListTable;
