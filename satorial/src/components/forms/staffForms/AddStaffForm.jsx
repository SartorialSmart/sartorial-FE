import { useState } from "react";
import { X, Upload } from "lucide-react";

const AddStaffForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    password: "**********",
    salary: "",
    employmentDate: "",
    birthdayDate: "",
    gender: "male",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl  w-full max-w-3xl p-6 relative">
        

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X size={22} />
        </button>


        <h2 className="text-xl font-semibold text-gray-900">Add Staff</h2>
        <p className="text-gray-600 mb-4">Personal Details</p>


        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          

          <div className="col-span-2 flex items-center">
            <button type="button" className="flex items-center gap-2 px-4 py-2 text-blue-600 border rounded-md">
              <Upload size={16} /> Upload Picture
            </button>
          </div>


          <div>
            <label className="text-sm font-medium text-gray-700">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>


          <div>
            <label className="text-sm font-medium text-gray-700">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>


          <div>
            <label className="text-sm font-medium text-gray-700">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>


          <div>
            <label className="text-sm font-medium text-gray-700">Phone Number *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>


          <div>
            <label className="text-sm font-medium text-gray-700">Department *</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              <option value="HR">HR</option>
              <option value="Engineering">Engineering</option>
            </select>
          </div>


          <div>
            <label className="text-sm font-medium text-gray-700">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              <option value="Manager">Manager</option>
              <option value="Developer">Developer</option>
            </select>
          </div>


          <div className="relative">
            <label className="text-sm font-medium text-gray-700">Password *</label>
            <input
              type="text"
              name="password"
              value={formData.password}
              readOnly
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button type="button" className="absolute top-8 right-3 text-blue-600">
              Generate
            </button>
          </div>

          {/* Salary */}
          <div>
            <label className="text-sm font-medium text-gray-700">Salary *</label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="₦200,000"
            />
          </div>

          {/* Employment Date */}
          <div>
            <label className="text-sm font-medium text-gray-700">Employment Date *</label>
            <input
              type="date"
              name="employmentDate"
              value={formData.employmentDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Birthday Date */}
          <div>
            <label className="text-sm font-medium text-gray-700">Birthday Date *</label>
            <input
              type="date"
              name="birthdayDate"
              value={formData.birthdayDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Gender */}
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Gender</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                  className="mr-1"
                />
                Male
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                  className="mr-1"
                />
                Female
              </label>
            </div>
          </div>


          <div className="col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddStaffForm;
