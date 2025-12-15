import { X } from 'lucide-react';

const PrivacyContent = ({ onClose }) => {
  return (
    <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
      <button 
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
      >
        <X size={20} />
      </button>
      
      <h2 className="text-2xl font-semibold mb-6">Privacy Policy</h2>
      
      <div className="space-y-4 mb-6">
        <p className="text-gray-600">Our privacy policy outlines how we handle and protect your data...</p>
        {/* Add more privacy policy content */}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PrivacyContent;