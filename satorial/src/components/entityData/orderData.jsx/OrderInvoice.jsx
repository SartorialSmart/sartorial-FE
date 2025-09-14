import React, { useState, useEffect, useRef } from "react";
import OrderService from "../../../services/OrderService";

const OrderInvoice = ({ onClose, order }) => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const invoiceRef = useRef(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        if (typeof order === "string" || typeof order === "number") {
          const data = await OrderService.getOrderById(order);
          setOrderData(data);
        } else if (order && typeof order === "object") {
          setOrderData(order);
        }
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (order) {
      fetchOrderDetails();
    }
  }, [order]);

  // Helper functions for formatting
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
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

  const calculateVAT = (amount, vatRate = 0.075) => {
    return Number(amount) * vatRate;
  };

  // PDF Generation Function
  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).jsPDF;

      const element = invoiceRef.current;
      if (!element) return null;

      const canvas = await html2canvas(element, {
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
      const imgY = 30;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      return pdf;
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
      return null;
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Download PDF
  const handleDownload = async () => {
    const pdf = await generatePDF();
    if (pdf) {
      const invoiceNumber = orderData.id
        ? `INV-${String(orderData.id).padStart(4, "0")}`
        : "INV-0000";
      pdf.save(`Invoice-${invoiceNumber}.pdf`);
    }
  };

  // Check if Web Share API is supported
  const canShareFiles = () => {
    return (
      navigator.canShare &&
      navigator.canShare({ files: [new File([], "test")] })
    );
  };

  // Share via Web Share API (with file attachment)
  const shareWithAttachment = async (shareData) => {
    const pdf = await generatePDF();
    if (pdf) {
      const invoiceNumber = orderData.id
        ? `INV-${String(orderData.id).padStart(4, "0")}`
        : "INV-0000";
      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], `Invoice-${invoiceNumber}.pdf`, {
        type: "application/pdf",
      });

      if (canShareFiles()) {
        try {
          await navigator.share({
            title: shareData.title,
            text: shareData.text,
            files: [file],
          });
          setShowShareModal(false);
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Error sharing:", error);
            // Fallback to download + manual sharing
            fallbackShare(shareData.type);
          }
        }
      } else {
        fallbackShare(shareData.type);
      }
    }
  };

  // Fallback sharing method
  const fallbackShare = async (type) => {
    const pdf = await generatePDF();
    if (!pdf) return;

    const invoiceNumber = orderData.id
      ? `INV-${String(orderData.id).padStart(4, "0")}`
      : "INV-0000";
    const pdfBlob = pdf.output("blob");

    // Create downloadable link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice-${invoiceNumber}.pdf`;
    link.click();

    // Show instructions modal
    showFallbackInstructions(type, invoiceNumber);
  };

  // Show manual attachment instructions
  const showFallbackInstructions = (type, invoiceNumber) => {
    const instructions =
      type === "email"
        ? `The PDF has been downloaded to your device.\n\nTo complete sharing:\n1. Open your email app\n2. Compose new email to: ${
            orderData.client_email || "customer email"
          }\n3. Attach the downloaded file: Invoice-${invoiceNumber}.pdf\n4. Send the email`
        : `The PDF has been downloaded to your device.\n\nTo complete sharing:\n1. Open WhatsApp\n2. Find contact: ${
            orderData.client_full_name || "customer"
          }\n3. Click the attachment (📎) button\n4. Select "Document"\n5. Choose the downloaded file: Invoice-${invoiceNumber}.pdf\n6. Send the message`;

    alert(instructions);
    setShowShareModal(false);
  };

  // Enhanced Email Share
  const shareViaEmail = async () => {
    const invoiceNumber = orderData.id
      ? `INV-${String(orderData.id).padStart(4, "0")}`
      : "INV-0000";
    const subject = `Invoice ${invoiceNumber} - ${
      orderData.order_title || "Order"
    }`;
    const emailText = `Dear ${orderData.client_full_name || "Customer"},

Please find attached the invoice for your order.

Invoice Details:
- Invoice Number: ${invoiceNumber}
- Order: ${orderData.order_title || "N/A"}
- Amount: ${formatAmount(orderData.order_price)}
- Date: ${formatDate(orderData.ordered_at || orderData.created_at)}

Thank you for your business!

Best regards`;

    // Try Web Share API first
    if (canShareFiles()) {
      await shareWithAttachment({
        title: subject,
        text: emailText,
        type: "email",
      });
    } else {
      // Fallback: Try mailto with base64 attachment (limited support)
      const pdf = await generatePDF();
      if (pdf) {
        const pdfBase64 = pdf.output("dataurlstring");

        // Some email clients support data URLs, but most don't
        // So we'll do a hybrid approach
        try {
          const mailtoLink = `mailto:${
            orderData.client_email || ""
          }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
            emailText + "\n\n[PDF attachment should be manually added]"
          )}`;

          // Download PDF first
          const pdfBlob = pdf.output("blob");
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `Invoice-${invoiceNumber}.pdf`;
          link.click();

          // Then open email
          setTimeout(() => {
            window.open(mailtoLink);
            showFallbackInstructions("email", invoiceNumber);
          }, 1000);
        } catch (error) {
          console.error("Email sharing error:", error);
          fallbackShare("email");
        }
      }
    }
  };

  // Enhanced WhatsApp Share
  const shareViaWhatsApp = async () => {
    const invoiceNumber = orderData.id
      ? `INV-${String(orderData.id).padStart(4, "0")}`
      : "INV-0000";
    const whatsappText = `Hi ${orderData.client_full_name || "there"}! 👋

Your invoice is ready! 📄

*Invoice Details:*
📋 Invoice Number: ${invoiceNumber}
🛍️ Order: ${orderData.order_title || "N/A"}
💰 Amount: ${formatAmount(orderData.order_price)}
📅 Date: ${formatDate(orderData.ordered_at || orderData.created_at)}

Thank you for your business! 🙏`;

    // Try Web Share API first
    if (canShareFiles()) {
      await shareWithAttachment({
        title: `Invoice ${invoiceNumber}`,
        text: whatsappText,
        type: "whatsapp",
      });
    } else {
      // Fallback to manual process
      const pdf = await generatePDF();
      if (pdf) {
        const pdfBlob = pdf.output("blob");
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Invoice-${invoiceNumber}.pdf`;
        link.click();

        // Open WhatsApp after a short delay
        setTimeout(() => {
          const whatsappLink = `https://wa.me/${
            orderData.client_phone || ""
          }?text=${encodeURIComponent(
            whatsappText + "\n\n[Please attach the downloaded PDF file]"
          )}`;
          window.open(whatsappLink, "_blank");
          showFallbackInstructions("whatsapp", invoiceNumber);
        }, 1000);
      }
    }
  };

  // Advanced share with actual file attachment (for modern browsers)
  const shareViaAdvancedMethod = async (type) => {
    const pdf = await generatePDF();
    if (!pdf) return;

    const invoiceNumber = orderData.id
      ? `INV-${String(orderData.id).padStart(4, "0")}`
      : "INV-0000";
    const pdfBlob = pdf.output("blob");

    // Create a temporary file input to trigger file sharing
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    // Create a File object
    const file = new File([pdfBlob], `Invoice-${invoiceNumber}.pdf`, {
      type: "application/pdf",
    });

    // Use the File System Access API if available (Chrome/Edge)
    if ("showSaveFilePicker" in window) {
      try {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `Invoice-${invoiceNumber}.pdf`,
          types: [
            {
              description: "PDF files",
              accept: { "application/pdf": [".pdf"] },
            },
          ],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(pdfBlob);
        await writable.close();

        // Now open the sharing app
        if (type === "email") {
          const subject = `Invoice ${invoiceNumber}`;
          const mailtoLink = `mailto:${
            orderData.client_email || ""
          }?subject=${encodeURIComponent(subject)}`;
          window.open(mailtoLink);
        } else {
          const whatsappLink = `https://wa.me/${orderData.client_phone || ""}`;
          window.open(whatsappLink, "_blank");
        }

        alert(
          `PDF saved successfully! Please attach it to your ${
            type === "email" ? "email" : "WhatsApp message"
          }.`
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("File save error:", error);
          fallbackShare(type);
        }
      }
    } else {
      fallbackShare(type);
    }

    document.body.removeChild(fileInput);
    setShowShareModal(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white w-[600px] p-6 rounded-lg shadow-lg relative">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading invoice...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white w-[600px] p-6 rounded-lg shadow-lg relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">
              {error || "No order data available"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = Number(orderData.order_price || 0);
  const vat = calculateVAT(subtotal);
  const total = subtotal + vat;
  const invoiceNumber = orderData.id
    ? `#INV-${String(orderData.id).padStart(4, "0")}`
    : "#INV-0000";

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white w-[600px] p-6 rounded-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl z-10"
          >
            &times;
          </button>

          {/* Invoice Content for PDF Generation */}
          <div ref={invoiceRef} className="bg-white p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold">Invoice</h1>
            </div>

            <div className="border p-6 rounded-md bg-gray-100">
              <div className="flex justify-between">
                <p className="text-lg font-semibold">
                  Invoice <span className="text-gray-500">{invoiceNumber}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-500">Issued</p>
                  <p>
                    {formatDate(orderData.ordered_at || orderData.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Due</p>
                  <p>
                    {calculateDueDate(
                      orderData.ordered_at || orderData.created_at
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">From</p>
                  <p>
                    {orderData.business_name ||
                      orderData.vendor_name ||
                      "Your Business"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">To</p>
                  <p>
                    {orderData.client_full_name ||
                      orderData.client_name ||
                      "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-gray-500">About the project</p>
                <p className="text-gray-800">
                  {orderData.order_title || orderData.order_name || "Order"}
                </p>
                {orderData.order_description && (
                  <p className="text-gray-600 text-sm mt-1">
                    {orderData.order_description}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <p className="text-gray-500 font-semibold">Deliverables</p>
                <div className="flex justify-between border-b py-2">
                  <p className="text-gray-800">
                    {orderData.order_title || orderData.order_name || "Service"}
                  </p>
                  <p className="text-gray-800 font-semibold">
                    {formatAmount(subtotal)}
                  </p>
                </div>
                {orderData.order_items &&
                  orderData.order_items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between border-b py-2"
                    >
                      <p className="text-gray-800">{item.name || item.title}</p>
                      <p className="text-gray-800 font-semibold">
                        {formatAmount(item.price || item.amount)}
                      </p>
                    </div>
                  ))}
              </div>

              <div className="mt-6">
                <div className="flex justify-between border-t pt-2">
                  <p className="text-gray-500">Subtotal</p>
                  <p className="text-gray-800">{formatAmount(subtotal)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-500">VAT (7.5%)</p>
                  <p className="text-gray-800">{formatAmount(vat)}</p>
                </div>
              </div>

              <div className="flex justify-between mt-4 p-4 bg-gray-200 rounded-md">
                <p className="text-lg font-semibold">Total</p>
                <p className="text-lg font-bold">{formatAmount(total)}</p>
              </div>

              {orderData.order_status && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs ${
                        orderData.order_status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : orderData.order_status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {orderData.order_status}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-6 space-x-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              onClick={handleDownload}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? "Generating..." : "Download PDF"}
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              onClick={() => setShowShareModal(true)}
            >
              Share with Attachment
            </button>
            <button
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              onClick={() => window.print()}
            >
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share Invoice with PDF</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                &times;
              </button>
            </div>

            {canShareFiles() ? (
              <p className="text-green-600 mb-4 text-sm flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Automatic PDF attachment supported
              </p>
            ) : (
              <p className="text-amber-600 mb-4 text-sm flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                PDF will be saved for manual attachment
              </p>
            )}

            <div className="space-y-3">
              <button
                onClick={shareViaEmail}
                disabled={isGeneratingPDF}
                className="w-full flex items-center justify-center space-x-3 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>
                  {isGeneratingPDF ? "Generating PDF..." : "Email with PDF"}
                </span>
              </button>

              <button
                onClick={shareViaWhatsApp}
                disabled={isGeneratingPDF}
                className="w-full flex items-center justify-center space-x-3 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                </svg>
                <span>
                  {isGeneratingPDF ? "Generating PDF..." : "WhatsApp with PDF"}
                </span>
              </button>

              {canShareFiles() && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <p className="text-xs text-green-700">
                    ✅ Your browser supports automatic file sharing! The PDF
                    will be attached automatically.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderInvoice;
