import React from "react";
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
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[60] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center"
        >
          {/* Icon Container */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="relative flex justify-center mb-6"
          >
            <div className={`w-20 h-20 ${config.bgColor} rounded-full flex items-center justify-center shadow-lg`}>
              <Icon className="text-white w-10 h-10" />
            </div>

            {/* Decorative elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute -top-2 left-4 text-blue-400 text-lg">✦</div>
              <div className="absolute -top-3 right-8 text-yellow-400 text-xs">✹</div>
              <div className="absolute top-6 left-2 text-purple-400 text-sm">◌</div>
              <div className="absolute bottom-4 right-4 text-pink-400 text-xs">∗</div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className={`text-2xl font-bold ${config.textColor} mb-2`}>
              {title}
            </h2>

            {message && (
              <p className="text-gray-600 mb-6 leading-relaxed">
                {message}
              </p>
            )}

            <button
              onClick={onClose}
              className={`w-full ${config.bgColor} text-white px-6 py-3 rounded-lg ${config.hoverColor} transition-colors font-medium text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all`}
            >
              {buttonText}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SuccessModal;