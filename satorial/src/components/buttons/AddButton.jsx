import { User } from "lucide-react";
import PropTypes from "prop-types";

const AddButton = ({ text, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow ${className || ""}`}
    >
      <User size={16} />
      {text}
    </button>
  );
};

AddButton.propTypes = {
  text: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default AddButton;
