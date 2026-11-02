import React from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const SuccessModal = ({ 
  title, 
  message, 
  buttonText = "Close", 
  onClose, 
  isError = false,
  isWarning = false 
}) => {
  const getConfig = () => {
    if (isError) {
      return {
        bgColor: "bg-red-600",
        iconColor: "text-red-600",
        textColor: "text-red-900",
        Icon: XCircle,
        hoverColor: "hover:bg-red-700"
      };
    }
    if (isWarning) {
      return {
        bgColor: "bg-yellow-600",
        iconColor: "text-yellow-600",
        textColor: "text-yellow-900",
        Icon: AlertTriangle,
        hoverColor: "hover:bg-yellow-700"
      };
    }
    return {
      bgColor: "bg-green-600",
      iconColor: "text-green-600",
      textColor: "text-green-900",
      Icon: CheckCircle,
      hoverColor: "hover:bg-green-700"
    };
  };

  const config = getConfig();
  const Icon = config.Icon;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[60] p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon Container */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-5"
          >
            <div className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center shadow-lg`}>
              <Icon className="text-white w-8 h-8" />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className={`text-xl font-bold ${config.textColor} mb-2`}>
              {title}
            </h2>

            {message && (
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {message}
              </p>
            )}

            <button
              onClick={onClose}
              className={`w-full ${config.bgColor} text-white px-6 py-2.5 rounded-lg ${config.hoverColor} font-medium shadow-md hover:shadow-lg transition-all`}
            >
              {buttonText}
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

SuccessModal.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  buttonText: PropTypes.string,
  onClose: PropTypes.func,
  isError: PropTypes.bool,
  isWarning: PropTypes.bool,
};

export default SuccessModal;