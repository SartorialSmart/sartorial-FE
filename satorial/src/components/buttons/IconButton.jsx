import React from "react";
import PropTypes from "prop-types";

const IconButton = ({ icon: Icon, text, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
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
