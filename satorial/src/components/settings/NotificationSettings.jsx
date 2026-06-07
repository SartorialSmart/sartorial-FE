import { useState, useEffect } from "react";
import { Bell, Mail, MessageSquare, Clock, Save, Cake, Package, Smartphone, Send } from "lucide-react";
import { motion } from "framer-motion";
import NotificationService from "../../services/NotificationService";
import { FormSection } from "../common/FormComponents";
import { extractErrorMessage } from "../../../utils/errorUtils";
import SuccessModal from "../modals/SuccessModal";

const NotificationSettings = () => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);
  const [settings, setSettings] = useState({
    email_enabled: false,
    notification_email: "",
    whatsapp_enabled: false,
    whatsapp_phone: "",
    telegram_enabled: false,
    telegram_chat_id: "",
    due_order_reminder_days: "3",
    due_order_email_notifications_enabled: false,
    order_status_notifications: true,
    payment_notifications: true,
    birthday_notifications_enabled: false,
    order_limit_notifications_enabled: false,
    max_daily_orders: "0",
    max_weekly_orders: "0",
    max_monthly_orders: "0",
    max_yearly_orders: "0",
    max_daily_deliveries: "0",
    max_weekly_deliveries: "0",
    max_monthly_deliveries: "0",
    max_yearly_deliveries: "0",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await NotificationService.getSettings();
        setSettings((prev) => ({
          ...prev,
          email_enabled: data.email_enabled ?? prev.email_enabled,
          notification_email: data.notification_email || "",
          whatsapp_enabled: data.whatsapp_enabled ?? prev.whatsapp_enabled,
          whatsapp_phone: data.whatsapp_phone || "",
          telegram_enabled: data.telegram_enabled ?? prev.telegram_enabled,
          telegram_chat_id: data.telegram_chat_id || "",
          due_order_reminder_days: data.due_order_reminder_days != null ? String(data.due_order_reminder_days) : prev.due_order_reminder_days,
          due_order_email_notifications_enabled: data.due_order_email_notifications_enabled ?? prev.due_order_email_notifications_enabled,
          order_status_notifications: data.order_status_notifications ?? prev.order_status_notifications,
          payment_notifications: data.payment_notifications ?? prev.payment_notifications,
          birthday_notifications_enabled: data.birthday_notifications_enabled ?? prev.birthday_notifications_enabled,
          order_limit_notifications_enabled: data.order_limit_notifications_enabled ?? prev.order_limit_notifications_enabled,
          max_daily_orders: data.max_daily_orders != null ? String(data.max_daily_orders) : prev.max_daily_orders,
          max_weekly_orders: data.max_weekly_orders != null ? String(data.max_weekly_orders) : prev.max_weekly_orders,
          max_monthly_orders: data.max_monthly_orders != null ? String(data.max_monthly_orders) : prev.max_monthly_orders,
          max_yearly_orders: data.max_yearly_orders != null ? String(data.max_yearly_orders) : prev.max_yearly_orders,
          max_daily_deliveries: data.max_daily_deliveries != null ? String(data.max_daily_deliveries) : prev.max_daily_deliveries,
          max_weekly_deliveries: data.max_weekly_deliveries != null ? String(data.max_weekly_deliveries) : prev.max_weekly_deliveries,
          max_monthly_deliveries: data.max_monthly_deliveries != null ? String(data.max_monthly_deliveries) : prev.max_monthly_deliveries,
          max_yearly_deliveries: data.max_yearly_deliveries != null ? String(data.max_yearly_deliveries) : prev.max_yearly_deliveries,
        }));
      } catch (error) {
        console.error("Error fetching notification settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = (field) => {
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => {
      if (name === "max_daily_orders") {
        const daily = Number(value);
        if (!value || Number.isNaN(daily)) {
          return { ...prev, max_daily_orders: value, max_weekly_orders: value, max_monthly_orders: value, max_yearly_orders: value };
        }
        return { ...prev, max_daily_orders: value, max_weekly_orders: String(daily * 7), max_monthly_orders: String(daily * 30), max_yearly_orders: String(daily * 365) };
      }
      if (name === "max_daily_deliveries") {
        const daily = Number(value);
        if (!value || Number.isNaN(daily)) {
          return { ...prev, max_daily_deliveries: value, max_weekly_deliveries: value, max_monthly_deliveries: value, max_yearly_deliveries: value };
        }
        return { ...prev, max_daily_deliveries: value, max_weekly_deliveries: String(daily * 7), max_monthly_deliveries: String(daily * 30), max_yearly_deliveries: String(daily * 365) };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await NotificationService.updateSettings({
        email_enabled: settings.email_enabled,
        notification_email: settings.notification_email,
        whatsapp_enabled: settings.whatsapp_enabled,
        whatsapp_phone: settings.whatsapp_phone,
        telegram_enabled: settings.telegram_enabled,
        telegram_chat_id: settings.telegram_chat_id,
        due_order_reminder_days: Number(settings.due_order_reminder_days),
        due_order_email_notifications_enabled: settings.due_order_email_notifications_enabled,
        order_status_notifications: settings.order_status_notifications,
        payment_notifications: settings.payment_notifications,
        birthday_notifications_enabled: settings.birthday_notifications_enabled,
        order_limit_notifications_enabled: settings.order_limit_notifications_enabled,
        max_daily_orders: Number(settings.max_daily_orders),
        max_weekly_orders: Number(settings.max_weekly_orders),
        max_monthly_orders: Number(settings.max_monthly_orders),
        max_yearly_orders: Number(settings.max_yearly_orders),
        max_daily_deliveries: Number(settings.max_daily_deliveries),
        max_weekly_deliveries: Number(settings.max_weekly_deliveries),
        max_monthly_deliveries: Number(settings.max_monthly_deliveries),
        max_yearly_deliveries: Number(settings.max_yearly_deliveries),
      });
      setModalData({
        title: "Settings Saved",
        message: "Your notification settings have been updated successfully.",
        buttonText: "Done",
      });
    } catch (error) {
      setModalData({
        title: "Save Failed",
        message: extractErrorMessage(error, "Failed to save notification settings"),
        buttonText: "Close",
        isError: true,
      });
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

  const LimitInput = ({ name, label, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Package size={14} className="inline mr-2" />
        {label}
      </label>
      <input
        type="number"
        name={name}
        min="0"
        value={settings[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Email Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <FormSection title="Email Notifications" description="Configure email alerts for your business">
          <div className="space-y-4">
            <Toggle
              enabled={settings.email_enabled}
              onToggle={() => handleToggle("email_enabled")}
              label="Enable Email Notifications"
              description="Receive email alerts for upcoming due orders and important events"
            />
            {settings.email_enabled && (
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

      {/* WhatsApp Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <FormSection title="WhatsApp Notifications" description="Receive alerts via WhatsApp">
          <div className="space-y-4">
            <Toggle
              enabled={settings.whatsapp_enabled}
              onToggle={() => handleToggle("whatsapp_enabled")}
              label="Enable WhatsApp Notifications"
              description="Receive WhatsApp messages for critical order updates"
            />
            {settings.whatsapp_enabled && (
              <div className="pl-4 border-l-2 border-green-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Smartphone size={14} className="inline mr-2" />
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="tel"
                    name="whatsapp_phone"
                    value={settings.whatsapp_phone}
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

      {/* Telegram Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <FormSection title="Telegram Notifications" description="Receive alerts via Telegram bot">
          <div className="space-y-4">
            <Toggle
              enabled={settings.telegram_enabled}
              onToggle={() => handleToggle("telegram_enabled")}
              label="Enable Telegram Notifications"
              description="Receive Telegram messages for important updates"
            />
            {settings.telegram_enabled && (
              <div className="pl-4 border-l-2 border-sky-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Send size={14} className="inline mr-2" />
                    Telegram Chat ID
                  </label>
                  <input
                    type="text"
                    name="telegram_chat_id"
                    value={settings.telegram_chat_id}
                    onChange={handleChange}
                    placeholder="e.g. 123456789"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </FormSection>
      </motion.div>

      {/* Due Order Reminders */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <FormSection title="Due Order Reminders" description="Set when to be notified about upcoming order deadlines">
          <div className="space-y-4">
            <Toggle
              enabled={settings.due_order_email_notifications_enabled}
              onToggle={() => handleToggle("due_order_email_notifications_enabled")}
              label="Email Notification for Due Orders"
              description="Receive an email when orders are approaching their due date"
            />
            {settings.due_order_email_notifications_enabled && (
              <div className="pl-4 border-l-2 border-blue-200 space-y-4">
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
            )}
          </div>
        </FormSection>
      </motion.div>

      {/* Notification Types */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <FormSection title="Notification Types" description="Choose which events trigger notifications">
          <div className="space-y-4">
            <Toggle enabled={settings.order_status_notifications} onToggle={() => handleToggle("order_status_notifications")} label="Order Status Changes" description="Get notified when order statuses are updated" />
            <Toggle enabled={settings.payment_notifications} onToggle={() => handleToggle("payment_notifications")} label="Payment Alerts" description="Get notified when payments are received or overdue" />
          </div>
        </FormSection>
      </motion.div>

      {/* Birthday Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <FormSection title="Client Birthday Notifications" description="Get reminded when a client's birthday is today">
          <div className="space-y-4">
            <Toggle
              enabled={settings.birthday_notifications_enabled}
              onToggle={() => handleToggle("birthday_notifications_enabled")}
              label="Enable Birthday Notifications"
              description="Receive a daily email listing clients whose birthday is today"
            />
            {settings.birthday_notifications_enabled && (
              <div className="pl-4 border-l-2 border-blue-200">
                <p className="text-sm text-gray-500">
                  <Cake size={14} className="inline mr-1" />
                  Notifications are sent at 8:15 AM daily to your notification email.
                </p>
              </div>
            )}
          </div>
        </FormSection>
      </motion.div>

      {/* Order Intake & Delivery Limit Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <FormSection title="Order Intake & Delivery Limits" description="Get alerted when order intake or delivery counts reach your limits">
          <div className="space-y-4">
            <Toggle
              enabled={settings.order_limit_notifications_enabled}
              onToggle={() => handleToggle("order_limit_notifications_enabled")}
              label="Enable Order Limit Alerts"
              description="Receive an alert when your intake or delivery limits are reached"
            />
            <div className="pl-4 border-l-2 border-blue-200 space-y-6">
              {!settings.order_limit_notifications_enabled && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                  Limits can be saved now, but they are only enforced when order limit alerts are enabled.
                </p>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Order intake limits</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LimitInput name="max_daily_orders" label="Max orders per day (0 = no limit)" placeholder="e.g. 10" />
                  <LimitInput name="max_weekly_orders" label="Max orders per week (0 = no limit)" placeholder="e.g. 50" />
                  <LimitInput name="max_monthly_orders" label="Max orders per month (0 = no limit)" placeholder="e.g. 200" />
                  <LimitInput name="max_yearly_orders" label="Max orders per year (0 = no limit)" placeholder="e.g. 2400" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Delivery date limits</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LimitInput name="max_daily_deliveries" label="Max deliveries per day (0 = no limit)" placeholder="e.g. 5" />
                  <LimitInput name="max_weekly_deliveries" label="Max deliveries per week (0 = no limit)" placeholder="e.g. 20" />
                  <LimitInput name="max_monthly_deliveries" label="Max deliveries per month (0 = no limit)" placeholder="e.g. 80" />
                  <LimitInput name="max_yearly_deliveries" label="Max deliveries per year (0 = no limit)" placeholder="e.g. 960" />
                </div>
              </div>
            </div>
          </div>
        </FormSection>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      {modalData && <SuccessModal {...modalData} onClose={() => setModalData(null)} />}
    </form>
  );
};

export default NotificationSettings;
