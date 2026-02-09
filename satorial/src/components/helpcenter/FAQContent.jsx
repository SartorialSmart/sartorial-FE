import { X } from "lucide-react";
import PropTypes from "prop-types";

const FAQContent = ({ onClose }) => {
  return (
    <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>

      <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto">
        <div>
          <h3 className="font-medium mb-2">How do I create a new order?</h3>
          <p className="text-gray-600">
            Navigate to the Orders section and click on "Create New Order"...
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
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

FAQContent.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default FAQContent;