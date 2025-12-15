import { useState } from "react";

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

export default FilterByForm;
