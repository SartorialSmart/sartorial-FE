import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

const SuccessModal = ({ title, message, buttonText = "Close", onClose, isError = false }) => {
  const modalColor = isError ? "bg-red-600" : "bg-blue-600";
  const iconColor = isError ? "text-red-600" : "text-blue-600";
  const textColor = isError ? "text-red-900" : "text-gray-900";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-white rounded-2xl shadow-xl p-6 w-96 text-center"
      >
        <div className="relative flex justify-center mb-4">
          <div className={`w-20 h-20 ${modalColor} rounded-full flex items-center justify-center`}>
            {isError ? <XCircle className="text-white w-12 h-12" /> : <CheckCircle className="text-white w-12 h-12" />}
          </div>

          <div className="absolute -top-2 left-1 text-blue-500 text-lg">✦</div>
          <div className="absolute -top-3 right-5 text-yellow-400 text-xs">✹</div>
          <div className="absolute top-4 left-4 text-blue-400 text-sm">◌</div>
          <div className="absolute bottom-2 right-6 text-red-500 text-xs">∗</div>
        </div>

        <h2 className={`text-xl font-semibold ${textColor}`}>{title}</h2>

        {message && <p className="text-gray-600 mt-2">{message}</p>}

        <button
          onClick={onClose}
          className={`mt-5 w-full ${modalColor} text-white px-6 py-2 rounded-lg hover:opacity-90 transition text-lg`}
        >
          {buttonText}
        </button>
      </motion.div>
    </div>
  );
};

export default SuccessModal;
