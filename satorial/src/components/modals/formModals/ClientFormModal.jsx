import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, Ruler, Palette, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddClientForm from "../../forms/clientForms/AddClientForm";
import AddClientMeasurementForm from "../../forms/clientForms/AddClientMeasurementForm";
import AddClientDesignsForm from "../../forms/clientForms/AddClientDesignsForm";
import PropTypes from "prop-types";

const steps = [
  { label: "Details", icon: User },
  { label: "Measurements", icon: Ruler },
  { label: "Designs", icon: Palette },
];

const ClientFormModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [clientId, setClientId] = useState(null);
  const [clientGender, setClientGender] = useState(null);
  const [clientUnit, setClientUnit] = useState("cm");

  // Load clientId from localStorage on mount
  useEffect(() => {
    const storedClientId = localStorage.getItem("clientId");
    if (storedClientId && storedClientId !== "null") {
      setClientId(storedClientId);
    }
  }, []);

  const handleNext = (newClientId, gender, unit) => {
    if (newClientId) {
      setClientId(newClientId);
      localStorage.setItem("clientId", newClientId);
    }
    if (gender) {
      setClientGender(gender);
    }
    if (unit) {
      setClientUnit(unit);
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleClose = () => {
    setStep(1);
    setClientId(null);
    localStorage.removeItem("clientId");
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl relative flex flex-col max-h-[90vh] overflow-hidden"
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between max-w-md mx-auto">
                {steps.map((s, index) => {
                  const stepNum = index + 1;
                  const isActive = step === stepNum;
                  const isCompleted = step > stepNum;
                  const Icon = s.icon;

                  return (
                    <div key={s.label} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                            isCompleted
                              ? "bg-green-500 text-white"
                              : isActive
                              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          {isCompleted ? (
                            <Check size={16} strokeWidth={3} />
                          ) : (
                            <Icon size={16} />
                          )}
                        </div>
                        <span
                          className={`text-xs mt-1.5 font-medium ${
                            isActive
                              ? "text-blue-600"
                              : isCompleted
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-colors duration-200 ${
                            step > stepNum ? "bg-green-500" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {step === 1 && (
                <AddClientForm onNext={handleNext} onClose={handleClose} />
              )}
              {step === 2 && (
                <AddClientMeasurementForm
                  clientId={clientId}
                  gender={clientGender}
                  unit={clientUnit}
                  onBack={handleBack}
                  onNext={handleNext}
                  onClose={handleClose}
                />
              )}
              {step === 3 && (
                <AddClientDesignsForm
                  clientId={clientId}
                  onBack={handleBack}
                  onClose={handleClose}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

ClientFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ClientFormModal;
