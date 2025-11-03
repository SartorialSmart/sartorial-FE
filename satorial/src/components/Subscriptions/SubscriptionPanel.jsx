import React from "react";

const SubscriptionPanel = () => {
  const billingData = new Array(7).fill({
    date: "12/05/2024",
    reference: "SUBSCRIPTION_WALLET_CHARGE",
    method: "Card",
    amount: "₦10,000",
  });

  return (
    <div className="bg-[#F4F4F4] min-h-screen p-8">
      <h2 className="text-2xl font-semibold mb-4">Subscription</h2>

      <div className="flex flex-col lg:flex-row gap-6 mb-10">
        {/* Subscription Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 w-full lg:w-1/2">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[#2563EB] text-white text-xs font-medium px-2 py-1 rounded-md">
              ENTERPRISE
            </span>
            <span className="text-sm text-gray-500">Plan</span>
          </div>

          <div className="text-2xl font-semibold mb-1">₦10,500 
            <span className="text-base text-gray-500 font-normal"> /mo</span>
          </div>

          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>13 day spent</span>
            <span>17 days left</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-[#22C55E] h-2.5 rounded-full" style={{ width: "43%" }}></div>
          </div>

          <button className="bg-[#2563EB] text-white px-4 py-2 rounded-md text-sm font-medium">
            Manage Plan
          </button>
        </div>

        {/* Card Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 w-full lg:w-1/2">
          <div className="flex items-center gap-2 mb-2">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
              alt="Visa"
              className="h-5"
            />
            <span className="text-sm text-gray-700">Visa ending in <strong>8234</strong></span>
          </div>
          <div className="text-sm text-gray-500 mb-4">Exp 2/2025</div>

          <div className="flex flex-wrap gap-2">
            <button className="text-[#2563EB] border border-[#2563EB] rounded-md px-3 py-1 text-sm">
              Update Billing Method
            </button>
            <button className="text-gray-500 border border-gray-300 rounded-md px-3 py-1 text-sm">
              Remove Card
            </button>
            <button className="text-[#2563EB] border border-[#2563EB] rounded-md px-3 py-1 text-sm">
              Update Card
            </button>
          </div>
        </div>
      </div>

      {/* Billing History Table */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Billing History</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white rounded-xl overflow-hidden">
            <thead className="bg-gray-100 text-left text-gray-600">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Reference</th>
                <th className="px-6 py-3 font-medium">Payment Method</th>
                <th className="px-6 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {billingData.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-6 py-4 text-gray-700">{item.date}</td>
                  <td className="px-6 py-4 text-gray-700">{item.reference}</td>
                  <td className="px-6 py-4 text-gray-700">{item.method}</td>
                  <td className="px-6 py-4 text-gray-700">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPanel;
