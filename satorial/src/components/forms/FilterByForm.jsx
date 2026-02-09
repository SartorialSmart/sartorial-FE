import { useState } from "react";
import PropTypes from "prop-types";

const FilterByForm = ({ options, onFilterChange }) => {
  const [selectedOption, setSelectedOption] = useState(options[0].value);

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
    onFilterChange(event.target.value);
  };

  return (
    <div className="relative">
      <select
        className="w-full p-2 border rounded-lg bg-white text-gray-700 cursor-pointer"
        value={selectedOption}
        onChange={handleChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

FilterByForm.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default FilterByForm;
