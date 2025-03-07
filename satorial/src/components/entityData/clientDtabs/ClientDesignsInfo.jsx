import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import ClientService from "../../../services/ClientService";

const ClientDesignsInfo = ({ clientId }) => {
  const [designs, setDesigns] = useState([]);
  const [newDesigns, setNewDesigns] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

  const handleSave = async () => {
    if (!clientId || newDesigns.length === 0) {
      console.error("No new images to upload.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      newDesigns.forEach((design) => formData.append("images", design.file));
      formData.append("client", clientId);

      const uploadedImages = await ClientService.uploadStyleImage(formData);
      const newImages = Array.isArray(uploadedImages) ? uploadedImages : [uploadedImages];

      setDesigns((prevDesigns) => [
        ...prevDesigns,
        ...newImages.map((img) => ({
          id: img.id,
          image: img.image,
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
    const confirmDelete = window.confirm("Are you sure you want to delete this image?");
    if (!confirmDelete) return;

    try {
      await ClientService.deleteStyleImage(imageId);
      setDesigns((prev) => prev.filter((design) => design.id !== imageId));
    } catch (error) {
      console.error("Error deleting design:", error);
    }
  };

  return (
    <div className="p-6 bg-white h-auto rounded-xl">
      {/* Design Display Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {[...designs, ...newDesigns].map((design, index) => (
          <div key={index} className="relative bg-white p-4 rounded-lg shadow">
            <img
              src={design.preview || design.image.replace("image/upload/", "")}
              alt={`Design ${index + 1}`}
              className="w-full h-40 object-cover rounded-md"
            />

            <p className="mt-2 text-center text-gray-700">Design {index + 1}</p>

            {design.id && (
              <button
                className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white hover:bg-red-600"
                onClick={() => handleDelete(design.id)}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
      {showConfirmation && (
        <div className="mt-4 p-4 bg-gray-50 border border-red-500 rounded-lg shadow">
          <p className="text-gray-800">You've selected new designs. What would you like to do?</p>
          <div className="mt-2 flex space-x-4">
            <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600" onClick={() => setShowConfirmation(false)}>Add More</button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Proceed"}</button>
          </div>
        </div>
      )}
      {/* Upload Section */}
      <div
        className={`mt-6 p-4 bg-white rounded-lg shadow-md flex flex-col items-center border-2 border-dashed ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="text-gray-700">Upload</p>
        <label className="w-full p-6 text-center rounded-lg cursor-pointer hover:bg-gray-50">
          {dragging ? "Drop files here" : "Click or drag files to upload"}
          <input type="file" multiple onChange={handleFileUpload} className="hidden" disabled={isSaving} />
        </label>
      </div>
      
      
    </div>
  );
};

export default ClientDesignsInfo;
