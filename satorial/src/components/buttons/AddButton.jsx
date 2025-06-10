import { Plus } from "lucide-react";

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

export default AddButton;
