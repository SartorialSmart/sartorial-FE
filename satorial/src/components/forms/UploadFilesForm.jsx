import { useState } from "react";
import { Upload } from "lucide-react";

const UploadFilesForm = ({ buttonText = "Upload Files", onUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    onUpload && onUpload(files);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 px-4 py-2 border rounded-lg text-blue-600 border-blue-600 hover:bg-blue-100 cursor-pointer">
        <Upload size={16} />
        {buttonText}
        <input 
          type="file" 
          multiple 
          className="hidden" 
          onChange={handleFileChange} 
        />
      </label>

      {selectedFiles.length > 0 && (
        <ul className="text-gray-700 text-sm">
          {selectedFiles.map((file, index) => (
            <li key={index} className="border p-2 rounded-md bg-gray-50">
              {file.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UploadFilesForm;
