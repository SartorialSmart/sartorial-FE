import { Plus } from "lucide-react";
import PropTypes from "prop-types";

const AddButton = ({ text, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={
        className ||
        "flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      }
    >
      <Plus size={16} />
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
