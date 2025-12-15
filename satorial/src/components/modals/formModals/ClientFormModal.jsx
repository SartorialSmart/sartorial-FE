import { useState, useEffect } from "react";
import { X } from "lucide-react";
import AddClientForm from "../../forms/clientForms/AddClientForm";
import AddClientMeasurementForm from "../../forms/clientForms/AddClientMeasurementForm";
import AddClientDesignsForm from "../../forms/clientForms/AddClientDesignsForm";

const ClientFormModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [clientId, setClientId] = useState(null);

  // Load clientId from localStorage on mount
  useEffect(() => {
    const storedClientId = localStorage.getItem("clientId");
    if (storedClientId && storedClientId !== "null") {
      setClientId(storedClientId);
    }
  }, []);

  const handleNext = (newClientId) => {
    if (newClientId) {
      setClientId(newClientId);
      localStorage.setItem("clientId", newClientId);
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

  if (!isOpen) return null; // Prevent rendering when modal is closed

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-40"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative">
        <button onClick={handleClose} className="absolute top-4 right-4">
          <X size={20} />
        </button>

        {step === 1 && <AddClientForm onNext={handleNext} onClose={handleClose} />}
        {step === 2 && (
          <AddClientMeasurementForm
            clientId={clientId}
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
    </div>
  );
};

export default ClientFormModal;
