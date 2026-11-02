import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, X } from "lucide-react";
import PropTypes from "prop-types";

const MessageModal = ({ type, message, duration = 5000, onClose }) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.max(prev - 100 / (duration / 100), 0));
    }, 100);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 200);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  const isSuccess = type === "success";
  const Icon = isSuccess ? CheckCircle : XCircle;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.2 }}
          className={`fixed top-4 right-4 max-w-sm w-full rounded-xl shadow-lg border z-50 overflow-hidden ${
            isSuccess
              ? "bg-white border-green-200"
              : "bg-white border-red-200"
          }`}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Icon
                size={20}
                className={`flex-shrink-0 mt-0.5 ${
                  isSuccess ? "text-green-500" : "text-red-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${
                  isSuccess ? "text-green-800" : "text-red-800"
                }`}>
                  {isSuccess ? "Success" : "Error"}
                </p>
                <p className="text-sm text-gray-600 mt-0.5">{message}</p>
              </div>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 200);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <X size={14} className="text-gray-400" />
              </button>
            </div>
          </div>
          <div className="h-1 w-full bg-gray-100">
            <div
              className="h-full rounded-full transition-all duration-100 ease-linear"
              style={{
                width: `${progress}%`,
                backgroundColor: isSuccess ? "#22c55e" : "#ef4444",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

MessageModal.propTypes = {
  type: PropTypes.string,
  message: PropTypes.string,
  duration: PropTypes.number,
  onClose: PropTypes.func,
};

export default MessageModal;
