import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { 
  EditIcon, ChevronRight, CheckCircle, Calendar, Clock, Truck, Package, 
  UserCheck, XCircle, Loader2, User, Mail, FileText, ShoppingBag, 
  CreditCard, BarChart3, Tag, UserPlus, Repeat, ClipboardCheck, Upload, X,
  ArrowUpDown
} from "lucide-react";
import OrderService from "../../../services/OrderService";
import SettingsService from "../../../services/settings";
import AddPaymentModal from "../../modals/formModals/AddOrderPaymentFormModal";
import TrackOrderStatusModal from "../../modals/formModals/TrackOrderStatusModal";
import AssignOrderModal from "../../allocationModals/AssignOrderModal";
import Avatar from "../../avatar/Avatar";
import StaffService from "../../../services/staffServices/StaffService";
import { getLogoUrl, getLocalProfile, getLocalInvoiceSettings } from "../../../utils/localImageService";
import { isReadyMadeOrder, getCleanDescription } from "../../../../utils/orderUtils";
import SuccessModal from "../../modals/SuccessModal";
import { extractErrorMessage } from "../../../../utils/errorUtils";
import { useAuth } from "../../../contexts/AuthContext";
import { canViewModule } from "../../../utils/permissions";

const OrderDetail = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const isClientView = searchParams.get("clientView") === "1";
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTrackOrderModal, setShowTrackOrderModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignMode, setAssignMode] = useState("assign");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [orgProfile, setOrgProfile] = useState(null);
  const [invoiceLayout, setInvoiceLayout] = useState("layout1");
  const [showQAModal, setShowQAModal] = useState(false);
  const [qaChecklist, setQaChecklist] = useState(() => {
    const saved = localStorage.getItem(`qa_checklist_${orderId}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [showCompleteUploadModal, setShowCompleteUploadModal] = useState(false);
  const [completeOrderImage, setCompleteOrderImage] = useState(null);
  const [errorModal, setErrorModal] = useState({ show: false, title: "", message: "" });
  const [timelineSortAsc, setTimelineSortAsc] = useState(false);
  const [cachedAllocation, setCachedAllocation] = useState(null);
  const { user } = useAuth();
  const ALLOWED_ROLES = ["super_admin", "admin", "organization"];
  const isAdmin = ALLOWED_ROLES.includes(user?.role?.toLowerCase());
  const canAccessQA = isAdmin || canViewModule(user, "qa_checklist");

  // Define all possible statuses in order (Completed before On Delivery)
  const STATUS_FLOW = [
    { key: 'Pending', label: 'Pending', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    { key: 'Assigned', label: 'Assigned', icon: UserCheck, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { key: 'In Progress', label: 'In Progress', icon: Package, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { key: 'QA Check', label: 'QA Check', icon: ClipboardCheck, color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' },
    { key: 'Completed', label: 'Completed', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { key: 'On Delivery', label: 'Delivered', icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    { key: 'Cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  ];

  const READY_MADE_STATUS_FLOW = [
    { key: 'Completed', label: 'Completed', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { key: 'On Delivery', label: 'Delivered', icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    { key: 'Cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  ];

  const STATUS_API_MAP = {
    "QA Check": "Processing",
  };
  const REVERSE_STATUS_API_MAP = Object.fromEntries(
    Object.entries(STATUS_API_MAP).map(([k, v]) => [v, k])
  );
  const displayStatus = REVERSE_STATUS_API_MAP[order?.order_status] || order?.order_status;

  const QA_ITEMS = [
    { id: "measurements", label: "Measurements verified and match order specifications" },
    { id: "fabric", label: "Fabric inspected for quality and consistency" },
    { id: "stitching", label: "Stitching and seam quality meets standards" },
    { id: "finishing", label: "Finishing touches completed (buttons, zippers, hems)" },
    { id: "pressing", label: "Garment pressed and prepared for delivery" },
    { id: "final_inspection", label: "Final quality inspection passed" },
  ];
  const allQaChecked = QA_ITEMS.every((item) => qaChecklist[item.id]);

  const isReadyMade = isReadyMadeOrder(order);
  const activeStatusFlow = isReadyMade ? READY_MADE_STATUS_FLOW : STATUS_FLOW;

  const preserveAllocation = (data) => {
    if (data.current_allocation) {
      setCachedAllocation(data.current_allocation);
    } else if (cachedAllocation) {
      data.current_allocation = cachedAllocation;
    }
    return data;
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const data = await OrderService.getOrderById(orderId);
        if (!data.current_allocation) {
          try {
            const allocations = await OrderService.getAllocations();
            const allocationList = Array.isArray(allocations)
              ? allocations
              : allocations.results || allocations.allocations || [];
            const match = allocationList.find(
              (a) => String(a.order?.id || a.order?.order_id || a.order) === String(orderId)
            );
            if (match) {
              const staffObj = match.staff || match;
              data.current_allocation = {
                staff_name: staffObj.name || `${staffObj.first_name || ""} ${staffObj.last_name || ""}`.trim() || "Staff",
                staff_id: staffObj.id || match.staff_id || match.staff,
                staff: staffObj.id || match.staff,
                department: match.department || staffObj.department || "",
                role: match.role || staffObj.role || staffObj.staff_role || "",
                avatar_url: staffObj.avatar || staffObj.avatar_url || match.avatar_url,
                id: match.id,
              };
            }
          } catch {
            // allocations fetch is optional
          }
        }
        preserveAllocation(data);
        setOrder(data);
      } catch (err) {
        setError("Failed to fetch order details.");
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchOrgProfile = async () => {
      try {
        const profile = await SettingsService.Profile.getProfile();
        setOrgProfile(profile);
      } catch (err) {
        console.error("Error fetching org profile:", err);
        const localProfile = getLocalProfile();
        if (localProfile) setOrgProfile(localProfile);
      }
    };

    fetchOrderDetails();
    fetchOrgProfile();
  }, [orderId]);

  useEffect(() => {
    const fetchInvoiceLayout = async () => {
      try {
        const settings = await SettingsService.Invoice.getSettings();
        if (settings?.selected_layout) {
          setInvoiceLayout(settings.selected_layout);
          return;
        }
        const local = getLocalInvoiceSettings();
        if (local?.selectedLayout) {
          setInvoiceLayout(local.selectedLayout);
        }
      } catch (err) {
        console.error("Error fetching invoice layout:", err);
        const local = getLocalInvoiceSettings();
        if (local?.selectedLayout) {
          setInvoiceLayout(local.selectedLayout);
        }
      }
    };
    fetchInvoiceLayout();
  }, []);

  const handleSavePayment = async () => {
    // AddPaymentForm already called PaymentService.createPayment — refresh order in background
    setShowPaymentModal(false);
    OrderService.getOrderById(orderId)
      .then((updatedOrder) => setOrder(preserveAllocation(updatedOrder)))
      .catch((err) => console.error("Failed to refresh order after payment:", err));
  };

  const handleAssignOrder = async (payload) => {
    const result = await OrderService.assignOrder(payload);
    const updatedOrder = await OrderService.getOrderById(orderId);
    if (result) {
      const alloc = result.allocation || result;
      const s = result.staff || alloc.staff || alloc;
      updatedOrder.current_allocation = {
        staff_name: s.name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Staff",
        staff_id: s.id || alloc.staff_id,
        staff: s.id || alloc.staff,
        department: alloc.department || s.department || "",
        role: alloc.role || s.role || s.staff_role || "",
        avatar_url: s.avatar || s.avatar_url || alloc.avatar_url,
        id: alloc.id,
      };
    }
    setOrder(updatedOrder);
  };

  const handleQAComplete = async () => {
    setShowQAModal(false);
    const qaStatus = STATUS_API_MAP["QA Check"] || "QA Check";
    const shouldComplete = order.order_status === qaStatus;
    if (!shouldComplete) {
      setUpdatingStatus(true);
      try {
        await OrderService.updateOrder(orderId, { ...order, order_status: qaStatus });
        const updatedOrder = await OrderService.getOrderById(orderId);
        setOrder(preserveAllocation(updatedOrder));
      } catch (err) {
        console.warn("QA status update skipped (backend may not support this status). Proceeding to completion upload.", err);
      } finally {
        setUpdatingStatus(false);
      }
    }
    setShowCompleteUploadModal(true);
  };

  const handleCompleteConfirm = async () => {
    setShowCompleteUploadModal(false);
    setUpdatingStatus(true);
    try {
      if (completeOrderImage) {
        const formData = new FormData();
        formData.append("order_status", "Completed");
        formData.append("order_completion_image", completeOrderImage);
        await OrderService.updateOrder(orderId, formData);
      } else {
      await OrderService.updateOrder(orderId, { ...order, order_status: "Completed" });
      }
      const updatedOrder = await OrderService.getOrderById(orderId);
      setOrder(preserveAllocation(updatedOrder));
      setCompleteOrderImage(null);
    } catch (err) {
      console.error("Failed to update status:", err);
      setErrorModal({
        show: true,
        title: "Failed to update order status",
        message: extractErrorMessage(err, "Please try again."),
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (updatingStatus || !order) return;

    if (newStatus === "Assigned") {
      if (!order.current_allocation?.id) {
        setAssignMode("assign");
        setShowAssignModal(true);
        return;
      }
      const name = order.current_allocation.staff_name;
      const confirmed = window.confirm(
        `Order is already assigned to ${name}. Do you wish to Re-Assign to another tailor?`
      );
      if (confirmed) {
        setAssignMode("reassign");
        setShowAssignModal(true);
      }
      return;
    }

    if (newStatus === "QA Check") {
      if (canAccessQA) setShowQAModal(true);
      return;
    }

    if (newStatus === "Completed") {
      if (!allQaChecked) {
        if (canAccessQA) setShowQAModal(true);
      } else {
        setShowCompleteUploadModal(true);
      }
      return;
    }

    setUpdatingStatus(true);
    try {
      const apiStatus = STATUS_API_MAP[newStatus] || newStatus;
      const updateData = {
        ...order,
        order_status: apiStatus
      };

      await OrderService.updateOrder(orderId, updateData);
      const updatedOrder = await OrderService.getOrderById(orderId);
      setOrder(preserveAllocation(updatedOrder));
    } catch (err) {
      console.error("Failed to update status:", err);
      setErrorModal({
        show: true,
        title: "Failed to update order status",
        message: extractErrorMessage(err, "Please try again."),
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleTrackOrder = () => {
    setShowTrackOrderModal(true);
  };

  const handleGenerateInvoice = async () => {
    if (!order || isGeneratingInvoice) return;
    
    setIsGeneratingInvoice(true);
    try {
      // Dynamically import the libraries
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // Create a temporary container for the invoice
      const invoiceContainer = document.createElement('div');
      invoiceContainer.style.position = 'absolute';
      invoiceContainer.style.left = '-9999px';
      invoiceContainer.style.width = '800px';
      invoiceContainer.style.backgroundColor = '#ffffff';
      invoiceContainer.style.padding = '40px';
      document.body.appendChild(invoiceContainer);

      // Calculate invoice details
      const subtotal = Number(order.order_price || 0);
      const vat = subtotal * 0.075; // 7.5% VAT
      const total = subtotal + vat;
      const invoiceNumber = order.invoice_number || "INV-0000";
      
      const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      };

      const formatAmount = (amount) => {
        if (!amount && amount !== 0) return "₦0.00";
        return `₦${Number(amount).toLocaleString()}`;
      };

      const calculateDueDate = (issuedDate, daysToAdd = 12) => {
        if (!issuedDate) return "N/A";
        const date = new Date(issuedDate);
        date.setDate(date.getDate() + daysToAdd);
        return formatDate(date.toISOString());
      };

      // Build business header from org profile
      const businessName = orgProfile?.business_name || order.business_name || order.vendor_name || "Your Business";
      const businessAddress = orgProfile ? [orgProfile.address_line1, orgProfile.address_line2, orgProfile.city, orgProfile.state, orgProfile.country].filter(Boolean).join(", ") : "";
      const businessPhone = orgProfile?.business_phone || "";
      const businessEmail = orgProfile?.business_email || "";
      const businessLogo = getLogoUrl(orgProfile?.logo_url) || "";

      // Compute payment status
      const paymentStatus = order.order_status === "Completed" ? "Paid" : "Pending";
      const paidAmount = order.payments ? order.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0) : 0;
      const balanceDue = Math.max(0, total - paidAmount);

      const layout1HTML = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 720px; margin: 0 auto;">
          <div style="margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 20px;">
            <div>
              ${businessLogo ? `<img src="${businessLogo}" style="max-height: 60px; max-width: 200px; margin-bottom: 10px;" crossorigin="anonymous" />` : ""}
              <h2 style="font-size: 20px; font-weight: bold; margin: 0; color: #1e40af;">${businessName}</h2>
              ${businessAddress ? `<p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">${businessAddress}</p>` : ""}
              ${businessPhone ? `<p style="font-size: 12px; color: #666; margin: 2px 0 0 0;">Tel: ${businessPhone}</p>` : ""}
              ${businessEmail ? `<p style="font-size: 12px; color: #666; margin: 2px 0 0 0;">${businessEmail}</p>` : ""}
            </div>
            <div style="text-align: right;">
              <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 10px 0;">Invoice</h1>
              <p style="font-size: 18px; color: #666; margin: 0;">${invoiceNumber}</p>
            </div>
          </div>

          <div style="background-color: #f5f5f5; padding: 24px; border-radius: 8px; margin-bottom: 30px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div>
                <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Issued</p>
                <p style="font-weight: 600; margin: 0;">${formatDate(order.ordered_at || order.created_at)}</p>
              </div>
              <div>
                <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Due</p>
                <p style="font-weight: 600; margin: 0;">${calculateDueDate(order.ordered_at || order.created_at)}</p>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">From</p>
                <p style="font-weight: 600; margin: 0;">${businessName}</p>
              </div>
              <div>
                <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">To</p>
                <p style="font-weight: 600; margin: 0;">${order.client_full_name || order.client_name || "N/A"}</p>
              </div>
            </div>

            <div style="margin-top: 20px;">
              <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">About the project</p>
              <p style="font-weight: 600; margin: 0;">${order.order_title || order.order_name || "Order"}</p>
              ${order.order_description ? `<p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">${order.order_description}</p>` : ''}
            </div>

            <div style="margin-top: 24px;">
              <p style="color: #666; font-size: 14px; font-weight: 600; margin: 0 0 10px 0;">Deliverables</p>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #ddd;">
                <p style="margin: 0; font-weight: 600;">${order.order_title || order.order_name || "Service"}</p>
                <p style="margin: 0; font-weight: 600;">${formatAmount(subtotal)}</p>
              </div>
            </div>

            <div style="margin-top: 24px;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #ddd;">
                <p style="color: #666; margin: 0;">Subtotal</p>
                <p style="margin: 0;">${formatAmount(subtotal)}</p>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <p style="color: #666; margin: 0;">VAT (7.5%)</p>
                <p style="margin: 0;">${formatAmount(vat)}</p>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 16px; padding: 16px; background-color: #e5e5e5; border-radius: 8px;">
              <p style="font-size: 18px; font-weight: bold; margin: 0;">Total</p>
              <p style="font-size: 18px; font-weight: bold; margin: 0;">${formatAmount(total)}</p>
            </div>

            ${order.order_status ? `
              <div style="margin-top: 16px; padding: 12px; background-color: #dbeafe; border-radius: 8px;">
                <p style="font-size: 14px; color: #1e40af; margin: 0;">
                  <strong>Status:</strong>
                  <span style="margin-left: 8px; padding: 4px 8px; background-color: ${
                    order.order_status === "Completed" ? "#d1fae5" :
                    order.order_status === "In Progress" ? "#dbeafe" : "#fef3c7"
                  }; color: ${
                    order.order_status === "Completed" ? "#065f46" :
                    order.order_status === "In Progress" ? "#1e40af" : "#92400e"
                  }; border-radius: 4px; font-size: 12px;">${order.order_status}</span>
                </p>
              </div>
            ` : ''}
          </div>

          <div style="text-align: center; font-size: 11px; color: #999; margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee;">
            Generated on ${formatDate(new Date().toISOString())} &mdash; Terms &amp; Conditions Apply
          </div>
        </div>
      `;

      const layout2HTML = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 720px; margin: 0 auto; display: flex;">
          <div style="width: 180px; background: linear-gradient(180deg, #1e3a5f, #1e40af); color: #fff; padding: 24px; flex-shrink: 0;">
            ${businessLogo ? `<img src="${businessLogo}" style="width: 48px; height: 48px; object-fit: contain; background: #fff; padding: 4px; border-radius: 8px; margin-bottom: 12px;" crossorigin="anonymous" />` : `
              <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; margin-bottom: 12px;">B</div>
            `}
            <h2 style="font-size: 16px; font-weight: bold; margin: 0 0 16px 0;">${businessName}</h2>
            ${businessEmail ? `<p style="font-size: 11px; color: #bfdbfe; margin: 0 0 4px 0;">${businessEmail}</p>` : ""}
            ${businessPhone ? `<p style="font-size: 11px; color: #bfdbfe; margin: 0 0 4px 0;">${businessPhone}</p>` : ""}
            ${businessAddress ? `<p style="font-size: 10px; color: #bfdbfe; margin: 0;">${businessAddress}</p>` : ""}
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2);">
              <p style="font-size: 10px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Issued</p>
              <p style="font-size: 13px; font-weight: 500; margin: 0 0 12px 0;">${formatDate(order.ordered_at || order.created_at)}</p>
              <p style="font-size: 10px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Due</p>
              <p style="font-size: 13px; font-weight: 500; margin: 0;">${calculateDueDate(order.ordered_at || order.created_at)}</p>
            </div>
          </div>

          <div style="flex: 1; padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
              <div>
                <h1 style="font-size: 28px; font-weight: bold; margin: 0; color: #111;">Invoice</h1>
                <p style="font-size: 14px; color: #666; margin: 2px 0 0 0;">${invoiceNumber}</p>
              </div>
              <div style="text-align: right;">
                <p style="font-size: 12px; color: #666; margin: 0 0 4px 0;">Amount Due</p>
                <p style="font-size: 22px; font-weight: bold; margin: 0; color: #111;">${formatAmount(balanceDue > 0 ? balanceDue : total)}</p>
                <p style="font-size: 11px; margin: 6px 0 0 0; display: inline-block; padding: 2px 10px; border-radius: 10px; background-color: ${paymentStatus === "Paid" ? "#d1fae5" : "#fef3c7"}; color: ${paymentStatus === "Paid" ? "#065f46" : "#92400e"};">${paymentStatus}</p>
              </div>
            </div>

            <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
              <p style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Bill To</p>
              <p style="font-weight: 600; margin: 0; color: #111;">${order.client_full_name || order.client_name || "Customer"}</p>
              ${order.client_email ? `<p style="font-size: 13px; color: #666; margin: 2px 0 0 0;">${order.client_email}</p>` : ""}
              ${order.client_phone ? `<p style="font-size: 13px; color: #666; margin: 1px 0 0 0;">${order.client_phone}</p>` : ""}
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #e5e7eb;">
                  <th style="padding: 10px 0; text-align: left; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Description</th>
                  <th style="padding: 10px 0; text-align: right; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 14px 0;">
                    <p style="font-weight: 600; margin: 0; color: #111;">${order.order_title || order.order_name || "Order"}</p>
                    ${order.order_description ? `<p style="font-size: 12px; color: #666; margin: 2px 0 0 0;">${order.order_description}</p>` : ""}
                  </td>
                  <td style="padding: 14px 0; text-align: right; font-weight: 600; color: #111;">${formatAmount(subtotal)}</td>
                </tr>
              </tbody>
            </table>

            <div style="border-top: 1px solid #e5e7eb; margin-top: 16px; padding-top: 16px;">
              <div style="max-width: 260px; margin-left: auto;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #666; padding: 4px 0;">
                  <span>Subtotal</span><span>${formatAmount(subtotal)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #666; padding: 4px 0;">
                  <span>VAT (7.5%)</span><span>${formatAmount(vat)}</span>
                </div>
                ${paidAmount > 0 ? `
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #16a34a; padding: 4px 0;">
                  <span>Amount Paid</span><span>-${formatAmount(paidAmount)}</span>
                </div>` : ""}
                <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #111; padding: 10px 0 0 0; margin-top: 8px; border-top: 1px solid #e5e7eb;">
                  <span>Total Due</span><span>${formatAmount(balanceDue > 0 ? balanceDue : total)}</span>
                </div>
              </div>
            </div>

            <div style="text-align: center; font-size: 11px; color: #999; margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee;">
              Generated on ${formatDate(new Date().toISOString())} &mdash; Terms &amp; Conditions Apply
            </div>
          </div>
        </div>
      `;

      invoiceContainer.innerHTML = invoiceLayout === "layout2" ? layout2HTML : layout1HTML;

      // Convert to canvas and then to PDF
      const canvas = await html2canvas(invoiceContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      // Download the PDF
      pdf.save(`Invoice-${invoiceNumber}.pdf`);

      // Clean up
      document.body.removeChild(invoiceContainer);

      // Show success message (optional)
      alert(`Invoice ${invoiceNumber} downloaded successfully!`);
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice. Please try again.");
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const generatePaymentReceipt = async (payment) => {
    if (!payment || isGeneratingInvoice) return;

    setIsGeneratingInvoice(true);
    try {
      // Dynamically import libraries
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // Create temporary container
      const receiptContainer = document.createElement("div");
      receiptContainer.style.position = "absolute";
      receiptContainer.style.left = "-9999px";
      receiptContainer.style.width = "800px";
      receiptContainer.style.backgroundColor = "#ffffff";
      receiptContainer.style.padding = "40px";
      document.body.appendChild(receiptContainer);

      const formatDatePDF = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      };

      const formatAmountPDF = (amount) => {
        if (!amount && amount !== 0) return "₦0.00";
        return `₦${Number(amount).toLocaleString()}`;
      };

      // Receipt number
      const receiptNumber = payment.id
        ? `RCPT-${String(payment.id).padStart(4, "0")}`
        : "RCPT-0000";

      // Build business header from org profile
      const rcptBusinessName = orgProfile?.business_name || order.business_name || order.vendor_name || "Your Business";
      const rcptBusinessAddress = orgProfile ? [orgProfile.address_line1, orgProfile.address_line2, orgProfile.city, orgProfile.state, orgProfile.country].filter(Boolean).join(", ") : "";
      const rcptBusinessPhone = orgProfile?.business_phone || "";
      const rcptBusinessEmail = orgProfile?.business_email || "";
      const rcptBusinessLogo = getLogoUrl(orgProfile?.logo_url) || "";

      // Build receipt HTML
      receiptContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              ${rcptBusinessLogo ? `<img src="${rcptBusinessLogo}" style="max-height: 60px; max-width: 200px; margin-bottom: 10px;" crossorigin="anonymous" />` : ""}
              <h2 style="font-size: 18px; font-weight: bold; margin: 0; color: #1e40af;">${rcptBusinessName}</h2>
              ${rcptBusinessAddress ? `<p style="font-size: 11px; color: #666; margin: 4px 0 0 0;">${rcptBusinessAddress}</p>` : ""}
              ${rcptBusinessPhone ? `<p style="font-size: 11px; color: #666; margin: 2px 0 0 0;">Tel: ${rcptBusinessPhone}</p>` : ""}
              ${rcptBusinessEmail ? `<p style="font-size: 11px; color: #666; margin: 2px 0 0 0;">${rcptBusinessEmail}</p>` : ""}
            </div>
            <div style="text-align: right;">
              <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 10px 0; color: #1e40af;">Payment Receipt</h1>
              <p style="font-size: 18px; color: #666; margin: 0;">${receiptNumber}</p>
            </div>
          </div>

          <div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #2563eb;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div>
                <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 600;">Payment Date</p>
                <p style="font-weight: 700; margin: 0; font-size: 16px; color: #1e293b;">${formatDatePDF(
                  payment.paid_at
                )}</p>
              </div>
              <div>
                <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 600;">Receipt Number</p>
                <p style="font-weight: 700; margin: 0; font-size: 16px; color: #1e293b;">${receiptNumber}</p>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div>
                <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 600;">From</p>
                <p style="font-weight: 600; margin: 0; color: #1e293b;">${rcptBusinessName}</p>
              </div>
              <div>
                <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 600;">To</p>
                <p style="font-weight: 600; margin: 0; color: #1e293b;">${
                  order.client_full_name || "N/A"
                }</p>
              </div>
            </div>

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 600;">Order Reference</p>
              <p style="font-weight: 600; margin: 0; color: #1e293b;">${
                order.order_title
              }</p>
              ${
                order.order_description
                  ? `<p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">${order.order_description}</p>`
                  : ""
              }
            </div>

            <div style="margin-top: 24px; padding-top: 24px; border-top: 2px solid #e2e8f0;">
              <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <p style="color: #64748b; margin: 0; font-size: 14px; font-weight: 600;">Payment Type</p>
                  <p style="margin: 0; font-weight: 600; color: #1e293b;">${
                    payment.payment_type || "Payment"
                  }</p>
                </div>
                ${
                  payment.payment_method
                    ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <p style="color: #64748b; margin: 0; font-size: 14px; font-weight: 600;">Payment Method</p>
                    <p style="margin: 0; font-weight: 600; color: #1e293b;">${payment.payment_method}</p>
                  </div>
                `
                    : ""
                }
                ${
                  payment.payment_reference
                    ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <p style="color: #64748b; margin: 0; font-size: 14px; font-weight: 600;">Reference</p>
                    <p style="margin: 0; font-weight: 600; color: #1e293b; font-family: monospace;">${payment.payment_reference}</p>
                  </div>
                `
                    : ""
                }
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 2px solid #e2e8f0;">
                  <p style="color: #1e293b; margin: 0; font-size: 18px; font-weight: 700;">Amount Paid</p>
                  <p style="margin: 0; font-size: 28px; font-weight: 700; color: #16a34a;">${formatAmountPDF(
                    payment.amount_paid
                  )}</p>
                </div>
              </div>
            </div>

            <div style="margin-top: 24px; padding: 16px; background-color: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
              <p style="font-size: 12px; color: #1e40af; margin: 0; font-weight: 600;">
                <strong>Order Status:</strong>
                <span style="margin-left: 8px; padding: 4px 12px; background-color: ${
                  order.order_status === "Completed"
                    ? "#d1fae5"
                    : order.order_status === "In Progress"
                    ? "#dbeafe"
                    : "#fef3c7"
                }; color: ${
        order.order_status === "Completed"
          ? "#065f46"
          : order.order_status === "In Progress"
          ? "#1e40af"
          : "#92400e"
      }; border-radius: 4px; font-size: 12px; font-weight: 700;">${
        order.order_status
      }</span>
              </p>
              ${
                Number(order.balance_amount) > 0
                  ? `
                <p style="font-size: 12px; color: #1e40af; margin: 8px 0 0 0;">
                  <strong>Remaining Balance:</strong> <span style="font-weight: 700;">${formatAmountPDF(
                    order.balance_amount
                  )}</span>
                </p>
              `
                  : `
                <p style="font-size: 12px; color: #065f46; margin: 8px 0 0 0; font-weight: 600;">
                  ✓ Payment Complete
                </p>
              `
              }
            </div>

            ${
              payment.notes
                ? `
              <div style="margin-top: 20px; padding: 16px; background-color: #fefce8; border-radius: 8px; border-left: 4px solid #facc15;">
                <p style="font-size: 12px; color: #854d0e; margin: 0; font-weight: 600;">Notes:</p>
                <p style="font-size: 12px; color: #713f12; margin: 5px 0 0 0;">${payment.notes}</p>
              </div>
            `
                : ""
            }
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">Thank you for your payment!</p>
            <p style="font-size: 12px; color: #cbd5e1; margin: 5px 0 0 0;">This is a computer-generated receipt and does not require a signature.</p>
          </div>
        </div>
      `;

      // Convert to PDF
      const canvas = await html2canvas(receiptContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Download
      pdf.save(`Payment-Receipt-${receiptNumber}.pdf`);

      // Cleanup
      document.body.removeChild(receiptContainer);

      alert(`Receipt ${receiptNumber} downloaded successfully!`);
    } catch (error) {
      console.error("Error generating payment receipt:", error);
      alert("Failed to generate payment receipt. Please try again.");
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const formatCurrency = (value) =>
    `₦${new Intl.NumberFormat("en-NG").format(value)}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get current status index
  const currentStatusIndex = activeStatusFlow.findIndex(status => status.key === displayStatus);
  const isCancelled = displayStatus === 'Cancelled';

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4 font-medium">Loading order details...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-red-500 text-lg font-semibold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
  
  if (!order) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No order found.</p>
      </div>
    </div>
  );
  
  if (!order.client_full_name || !order.order_title) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
        <XCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Incomplete order data.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Navigation Breadcrumb */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/order/order-dashboard" className="hover:text-blue-600 transition-colors font-medium">
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link to="/order/orders-list" className="hover:text-blue-600 transition-colors font-medium">
              Orders
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-semibold">Order Details</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-white to-blue-50/50 rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
                {order.order_title?.charAt(0) || 'O'}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 break-words">{order.order_title}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <p className="text-sm text-gray-600">Order ID: <span className="font-mono font-semibold">{order.slug}</span></p>
                  {isReadyMade && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700 border border-teal-200">
                      Ready Made
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isCancelled 
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {order.order_status}
                  </span>
                </div>
                {(order.order_description || order.current_allocation) && (
                  <p className="text-sm text-gray-500 mt-1.5">
                    {order.order_description}
                    {order.order_description && order.current_allocation && (
                      <> <span className="text-gray-300">|</span> </>
                    )}
                    {order.current_allocation && (
                      <>
                        <User size={13} className="inline text-gray-400 mr-1 -mt-0.5" />
                        Assigned to <strong>{order.current_allocation.staff_name}</strong>
                        {order.current_allocation.department && (
                          <> ({order.current_allocation.department})</>
                        )}
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button 
                onClick={handleTrackOrder}
                className="px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium whitespace-nowrap"
              >
                <Truck className="inline mr-1.5" size={14} />
                Track Order
              </button>
              <button 
                onClick={handleGenerateInvoice}
                disabled={isGeneratingInvoice}
                className="px-3 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingInvoice ? (
                  <>
                    <Loader2 className="inline mr-1.5 animate-spin" size={14} />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="inline mr-1.5" size={14} />
                    Invoice
                  </>
                )}
              </button>
              {!isClientView && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all text-sm font-medium whitespace-nowrap"
                >
                  <CreditCard className="inline mr-1.5" size={14} />
                  Add Payment
                </button>
              )}
              {!isClientView && (
                <Link to={`/order/edit/${orderId}`}>
                  <button className="px-3 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-700 transition-all text-sm font-medium flex items-center gap-1.5 whitespace-nowrap">
                    <EditIcon size={14} />
                    Edit Order
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={24} />
            Order Status Timeline
          </h2>
          
          <div className="flex items-center justify-between relative mb-12">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 -z-10 rounded-full">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  isCancelled 
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-blue-500 via-purple-500 to-green-500'
                }`}
                style={{ 
                  width: `${(currentStatusIndex / (activeStatusFlow.length - 1)) * 100}%` 
                }}
              ></div>
            </div>

            {activeStatusFlow.map((status, index) => {
              const IconComponent = status.icon;
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = order.order_status === status.key;
              const isClickable = index <= currentStatusIndex + 1 && !isCancelled && (status.key !== "QA Check" || canAccessQA);
              
              return (
                <div key={status.key} className="flex flex-col items-center relative z-10">
                  <button
                    onClick={() => isClickable && handleStatusUpdate(status.key)}
                    disabled={!isClickable || updatingStatus}
                    className={`flex items-center justify-center w-14 h-14 rounded-full border-4 transition-all duration-300 ${
                      isCancelled && status.key !== 'Cancelled'
                        ? 'border-gray-200 bg-gray-100 text-gray-400 opacity-40'
                        : isCurrent 
                        ? `border-${status.key === 'Cancelled' ? 'red' : 'blue'}-600 bg-gradient-to-br from-${status.key === 'Cancelled' ? 'red' : 'blue'}-500 to-${status.key === 'Cancelled' ? 'red' : 'purple'}-600 text-white shadow-xl scale-110 ring-4 ring-${status.key === 'Cancelled' ? 'red' : 'blue'}-100` 
                        : isCompleted
                        ? `border-${status.key === 'Cancelled' ? 'red' : 'green'}-500 bg-${status.key === 'Cancelled' ? 'red' : 'green'}-500 text-white shadow-lg`
                        : 'border-gray-300 bg-white text-gray-400'
                    } ${isClickable && !updatingStatus ? 'hover:scale-105 cursor-pointer hover:shadow-lg' : 'cursor-not-allowed'}`}
                  >
                    {updatingStatus && isCurrent ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle className="w-7 h-7" />
                    ) : (
                      <IconComponent className="w-7 h-7" />
                    )}
                  </button>
                  
                  <span className={`text-sm font-semibold mt-3 text-center transition-all ${
                    isCancelled && status.key !== 'Cancelled'
                      ? 'text-gray-400'
                      : isCurrent 
                      ? status.key === 'Cancelled' ? 'text-red-600' : 'text-blue-600'
                      : isCompleted 
                      ? 'text-gray-900' 
                      : 'text-gray-500'
                  }`}>
                    {status.label}
                  </span>
                  
                  {isCurrent && (
                    <div className="absolute -bottom-10">
                      <div className={`${
                        status.key === 'Cancelled' ? 'bg-red-600' : 'bg-blue-600'
                      } text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg font-medium`}>
                        Current Status
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Status Description */}
          <div className={`mt-4 p-5 rounded-xl border-2 ${
            isCancelled 
              ? 'bg-red-50 border-red-200' 
              : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-10 h-10 ${
                isCancelled ? 'bg-red-600' : 'bg-blue-600'
              } rounded-full flex items-center justify-center mt-0.5 shadow-lg`}>
                {isCancelled ? (
                  <XCircle className="w-5 h-5 text-white" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h3 className={`font-bold text-lg ${
                  isCancelled ? 'text-red-900' : 'text-blue-900'
                }`}>
                  Current Status: {displayStatus}
                </h3>
                <p className={`${
                  isCancelled ? 'text-red-700' : 'text-blue-700'
                } text-sm mt-1`}>
                  {displayStatus === 'Pending' && 'Order has been created and is awaiting assignment to a staff member.'}
                  {displayStatus === 'Assigned' && 'Order has been assigned to staff and work will begin soon.'}
                  {displayStatus === 'In Progress' && 'Order is currently being worked on by our team.'}
                  {displayStatus === 'Completed' && (isReadyMade ? 'Ready made order has been completed.' : 'Order production has been completed.')}
                  {displayStatus === 'On Delivery' && 'Order has been sent for delivery to the client.'}
                  {displayStatus === 'Cancelled' && 'This order has been cancelled and will not be processed further.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-blue-600" />
              Client Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <User size={16} className="text-gray-400" />
                  Client Name
                </label>
                <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200 text-gray-900 font-medium">
                  {order.client_full_name}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <Mail size={16} className="text-gray-400" />
                  Email Address
                </label>
                <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200 text-gray-900 font-medium">
                  {order.client_email}
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-600" />
              Order Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-gray-400" />
                  Order Title
                </label>
                <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-xl border border-gray-200 text-gray-900 font-medium">
                  {order.order_title}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <Tag size={16} className="text-gray-400" />
                  Order Category
                </label>
                <div className="mt-1">
                  {order.order_category ? (
                    <span className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-xl text-sm font-semibold border-2 border-purple-200 shadow-sm">
                      <span className="w-2.5 h-2.5 bg-purple-600 rounded-full"></span>
                      {order.order_category.name}
                    </span>
                  ) : (
                    <span className="text-gray-500 italic">No category selected</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Description & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="text-indigo-600" size={20} />
              Order Description
            </h3>
            <div className="p-5 bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-xl border border-gray-200 min-h-[140px]">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {getCleanDescription(order.order_description) || "No description provided."}
              </p>
              {order.current_allocation && (
                <>
                  <hr className="my-4 border-t border-gray-200" />
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={order.current_allocation.avatar_url}
                      alt={order.current_allocation.staff_name}
                    />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</p>
                      <p className="text-sm font-bold text-gray-900">{order.current_allocation.staff_name}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Timeline & Pricing */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Timeline & Pricing
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Start Date</label>
                  <div className="p-3 bg-gradient-to-r from-gray-50 to-green-50/30 rounded-xl border border-gray-200 text-center">
                    <Calendar size={16} className="inline text-gray-400 mr-2" />
                    <span className="font-medium">{formatDate(order.start_date)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Delivery Date</label>
                  <div className="p-3 bg-gradient-to-r from-gray-50 to-green-50/30 rounded-xl border border-gray-200 text-center">
                    <Truck size={16} className="inline text-gray-400 mr-2" />
                    <span className="font-medium">{formatDate(order.end_date)}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">Total Price</label>
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 font-bold text-blue-900 text-center">
                    {formatCurrency(order.order_price)}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">Initial Deposit</label>
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 text-purple-900 font-semibold text-center">
                    {formatCurrency(order.initial_deposit)}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">Total Paid</label>
                  <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 text-green-900 font-semibold text-center">
                    {formatCurrency(order.total_paid || 0)}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">Balance</label>
                  <div className={`p-3 rounded-xl border-2 font-bold text-center ${
                    order.balance_amount > 0
                      ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 text-amber-800'
                      : 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 text-green-800'
                  }`}>
                    {formatCurrency(order.balance_amount)}
                  </div>
                </div>
              </div>

              {/* Initial Deposit Receipt Button */}
              {order.initial_deposit > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => generatePaymentReceipt({
                      id: `DEP-${order.id}`,
                      paid_at: order.ordered_at || order.created_at,
                      amount_paid: order.initial_deposit,
                      payment_type: "Initial Deposit",
                      payment_method: null,
                      payment_reference: null,
                      notes: "Initial deposit payment"
                    })}
                    disabled={isGeneratingInvoice}
                    className="text-sm px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <FileText size={14} />
                    Download Initial Deposit Receipt
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Type & Payment Receipt */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Type */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="text-orange-600" size={20} />
              Order Type
            </h3>
            <div className="p-5 bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-xl border border-gray-200">
              <span className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl text-base font-bold shadow-sm ${
                order.order_type === 'Bulk' 
                  ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-2 border-purple-300' 
                  : order.order_type === 'Ready Made'
                  ? 'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border-2 border-teal-300'
                  : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-2 border-blue-300'
              }`}>
                <span className="w-3 h-3 bg-current rounded-full shadow-inner"></span>
                {order.order_type} Order
              </span>
            </div>
          </div>

          {/* Payment Receipt */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="text-teal-600" size={20} />
              Payment Receipt
            </h3>
            <div className="p-5 bg-gradient-to-br from-gray-50 to-teal-50/30 rounded-xl border border-gray-200">
              {order.order_payment_receipt_url ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-semibold">Payment receipt uploaded</p>
                    <p className="text-gray-500 text-sm mt-1">Click to view the receipt</p>
                  </div>
                  <a
                    href={order.order_payment_receipt_url}
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all font-medium shadow-md hover:shadow-lg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Receipt
                  </a>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No payment receipt uploaded</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Timeline & Completion Image */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Timeline */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="text-indigo-600" size={20} />
                Order Timeline
              </h3>
              <button
                onClick={() => setTimelineSortAsc((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                title={timelineSortAsc ? "Sort descending" : "Sort ascending"}
              >
                <ArrowUpDown size={16} />
                <span>{timelineSortAsc ? "ASC" : "DSC"}</span>
              </button>
            </div>
            <div className="space-y-0">
              {(() => {
              const events = [];

              events.push({
                date: order.ordered_at,
                element: (
                  <div className="flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 rounded-lg px-4 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Order Created</p>
                        <p className="text-gray-500 text-sm">Order was successfully created in the system</p>
                      </div>
                    </div>
                    <span className="text-gray-600 text-sm font-medium">
                      {order.ordered_at ? formatDate(order.ordered_at) : 'N/A'}
                    </span>
                  </div>
                )
              });

              if (order.current_allocation) {
                const allocDate = order.current_allocation.allocated_at || order.updated_at;
                events.push({
                  date: allocDate,
                  element: (
                    <div className="flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 rounded-lg px-4 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                          <UserCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Order / Staff</p>
                          <p className="text-gray-500 text-sm">Assigned to: <span className="font-semibold text-gray-700">{order.current_allocation.staff_name}</span></p>
                        </div>
                      </div>
                      <span className="text-gray-600 text-sm font-medium">
                        {allocDate ? formatDate(allocDate) : 'N/A'}
                      </span>
                    </div>
                  )
                });
              }

              if (order.payments && order.payments.length > 0) {
                order.payments.forEach((payment) => {
                  events.push({
                    date: payment.paid_at,
                    element: (
                      <div className="flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 rounded-lg px-4 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                            <CreditCard className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{payment.payment_type || "Payment Received"}</p>
                            <p className="text-gray-500 text-sm">
                              {`₦${Number(payment.amount_paid).toLocaleString()}`}
                              {payment.payment_method ? ` via ${payment.payment_method}` : ""}
                            </p>
                            {payment.notes && (
                              <p className="text-xs text-amber-600 mt-1 font-medium">{payment.notes}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-gray-600 text-sm font-medium">
                          {payment.paid_at ? formatDate(payment.paid_at) : 'N/A'}
                        </span>
                      </div>
                    )
                  });
                });
              }

              events.push({
                date: order.updated_at,
                element: (
                  <div className="flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 rounded-lg px-4 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                        order.order_status !== 'Pending'
                          ? 'bg-gradient-to-br from-blue-400 to-blue-500'
                          : 'bg-gray-200'
                      }`}>
                        {order.order_status !== 'Pending' ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Status Updated</p>
                        <p className="text-gray-500 text-sm">Current status: <span className="font-semibold text-gray-700">{order.order_status}</span></p>
                      </div>
                    </div>
                    <span className="text-gray-600 text-sm font-medium">
                      {order.updated_at ? formatDate(order.updated_at) : 'N/A'}
                    </span>
                  </div>
                )
              });

              const sortedEvents = events
                .filter((e) => e.date)
                .sort((a, b) => {
                  const diff = new Date(a.date) - new Date(b.date);
                  return timelineSortAsc ? diff : -diff;
                });

              return sortedEvents.length > 0
                ? sortedEvents.map((event, i) => (
                    <div key={i}>{event.element}</div>
                  ))
                : <p className="text-gray-500 text-sm text-center py-4">No timeline events available.</p>;
            })()}
            </div>
          </div>

          {/* Completion Image */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} />
              Completed Work
            </h3>
            {order.order_completion_image_url || order.order_completion_image ? (
              <div className="space-y-3">
                <img
                  src={order.order_completion_image_url || order.order_completion_image}
                  alt="Completed garment"
                  className="w-full rounded-lg object-contain border border-gray-200"
                  style={{ maxHeight: "320px" }}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No completion image uploaded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment History Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="text-green-600" size={24} />
              Payment History
            </h3>
            {order.payments && order.payments.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(order.total_paid)}
                  </p>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Payment Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Number(order.payment_progress).toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {order.payments && order.payments.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Payment Completion</span>
                <span className="text-gray-900 font-semibold">
                  {formatCurrency(order.total_paid)} / {formatCurrency(order.order_price)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-700 shadow-lg"
                  style={{ width: `${Math.min(Number(order.payment_progress), 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Payments Table */}
          {order.payments && order.payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <th className="p-4 text-left text-sm font-bold text-gray-900">Date</th>
                    <th className="p-4 text-left text-sm font-bold text-gray-900">Payment Type</th>
                    <th className="p-4 text-left text-sm font-bold text-gray-900">Reference</th>
                    <th className="p-4 text-left text-sm font-bold text-gray-900">Method</th>
                    <th className="p-4 text-left text-sm font-bold text-gray-900">Notes</th>
                    <th className="p-4 text-right text-sm font-bold text-gray-900">Amount</th>
                    <th className="p-4 text-center text-sm font-bold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.payments.map((payment, index) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-green-50/50 transition-all"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(payment.paid_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(payment.paid_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${
                          payment.payment_type === 'Initial Deposit'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : payment.payment_type === 'Final Payment'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : payment.payment_type === 'Full Payment'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {payment.payment_type || 'Payment'}
                        </span>
                      </td>
                      <td className="p-4">
                        {payment.payment_reference ? (
                          <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-700 border border-gray-200">
                            {payment.payment_reference}
                          </code>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {payment.payment_method ? (
                          <span className="text-sm font-medium text-gray-700">
                            {payment.payment_method}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {payment.notes ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            {payment.notes}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(payment.amount_paid)}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => generatePaymentReceipt(payment)}
                            disabled={isGeneratingInvoice}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-all text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed group relative"
                            title="Generate Receipt"
                          >
                            <FileText size={18} />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Download Receipt
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-10 h-10 text-gray-300" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Payments Yet</h4>
              <p className="text-gray-500 mb-6">No payments have been recorded for this order</p>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-md hover:shadow-lg"
              >
                <CreditCard className="inline mr-2" size={18} />
                Add First Payment
              </button>
            </div>
          )}

          {/* Payment Summary Cards */}
          {order.payments && order.payments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t-2 border-gray-200">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                <p className="text-xs font-semibold text-blue-700 mb-1">Total Order Value</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(order.order_price)}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
                <p className="text-xs font-semibold text-green-700 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(order.total_paid)}</p>
              </div>
              <div className={`rounded-xl p-4 border-2 ${
                Number(order.balance_amount) > 0
                  ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
                  : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
              }`}>
                <p className={`text-xs font-semibold mb-1 ${
                  Number(order.balance_amount) > 0 ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  Remaining Balance
                </p>
                <p className={`text-2xl font-bold ${
                  Number(order.balance_amount) > 0 ? 'text-amber-900' : 'text-emerald-900'
                }`}>
                  {formatCurrency(order.balance_amount)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                <p className="text-xs font-semibold text-purple-700 mb-1">Payments Made</p>
                <p className="text-2xl font-bold text-purple-900">{order.payments.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <AddPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          order={order}
          onSave={handleSavePayment}
        />
      )}

      {/* Track Order Modal */}
      {showTrackOrderModal && (
        <TrackOrderStatusModal
          isOpen={showTrackOrderModal}
          onClose={() => setShowTrackOrderModal(false)}
          currentStatus={order.order_status}
          orderId={orderId}
          isReadyMade={isReadyMade}
        />
      )}

      {/* QA Checklist Modal */}
      {showQAModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowQAModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6 text-cyan-600" />
                QA Checklist
              </h3>
              <button onClick={() => setShowQAModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
              <p className="text-sm text-gray-600 mb-4">Verify all items before marking the order as quality checked:</p>
            <div className="space-y-3 mb-6">
              {QA_ITEMS.map((item) => (
                <label key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                    checked={qaChecklist[item.id] || false}
                    onChange={() => {
                      const next = { ...qaChecklist, [item.id]: !qaChecklist[item.id] };
                      setQaChecklist(next);
                      localStorage.setItem(`qa_checklist_${orderId}`, JSON.stringify(next));
                    }}
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
            <button
              onClick={handleQAComplete}
              disabled={!allQaChecked}
              className={`w-full py-3 font-semibold rounded-xl transition-all ${
                allQaChecked
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {allQaChecked ? "Complete QA Check" : "Check all items to continue"}
            </button>
          </div>
        </div>
      )}

      {/* Complete Upload Modal */}
      {showCompleteUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowCompleteUploadModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Complete Order
              </h3>
              <button onClick={() => setShowCompleteUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Optionally upload a photo of the completed garment before marking the order as done.
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6 text-center hover:border-gray-400 transition-colors">
              {completeOrderImage ? (
                <div className="space-y-3">
                  <img
                    src={URL.createObjectURL(completeOrderImage)}
                    alt="Completed garment preview"
                    className="max-h-48 mx-auto rounded-lg object-contain"
                  />
                  <p className="text-sm text-gray-500">{completeOrderImage.name}</p>
                  <button
                    onClick={() => setCompleteOrderImage(null)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-10 h-10 text-gray-400" />
                  <span className="text-sm text-gray-500">Click to upload completed garment photo</span>
                  <span className="text-xs text-gray-400">Optional</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files[0]) setCompleteOrderImage(e.target.files[0]);
                    }}
                  />
                </label>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCompleteUploadModal(false); setCompleteOrderImage(null); }}
                className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteConfirm}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all"
              >
                Complete Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign / Reassign Modal */}
      {!isReadyMade && (
        <AssignOrderModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          order={order}
          mode={assignMode}
          showDepartmentFilter={true}
          onAssign={handleAssignOrder}
          excludeStaffId={order?.current_allocation?.staff_id || order?.current_allocation?.staff}
        />
      )}

      {/* Error Modal */}
      {errorModal.show && (
        <SuccessModal
          title={errorModal.title}
          message={errorModal.message}
          buttonText="OK"
          onClose={() => setErrorModal({ show: false, title: "", message: "" })}
          isError={true}
        />
      )}
    </div>
  );
};

export default OrderDetail;