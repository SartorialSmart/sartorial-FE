import { motion, AnimatePresence } from "framer-motion";
import OrderInvoice from "../../entityData/orderData.jsx/OrderInvoice";
import PropTypes from "prop-types";

const OrderInvoiceModal = ({ isOpen, onClose, order, onSave }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <OrderInvoice order={order} onClose={onClose} onSave={onSave} />
          </div>
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
