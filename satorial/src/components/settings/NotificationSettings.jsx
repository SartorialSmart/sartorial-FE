import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Bell, Mail, MessageSquare, Clock, Save } from "lucide-react";
import { motion } from "framer-motion";
import { message } from "antd";
import SettingsService from "../../services/settings";
import { FormSection } from "../common/FormComponents";
import { extractErrorMessage } from "../../../utils/errorUtils";

const NotificationSettings = () => {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    email_notifications_enabled: false,
    notification_email: "",
    sms_notifications_enabled: false,
    notification_phone: "",
    due_order_reminder_days: "3",
    order_status_notifications: true,
    payment_notifications: true,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await SettingsService.Profile.getProfile();
        setSettings((prev) => ({
          ...prev,
          email_notifications_enabled: profile.email_notifications_enabled ?? prev.email_notifications_enabled,
          notification_email: profile.notification_email || profile.business_email || "",
          sms_notifications_enabled: profile.sms_notifications_enabled ?? prev.sms_notifications_enabled,
          notification_phone: profile.notification_phone || profile.business_phone || "",
          due_order_reminder_days: profile.due_order_reminder_days != null ? String(profile.due_order_reminder_days) : prev.due_order_reminder_days,
          order_status_notifications: profile.order_status_notifications ?? prev.order_status_notifications,
          payment_notifications: profile.payment_notifications ?? prev.payment_notifications,
        }));
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleToggle = (field) => {
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await SettingsService.Profile.updateProfile({
        email_notifications_enabled: settings.email_notifications_enabled,
        notification_email: settings.notification_email,
        sms_notifications_enabled: settings.sms_notifications_enabled,
        notification_phone: settings.notification_phone,
        due_order_reminder_days: Number(settings.due_order_reminder_days),
        order_status_notifications: settings.order_status_notifications,
        payment_notifications: settings.payment_notifications,
      });
      message.success("Notification settings saved successfully");
    } catch (error) {
      message.error(extractErrorMessage(error, "Failed to save notification settings"));
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ enabled, onToggle, label, description }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  Toggle.propTypes = {
    enabled: PropTypes.bool,
    onToggle: PropTypes.func,
    label: PropTypes.string,
    description: PropTypes.string,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Email Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FormSection
          title="Email Notifications"
          description="Configure email alerts for your business"
        >
          <div className="space-y-4">
            <Toggle
              enabled={settings.email_notifications_enabled}
              onToggle={() => handleToggle("email_notifications_enabled")}
              label="Enable Email Notifications"
              description="Receive email alerts for upcoming due orders and important events"
            />

            {settings.email_notifications_enabled && (
              <div className="pl-4 border-l-2 border-blue-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail size={14} className="inline mr-2" />
                    Notification Email
                  </label>
                  <input
                    type="email"
                    name="notification_email"
                    value={settings.notification_email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </FormSection>
      </motion.div>

      {/* SMS Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <FormSection
          title="SMS Notifications"
          description="Configure SMS alerts for urgent updates"
        >
          <div className="space-y-4">
            <Toggle
              enabled={settings.sms_notifications_enabled}
              onToggle={() => handleToggle("sms_notifications_enabled")}
              label="Enable SMS Notifications"
              description="Receive SMS alerts for critical order deadlines"
            />

            {settings.sms_notifications_enabled && (
              <div className="pl-4 border-l-2 border-blue-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare size={14} className="inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="notification_phone"
                    value={settings.notification_phone}
                    onChange={handleChange}
                    placeholder="+234..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </FormSection>
      </motion.div>

      {/* Due Order Reminders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <FormSection
          title="Due Order Reminders"
          description="Set when to be notified about upcoming order deadlines"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock size={14} className="inline mr-2" />
                Remind me before order due date
              </label>
              <select
                name="due_order_reminder_days"
                value={settings.due_order_reminder_days}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">1 day before</option>
                <option value="2">2 days before</option>
                <option value="3">3 days before</option>
                <option value="5">5 days before</option>
                <option value="7">7 days before</option>
                <option value="14">14 days before</option>
              </select>
            </div>
          </div>
        </FormSection>
      </motion.div>

      {/* Notification Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <FormSection
          title="Notification Types"
          description="Choose which events trigger notifications"
        >
          <div className="space-y-4">
            <Toggle
              enabled={settings.order_status_notifications}
              onToggle={() => handleToggle("order_status_notifications")}
              label="Order Status Changes"
              description="Get notified when order statuses are updated"
            />
            <Toggle
              enabled={settings.payment_notifications}
              onToggle={() => handleToggle("payment_notifications")}
              label="Payment Alerts"
              description="Get notified when payments are received or overdue"
            />
          </div>
        </FormSection>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Notification Settings
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default NotificationSettings;
