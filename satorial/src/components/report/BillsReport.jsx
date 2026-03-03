import { Search, Download, MoreVertical, CheckSquare } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

import BillsService from "../../services/BillsService";

const BillsReport = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bills, setBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await BillsService.getBillListView();
        // Ensure we always have an array, even if the API response structure differs
        const billsData = Array.isArray(data)
          ? data
          : data?.bills || data?.items || data?.data || [];
        setBills(billsData);
      } catch (err) {
        console.error("Error fetching bills:", err);
        setError("Failed to load bills. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Safe date parsing function
  const parseDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  // Filter bills based on selected time period
  const filterBillsByDate = (bills) => {
    if (!Array.isArray(bills)) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (selectedFilter) {
      case "Today":
        return bills.filter((bill) => {
          if (!bill) return false;
          const billDate = parseDate(bill.date || bill.created_at);
          return billDate && billDate >= today;
        });

      case "This Week":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday of this week
        return bills.filter((bill) => {
          if (!bill) return false;
          const billDate = parseDate(bill.date || bill.created_at);
          return billDate && billDate >= startOfWeek;
        });

      case "This Month":
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return bills.filter((bill) => {
          if (!bill) return false;
          const billDate = parseDate(bill.date || bill.created_at);
          return billDate && billDate >= startOfMonth;
        });

      case "This Year":
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return bills.filter((bill) => {
          if (!bill) return false;
          const billDate = parseDate(bill.date || bill.created_at);
          return billDate && billDate >= startOfYear;
        });

      case "Custom Date":
        if (!customStartDate || !customEndDate) return bills;

        const startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate);

        // Check if dates are valid
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return bills;
        }

        endDate.setHours(23, 59, 59, 999); // End of the day

        return bills.filter((bill) => {
          if (!bill) return false;
          const billDate = parseDate(bill.date || bill.created_at);
          return billDate && billDate >= startDate && billDate <= endDate;
        });

      default: // "All Time"
        return bills;
    }
  };

  // Safe value extraction with fallbacks
  const getBillValue = (bill, ...propertyPaths) => {
    if (!bill || typeof bill !== "object") return null;

    for (const path of propertyPaths) {
      if (typeof path !== "string") continue;

      if (path.includes(".")) {
        const parts = path.split(".");
        let value = bill;
        for (const part of parts) {
          if (
            value &&
            typeof value === "object" &&
            value.hasOwnProperty(part)
          ) {
            value = value[part];
          } else {
            value = null;
            break;
          }
        }
        if (value !== null && value !== undefined) return value;
      } else if (bill.hasOwnProperty(path)) {
        const value = bill[path];
        if (value !== null && value !== undefined) return value;
      }
    }
    return null;
  };

  // Search bills based on query
  const searchBills = (bills) => {
    if (!Array.isArray(bills)) return [];
    if (!searchQuery.trim()) return bills;

    const query = searchQuery.toLowerCase();
    return bills.filter((bill) => {
      if (!bill) return false;

      const vendorName = getBillValue(
        bill,
        "vendor_name",
        "vendor",
        "supplier"
      );
      const vendorCategory = getBillValue(
        bill,
        "vendor_category",
        "vendor_category_obj.name",
        "category"
      );

      const vendorNameStr = vendorName ? String(vendorName).toLowerCase() : "";
      const vendorCategoryStr = vendorCategory
        ? String(vendorCategory).toLowerCase()
        : "";

      return vendorNameStr.includes(query) || vendorCategoryStr.includes(query);
    });
  };

  // Format currency safely
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(Number(value)))
      return "₦0";
    return `₦${Number(value).toLocaleString()}`;
  };

  // Combine filtering and searching
  const filteredBills = useMemo(() => {
    try {
      const dateFiltered = filterBillsByDate(bills);
      return searchBills(dateFiltered);
    } catch {
      return [];
    }
  }, [bills, selectedFilter, searchQuery, customStartDate, customEndDate]);

  // Handle export functionality
  const handleExport = () => {
    try {
      const csvContent = [
        ["Date", "Vendor Name", "Vendor Category", "Quantity", "Amount", "Amount Paid", "Balance"].join(","),
        ...filteredBills.map(bill => [
          `"${getBillValue(bill, "date", "created_at") ? new Date(getBillValue(bill, "date", "created_at")).toLocaleDateString() : ""}"`,
          `"${getBillValue(bill, "vendor_name", "vendor", "supplier") || ""}"`,
          `"${getBillValue(bill, "vendor_category", "vendor_category_obj.name", "category") || ""}"`,
          getBillValue(bill, "quantity") ?? "",
          getBillValue(bill, "amount") ?? 0,
          getBillValue(bill, "amount_paid") ?? 0,
          getBillValue(bill, "balance") ?? 0,
        ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bills_report_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      // Export failed silently
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header & Filters */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[22px] font-semibold text-gray-900">
          Bills Report
        </h2>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            "All Time",
            "Today",
            "This Week",
            "This Month",
            "This Year",
            "Custom Date",
          ].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-[6px] text-sm rounded-md border transition ${
                selectedFilter === filter
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Picker (shown only when Custom Date is selected) */}
      {selectedFilter === "Custom Date" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 gap-3 bg-white p-3 rounded-lg shadow-sm">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            />
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            />
          </div>
        </div>
      )}

      {/* Search & Export */}
      <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center mb-4 gap-3">
        <div className="relative w-full sm:w-[300px]">
          <input
            type="text"
            placeholder="Search by vendor name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-[9px] pl-10 w-full bg-white text-sm focus:ring focus:ring-gray-200 outline-none"
          />
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        </div>
        <button
          onClick={handleExport}
          className="flex items-center justify-center px-4 py-[9px] border border-gray-300 rounded-lg bg-white text-sm text-gray-700 whitespace-nowrap"
        >
          <Download className="w-5 h-5 mr-2 text-gray-600" />
          Export
        </button>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-10">Loading bills...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-200 text-gray-700 text-left">
                  <tr>
                    <th className="p-3 text-sm font-semibold"></th>
                    <th className="p-3 text-sm font-semibold">Date</th>
                    <th className="p-3 text-sm font-semibold">Vendor Name</th>
                    <th className="p-3 text-sm font-semibold">
                      Vendor Category
                    </th>
                    <th className="p-3 text-sm font-semibold">Quantity</th>
                    <th className="p-3 text-sm font-semibold">Amount</th>
                    <th className="p-3 text-sm font-semibold">Amount Paid</th>
                    <th className="p-3 text-sm font-semibold">Balance</th>
                    <th className="p-3 text-sm font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-8 text-gray-400"
                      >
                        {bills.length === 0
                          ? "No bills available."
                          : "No bills match your search criteria."}
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill, index) => {
                      if (!bill) return null;

                      const date = getBillValue(bill, "date", "created_at");
                      const vendorName = getBillValue(
                        bill,
                        "vendor_name",
                        "vendor",
                        "supplier"
                      );
                      const vendorCategory = getBillValue(
                        bill,
                        "vendor_category",
                        "vendor_category_obj.name",
                        "category"
                      );
                      const quantity = getBillValue(bill, "quantity");
                      const amount = getBillValue(bill, "amount");
                      const amountPaid = getBillValue(bill, "amount_paid");
                      const balance = getBillValue(bill, "balance");

                      return (
                        <tr
                          key={bill.id || index}
                          className="border-b text-gray-700 hover:bg-gray-50"
                        >
                          <td className="p-3">
                            <CheckSquare className="w-5 h-5 text-gray-500" />
                          </td>
                          <td className="p-3 text-sm">
                            {date ? new Date(date).toLocaleDateString() : "-"}
                          </td>
                          <td className="p-3 text-sm">{vendorName || "-"}</td>
                          <td className="p-3 text-sm">
                            {vendorCategory || "-"}
                          </td>
                          <td className="p-3 text-sm">{quantity ?? "-"}</td>
                          <td className="p-3 text-sm">
                            {formatCurrency(amount)}
                          </td>
                          <td className="p-3 text-sm">
                            {formatCurrency(amountPaid)}
                          </td>
                          <td className="p-3 text-sm">
                            {formatCurrency(balance)}
                          </td>
                          <td className="p-3 text-right">
                            <MoreVertical className="w-5 h-5 text-gray-500 cursor-pointer" />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Results count */}
            <div className="p-3 text-sm text-gray-500 border-t">
              Showing {filteredBills.length} of {bills.length} bills
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BillsReport;
