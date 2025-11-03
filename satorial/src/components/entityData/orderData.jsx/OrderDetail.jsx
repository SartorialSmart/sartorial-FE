import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EditIcon, ChevronRight, CheckCircle, Calendar, Clock, Truck, Package, UserCheck, XCircle, Loader2 } from "lucide-react";
import OrderService from "../../../services/OrderService";
import PaymentService from "../../../services/PaymentService";
import AddPaymentModal from "../../modals/formModals/AddOrderPaymentFormModal";
import TrackOrderStatusModal from "../../modals/formModals/TrackOrderStatusModal";

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTrackOrderModal, setShowTrackOrderModal] = useState(false); // Add this state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Define all possible statuses in order
  const STATUS_FLOW = [
    { key: 'Pending', label: 'Pending', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    { key: 'Assigned', label: 'Assigned', icon: UserCheck, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { key: 'In Progress', label: 'In Progress', icon: Package, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { key: 'On Delivery', label: 'On Delivery', icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    { key: 'Completed', label: 'Completed', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
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

    fetchOrderDetails();
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
      // Only send the status field for update
      const updateData = {
        order_status: newStatus
      };

      // Update order status
      await OrderService.updateOrder(orderId, updateData);

      // Refresh order details
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-500 text-lg">{error}</p>
    </div>
  );
  
  if (!order) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500 text-lg">No order found.</p>
    </div>
  );
  
  if (!order.client_full_name || !order.order_title) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500 text-lg">Incomplete order data.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Navigation Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/order/order-dashboard" className="hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/order/orders-list" className="hover:text-blue-600 transition-colors">
            Orders
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Order Details</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{order.order_title}</h1>
                <p className="text-gray-600 mt-1">Order ID: {order.slug}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleTrackOrder}
                className="px-4 py-2.5 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-medium"
              >
                Track Order
              </button>
              <button className="px-4 py-2.5 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-medium">
                Generate Invoice
              </button>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Add Payment
              </button>
              <Link to={`/order/edit/${orderId}`}>
                <button className="px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center gap-2">
                  <EditIcon size={16} />
                  Edit Order
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Rest of your component remains exactly the same */}
        {/* Status Tracker */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>
          
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 -z-10">
              <div 
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ 
                  width: `${(currentStatusIndex / (STATUS_FLOW.length - 1)) * 100}%` 
                }}
              ></div>
            </div>

            {STATUS_FLOW.map((status, index) => {
              const IconComponent = status.icon;
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = order.order_status === status.key;
              const isClickable = index <= currentStatusIndex + 1; // Can only move forward sequentially
              
              return (
                <div key={status.key} className="flex flex-col items-center relative">
                  <button
                    onClick={() => isClickable && handleStatusUpdate(status.key)}
                    disabled={!isClickable || updatingStatus}
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                      isCurrent 
                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg scale-110' 
                        : isCompleted
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    } ${isClickable && !updatingStatus ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'}`}
                  >
                    {updatingStatus && isCurrent ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <IconComponent className="w-6 h-6" />
                    )}
                  </button>
                  
                  <span className={`text-sm font-medium mt-3 text-center ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {status.label}
                  </span>
                  
                  {isCurrent && (
                    <div className="absolute -bottom-8">
                      <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        Current Status
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Status Description */}
          <div className="mt-12 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Current Status: {order.order_status}</h3>
                <p className="text-blue-700 text-sm mt-1">
                  {order.order_status === 'Pending' && 'Order has been created and is awaiting assignment.'}
                  {order.order_status === 'Assigned' && 'Order has been assigned to staff and work will begin soon.'}
                  {order.order_status === 'In Progress' && 'Order is currently being worked on by our team.'}
                  {order.order_status === 'On Delivery' && 'Order is out for delivery to the client.'}
                  {order.order_status === 'Completed' && 'Order has been successfully completed and delivered.'}
                  {order.order_status === 'Cancelled' && 'Order has been cancelled.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              Client Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Client Name</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                  {order.client_full_name}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                  {order.client_email}
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Order Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Order Title</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                  {order.order_title}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Order Category</label>
                <div className="mt-1">
                  {order.order_category ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      {order.order_category.name}
                    </span>
                  ) : (
                    <span className="text-gray-500">No category selected</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Description & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Description</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[120px]">
              <p className="text-gray-700 whitespace-pre-wrap">
                {order.order_description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Timeline & Pricing */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Timeline & Pricing
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {formatDate(order.start_date)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Delivery Date</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {formatDate(order.end_date)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Total Price</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200 font-semibold text-gray-900">
                    {formatCurrency(order.order_price)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Initial Deposit</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                    {formatCurrency(order.initial_deposit)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Balance</label>
                  <div className={`mt-1 p-3 rounded-lg border font-semibold ${
                    order.balance_amount > 0 
                      ? 'bg-amber-50 border-amber-200 text-amber-700' 
                      : 'bg-green-50 border-green-200 text-green-700'
                  }`}>
                    {formatCurrency(order.balance_amount)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Type & Payment Receipt */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Type */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Type</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                order.order_type === 'Bulk' 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                <span className="w-2 h-2 bg-current rounded-full"></span>
                {order.order_type} Order
              </span>
            </div>
          </div>

          {/* Payment Receipt */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Receipt</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              {order.order_payment_receipt_url ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700">Payment receipt uploaded</p>
                    <p className="text-gray-500 text-sm mt-1">Click to view the receipt</p>
                  </div>
                  <Link
                    to={order.order_payment_receipt_url}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    target="_blank"
                  >
                    View Receipt
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500">No payment receipt uploaded</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Order Created</p>
                  <p className="text-gray-500 text-sm">Order was successfully created</p>
                </div>
              </div>
              <span className="text-gray-500 text-sm">
                {order.ordered_at ? formatDate(order.ordered_at) : 'N/A'}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  order.order_status !== 'Pending' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {order.order_status !== 'Pending' ? (
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Status Updated</p>
                  <p className="text-gray-500 text-sm">Current status: {order.order_status}</p>
                </div>
              </div>
              <span className="text-gray-500 text-sm">
                Last updated: {order.updated_at ? formatDate(order.updated_at) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Receipts Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Receipts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {order.receipts && order.receipts.length > 0 ? (
              order.receipts.map((receipt, index) => (
                <div
                  key={index}
                  className="border border-gray-200 p-4 rounded-xl hover:border-blue-200 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {receipt.name} {formatCurrency(receipt.amount)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{receipt.date}</p>
                    </div>
                    <div className="flex gap-3 text-blue-600 text-sm">
                      <Link to={receipt.view_link} className="hover:text-blue-800 transition-colors">
                        View
                      </Link>
                      <Link to={receipt.download_link} className="hover:text-blue-800 transition-colors">
                        Download
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No receipts available.</p>
                <p className="text-gray-400 text-sm mt-1">Add payments to see receipts here</p>
              </div>
            )}
          </div>
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
          currentStatus={order.order_status} // Pass current status
          orderId={orderId} // Pass order ID for tracking
        />
      )}
    </div>
  );
};

export default OrderDetail;