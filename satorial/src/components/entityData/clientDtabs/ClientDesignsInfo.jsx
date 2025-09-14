import { useState, useEffect } from "react";
import { Trash2, X } from "lucide-react";
import ClientService from "../../../services/ClientService";

const ClientDesignsInfo = ({ clientId }) => {
  const [designs, setDesigns] = useState([]);
  const [newDesigns, setNewDesigns] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchDesigns = async () => {
      if (!clientId) return;
      try {
        const data = await ClientService.getStyleImageById(clientId);
        setDesigns(data);
      } catch (error) {
        console.error("Error fetching client designs:", error);
      }
    };
    fetchDesigns();
  }, [clientId]);

  const handleFileUpload = (event) => {
    const files = event.target.files;
    processFiles(files);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    const files = event.dataTransfer.files;
    processFiles(files);
  };

  const processFiles = (files) => {
    if (files.length > 0) {
      const newFiles = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        description: "", // Initialize with empty description
      }));
      setNewDesigns((prev) => [...prev, ...newFiles]);
      setShowConfirmation(true);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDescriptionChange = (index, description) => {
    setNewDesigns((prev) =>
      prev.map((design, i) =>
        i === index ? { ...design, description } : design
      )
    );
  };

  const handleSave = async () => {
    if (!clientId || newDesigns.length === 0) {
      console.error("No new images to upload.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      newDesigns.forEach((design) => {
        formData.append("images", design.file);
        formData.append("description", design.description || "");
      });
      formData.append("client", clientId);

      const uploadedImages = await ClientService.uploadStyleImage(formData);
      const newImages = Array.isArray(uploadedImages)
        ? uploadedImages
        : [uploadedImages];

      setDesigns((prevDesigns) => [
        ...prevDesigns,
        ...newImages.map((img) => ({
          id: img.id,
          image: img.image,
          description: img.description || "",
          preview: img.image,
        })),
      ]);

      setNewDesigns([]);
      setShowConfirmation(false);
    } catch (error) {
      console.error("Error saving designs:", error);
    }
    setIsSaving(false);
  };

  const handleDelete = async (imageId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this image?"
    );
    if (!confirmDelete) return;

    try {
      await ClientService.deleteStyleImage(imageId);
      setDesigns((prev) => prev.filter((design) => design.id !== imageId));
    } catch (error) {
      console.error("Error deleting design:", error);
    }
  };

  const removeNewDesign = (index) => {
    setNewDesigns((prev) => prev.filter((_, i) => i !== index));
    if (newDesigns.length === 1) {
      setShowConfirmation(false);
    }
  };

  const openImageModal = (imageSrc, description) => {
    setSelectedImage({ src: imageSrc, description });
    setShowModal(true);
  };

  const closeImageModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  return (
    <div className="p-6 bg-white h-auto rounded-xl">
      {/* Existing Designs Display Section */}
      {designs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {designs.map((design, index) => (
            <div
              key={design.id}
              className="relative bg-white p-4 rounded-lg shadow"
            >
              <img
                src={
                  design.preview || design.image.replace("image/upload/", "")
                }
                alt={`Design ${index + 1}`}
                className="w-full h-40 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() =>
                  openImageModal(
                    design.preview || design.image.replace("image/upload/", ""),
                    design.description
                  )
                }
              />

              <div className="mt-2 text-center">
                {design.description && (
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {design.description}
                  </p>
                )}
              </div>

              <button
                className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white hover:bg-red-600"
                onClick={() => handleDelete(design.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New Designs with Description Input */}
      {newDesigns.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            New Designs to Upload
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {newDesigns.map((design, index) => (
              <div
                key={index}
                className="relative bg-gray-50 p-4 rounded-lg border"
              >
                <img
                  src={design.preview}
                  alt={`New Design ${index + 1}`}
                  className="w-full h-40 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    openImageModal(design.preview, design.description)
                  }
                />

                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900 text-center mb-2">
                    {design.description || `New Design ${index + 1}`}
                  </p>
                  <textarea
                    value={design.description}
                    onChange={(e) =>
                      handleDescriptionChange(index, e.target.value)
                    }
                    placeholder="Enter description for this design..."
                    className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <button
                  className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white hover:bg-red-600"
                  onClick={() => removeNewDesign(index)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Section */}
      {showConfirmation && (
        <div className="mt-4 p-4 bg-gray-50 border border-blue-500 rounded-lg shadow">
          <p className="text-gray-800">
            You've selected {newDesigns.length} new design
            {newDesigns.length > 1 ? "s" : ""}. Add descriptions above and
            choose what to do next:
          </p>
          <div className="mt-2 flex space-x-4">
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              onClick={() => setShowConfirmation(false)}
            >
              Add More
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save All Designs"}
            </button>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div
        className={`mt-6 p-4 bg-white rounded-lg shadow-md flex flex-col items-center border-2 border-dashed ${
          dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="text-gray-700 font-medium">Upload New Designs</p>
        <label className="w-full p-6 text-center rounded-lg cursor-pointer hover:bg-gray-50">
          {dragging ? "Drop files here" : "Click or drag files to upload"}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isSaving}
          />
        </label>
      </div>

      {/* Image Modal */}
      {showModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <button
              className="absolute top-4 right-4 bg-red-500 p-2 rounded-full text-white hover:bg-red-600 z-10"
              onClick={closeImageModal}
            >
              <X size={20} />
            </button>
            <div className="p-6">
              <img
                src={selectedImage.src}
                alt="Design preview"
                className="w-full h-auto max-h-[70vh] object-contain rounded-md"
              />
              {selectedImage.description && (
                <div className="mt-4 text-center">
                  <p className="text-lg font-medium text-gray-900">
                    {selectedImage.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDesignsInfo;
