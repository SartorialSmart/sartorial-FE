import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Upload,
  Select,
  Radio,
  DatePicker,
  Input,
  InputNumber,
  Spin,
  message,
} from "antd";
import { Briefcase, CheckCircle, Clock } from "lucide-react";
import StaffService from "../../../services/staffServices/StaffService";
import dayjs from "dayjs";
import PropTypes from "prop-types";

const { Option } = Select;

const StaffDetail = () => {
  const { slug } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [fileList, setFileList] = useState([]);
  const [user, setUser] = useState({ avatar: "" });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await StaffService.getStaffDetail(slug);
        setStaff(data);
        setUser({ avatar: data.avatar_url || data.avatar });
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          department: data.department,
          role: data.role,
          salary: data.salary,
          gender: data.gender,
          employment_date: data.employment_date,
        });
      } catch (error) {
        console.error("Failed to fetch staff detail:", error);
        message.error("Failed to load staff details");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [slug]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const formPayload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          const val =
            key === "employment_date" && value
              ? dayjs(value).format("YYYY-MM-DD")
              : value;
          formPayload.append(key, val);
        }
      });

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formPayload.append("avatar", fileList[0].originFileObj);
        console.log("Appending avatar:", fileList[0].originFileObj);
      }

      // Debug: log FormData keys
      for (let pair of formPayload.entries()) {
        console.log(pair[0] + ":", pair[1]);
      }

      await StaffService.updateStaff(staff.slug, formPayload, true);

      message.success("Staff details updated successfully");
      setIsEditing(false);
      setFileList([]);

      const data = await StaffService.getStaffDetail(slug);
      setStaff(data);
      setUser({ avatar: data.avatar_url || data.avatar });
    } catch (error) {
      console.error("Failed to update staff:", error);
      message.error("Failed to update staff details");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList }) => {
    console.log("Upload fileList:", fileList);
    setFileList(fileList);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="text-center text-red-500 font-semibold text-lg">
        Staff not found
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Staff Details</h1>
      </div>

      {/* Performance Summary */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          Staff Performance Report
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            ["Allocated", "orange", Briefcase],
            ["Completed", "green", CheckCircle],
            ["In Progress", "blue", Clock],
          ].map(([label, color, Icon]) => (
            <div
              key={label}
              className={`bg-${color}-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm`}
            >
              <Icon className={`w-10 h-10 text-${color}-500`} />
              <div>
                <div className="text-2xl font-bold text-gray-800">112</div>
                <div className="text-gray-600">{label} Orders</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Details */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">
          Personal Details
        </h2>

        <div className="flex justify-between items-center mb-6">
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-medium">
              Avatar
            </label>
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Current Avatar"
                className="w-24 h-24 rounded-full object-cover mb-3 border"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3 border">
                No Avatar
              </div>
            )}

            <Upload
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              disabled={!isEditing}
              showUploadList={false}
            >
              {isEditing && (
                <button className="py-2 px-4 border rounded hover:border-orange-500 transition">
                  Click to Upload
                </button>
              )}
            </Upload>
          </div>

          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFileList([]);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-5 rounded-lg shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow-sm"
                >
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-5 rounded-lg shadow-sm flex items-center gap-2 transition"
              >
                Edit
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <InputField
              label="First Name *"
              value={formData.first_name}
              disabled={!isEditing}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
            />
            <InputField
              label="Email Address *"
              value={formData.email}
              disabled={!isEditing}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
            <SelectField
              label="Department *"
              value={formData.department}
              options={["it", "hr", "finance"]}
              disabled={!isEditing}
              onChange={(val) => handleInputChange("department", val)}
            />
            <Input.Password
              placeholder="********"
              disabled={!isEditing}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />
          </div>

          <div className="space-y-6">
            <InputField
              label="Last Name *"
              value={formData.last_name}
              disabled={!isEditing}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
            />
            <InputField
              label="Phone Number *"
              value={formData.phone_number}
              disabled={!isEditing}
              onChange={(e) =>
                handleInputChange("phone_number", e.target.value)
              }
            />
            <SelectField
              label="Role *"
              value={formData.role}
              options={["admin", "manager", "staff"]}
              disabled={!isEditing}
              onChange={(val) => handleInputChange("role", val)}
            />
            <div>
              <label className="block text-gray-700 mb-2">Salary *</label>
              <InputNumber
                className="w-full"
                value={formData.salary}
                onChange={(value) => handleInputChange("salary", value)}
                formatter={(value) =>
                  `₦${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/₦\s?|(,*)/g, "")}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-gray-700 mb-2">
              Employment Date *
            </label>
            <DatePicker
              className="w-full"
              value={
                formData.employment_date
                  ? dayjs(formData.employment_date)
                  : null
              }
              onChange={(date) =>
                handleInputChange("employment_date", date ?? null)
              }
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Gender</label>
            <Radio.Group
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              disabled={!isEditing}
            >
              <Radio value="male">Male</Radio>
              <Radio value="female">Female</Radio>
            </Radio.Group>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, disabled }) => (
  <div>
    <label className="block text-gray-700 mb-2">{label}</label>
    <Input value={value} onChange={onChange} disabled={disabled} />
  </div>
);

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

const SelectField = ({ label, value, onChange, options, disabled }) => (
  <div>
    <label className="block text-gray-700 mb-2">{label}</label>
    <Select
      className="w-full"
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      {options.map((opt) => (
        <Option key={opt} value={opt}>
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </Option>
      ))}
    </Select>
  </div>
);

SelectField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  disabled: PropTypes.bool,
};

export default StaffDetail;
