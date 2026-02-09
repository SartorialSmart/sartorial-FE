import { X } from "lucide-react";
import AddBillPaymentForm from "../../forms/billForms/AddBillPaymentForm";
import { motion, AnimatePresence } from "framer-motion";

const AddBillPaymentFormModal = ({ isOpen, onClose, bill, onSuccess }) => {
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
            className="bg-transparent rounded-lg w-full max-w-md relative flex flex-col max-h-[90vh] overflow-hidden"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <X size={20} />
            </button>

            <div className="flex-1 overflow-y-auto">
              <AddBillPaymentForm
                bill={bill}
                onClose={onClose}
                onSuccess={onSuccess}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddBillPaymentFormModal;
