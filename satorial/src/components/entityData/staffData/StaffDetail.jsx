// components/pages/staff/StaffDetail.jsx

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Upload,
  Select,
  Radio,
  DatePicker,
  Input,
  InputNumber,
  Spin,
  message,
  Tabs,
  Progress,
  Card,
  Statistic,
  Empty,
  Tag,
} from "antd";
import {
  Briefcase,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  DollarSign,
  Award,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import StaffService from "../../../services/staffServices/StaffService";
import StaffReportService from "../../../services/staffServices/StaffReportService";
import OrderService from "../../../services/OrderService";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import SuccessModal from "../../modals/SuccessModal";

const { Option } = Select;
const { TabPane } = Tabs;

// Returns the most recent allocation record per unique order,
// because the performance API emits one entry per allocation event.
const getUniqueRecentOrders = (orders = []) => {
  const seen = new Map();
  orders.forEach((order) => {
    const key =
      order.order_id ||
      order.id ||
      `${order.client_name}-${order.order_title}-${order.order_price}`;
    const existing = seen.get(key);
    const thisTime = order.allocated_at ? new Date(order.allocated_at).getTime() : 0;
    const prevTime = existing?.allocated_at ? new Date(existing.allocated_at).getTime() : 0;
    if (!existing || thisTime > prevTime) {
      seen.set(key, order);
    }
  });
  // Sort descending by allocated_at so we always show the 10 most recent overall
  const uniqueArray = Array.from(seen.values());
  uniqueArray.sort((a, b) => {
    const timeA = a.allocated_at ? new Date(a.allocated_at).getTime() : 0;
    const timeB = b.allocated_at ? new Date(b.allocated_at).getTime() : 0;
    return timeB - timeA;
  });
  return uniqueArray.slice(0, 10);
};

const StaffDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [staff, setStaff] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [fileList, setFileList] = useState([]);
  const [user, setUser] = useState({ avatar: "" });
  const [successModal, setSuccessModal] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
    end_date: dayjs().format('YYYY-MM-DD'),
  });

  useEffect(() => {
    fetchStaffData();
  }, [slug]);

  useEffect(() => {
    if (staff?.id) {
      fetchPerformanceData();
    }
  }, [staff?.id, dateRange]);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
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
        staff_role: data.staff_role,
        salary: data.salary,
        gender: data.gender,
        employment_date: data.employment_date,
        birthday_date: data.birthday_date,
        address: data.address || "",
      });
    } catch (error) {
      console.error("Failed to fetch staff detail:", error);
      message.error("Failed to load staff details");
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      setPerformanceLoading(true);

      // Fetch performance metrics (date-range-scoped) AND all-time order history
      // for this staff member in parallel.
      const [data, allTimeData] = await Promise.all([
        StaffReportService.getStaffPerformanceDetail(staff.id, dateRange),
        StaffReportService.getStaffPerformanceDetail(staff.id, {
          start_date: "2000-01-01",
          end_date: "2099-12-31"
        }).catch(() => null),
      ]);

      // API may return data directly or wrapped in a `data` field — handle both
      const perfData = data?.data || data;
      
      // Use the all-time history if available so we see all orders ever assigned,
      // otherwise fall back to the date-scoped history.
      const allTimeHistory = allTimeData?.data?.order_history || allTimeData?.order_history || [];
      const historyOrders = allTimeHistory.length > 0 ? allTimeHistory : (perfData?.order_history ?? []);

      setPerformance({
        ...perfData,
        order_history: historyOrders,
      });
    } catch (error) {
      console.error("Failed to fetch performance data:", error);
      message.error("Failed to load performance data");
    } finally {
      setPerformanceLoading(false);
    }
  };

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
            (key === "employment_date" || key === "birthday_date") && value
              ? dayjs(value).format("YYYY-MM-DD")
              : value;
          formPayload.append(key, val);
        }
      });

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formPayload.append("avatar", fileList[0].originFileObj);
      }

      await StaffService.updateStaff(staff.slug, formPayload, true);

      setSuccessModal({
        title: "Staff Updated",
        message: "Staff details have been updated successfully.",
        buttonText: "Done",
      });
      setIsEditing(false);
      setFileList([]);

      await fetchStaffData();
    } catch (error) {
      console.error("Failed to update staff:", error);
      message.error("Failed to update staff details");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleDateRangeChange = (start, end) => {
    setDateRange({
      start_date: start ? dayjs(start).format('YYYY-MM-DD') : dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
      end_date: end ? dayjs(end).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'green',
      'In Progress': 'blue',
      'Pending': 'orange',
      'Assigned': 'purple',
      'On Delivery': 'cyan',
      'Cancelled': 'red',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="text-center text-red-500 font-semibold text-lg p-8">
        Staff not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/staff')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Staff Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {staff.first_name?.[0]}{staff.last_name?.[0]}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {staff.first_name} {staff.last_name}
                </h1>
                <p className="text-gray-600">
                  {staff.staff_role} • {staff.department}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing && (
              <button
                onClick={() => fetchPerformanceData()}
                disabled={performanceLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} className={performanceLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            )}
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFileList([]);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <Tabs defaultActiveKey="1" className="bg-white rounded-xl shadow-sm p-6">
        {/* Performance Tab */}
        <TabPane tab="Performance" key="1">
          <div className="space-y-6">
            {/* Date Range Filter */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
              <Calendar size={20} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Date Range:</span>
              <DatePicker
                value={dayjs(dateRange.start_date)}
                onChange={(date) => handleDateRangeChange(date, dateRange.end_date)}
                format="YYYY-MM-DD"
              />
              <span className="text-gray-500">to</span>
              <DatePicker
                value={dayjs(dateRange.end_date)}
                onChange={(date) => handleDateRangeChange(dateRange.start_date, date)}
                format="YYYY-MM-DD"
              />
            </div>

            {performanceLoading ? (
              <div className="flex justify-center py-12">
                <Spin size="large" />
              </div>
            ) : performance ? (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="border-l-4 border-l-orange-500">
                      <Statistic
                        title="Total Assigned"
                        value={performance.total_assigned || 0}
                        prefix={<Briefcase className="text-orange-500" />}
                      />
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="border-l-4 border-l-green-500">
                      <Statistic
                        title="Completed"
                        value={performance.completed_orders || 0}
                        prefix={<CheckCircle className="text-green-500" />}
                      />
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="border-l-4 border-l-blue-500">
                      <Statistic
                        title="In Progress"
                        value={performance.in_progress_orders || 0}
                        prefix={<Clock className="text-blue-500" />}
                      />
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="border-l-4 border-l-red-500">
                      <Statistic
                        title="Reassigned"
                        value={performance.reassigned_orders || 0}
                        prefix={<AlertTriangle className="text-red-500" />}
                      />
                    </Card>
                  </motion.div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card title="Completion Rate" className="shadow-sm">
                    <div className="space-y-4">
                      <Progress
                        percent={performance.completion_rate || 0}
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                        format={(percent) => `${percent}%`}
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{performance.completed_orders || 0} Completed</span>
                        <span>{performance.total_assigned || 0} Total</span>
                      </div>
                    </div>
                  </Card>

                  <Card title="Reassignment Rate" className="shadow-sm">
                    <div className="space-y-4">
                      <Progress
                        percent={performance.reassignment_rate || 0}
                        strokeColor={
                          (performance.reassignment_rate || 0) > 20 ? '#ff4d4f' : '#faad14'
                        }
                        format={(percent) => `${percent}%`}
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{performance.reassigned_orders || 0} Reassigned</span>
                        <span>{performance.total_assigned || 0} Total</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Financial Performance */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="shadow-sm">
                    <Statistic
                      title="Total Order Value"
                      value={performance.total_order_value || 0}
                      prefix={<DollarSign size={16} />}
                      formatter={(value) => formatCurrency(value)}
                    />
                  </Card>

                  <Card className="shadow-sm">
                    <Statistic
                      title="Completed Order Value"
                      value={performance.completed_order_value || 0}
                      prefix={<Award size={16} />}
                      formatter={(value) => formatCurrency(value)}
                    />
                  </Card>

                  <Card className="shadow-sm">
                    <Statistic
                      title="Avg. Completion Time"
                      value={performance.avg_completion_days || 0}
                      suffix="days"
                      prefix={<Target size={16} />}
                    />
                  </Card>
                </div>

                {/* Order Breakdown */}
                <Card title="Order Status Breakdown" className="shadow-sm">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.max(0, (performance.total_assigned || 0) - (performance.completed_orders || 0) - (performance.cancelled_orders || 0))}
                      </div>
                      <div className="text-sm text-gray-600">Active Assignments</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {performance.in_progress_orders || 0}
                      </div>
                      <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {performance.pending_orders || 0}
                      </div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                    <div className="text-center p-4 bg-cyan-50 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-600">
                        {performance.on_delivery_orders || 0}
                      </div>
                      <div className="text-sm text-gray-600">On Delivery</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {performance.completed_orders || 0}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {performance.cancelled_orders || 0}
                      </div>
                      <div className="text-sm text-gray-600">Cancelled</div>
                    </div>
                  </div>
                </Card>

                {/* Order History - deduplicated so each order appears once */}
                {(() => {
                  const recentOrders = getUniqueRecentOrders(performance.order_history);
                  return recentOrders.length > 0 ? (
                  <Card title="Recent Order History" className="shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Order
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Client
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Value
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Allocated
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {recentOrders.map((order) => {
                            // Resolve status field — API may use order_status or status
                            const orderStatus = order.order_status || order.status;
                            const rowKey = order.order_id || order.id ||
                              `${order.client_name}-${order.order_title}`;
                            return (
                              <tr key={rowKey} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm">
                                  {order.order_title || order.title}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {order.client_name}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <Tag color={getStatusColor(orderStatus)}>
                                    {orderStatus}
                                  </Tag>
                                </td>
                                <td className="px-4 py-3 text-sm font-medium">
                                  {formatCurrency(order.order_price)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {dayjs(order.allocated_at).format('MMM DD, YYYY')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                  ) : null;
                })()}
              </>
            ) : (
              <Empty description="No performance data available" />
            )}
          </div>
        </TabPane>

        {/* Personal Details Tab */}
        <TabPane tab="Personal Details" key="2">
          <div className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-6 pb-6 border-b">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Current Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {staff.first_name?.[0]}{staff.last_name?.[0]}
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Profile Picture</h3>
                <Upload
                  fileList={fileList}
                  onChange={handleUploadChange}
                  beforeUpload={() => false}
                  disabled={!isEditing}
                  showUploadList={false}
                  accept="image/*"
                >
                  {isEditing && (
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                      Upload New Photo
                    </button>
                  )}
                </Upload>
                {fileList.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {fileList[0].name}
                  </p>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                value={formData.first_name}
                disabled={!isEditing}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                required
              />

              <InputField
                label="Last Name"
                value={formData.last_name}
                disabled={!isEditing}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                required
              />

              <InputField
                label="Email Address"
                value={formData.email}
                disabled={!isEditing}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />

              <InputField
                label="Phone Number"
                value={formData.phone_number}
                disabled={!isEditing}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
                required
              />

              <SelectField
                label="Department"
                value={formData.department}
                options={["HR", "Finance", "IT", "Marketing", "Sales"]}
                disabled={!isEditing}
                onChange={(val) => handleInputChange("department", val)}
                required
              />

              <SelectField
                label="Staff Role"
                value={formData.staff_role}
                options={["Tailor", "Designer", "Driver", "Accountant", "Procurement_Manager"]}
                disabled={!isEditing}
                onChange={(val) => handleInputChange("staff_role", val)}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary <span className="text-red-500">*</span>
                </label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <Radio.Group
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  disabled={!isEditing}
                >
                  <Radio value="Male">Male</Radio>
                  <Radio value="Female">Female</Radio>
                </Radio.Group>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Date <span className="text-red-500">*</span>
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
                  format="YYYY-MM-DD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birthday
                </label>
                <DatePicker
                  className="w-full"
                  value={
                    formData.birthday_date
                      ? dayjs(formData.birthday_date)
                      : null
                  }
                  onChange={(date) =>
                    handleInputChange("birthday_date", date ?? null)
                  }
                  disabled={!isEditing}
                  format="YYYY-MM-DD"
                />
              </div>
            </div>

            {/* Address */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <Input.TextArea
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={!isEditing}
                rows={3}
                className="w-full"
                placeholder="Enter staff address"
              />
            </div>
          </div>
        </TabPane>
      </Tabs>
      {successModal && (
        <SuccessModal
          {...successModal}
          onClose={() => setSuccessModal(null)}
        />
      )}
    </div>
  );
};

// Reusable Components
const InputField = ({ label, value, onChange, disabled, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Input
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full"
    />
  </div>
);

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
};

const SelectField = ({ label, value, onChange, options, disabled, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Select
      className="w-full"
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      {options.map((opt) => (
        <Option key={opt} value={opt}>
          {opt}
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
  required: PropTypes.bool,
};

export default StaffDetail;
