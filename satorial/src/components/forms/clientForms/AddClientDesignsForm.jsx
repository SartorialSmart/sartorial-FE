import { useState } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import ClientService from "../../../services/ClientService";
import { useClient } from "../../../contexts/ClientContext";
import SuccessModal from "../../modals/SuccessModal";
import PropTypes from "prop-types";
import { extractErrorMessage } from "../../../../utils/errorUtils";

// Add these constants at the top
const MAX_FILE_SIZE = 1024 * 1024; // 1MB in bytes
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const AddClientDesignsForm = ({ onClose, onBack, clientId }) => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    isError: false,
  });

  const { refreshClients } = useClient();

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > 1200) {
            height *= 1200 / width;
            width = 1200;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(
                new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                })
              );
            },
            "image/jpeg",
            0.6 // compression quality
          );
        };
      };
    });
  };

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("Invalid file type. Only JPG and PNG files are allowed.");
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size too large. Maximum size is 1MB.");
    }
    return true;
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (!clientId) {
      setModal({
        show: true,
        title: "Upload Failed",
        message: "Client ID is missing. Please refresh and try again.",
        isError: true,
      });
      return;
    }

    try {
      // Validate and compress files
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          validateFile(file);
          return await compressImage(file);
        })
      );

      setLoading(true);

      // Create FormData with client ID
      const formData = new FormData();
      processedFiles.forEach((file) => formData.append("images", file));
      formData.append("client", clientId);

      // Use your existing service method
      const uploadedImages = await ClientService.uploadStyleImage(formData);

      // Use backend's returned images for preview
      if (Array.isArray(uploadedImages)) {
        setDesigns(
          uploadedImages.map((img, idx) => ({
            id: img.id || idx,
            localUrl: img.image, // Use backend image URL
            uploadedUrl: img.image,
          }))
        );
      } else if (uploadedImages && uploadedImages.image) {
        // Single object response
        setDesigns([
          {
            id: uploadedImages.id,
            localUrl: uploadedImages.image,
            uploadedUrl: uploadedImages.image,
          },
        ]);
      } else {
        throw new Error("Invalid response from server");
      }

      setModal({
        show: true,
        title: "Success!",
        message: "Designs uploaded successfully",
        isError: false,
      });
    } catch (error) {
      setModal({
        show: true,
        title: "Upload Failed",
        message: extractErrorMessage(error, "Failed to process images. Please try again."),
        isError: true,
      });
    } finally {
      setLoading(false);
      // Clear the file input
      event.target.value = "";
    }
  };

  const handleSave = () => {
    // Save is allowed regardless of whether designs were uploaded
    refreshClients();
    
    const message = designs.length > 0 
      ? "Client profile with designs has been saved successfully"
      : "Client profile has been saved successfully";
    
    setModal({
      show: true,
      title: "Success!",
      message: message,
      isError: false,
    });
  };

  const handleSkip = () => {
    // Allow skipping design upload entirely
    refreshClients();
    onClose();
  };

  const closeModal = () => {
    setModal({ ...modal, show: false });
    // If it was a success message, close the form too
    if (!modal.isError) {
      refreshClients();
      onClose(); // Close the entire form
    }
  };

  const handleRemoveDesign = async (id) => {
    try {
      // If you have a delete API endpoint, call it here
      // await ClientService.deleteStyleImage(id);
      setDesigns((prev) => prev.filter((design) => design.id !== id));
    } catch (error) {
      console.error("Error removing design:", error);
      setModal({
        show: true,
        title: "Error",
        message: "Failed to remove design. Please try again.",
        isError: true,
      });
    }
  };

  return (
    <>
      <div className="w-full">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold mb-1">Client Designs</h2>
          <p className="text-gray-500 text-sm">
            Upload design images for this client (optional)
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Uploaded Designs</h3>
          {designs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {designs.map((design, index) => (
                <div
                  key={design.id || index}
                  className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                >
                  <img
                    src={design.uploadedUrl || design.localUrl}
                    alt={`Design ${index + 1}`}
                    className="w-full h-28 object-cover"
                    onError={(e) => {
                      console.error("Image failed to load:", e.target.src);
                      e.target.src = "/placeholder-image.png";
                    }}
                  />
                  <div className="px-2 py-1.5 text-center">
                    <p className="text-xs text-gray-500 font-medium">
                      Design {index + 1}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDesign(design.id)}
                    className="absolute top-1.5 right-1.5 bg-white/90 rounded-full p-1 shadow-sm hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <ImageIcon size={40} className="mx-auto mb-2 opacity-40" />
              <p className="font-medium text-sm mb-0.5">No designs uploaded yet</p>
              <p className="text-xs">You can add designs later if needed</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileUpload}
            className="hidden"
            id="fileUpload"
            disabled={loading}
          />
          <label
            htmlFor="fileUpload"
            className={`flex-1 text-sm ${
              loading ? "text-gray-400" : "text-gray-600 cursor-pointer"
            }`}
          >
            {loading
              ? "Uploading..."
              : "Choose files (JPG, PNG - Max 1MB each)"}
          </label>
          <label
            htmlFor="fileUpload"
            className={`${
              loading
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white border border-gray-200 cursor-pointer hover:bg-gray-100"
            } px-3 py-1.5 rounded-lg transition-colors`}
          >
            <Upload size={16} />
          </label>
        </div>

        {loading && (
          <div className="mt-3 flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Uploading and processing images...</span>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 gap-3">
          <button
            onClick={onBack}
            className="border border-gray-300 text-gray-600 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            disabled={loading}
          >
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="border border-gray-300 text-gray-600 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              disabled={loading}
            >
              Skip
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm font-medium"
              disabled={loading}
            >
              {designs.length > 0 ? "Save & Finish" : "Finish"}
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

AddClientDesignsForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  clientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export default AddClientDesignsForm;