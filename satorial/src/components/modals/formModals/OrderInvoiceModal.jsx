import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import OrderInvoice from "../../entityData/orderData.jsx/OrderInvoice";

const OrderInvoiceModal = ({ isOpen, onClose, order, onSave }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 sm:p-6 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg w-full max-w-md relative flex flex-col"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            {/* Modal Content */}
            <div className="p-6">
              <OrderInvoice order={order} onClose={onClose} onSave={onSave} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderInvoiceModal;
