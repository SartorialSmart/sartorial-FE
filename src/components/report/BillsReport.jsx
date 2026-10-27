import { Search, Download, MoreVertical, Filter, ChevronDown, Loader2, Receipt } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { formatDateCaption } from "../../../utils/reportUtils";

import BillsService from "../../services/BillsService";

const BillsReport = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bills, setBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await BillsService.getBillListView();
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

  const parseDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

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

      case "This Week": {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return bills.filter((bill) => {
          if (!bill) return false;
          const billDate = parseDate(bill.date || bill.created_at);
          return billDate && billDate >= startOfWeek;
        });
      }

      case "This Month": {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return bills.filter((bill) => {
          if (!bill) return false;
          const billDate = parseDate(bill.date || bill.created_at);
          return billDate && billDate >= startOfMonth;
        });
      }

      case "This Year": {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return bills.filter((bill) => {
          if (!bill) return false;
          const billDate = parseDate(bill.date || bill.created_at);
          return billDate && billDate >= startOfYear;
        });
      }

      case "Custom Date": {
        if (!customStartDate || !customEndDate) return bills;
        const startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return bills;
        endDate.setHours(23, 59, 59, 999);
        return bills.filter((bill) => {
          if (!bill) return false;
          const billDate = parseDate(bill.date || bill.created_at);
          return billDate && billDate >= startDate && billDate <= endDate;
        });
      }

      default:
        return bills;
    }
  };

  const getBillValue = (bill, ...propertyPaths) => {
    if (!bill || typeof bill !== "object") return null;
    for (const path of propertyPaths) {
      if (typeof path !== "string") continue;
      if (path.includes(".")) {
        const parts = path.split(".");
        let value = bill;
        for (const part of parts) {
          if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, part)) {
            value = value[part];
          } else {
            value = null;
            break;
          }
        }
        if (value !== null && value !== undefined) return value;
      } else if (Object.prototype.hasOwnProperty.call(bill, path)) {
        const value = bill[path];
        if (value !== null && value !== undefined) return value;
      }
    }
    return null;
  };

  const vendorCategories = useMemo(() => {
    const cats = new Set();
    bills.forEach((bill) => {
      const cat = getBillValue(bill, "vendor_category", "vendor_category_obj.name", "category");
      if (cat) cats.add(cat);
    });
    return ["All", ...Array.from(cats).sort()];
  }, [bills]);

  const dateFilteredBills = useMemo(() => {
    return filterBillsByDate(bills);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bills, selectedFilter, customStartDate, customEndDate]);

  const filteredBills = useMemo(() => {
    try {
      let result = dateFilteredBills;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        result = result.filter((bill) => {
          if (!bill) return false;
          const vendorName = getBillValue(bill, "vendor_name", "vendor", "supplier");
          const vendorCategory = getBillValue(bill, "vendor_category", "vendor_category_obj.name", "category");
          return (
            (vendorName && String(vendorName).toLowerCase().includes(query)) ||
            (vendorCategory && String(vendorCategory).toLowerCase().includes(query))
          );
        });
      }

      if (selectedCategory !== "All") {
        result = result.filter((bill) => {
          const cat = getBillValue(bill, "vendor_category", "vendor_category_obj.name", "category");
          return cat === selectedCategory;
        });
      }

      return result;
    } catch {
      return [];
    }
  }, [dateFilteredBills, searchQuery, selectedCategory]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) return "₦0";
    return `₦${Number(value).toLocaleString()}`;
  };

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
      // export failed silently
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bills Report</h1>
            <p className="text-gray-600">
              Track and analyze vendor bills
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {selectedFilter === "Custom Date" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by vendor name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 appearance-none min-w-40"
              >
                {vendorCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <button
              onClick={handleExport}
              disabled={filteredBills.length === 0}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Search: &ldquo;{searchQuery}&rdquo;
              <button onClick={() => setSearchQuery("")} className="hover:text-blue-900">
                ×
              </button>
            </span>
          )}
          {selectedCategory !== "All" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory("All")} className="hover:text-green-900">
                ×
              </button>
            </span>
          )}
          {(searchQuery || selectedCategory !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredBills.length}</span> of{" "}
          <span className="font-semibold text-gray-900">{dateFilteredBills.length}</span> bills
          {selectedFilter !== "All Time" && (
            <> for <span className="font-medium text-blue-600">{formatDateCaption(selectedFilter, customStartDate, customEndDate)}</span></>
          )}
        </div>
        {filteredBills.length > 0 && (
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold text-green-600">
              {formatCurrency(dateFilteredBills.reduce((sum, b) => sum + (parseFloat(getBillValue(b, "amount")) || 0), 0))}
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading bills...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 text-lg mb-2">⚠️</p>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left">
                  <th className="p-6 w-12">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Date</th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Vendor Name</th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Vendor Category</th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Quantity</th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Amount</th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Amount Paid</th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Balance</th>
                  <th className="p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Receipt className="w-12 h-12" />
                        <p className="text-lg font-medium">No bills found</p>
                        <p className="text-sm">
                          {searchQuery || selectedCategory !== "All"
                            ? "Try adjusting your search or filters"
                            : "No bill data available"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill, index) => {
                    if (!bill) return null;
                    const date = getBillValue(bill, "date", "created_at");
                    const vendorName = getBillValue(bill, "vendor_name", "vendor", "supplier");
                    const vendorCategory = getBillValue(bill, "vendor_category", "vendor_category_obj.name", "category");
                    const quantity = getBillValue(bill, "quantity");
                    const amount = getBillValue(bill, "amount");
                    const amountPaid = getBillValue(bill, "amount_paid");
                    const balance = getBillValue(bill, "balance");
                    return (
                      <tr
                        key={bill.id || index}
                        className="hover:bg-gray-50/50 transition-colors duration-150 group"
                      >
                        <td className="p-6 w-12">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 group-hover:border-gray-400"
                          />
                        </td>
                        <td className="p-6">
                          <div className="text-sm text-gray-600">
                            {date ? new Date(date).toLocaleDateString() : "-"}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="font-medium text-gray-900">{vendorName || "-"}</div>
                        </td>
                        <td className="p-6">
                          <div className="text-sm text-gray-600">{vendorCategory || "-"}</div>
                        </td>
                        <td className="p-6">
                          <div className="text-sm text-gray-900">{quantity ?? "-"}</div>
                        </td>
                        <td className="p-6">
                          <div className="font-bold text-gray-900 text-lg">{formatCurrency(amount)}</div>
                        </td>
                        <td className="p-6">
                          <div className="text-sm text-gray-600">{formatCurrency(amountPaid)}</div>
                        </td>
                        <td className="p-6">
                          <div className={`font-medium ${parseFloat(balance || 0) > 0 ? "text-red-600" : "text-green-600"}`}>
                            {formatCurrency(balance)}
                          </div>
                        </td>
                        <td className="p-6">
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillsReport;
