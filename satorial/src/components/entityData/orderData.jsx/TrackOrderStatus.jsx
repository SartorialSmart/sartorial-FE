import { X, Clock, Check, Truck, Package, UserCheck, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Enhanced statuses with icons and colors
const statuses = [
  {
    id: 1,
    label: "Pending",
    description: "Order has been created and is awaiting assignment",
    icon: Clock,
    color: "yellow"
  },
  {
    id: 2,
    label: "Assigned",
    description: "Order has been assigned to staff",
    icon: UserCheck,
    color: "blue"
  },
  {
    id: 3,
    label: "In Progress",
    description: "Order is currently being worked on",
    icon: Package,
    color: "indigo"
  },
  {
    id: 4,
    label: "Completed",
    description: "Order production has been completed",
    icon: Check,
    color: "green"
  },
  {
    id: 5,
    label: "On Delivery",
    description: "Order has been sent for delivery to the client",
    icon: Truck,
    color: "purple"
  },
  {
    id: 6,
    label: "Cancelled",
    description: "Order has been cancelled",
    icon: AlertCircle,
    color: "red"
  },
];

const TrackOrderStatus = ({ currentStatus = "Pending", onClose, orderId }) => {
  const [animatedIndex, setAnimatedIndex] = useState(-1);
  const currentIndex = statuses.findIndex((s) => s.label === currentStatus);

  // Animation effect for status progression
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedIndex(currentIndex);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const getStatusColor = (status, index) => {
    const colors = {
      yellow: { bg: "bg-yellow-100", border: "border-yellow-500", text: "text-yellow-700", lightBg: "bg-yellow-50" },
      blue: { bg: "bg-blue-100", border: "border-blue-500", text: "text-blue-700", lightBg: "bg-blue-50" },
      indigo: { bg: "bg-indigo-100", border: "border-indigo-500", text: "text-indigo-700", lightBg: "bg-indigo-50" },
      purple: { bg: "bg-purple-100", border: "border-purple-500", text: "text-purple-700", lightBg: "bg-purple-50" },
      green: { bg: "bg-green-100", border: "border-green-500", text: "text-green-700", lightBg: "bg-green-50" },
      red: { bg: "bg-red-100", border: "border-red-500", text: "text-red-700", lightBg: "bg-red-50" },
    };
    
    return colors[status.color] || colors.blue;
  };

  const getCurrentStatusColor = () => {
    const currentStatusData = statuses[currentIndex];
    return getStatusColor(currentStatusData, currentIndex);
  };

  const StatusIcon = ({ status, index, isCurrent }) => {
    const IconComponent = status.icon;
    const colors = getStatusColor(status, index);
    
    if (index < currentIndex) {
      return (
        <div className={`w-10 h-10 flex items-center justify-center rounded-full ${colors.bg} border-2 ${colors.border} text-white`}>
          <Check size={18} />
        </div>
      );
    }
    
    if (isCurrent) {
      return (
        <div className={`w-10 h-10 flex items-center justify-center rounded-full ${colors.bg} border-2 ${colors.border} animate-pulse`}>
          <IconComponent size={18} className={colors.text} />
        </div>
      );
    }
    
    return (
      <div className={`w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border-2 border-gray-300 text-gray-400`}>
        <IconComponent size={18} />
      </div>
    );
  };

  StatusIcon.propTypes = {
    status: PropTypes.shape({
      icon: PropTypes.elementType,
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
      description: PropTypes.string,
      color: PropTypes.string,
    }),
    index: PropTypes.number,
    isCurrent: PropTypes.bool,
  };

  const currentStatusColor = getCurrentStatusColor();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Scrollable container that centers the content */}
      <div className="flex items-center justify-center min-h-full w-full max-h-screen overflow-y-auto py-8">
        {/* Main content card */}
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative my-auto">
          {/* Header - Sticky */}
          <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 z-10 p-6 pb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">Order Tracking</h2>
                <p className="text-sm text-gray-500 mt-1">Tracking ID: <span className="font-mono font-medium">{orderId}</span></p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-lg flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            {/* Current Status Banner */}
            <div className={`mt-4 p-4 ${currentStatusColor.bg} rounded-xl border ${currentStatusColor.border} transition-all duration-500`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Status</p>
                  <p className={`text-lg font-bold ${currentStatusColor.text} mt-1`}>
                    {currentStatus}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full ${currentStatusColor.border} border bg-white/50 backdrop-blur-sm`}>
                  <span className={`text-sm font-semibold ${currentStatusColor.text}`}>
                    Step {currentIndex + 1} of {statuses.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>0%</span>
                <span>{Math.round((currentIndex / (statuses.length - 1)) * 100)}%</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="overflow-y-auto max-h-[60vh] px-6 pb-6">
            {/* Tracking Timeline */}
            <div className="pt-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Order Journey
              </h3>
              
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 z-0" />
                
                <div className="space-y-8">
                  {statuses.map((status, index) => {
                    /* eslint-disable react/prop-types */
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const colors = getStatusColor(status, index);

                    return (
                      <div
                        key={status.id}
                        className={`relative flex items-start gap-4 p-4 rounded-xl transition-all duration-500 ${
                          isCompleted
                            ? `${colors.lightBg} border ${colors.border} border-opacity-30`
                            : 'bg-gray-50 opacity-70'
                        } ${isCurrent ? 'scale-[1.02] shadow-md' : ''}`}
                      >
                        {/* Status Icon */}
                        <div className="relative z-10 flex-shrink-0">
                          <StatusIcon status={status} index={index} isCurrent={isCurrent} />

                          {/* Connecting Line */}
                          {index < statuses.length - 1 && (
                            <div
                              className={`absolute left-1/2 -bottom-8 w-0.5 h-8 transform -translate-x-1/2 transition-all duration-700 ${
                                index < currentIndex
                                  ? colors.bg
                                  : 'bg-gray-200'
                              }`}
                            />
                          )}
                        </div>

                        {/* Status Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-semibold ${
                              isCompleted ? colors.text : 'text-gray-400'
                            }`}>
                              {status.label}
                            </h4>
                            {isCompleted && index !== currentIndex && (
                              <Check size={16} className="text-green-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${
                            isCompleted ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {status.description}
                          </p>

                          {/* Time stamp */}
                          {isCompleted && (
                            <p className="text-xs text-gray-400 mt-2">
                              {index === currentIndex ? 'In progress...' : 'Completed'}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                    /* eslint-enable react/prop-types */
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer with Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-2xl p-6 pt-4">
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                onClick={onClose}
              >
                Close
              </button>
              <button
                className="flex-1 py-3 px-4 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => window.location.href = `/support?order=${orderId}`}
              >
                Get Help
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .max-h-\\[60vh\\]::-webkit-scrollbar {
          width: 6px;
        }
        .max-h-\\[60vh\\]::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 3px;
        }
        .max-h-\\[60vh\\]::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .max-h-\\[60vh\\]::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

TrackOrderStatus.propTypes = {
  currentStatus: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default TrackOrderStatus;