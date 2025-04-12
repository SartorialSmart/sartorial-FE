import { X } from "lucide-react";
import TrackOrderStatus from "../../entityData/orderData.jsx/TrackOrderStatus";
import { motion, AnimatePresence } from "framer-motion";

const TrackOrderStatusModal = ({ isOpen, onClose, billId }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 sm:p-6 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {/* Modal */}
            <motion.div
              className="rounded-lg w-full max-w-3xl relative flex flex-col max-h-[90vh]"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <TrackOrderStatus billId={billId} onClose={onClose} />
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TrackOrderStatusModal;