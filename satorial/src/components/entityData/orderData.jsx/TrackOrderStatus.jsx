import { X, Clock } from "lucide-react";

const statuses = [
  { id: 1, label: "Assigned", description: "Order has been assigned" },
  { id: 2, label: "In Progress", description: "Order is in progress" },
  {
    id: 3,
    label: "On Delivery",
    description: "Order is on its way for delivery",
  },
  { id: 4, label: "Delivered", description: "Order Delivered" },
];

const TrackOrderStatus = ({ currentStatus = "In Progress", onClose }) => {
  const currentIndex = statuses.findIndex((s) => s.label === currentStatus);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Track Order</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tracking History */}
        <div className="mt-5">
          <h3 className="text-sm text-gray-500 font-medium">
            Tracking History
          </h3>
          <div className="mt-3 space-y-14">
            {statuses.map((status, index) => (
              <div key={status.id} className="relative flex items-start">
                {/* Status Icon */}
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                    index <= currentIndex
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  <Clock size={16} />
                </div>

                {/* Status Info */}
                <div className="ml-4">
                  <p
                    className={`font-semibold ${
                      index <= currentIndex ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {status.label}
                  </p>
                  <p className="text-xs text-gray-500">{status.description}</p>
                </div>

                {/* Connecting Line */}
                {index < statuses.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 w-0.5 h-16 ${
                      index < currentIndex ? "bg-blue-600" : "bg-gray-300"
                    } dashed-line`}
                  />
                )}
                
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          className="w-full mt-6 py-3 text-white bg-blue-600 rounded-xl font-medium hover:bg-blue-700"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default TrackOrderStatus;
