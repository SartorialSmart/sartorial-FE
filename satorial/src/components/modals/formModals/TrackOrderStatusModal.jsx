import { X } from "lucide-react";
import TrackOrderStatus from "../../entityData/orderData.jsx/TrackOrderStatus";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const TrackOrderStatusModal = ({ isOpen, onClose, currentStatus, orderId }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 overflow-y-auto py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* Centered container that handles vertical spacing */}
          <div className="min-h-full flex items-center justify-center p-4">
            <motion.div
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-500 hover:text-gray-700 rounded-full p-2 backdrop-blur-sm border border-gray-200 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
              >
                <X size={18} />
              </button>

              {/* Scrollable content with max height */}
              <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
                <TrackOrderStatus 
                  currentStatus={currentStatus} 
                  onClose={onClose} 
                  orderId={orderId}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrackOrderStatusModal;