const InputField = ({ label, name, value, onChange, readOnly, icon }) => (
    <div>
      <label className="block text-gray-600">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-3">{icon}</span>}
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          className="w-full p-2 border rounded-lg"
        />
      </div>
    </div>
  );

export default InputField
  