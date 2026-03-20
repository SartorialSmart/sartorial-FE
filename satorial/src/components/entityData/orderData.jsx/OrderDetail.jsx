import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { 
  EditIcon, ChevronRight, CheckCircle, Calendar, Clock, Truck, Package, 
  UserCheck, XCircle, Loader2, User, Mail, FileText, ShoppingBag, 
  CreditCard, BarChart3, Tag 
} from "lucide-react";
import OrderService from "../../../services/OrderService";
import PaymentService from "../../../services/PaymentService";
import SettingsService from "../../../services/settings";
import AddPaymentModal from "../../modals/formModals/AddOrderPaymentFormModal";
import TrackOrderStatusModal from "../../modals/formModals/TrackOrderStatusModal";

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTrackOrderModal, setShowTrackOrderModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [orgProfile, setOrgProfile] = useState(null);

  // Define all possible statuses in order (Completed before On Delivery)
  const STATUS_FLOW = [
    { key: 'Pending', label: 'Pending', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    { key: 'Assigned', label: 'Assigned', icon: UserCheck, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { key: 'In Progress', label: 'In Progress', icon: Package, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { key: 'Completed', label: 'Completed', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { key: 'On Delivery', label: 'On Delivery', icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    { key: 'Cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  ];

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const data = await OrderService.getOrderById(orderId);
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
      }
    };

    fetchOrderDetails();
    fetchOrgProfile();
  }, [orderId]);

  const handleSavePayment = async (paymentData) => {
    try {
      await PaymentService.createPayment({
        order: orderId,
        amount_paid: Number(paymentData.amountPaid),
      });

      setShowPaymentModal(false);
      const updatedOrder = await OrderService.getOrderById(orderId);
      setOrder(updatedOrder);
    } catch (err) {
      console.error("Failed to save payment:", err);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (updatingStatus || !order) return;
    
    setUpdatingStatus(true);
    try {
      const updateData = {
        order_status: newStatus
      };

      await OrderService.updateOrder(orderId, updateData);
      const updatedOrder = await OrderService.getOrderById(orderId);
      setOrder(updatedOrder);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update order status. Please try again.");
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
      const invoiceNumber = order.id ? `INV-${String(order.id).padStart(4, "0")}` : "INV-0000";
      
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
      const businessLogo = orgProfile?.logo_url || "";

      // Build the invoice HTML
      invoiceContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #333;">
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
        </div>
      `;

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
      const rcptBusinessLogo = orgProfile?.logo_url || "";

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
  const currentStatusIndex = STATUS_FLOW.findIndex(status => status.key === order?.order_status);
  const isCancelled = order?.order_status === 'Cancelled';

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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {order.order_title?.charAt(0) || 'O'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{order.order_title}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-gray-600">Order ID: <span className="font-mono font-semibold">{order.slug}</span></p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isCancelled 
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {order.order_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleTrackOrder}
                className="px-4 py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium shadow-sm hover:shadow-md"
              >
                <Truck className="inline mr-2" size={16} />
                Track Order
              </button>
              <button 
                onClick={handleGenerateInvoice}
                disabled={isGeneratingInvoice}
                className="px-4 py-2.5 border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingInvoice ? (
                  <>
                    <Loader2 className="inline mr-2 animate-spin" size={16} />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="inline mr-2" size={16} />
                    Invoice
                  </>
                )}
              </button>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-md hover:shadow-lg"
              >
                <CreditCard className="inline mr-2" size={16} />
                Add Payment
              </button>
              <Link to={`/order/edit/${orderId}`}>
                <button className="px-4 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all font-medium flex items-center gap-2 shadow-md hover:shadow-lg">
                  <EditIcon size={16} />
                  Edit Order
                </button>
              </Link>
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
                  width: `${(currentStatusIndex / (STATUS_FLOW.length - 1)) * 100}%` 
                }}
              ></div>
            </div>

            {STATUS_FLOW.map((status, index) => {
              const IconComponent = status.icon;
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = order.order_status === status.key;
              const isClickable = index <= currentStatusIndex + 1 && !isCancelled;
              
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
                  Current Status: {order.order_status}
                </h3>
                <p className={`${
                  isCancelled ? 'text-red-700' : 'text-blue-700'
                } text-sm mt-1`}>
                  {order.order_status === 'Pending' && 'Order has been created and is awaiting assignment to a staff member.'}
                  {order.order_status === 'Assigned' && 'Order has been assigned to staff and work will begin soon.'}
                  {order.order_status === 'In Progress' && 'Order is currently being worked on by our team.'}
                  {order.order_status === 'Completed' && 'Order production has been completed.'}
                  {order.order_status === 'On Delivery' && 'Order has been sent for delivery to the client.'}
                  {order.order_status === 'Cancelled' && 'This order has been cancelled and will not be processed further.'}
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
                {order.order_description || "No description provided."}
              </p>
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

        {/* Order Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="text-indigo-600" size={20} />
            Order Timeline
          </h3>
          <div className="space-y-4">
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

            {/* Payment timeline events */}
            {order.payments && order.payments.length > 0 && (
              [...order.payments]
                .sort((a, b) => new Date(a.paid_at) - new Date(b.paid_at))
                .map((payment, idx) => (
                  <div key={`pay-${idx}`} className="flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 rounded-lg px-4 transition-colors">
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
                      </div>
                    </div>
                    <span className="text-gray-600 text-sm font-medium">
                      {payment.paid_at ? formatDate(payment.paid_at) : 'N/A'}
                    </span>
                  </div>
                ))
            )}

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
        />
      )}
    </div>
  );
};

export default OrderDetail;