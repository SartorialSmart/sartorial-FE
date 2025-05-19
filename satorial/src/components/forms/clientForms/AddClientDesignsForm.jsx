import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import ClientService from "../../../services/ClientService";
import SuccessModal from "../../modals/SuccessModal";

const AddClientDesignsForm = ({ onClose, onBack, clientId }) => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    isError: false,
  });

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const previewImages = files.map((file) => ({
      id: URL.createObjectURL(file),
      localUrl: URL.createObjectURL(file),
      uploadedUrl: null,
    }));

    setDesigns((prevDesigns) => [...prevDesigns, ...previewImages]);

    setLoading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append("client", clientId);

    try {
      const uploadedImages = await ClientService.uploadStyleImage(formData);

      if (Array.isArray(uploadedImages)) {
        setDesigns((prevDesigns) =>
          prevDesigns.map((design) => {
            const uploadedImage = uploadedImages.find((img) => design.id === img.id);
            return uploadedImage ? { ...design, uploadedUrl: uploadedImage.image } : design;
          })
        );

        // Show success modal
        setModal({
          show: true,
          title: "Success!",
          message: "Designs uploaded successfully",
          isError: false,
        });

        // Clean up localStorage while preserving tokens
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        Object.keys(localStorage).forEach((key) => {
          if (!["accessToken", "refreshToken"].includes(key)) {
            localStorage.removeItem(key);
          }
        });

        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      setModal({
        show: true,
        title: "Upload Failed",
        message: error.message || "Failed to upload designs. Please try again.",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (designs.length === 0) {
      setModal({
        show: true,
        title: "No Designs",
        message: "Please upload at least one design before saving",
        isError: true,
      });
      return;
    }

    // If you have additional save logic, put it here
    // Otherwise just show success
    setModal({
      show: true,
      title: "Saved!",
      message: "Client designs have been saved successfully",
      isError: false,
    });
  };

  const closeModal = () => {
    setModal({ ...modal, show: false });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg w-full max-w-3xl p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4">
            <X size={20} />
          </button>

          <h2 className="text-2xl font-semibold mb-4">Add Client Designs</h2>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Uploaded Designs</h3>
            <div className="grid grid-cols-3 gap-4">
              {designs.map((design, index) => (
                <div key={design.id || index} className="flex flex-col items-center">
                  <img
                    src={design.uploadedUrl || design.localUrl}
                    alt={`Design ${index + 1}`}
                    className="w-28 h-28 rounded-lg object-cover"
                  />
                  <p className="text-sm text-gray-600 mt-2">Design {index + 1}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 border rounded-lg p-2">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="hidden" 
              id="fileUpload" 
              disabled={loading}
            />
            <label 
              htmlFor="fileUpload" 
              className={`flex-1 ${loading ? 'text-gray-400' : 'text-gray-600 cursor-pointer'}`}
            >
              {loading ? 'Uploading...' : 'Choose files'}
            </label>
            <button 
              className={`${loading ? 'bg-gray-100' : 'bg-gray-200'} px-4 py-1 rounded-lg`}
              disabled={loading}
            >
              <Upload size={16} />
            </button>
          </div>

          {loading && (
            <div className="mt-2 flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading...</span>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button 
              onClick={onBack} 
              className="border border-gray-400 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100"
              disabled={loading}
            >
              Back: Measurements
            </button>
            <button 
              onClick={handleSave} 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              disabled={loading}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Success/Error Modal */}
      {modal.show && (
        <SuccessModal
          title={modal.title}
          message={modal.message}
          isError={modal.isError}
          onClose={closeModal}
          buttonText={modal.isError ? "Try Again" : "Continue"}
        />
      )}
    </>
  );
};

export default AddClientDesignsForm;