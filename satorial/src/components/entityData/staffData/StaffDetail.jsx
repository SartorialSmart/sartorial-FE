import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Upload, Select, Radio, DatePicker, Input, InputNumber, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import StaffService from "../../../services/StaffService";
import dayjs from "dayjs"; // Replacing moment with dayjs

const { Option } = Select;

const StaffDetail = () => {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await StaffService.getStaffDetail(id);
        setStaff(data);
      } catch (error) {
        console.error("Failed to fetch staff detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!staff) {
    return <div className="text-center text-red-500">Staff not found</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Staff Details</h1>

      {/* Staff Performance Report */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Staff Performance Report</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">112</div>
            <div className="text-gray-600">Allocated Orders</div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">112</div>
            <div className="text-gray-600">Completed Orders</div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">112</div>
            <div className="text-gray-600">In Progress Orders</div>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">Personal Details</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Upload</label>
              <Upload>
                <button className="w-full py-2 px-3 border rounded text-left" icon={<UploadOutlined />}>
                  Click to upload
                </button>
              </Upload>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">First Name *</label>
              <Input defaultValue={staff.first_name} />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Email Address *</label>
              <Input defaultValue={staff.email} />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Department *</label>
              <Select className="w-full" defaultValue={staff.department}>
                <Option value="it">IT</Option>
                <Option value="hr">HR</Option>
                <Option value="finance">Finance</Option>
              </Select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Password *</label>
              <Input.Password placeholder=".........." />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Last Name *</label>
              <Input defaultValue={staff.last_name} />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Phone Number *</label>
              <Input defaultValue={staff.phone_number} />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Role *</label>
              <Select className="w-full" defaultValue={staff.role?.toLowerCase()}>
                <Option value="admin">Admin</Option>
                <Option value="manager">Manager</Option>
                <Option value="staff">Staff</Option>
              </Select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Salary *</label>
              <InputNumber
                className="w-full"
                defaultValue={staff.salary}
                formatter={(value) => `#${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/#\s?|(,*)/g, '')}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Employment Date *</label>
            <DatePicker
              className="w-full"
              defaultValue={staff.employment_date ? dayjs(staff.employment_date) : null}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Gender</label>
            <Radio.Group defaultValue={staff.gender?.toLowerCase()}>
              <Radio value="male">Male</Radio>
              <Radio value="female">Female</Radio>
            </Radio.Group>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetail;
