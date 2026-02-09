import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { FileText, Download, MoreVertical, Loader2, Receipt } from "lucide-react";
import PaymentService from "../../services/PaymentService";
import OrderService from "../../services/OrderService";

const columns = [
  { key: "date", label: "Date" },
  { key: "client_name", label: "Client Name" },
  { key: "payment_type", label: "Payment Type" },
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
  const [selectedPayments, setSelectedPayments] = useState(new Set());
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const dropdownRefs = useRef([]);
  const buttonRefs = useRef([]);

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
              paid_at: item.paid_at,
            }))
          : [];

        console.log("Formatted Payments Data:", paymentsData);
        setPayments(paymentsData);
        dropdownRefs.current = new Array(paymentsData.length).fill(null);
        buttonRefs.current = new Array(paymentsData.length).fill(null);
      } catch (err) {
        console.error("Error fetching payment list:", err);
        setError("Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown !== null) {
        const dropdown = dropdownRefs.current[activeDropdown];
        const button = buttonRefs.current[activeDropdown];
        if (
          dropdown &&
          !dropdown.contains(event.target) &&
          button &&
          !button.contains(event.target)
        ) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

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
          payment.order_title
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
              endDate.setHours(23, 59, 59, 999);
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

  // Toggle payment selection
  const togglePaymentSelection = (paymentId) => {
    setSelectedPayments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(paymentId)) {
        newSet.delete(paymentId);
      } else {
        newSet.add(paymentId);
      }
      return newSet;
    });
  };

  // Select all payments
  const selectAllPayments = () => {
    if (selectedPayments.size === filteredPayments.length) {
      setSelectedPayments(new Set());
    } else {
      setSelectedPayments(new Set(filteredPayments.map((p) => p.id)));
    }
  };

  // Toggle dropdown
  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  // Get dropdown position
  const getDropdownPosition = (index) => {
    if (!buttonRefs.current[index]) return {};
    const button = buttonRefs.current[index];
    const rect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;

    if (spaceBelow < 160) {
      return {
        position: "fixed",
        bottom: viewportHeight - rect.top + 8,
        right: window.innerWidth - rect.right,
      };
    } else {
      return {
        position: "fixed",
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      };
    }
  };

  // Generate invoice for a single payment
  const generatePaymentInvoice = async (payment) => {
    if (!payment || isGenerating) return;

    setIsGenerating(true);
    try {
      // Fetch full order details if needed
      let orderData = payment.order_data;
      if (!orderData && payment.order) {
        try {
          orderData = await OrderService.getOrderById(payment.order);
        } catch (error) {
          console.warn("Could not fetch order details:", error);
        }
      }

      // Dynamically import libraries
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // Create temporary container
      const invoiceContainer = document.createElement("div");
      invoiceContainer.style.position = "absolute";
      invoiceContainer.style.left = "-9999px";
      invoiceContainer.style.width = "800px";
      invoiceContainer.style.backgroundColor = "#ffffff";
      invoiceContainer.style.padding = "40px";
      document.body.appendChild(invoiceContainer);

      const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      };

      const formatAmountPDF = (amount) => {
        if (!amount && amount !== 0) return "₦0.00";
        return `₦${Number(amount).toLocaleString()}`;
      };

      // Invoice number based on payment ID
      const invoiceNumber = payment.id
        ? `INV-PAY-${String(payment.id).padStart(4, "0")}`
        : "INV-PAY-0000";

      // Build invoice HTML
      invoiceContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px;">
            <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 10px 0; color: #1e40af;">Payment Receipt</h1>
            <p style="font-size: 18px; color: #666; margin: 0;">${invoiceNumber}</p>
          </div>

          <div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #2563eb;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div>
                <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 600;">Payment Date</p>
                <p style="font-weight: 700; margin: 0; font-size: 16px; color: #1e293b;">${formatDate(
                  payment.paid_at
                )}</p>
              </div>
              <div>
                <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 600;">Receipt Number</p>
                <p style="font-weight: 700; margin: 0; font-size: 16px; color: #1e293b;">${invoiceNumber}</p>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div>
                <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 600;">From</p>
                <p style="font-weight: 600; margin: 0; color: #1e293b;">${
                  orderData?.business_name ||
                  orderData?.vendor_name ||
                  "Your Business"
                }</p>
              </div>
              <div>
                <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 600;">To</p>
                <p style="font-weight: 600; margin: 0; color: #1e293b;">${
                  payment.client_name || orderData?.client_full_name || "N/A"
                }</p>
              </div>
            </div>

            ${
              payment.order_title || orderData?.order_title
                ? `
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 600;">Order Reference</p>
                <p style="font-weight: 600; margin: 0; color: #1e293b;">${
                  payment.order_title || orderData?.order_title
                }</p>
                ${
                  orderData?.order_description
                    ? `<p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">${orderData.order_description}</p>`
                    : ""
                }
              </div>
            `
                : ""
            }

            <div style="margin-top: 24px; padding-top: 24px; border-top: 2px solid #e2e8f0;">
              <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <p style="color: #64748b; margin: 0; font-size: 14px; font-weight: 600;">Payment Type</p>
                  <p style="margin: 0; font-weight: 600; color: #1e293b;">${
                    payment.payment_type || "Payment"
                  }</p>
                </div>
                ${
                  payment.payment_method
                    ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <p style="color: #64748b; margin: 0; font-size: 14px; font-weight: 600;">Payment Method</p>
                    <p style="margin: 0; font-weight: 600; color: #1e293b;">${payment.payment_method}</p>
                  </div>
                `
                    : ""
                }
                ${
                  payment.payment_reference
                    ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <p style="color: #64748b; margin: 0; font-size: 14px; font-weight: 600;">Reference</p>
                    <p style="margin: 0; font-weight: 600; color: #1e293b; font-family: monospace;">${payment.payment_reference}</p>
                  </div>
                `
                    : ""
                }
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 2px solid #e2e8f0;">
                  <p style="color: #1e293b; margin: 0; font-size: 18px; font-weight: 700;">Amount Paid</p>
                  <p style="margin: 0; font-size: 28px; font-weight: 700; color: #16a34a;">${formatAmountPDF(
                    payment.amount_paid
                  )}</p>
                </div>
              </div>
            </div>

            ${
              orderData
                ? `
              <div style="margin-top: 24px; padding: 16px; background-color: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                <p style="font-size: 12px; color: #1e40af; margin: 0; font-weight: 600;">
                  <strong>Order Status:</strong>
                  <span style="margin-left: 8px; padding: 4px 12px; background-color: ${
                    orderData.order_status === "Completed"
                      ? "#d1fae5"
                      : orderData.order_status === "In Progress"
                      ? "#dbeafe"
                      : "#fef3c7"
                  }; color: ${
                  orderData.order_status === "Completed"
                    ? "#065f46"
                    : orderData.order_status === "In Progress"
                    ? "#1e40af"
                    : "#92400e"
                }; border-radius: 4px; font-size: 12px; font-weight: 700;">${
                  orderData.order_status
                }</span>
                </p>
                ${
                  orderData.balance_amount > 0
                    ? `
                  <p style="font-size: 12px; color: #1e40af; margin: 8px 0 0 0;">
                    <strong>Remaining Balance:</strong> <span style="font-weight: 700;">${formatAmountPDF(
                      orderData.balance_amount
                    )}</span>
                  </p>
                `
                    : `
                  <p style="font-size: 12px; color: #065f46; margin: 8px 0 0 0; font-weight: 600;">
                    ✓ Payment Complete
                  </p>
                `
                }
              </div>
            `
                : ""
            }

            ${
              payment.notes
                ? `
              <div style="margin-top: 20px; padding: 16px; background-color: #fefce8; border-radius: 8px; border-left: 4px solid #facc15;">
                <p style="font-size: 12px; color: #854d0e; margin: 0; font-weight: 600;">Notes:</p>
                <p style="font-size: 12px; color: #713f12; margin: 5px 0 0 0;">${payment.notes}</p>
              </div>
            `
                : ""
            }
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">Thank you for your payment!</p>
            <p style="font-size: 12px; color: #cbd5e1; margin: 5px 0 0 0;">This is a computer-generated receipt and does not require a signature.</p>
          </div>
        </div>
      `;

      // Convert to canvas and PDF
      const canvas = await html2canvas(invoiceContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      // Download
      pdf.save(`Payment-Receipt-${invoiceNumber}.pdf`);

      // Cleanup
      document.body.removeChild(invoiceContainer);

      alert(`Receipt ${invoiceNumber} downloaded successfully!`);
    } catch (error) {
      console.error("Error generating receipt:", error);
      alert("Failed to generate receipt. Please try again.");
    } finally {
      setIsGenerating(false);
      setActiveDropdown(null);
    }
  };

  // Generate bulk invoices
  const generateBulkInvoices = async () => {
    if (selectedPayments.size === 0) {
      alert("Please select at least one payment to generate receipts.");
      return;
    }

    setIsGenerating(true);
    const selectedPaymentData = filteredPayments.filter((p) =>
      selectedPayments.has(p.id)
    );

    for (const payment of selectedPaymentData) {
      await generatePaymentInvoice(payment);
      // Small delay between generations
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setSelectedPayments(new Set());
    setIsGenerating(false);
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Payments List
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing {filteredPayments.length} of {payments.length} payments
          </p>
        </div>

        {/* Bulk Actions */}
        {selectedPayments.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1.5 rounded-full font-medium border border-blue-200">
              {selectedPayments.size} selected
            </span>
            <button
              onClick={generateBulkInvoices}
              disabled={isGenerating}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Generate Receipts ({selectedPayments.size})
                </>
              )}
            </button>
          </div>
        )}
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
                  <input
                    type="checkbox"
                    checked={
                      selectedPayments.size === filteredPayments.length &&
                      filteredPayments.length > 0
                    }
                    onChange={selectAllPayments}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="p-3 sm:p-4 font-medium text-gray-700"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="p-3 sm:p-4 text-center font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`border-t hover:bg-gray-50 transition ${
                    selectedPayments.has(row.id) ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="p-3 sm:p-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedPayments.has(row.id)}
                      onChange={() => togglePaymentSelection(row.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="p-3 sm:p-4 text-sm sm:text-base text-gray-800"
                    >
                      {col.key === "amount_paid" ? (
                        <span className="font-semibold text-green-600">
                          {formatAmount(row[col.key])}
                        </span>
                      ) : col.key === "payment_type" ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {row[col.key] || "Payment"}
                        </span>
                      ) : (
                        row[col.key] || "N/A"
                      )}
                    </td>
                  ))}
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center justify-center gap-2 relative">
                      <button
                        onClick={() => generatePaymentInvoice(row)}
                        disabled={isGenerating}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-all text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Generate Receipt"
                      >
                        <Receipt size={18} />
                      </button>
                      <button
                        ref={(el) => (buttonRefs.current[index] = el)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600"
                        onClick={() => toggleDropdown(index)}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdown === index && (
                        <div
                          ref={(el) => (dropdownRefs.current[index] = el)}
                          className="w-56 bg-white shadow-xl border-2 border-gray-200 rounded-xl py-2 z-50"
                          style={getDropdownPosition(index)}
                        >
                          <button
                            onClick={() => generatePaymentInvoice(row)}
                            disabled={isGenerating}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer w-full text-left transition-all disabled:opacity-50"
                          >
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <FileText size={16} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                Generate Receipt
                              </p>
                              <p className="text-xs text-gray-500">
                                Download PDF receipt
                              </p>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary Footer */}
      {filteredPayments.length > 0 && (
        <div className="mt-4 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {filteredPayments.length} payment
              {filteredPayments.length !== 1 ? "s" : ""} shown
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

PaymentsListTable.propTypes = {
  searchTerm: PropTypes.string,
  dateFilter: PropTypes.string,
  customDateRange: PropTypes.shape({
    start: PropTypes.string,
    end: PropTypes.string,
  }),
};

export default PaymentsListTable;