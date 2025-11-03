import { useState } from "react";
import { X, Upload } from "lucide-react";
import ClientService from "../../../services/ClientService";
import { useClient } from "../../../contexts/ClientContext";
import SuccessModal from "../../modals/SuccessModal";
import PropTypes from "prop-types";

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

      // Enhanced debug logging
      console.log("=== FormData Debug ===");
      console.log("Client ID being sent:", clientId);
      console.log("Client ID type:", typeof clientId);
      console.log("Files to upload:", processedFiles.length);
      console.log("All FormData entries:");
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(
            `${pair[0]}: File - ${pair[1].name} (${pair[1].size} bytes)`
          );
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      // Verify client field is actually there
      console.log("Client field from FormData:", formData.get("client"));
      console.log("Has client field:", formData.has("client"));

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
      console.error("Error processing images:", error, error.response?.data);
      setModal({
        show: true,
        title: "Upload Failed",
        message:
          error.response?.data?.message ||
          error.response?.data?.upload_error ||
          error.message ||
          "Failed to process images. Please try again.",
        isError: true,
      });
    } finally {
      setLoading(false);
      // Clear the file input
      event.target.value = "";
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
    refreshClients();
    setModal({
      show: true,
      title: "Saved!",
      message: "Client designs have been saved successfully",
      isError: false,
    });
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
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 z-10">
            <X size={20} />
          </button>

          <h2 className="text-2xl font-semibold mb-4">Add Client Designs</h2>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Uploaded Designs</h3>
            {designs.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {designs.map((design, index) => (
                  <div
                    key={design.id || index}
                    className="flex flex-col items-center relative group"
                  >
                    <img
                      src={design.uploadedUrl || design.localUrl}
                      alt={`Design ${index + 1}`}
                      className="w-28 h-28 rounded-lg object-cover"
                      onError={(e) => {
                        console.error("Image failed to load:", e.target.src);
                        e.target.src = "/placeholder-image.png"; // Add a placeholder image
                      }}
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Design {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemoveDesign(design.id)}
                      className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-500 hover:text-white transition group-hover:opacity-100 opacity-70"
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Upload size={48} className="mx-auto mb-4 opacity-50" />
                <p>No designs uploaded yet</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 border rounded-lg p-2">
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
              className={`flex-1 ${
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
                  : "bg-gray-200 cursor-pointer hover:bg-gray-300"
              } px-4 py-1 rounded-lg transition`}
            >
              <Upload size={16} />
            </label>
          </div>

          {loading && (
            <div className="mt-2 flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading and processing images...</span>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={onBack}
              className="border border-gray-400 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              disabled={loading}
            >
              Back: Measurements
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
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

AddClientDesignsForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  clientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export default AddClientDesignsForm;
