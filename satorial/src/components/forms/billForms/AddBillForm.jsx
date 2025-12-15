import { useState, useEffect } from "react";
import { 
  X, DollarSign, Package, Hash, User, Tag, Calculator, 
  AlertCircle, Loader2, CheckCircle, TrendingUp 
} from "lucide-react";
import BillsService from "../../../services/BillsService";
import VendorCategoryService from "../../../services/VendorCategoryService";
import VendorService from "../../../services/VendorService";

const AddBillForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    vendor_name: "",
    vendor_category: "",
    item_name: "",
    quantity: "",
    amount: "",
    amount_paid: "",
    balance: "0.00",
  });

  const [vendorCategories, setVendorCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch vendor categories and vendors on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        setError(null);

        // Fetch categories and vendors in parallel
        const [categoriesData, vendorsData] = await Promise.all([
          VendorCategoryService.getCategoriesList(),
          VendorService.getVendorsList()
        ]);

        setVendorCategories(categoriesData || []);
        setVendors(vendorsData || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load vendors and categories. Please try again.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };

      // Recalculate balance when amount or amount_paid changes
      if (name === "amount" || name === "amount_paid") {
        const amount = parseFloat(newFormData.amount) || 0;
        const amountPaid = parseFloat(newFormData.amount_paid) || 0;
        const calculatedBalance = amount - amountPaid;
        newFormData.balance = calculatedBalance >= 0 ? calculatedBalance.toFixed(2) : "0.00";
      }

      return newFormData;
    });

    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.vendor_name) {
      setError("Please select a vendor");
      return false;
    }
    if (!formData.vendor_category) {
      setError("Please select a vendor category");
      return false;
    }
    if (!formData.item_name.trim()) {
      setError("Please enter an item name");
      return false;
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setError("Please enter a valid quantity");
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount");
      return false;
    }
    if (parseFloat(formData.amount_paid) < 0) {
      setError("Amount paid cannot be negative");
      return false;
    }
    if (parseFloat(formData.amount_paid) > parseFloat(formData.amount)) {
      setError("Amount paid cannot exceed total amount");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const billData = {
        vendor_name: formData.vendor_name,
        vendor_category: parseInt(formData.vendor_category, 10),
        item_name: formData.item_name.trim(),
        quantity: parseInt(formData.quantity, 10),
        amount: parseFloat(formData.amount),
        amount_paid: parseFloat(formData.amount_paid) || 0,
        balance: parseFloat(formData.balance),
      };

      await BillsService.createBill(billData);
      
      setSuccess(true);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Close modal after short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to create bill:", err);
      setError(err.response?.data?.message || "Failed to create bill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "₦0.00";
    return `₦${parseFloat(value).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Package size={28} />
                Add New Bill
              </h2>
              <p className="text-blue-100 text-sm mt-1">Create a new bill record</p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-white/20 rounded-full transition-all disabled:opacity-50"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Loading State */}
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading vendors and categories...</p>
            </div>
          ) : success ? (
            // Success State
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Bill Created Successfully!</h3>
              <p className="text-gray-600">Closing...</p>
            </div>
          ) : (
            // Form
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900">Error</h4>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Vendor Information Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="text-blue-600" size={20} />
                  Vendor Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vendor Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vendor Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <select
                        name="vendor_name"
                        value={formData.vendor_name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                        required
                      >
                        <option value="">Select vendor</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.vendor_name}>
                            {vendor.vendor_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Vendor Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vendor Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <select
                        name="vendor_category"
                        value={formData.vendor_category}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                        required
                      >
                        <option value="">Select category</option>
                        {vendorCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Item Information Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="text-purple-600" size={20} />
                  Item Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Item Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="item_name"
                        value={formData.item_name}
                        onChange={handleChange}
                        placeholder="Enter item name"
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="0"
                        min="1"
                        step="1"
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Total Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-green-600" size={20} />
                  Payment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Amount Paid */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount Paid
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="number"
                        name="amount_paid"
                        value={formData.amount_paid}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Balance (Read-only) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Balance
                    </label>
                    <div className="relative">
                      <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="balance"
                        value={formatCurrency(formData.balance)}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 outline-none font-semibold text-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary Card */}
              {formData.amount && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border-2 border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Calculator size={18} className="text-blue-600" />
                    Payment Summary
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(formData.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Amount Paid</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(formData.amount_paid)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Balance Due</p>
                      <p className={`text-lg font-bold ${
                        parseFloat(formData.balance) > 0 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {formatCurrency(formData.balance)}
                      </p>
                    </div>
                  </div>
                  {parseFloat(formData.balance) === 0 && parseFloat(formData.amount) > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm font-medium">
                      <CheckCircle size={16} />
                      Fully Paid
                    </div>
                  )}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        {!loadingData && !success && (
          <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || loadingData}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Create Bill
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AddBillForm;