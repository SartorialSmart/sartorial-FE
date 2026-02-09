import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import OrderInvoice from "../../entityData/orderData.jsx/OrderInvoice";
import PropTypes from "prop-types";

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
          {/* Remove the inner motion.div wrapper since OrderInvoice handles its own modal */}
          <OrderInvoice order={order} onClose={onClose} onSave={onSave} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

OrderInvoiceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.object,
  onSave: PropTypes.func,
};

export default OrderInvoiceModal;
