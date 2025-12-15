import { useState, useEffect } from "react";
import {
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  ZoomIn,
  Plus,
  Check,
} from "lucide-react";
import ClientService from "../../../services/ClientService";

const ClientDesignsInfo = ({ clientId }) => {
  const [designs, setDesigns] = useState([]);
  const [newDesigns, setNewDesigns] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
        description: "",
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
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving designs:", error);
    }
    setIsSaving(false);
  };

  const handleDelete = async (imageId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this design?"
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
    <div className="space-y-6">
      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3 animate-fade-in">
          <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Check size={16} className="text-white" />
          </div>
          <p className="text-green-800 font-medium">
            Designs uploaded successfully!
          </p>
        </div>
      )}

      {/* Existing Designs Gallery */}
      {designs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-600 to-pink-700 px-6 py-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <ImageIcon size={20} className="mr-2" />
              Design Gallery
              <span className="ml-3 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                {designs.length} {designs.length === 1 ? "Design" : "Designs"}
              </span>
            </h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {designs.map((design, index) => (
                <div
                  key={design.id}
                  className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={
                        design.preview ||
                        design.image.replace("image/upload/", "")
                      }
                      alt={`Design ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={() =>
                          openImageModal(
                            design.preview ||
                              design.image.replace("image/upload/", ""),
                            design.description
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100"
                      >
                        <ZoomIn size={20} />
                      </button>
                    </div>
                  </div>

                  {design.description && (
                    <div className="p-3 bg-white">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {design.description}
                      </p>
                    </div>
                  )}

                  <button
                    className="absolute top-3 right-3 bg-red-500 p-2 rounded-full text-white hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100"
                    onClick={() => handleDelete(design.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Designs Preview */}
      {newDesigns.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Plus size={20} className="mr-2" />
              New Designs to Upload
              <span className="ml-3 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                {newDesigns.length}
              </span>
            </h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {newDesigns.map((design, index) => (
                <div
                  key={index}
                  className="group relative bg-purple-50 rounded-xl overflow-hidden border-2 border-purple-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={design.preview}
                      alt={`New Design ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={() =>
                          openImageModal(design.preview, design.description)
                        }
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100"
                      >
                        <ZoomIn size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-white">
                    <textarea
                      value={design.description}
                      onChange={(e) =>
                        handleDescriptionChange(index, e.target.value)
                      }
                      placeholder="Add a description..."
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>

                  <button
                    className="absolute top-3 right-3 bg-red-500 p-2 rounded-full text-white hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100"
                    onClick={() => removeNewDesign(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Banner */}
      {showConfirmation && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to upload {newDesigns.length} new design
                {newDesigns.length > 1 ? "s" : ""}?
              </h4>
              <p className="text-gray-700 mb-4">
                Add descriptions to your designs above, then choose what to do
                next.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  className="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all font-medium flex items-center shadow-md"
                  onClick={() => setShowConfirmation(false)}
                >
                  <Plus size={18} className="mr-2" />
                  Add More
                </button>
                <button
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium flex items-center shadow-md disabled:opacity-50"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="mr-2" />
                      Save All Designs
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div
        className={`bg-white rounded-xl shadow-sm border-2 border-dashed overflow-hidden transition-all duration-300 ${
          dragging
            ? "border-pink-500 bg-pink-50 shadow-lg"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-12">
          <label className="flex flex-col items-center cursor-pointer">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all ${
                dragging
                  ? "bg-pink-200 text-pink-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <Upload size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {dragging ? "Drop your files here" : "Upload New Designs"}
            </h3>
            <p className="text-gray-600 mb-4 text-center">
              Drag and drop your design images here, or click to browse
            </p>
            <div className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all font-medium">
              Choose Files
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isSaving}
            />
            <p className="text-sm text-gray-500 mt-4">
              Supports: JPG, PNG, GIF, WebP
            </p>
          </label>
        </div>
      </div>

      {/* Image Modal */}
      {showModal && selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={closeImageModal}
        >
          <div
            className="relative bg-white rounded-2xl max-w-5xl max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 bg-red-500 p-3 rounded-full text-white hover:bg-red-600 z-10 shadow-lg transition-all hover:scale-110"
              onClick={closeImageModal}
            >
              <X size={20} />
            </button>
            <div className="p-6">
              <img
                src={selectedImage.src}
                alt="Design preview"
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
              {selectedImage.description && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-lg text-gray-900">
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