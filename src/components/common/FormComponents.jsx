// components/common/FormComponents.jsx

import React from "react";
import { AlertCircle } from "lucide-react";
import PropTypes from "prop-types";

export const FormSection = ({ title, description, children }) => (
  <div className="space-y-4">
    {title && (
      <div className="border-b pb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
    )}
    {children}
  </div>
);

FormSection.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  icon: Icon,
}) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Icon size={18} className="text-gray-400" />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2.5 ${Icon ? "pl-10" : ""} border rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          transition-colors ${error ? "border-red-500" : "border-gray-300"}
          ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
        `}
      />
    </div>
    {error && (
      <p className="text-sm text-red-600 flex items-center gap-1">
        <AlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
);

InputField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.elementType,
};

export const TextAreaField = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  rows = 3,
}) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <textarea
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-4 py-2.5 border rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
        transition-colors resize-none ${error ? "border-red-500" : "border-gray-300"}
      `}
    />
    {error && (
      <p className="text-sm text-red-600 flex items-center gap-1">
        <AlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
);

TextAreaField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  rows: PropTypes.number,
};

export const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  placeholder = "Select an option",
  required = false,
  disabled = false,
}) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-2.5 border rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
        transition-colors ${error ? "border-red-500" : "border-gray-300"}
        ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
      `}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-sm text-red-600 flex items-center gap-1">
        <AlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
);

SelectField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

export const FileUpload = ({
  label,
  name,
  onChange,
  accept,
  preview,
  error,
  required = false,
}) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="flex items-center gap-4">
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
        />
      )}
      <div className="flex-1">
        <label
          htmlFor={name}
          className="inline-flex items-center px-4 py-2 border border-gray-300 
            rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white 
            hover:bg-gray-50 cursor-pointer transition-colors"
        >
          Choose File
        </label>
        <input
          id={name}
          name={name}
          type="file"
          accept={accept}
          onChange={onChange}
          className="hidden"
        />
      </div>
    </div>
    {error && (
      <p className="text-sm text-red-600 flex items-center gap-1">
        <AlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
);

FileUpload.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  accept: PropTypes.string,
  preview: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
};