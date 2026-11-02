import { X } from "lucide-react";
import TrackOrderStatus from "../../entityData/orderData.jsx/TrackOrderStatus";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import PropTypes from "prop-types";

const TrackOrderStatusModal = ({ isOpen, onClose, currentStatus, orderId, isReadyMade }) => {
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto py-8"
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
                className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>

              {/* Scrollable content with max height */}
              <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
                <TrackOrderStatus 
                  currentStatus={currentStatus} 
                  onClose={onClose} 
                  orderId={orderId}
                  isReadyMade={isReadyMade}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

TrackOrderStatusModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentStatus: PropTypes.string,
  orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isReadyMade: PropTypes.bool,
};

export default TrackOrderStatusModal;
