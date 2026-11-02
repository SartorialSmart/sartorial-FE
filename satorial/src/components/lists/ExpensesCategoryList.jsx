import { useEffect, useState } from "react";
import { MoreVertical, Search, Plus, Edit, Trash2, Eye, Loader2, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ExpenseCategoryFormModal from "../modals/formModals/ExpenseCategoryFormModal";
import ExpensescategoryService from "../../services/expensesServices/ExpensesCategoryService";
import SuccessModal from "../modals/SuccessModal";

const ExpensesCategoryList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const fetchExpenseCategories = async () => {
    try {
      setLoading(true);
      const response = await ExpensescategoryService.getExpenseCategoriesList();
      const data = Array.isArray(response) ? response : response.results || [];
      setExpenseCategories(data);
    } catch (err) {
      console.error("Failed to fetch expense categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseCategories();
  }, []);

  // Filter categories based on search term
  const filteredCategories = expenseCategories.filter((category) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      category.name?.toLowerCase().includes(searchLower) ||
      category.description?.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (category) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await ExpensescategoryService.deleteExpenseCategory(categoryToDelete.id);
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
      fetchExpenseCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return;

    try {
      setBulkActionLoading(true);
      await Promise.all(
        selectedCategories.map(id => ExpensescategoryService.deleteExpenseCategory(id))
      );
      setSelectedCategories([]);
      fetchExpenseCategories();
    } catch (error) {
      console.error("Error deleting categories:", error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleView = (category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
    setActiveMenu(null);
  };

  const handleFormClose = () => {
    setIsModalOpen(false);
    setCategoryToEdit(null);
  };

  const handleFormSuccess = () => {
    fetchExpenseCategories();
  };

  const toggleCategorySelection = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map((c) => c.id));
    }
  };

  const getTotalExpenses = () => {
    return expenseCategories.reduce((sum, cat) => sum + (cat.expense_count || 0), 0);
  };

  const getStatusColor = (expenseCount) => {
    if (expenseCount > 0) return "text-green-600 bg-green-50";
    return "text-gray-600 bg-gray-50";
  };

  const getStatusIcon = (expenseCount) => {
    if (expenseCount > 0) return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
    return <div className="w-2 h-2 bg-gray-300 rounded-full"></div>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Expense Categories</h1>
        <p className="text-gray-600">Manage and organize your expense categories</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Categories</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {expenseCategories.length}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Expenses</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {getTotalExpenses()}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Categories</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {expenseCategories.filter(c => c.expense_count > 0).length}
              </h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'} selected
                </span>
              </div>
              <button
                onClick={() => setSelectedCategories([])}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear selection
              </button>
            </div>
            <button
              onClick={handleBulkDelete}
              disabled={bulkActionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkActionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete Selected
            </button>
          </div>
        </motion.div>
      )}

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCategoryToEdit(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      filteredCategories.length > 0 &&
                      selectedCategories.length === filteredCategories.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. of Expenses
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm">
                      {searchTerm ? `No categories found matching "${searchTerm}"` : "No categories found"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try adding a new category
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category, index) => (
                  <motion.tr
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategorySelection(category.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(category.expense_count)}
                        <span className="text-xs font-medium">
                          {category.expense_count > 0 ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-800">
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:truncate-none">
                        {category.description || <span className="text-gray-400 italic">No description</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${getStatusColor(category.expense_count)}`}>
                        {category.expense_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Always visible action buttons */}
                        <button
                          onClick={() => handleView(category)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group/tooltip relative"
                          title="View Details"
                        >
                          <Eye size={18} />
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            View Details
                          </span>
                        </button>
                        
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors group/tooltip relative"
                          title="Edit"
                        >
                          <Edit size={18} />
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Edit
                          </span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setCategoryToDelete(category);
                            setShowDeleteConfirm(true);
                          }}
                          disabled={category.expense_count > 0}
                          className={`p-2 rounded-lg transition-colors group/tooltip relative ${
                            category.expense_count > 0
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                          }`}
                          title={category.expense_count > 0 ? "Cannot delete - has expenses" : "Delete"}
                        >
                          <Trash2 size={18} />
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {category.expense_count > 0 ? "Cannot delete - has expenses" : "Delete"}
                          </span>
                        </button>

                        {/* Additional dropdown menu for more actions */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenu(activeMenu === category.id ? null : category.id)
                            }
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <MoreVertical size={18} />
                          </button>

                          <AnimatePresence>
                            {activeMenu === category.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                              >
                                <button
                                  onClick={() => {
                                    handleView(category);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye size={16} />
                                  View Full Details
                                </button>
                                <button
                                  onClick={() => {
                                    handleEdit(category);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Edit size={16} />
                                  Quick Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setCategoryToDelete(category);
                                    setShowDeleteConfirm(true);
                                    setActiveMenu(null);
                                  }}
                                  disabled={category.expense_count > 0}
                                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                                    category.expense_count > 0
                                      ? "text-gray-400 cursor-not-allowed bg-gray-50"
                                      : "text-red-600 hover:bg-red-50"
                                  }`}
                                >
                                  <Trash2 size={16} />
                                  {category.expense_count > 0 ? "Cannot Delete" : "Delete Permanently"}
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination/Info Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {filteredCategories.length} of {expenseCategories.length} categories
            </div>
            <div className="flex items-center gap-2">
              {selectedCategories.length > 0 && (
                <span className="text-sm text-blue-600 font-medium">
                  {selectedCategories.length} selected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <ExpenseCategoryFormModal
        isOpen={isModalOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        categoryToEdit={categoryToEdit}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <SuccessModal
          title={
            categoryToDelete?.expense_count > 0
              ? "Cannot Delete Category"
              : "Delete Category?"
          }
          message={
            categoryToDelete?.expense_count > 0
              ? `This category has ${categoryToDelete.expense_count} associated expenses. Please reassign or delete these expenses before deleting the category.`
              : "Are you sure you want to delete this category? This action cannot be undone."
          }
          buttonText={categoryToDelete?.expense_count > 0 ? "Close" : "Delete"}
          onClose={() => {
            if (categoryToDelete?.expense_count > 0) {
              setShowDeleteConfirm(false);
              setCategoryToDelete(null);
            } else {
              handleDelete();
            }
          }}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setCategoryToDelete(null);
          }}
          showCancel={true}
          cancelText="Cancel"
          isError={true}
        />
      )}

      {/* View Details Modal */}
      <AnimatePresence>
        {showViewModal && selectedCategory && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Category Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Category Name</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {selectedCategory.name}
                    </span>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCategory.expense_count)}`}>
                      {getStatusIcon(selectedCategory.expense_count)}
                      <span>{selectedCategory.expense_count > 0 ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">
                    {selectedCategory.description || "No description provided"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Number of Expenses</p>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedCategory.expense_count || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created Date</p>
                    <p className="text-base text-gray-900 mt-1">
                      {selectedCategory.created_at
                        ? new Date(selectedCategory.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(selectedCategory);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Category
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpensesCategoryList;