import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EditIcon } from "lucide-react";
import OrderService from "../../../services/OrderService";
import PaymentService from "../../../services/PaymentService"; // Import Payment Service
import AddPaymentModal from "../../modals/formModals/AddOrderPaymentFormModal";

const OrderDetail = () => {
  const { orderId } = useParams(); // Get order ID from URL
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

    fetchOrderDetails();
  }, [orderId]);

  const handleSavePayment = async (paymentData) => {
    try {
      // Create Payment
      await PaymentService.createPayment({
        order: orderId,
        amount_paid: Number(paymentData.amountPaid),
      });

      setShowPaymentModal(false);

      // Refresh order details after payment
      const updatedOrder = await OrderService.getOrderById(orderId);
      setOrder(updatedOrder);
    } catch (err) {
      console.error("Failed to save payment:", err);
    }
  };

  const formatCurrency = (value) =>
    `₦${new Intl.NumberFormat("en-NG").format(value)}`;

  if (loading) return <p>Loading order details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!order) return <p>No order found.</p>;
  if (!order.client_full_name || !order.order_title)
    return <p>Incomplete order data.</p>;

  return (
    <div className="p-6 bg-gray-50 max-w-7xl mx-auto">
      <nav className="text-sm text-gray-500 mb-4">
        <Link
          to="/order/order-dashboard"
          className="hover:underline text-blue-500"
        >
          Dashboard
        </Link>{" "}
        &gt;
        <Link
          to="/order/orders-list"
          className="hover:underline ml-1 text-blue-500"
        >
          Orders
        </Link>{" "}
        &gt;
        <span className="ml-1 text-gray-700">Order Details</span>
      </nav>

      {/* Header Section */}
      <div className="bg-white p-6 rounded-lg shadow-md grid grid-cols-2 gap-4 w-full">
        <div className="flex items-center">
          {/* Title & Status */}
          <h2 className="text-2xl font-normal">Order Details</h2>
          <span className="px-3 mx-2 py-1 bg-green-200 text-green-700 text-sm font-thin rounded-full">
            {order.order_status}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-4 w-full justify-end">
          <button className="border border-blue-500 text-blue-500 px-4 py-2 rounded-md hover:bg-blue-100">
            Track Order
          </button>
          <button className="border border-blue-500 text-blue-500 px-4 py-2 rounded-md hover:bg-blue-100">
            Generate Invoice
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Payment
          </button>
          <Link to={`/order/edit/${orderId}`}>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700">
              Edit
              <span className="ml-2 text-xs">
                <EditIcon size={16} className="ml-1" />
              </span>
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-gray-600 text-sm font-medium">
              Client Name *
            </label>
            <input
              type="text"
              value={order.client_full_name}
              disabled
              className="w-full border p-2 rounded-md bg-gray-100"
            />
          </div>
          <div>
            <label className="text-gray-600 text-sm font-medium">
              Client Email Address *
            </label>
            <input
              type="text"
              value={order.client_email}
              disabled
              className="w-full border p-2 rounded-md bg-gray-100"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="text-gray-600 text-sm font-medium">
            Order Name *
          </label>
          <input
            type="text"
            value={order.order_title}
            disabled
            className="w-full border p-2 rounded-md bg-gray-100"
          />
        </div>

        <div className="mb-6">
          <label className="text-gray-700 text-sm font-medium">
            Order Category <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-3 mt-2">
            {order && order.order_category ? (
              <button
                type="button"
                className="px-4 py-2 flex items-center gap-2 border rounded-xl text-sm font-medium 
          border-gray-300 text-gray-600 bg-gray-100 shadow-sm cursor-not-allowed"
                disabled
              >
                <span className="w-4 h-4 flex items-center justify-center border border-blue-600 rounded-full">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                </span>
                {order.order_category.name}
              </button>
            ) : (
              <p className="text-gray-500">No category selected.</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-gray-600 text-sm font-medium">
            Order Description *
          </label>
          <textarea
            value={order.order_description}
            disabled
            className="w-full border p-2 rounded-md bg-gray-100 h-24"
          ></textarea>
        </div>

        <div className="mb-6">
          <label className="text-gray-600 text-sm font-medium">
            File Attachment
          </label>
          <div className="flex items-center gap-4 mt-2">
            <input
              type="text"
              value={order.order_payment_receipt_url || "No file uploaded"}
              disabled
              className="border p-2 rounded-md bg-gray-100 w-3/4"
            />
            {order.order_payment_receipt_url && (
              <Link
                to={order.order_payment_receipt_url}
                className="text-blue-600 hover:underline"
                target="_blank" // Open in new tab
              >
                Open Image
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-gray-600 text-sm font-medium">
              Start Date *
            </label>
            <input
              type="text"
              value={order.start_date}
              disabled
              className="w-full border p-2 rounded-md bg-gray-100"
            />
          </div>
          <div>
            <label className="text-gray-600 text-sm font-medium">
              Delivery Date *
            </label>
            <input
              type="text"
              value={order.end_date}
              disabled
              className="w-full border p-2 rounded-md bg-gray-100"
            />
          </div>
          <div>
            <label className="text-gray-600 text-sm font-medium">Price *</label>
            <input
              type="text"
              value={formatCurrency(order.order_price)}
              disabled
              className="w-full border p-2 rounded-md bg-gray-100"
            />
          </div>
          <div>
            <label className="text-gray-600 text-sm font-medium">
              Order Type *
            </label>
            <input
              type="text"
              value={order.order_type}
              disabled
              className="w-full border p-2 rounded-md bg-gray-100"
            />
          </div>
          <div>
            <label className="text-gray-600 text-sm font-medium">
              Initial Deposit *
            </label>
            <input
              type="text"
              value={formatCurrency(order.initial_deposit)}
              disabled
              className="w-full border p-2 rounded-md bg-gray-100"
            />
          </div>
          <div>
            <label className="text-gray-600 text-sm font-medium">
              Balance *
            </label>
            <input
              type="text"
              value={formatCurrency(order.balance_amount)}
              disabled
              className="w-full border p-2 rounded-md bg-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h3 className="text-lg font-semibold mb-4">Receipts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {order.receipts && order.receipts.length > 0 ? (
            order.receipts.map((receipt, index) => (
              <div
                key={index}
                className="border p-4 rounded-md flex justify-between items-center"
              >
                <div>
                  <p className="text-sm font-medium">
                    {receipt.name} ₦{receipt.amount}
                  </p>
                  <p className="text-xs text-gray-500">{receipt.date}</p>
                </div>
                <div className="flex gap-3 text-blue-600 text-sm">
                  <Link to={receipt.view_link}>View</Link>
                  <Link to={receipt.download_link}>Download</Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No receipts available.</p>
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
    </div>
  );
};

export default OrderDetail;
