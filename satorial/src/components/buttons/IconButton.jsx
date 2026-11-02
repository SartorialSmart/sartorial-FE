import PropTypes from "prop-types";

const IconButton = ({ icon: Icon, text, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${className || ""}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{text}</span>
    </button>
  );
};

IconButton.propTypes = {
  icon: PropTypes.elementType,
  text: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default IconButton;
