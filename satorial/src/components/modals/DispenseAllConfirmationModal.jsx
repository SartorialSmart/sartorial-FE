import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Loader2 } from "lucide-react";

/**
 * Confirmation dialog for dispensing every planned material line of an order
 * at once. Shows what will leave the store before the user commits.
 */
const DispenseAllConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  lineCount = 0,
  totalQuantity = 0,
  totalValue = "",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isLoading ? onClose : undefined}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto p-6"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Send className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Dispense All Materials</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isLoading}
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
              Every planned material line will be handed to the order&apos;s assignee and stock will be deducted for each.
              This cannot be undone.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-2 py-3">
                <p className="text-xs text-gray-500">Lines</p>
                <p className="text-lg font-bold text-gray-900">{lineCount}</p>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-2 py-3">
                <p className="text-xs text-gray-500">Total Qty</p>
                <p className="text-lg font-bold text-gray-900">{totalQuantity}</p>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-2 py-3">
                <p className="text-xs text-gray-500">Value</p>
                <p className="text-lg font-bold text-[#7A5AF8]">{totalValue}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Dispensing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Dispense All
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

DispenseAllConfirmationModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  isLoading: PropTypes.bool,
  lineCount: PropTypes.number,
  totalQuantity: PropTypes.number,
  totalValue: PropTypes.string,
};

export default DispenseAllConfirmationModal;
