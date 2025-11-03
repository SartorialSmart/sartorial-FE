import React from "react";

const plans = [
  {
    price: "₦0",
    label: "Free",
    description: "Current Plan",
    features: [
      "Up to 10% shipping discount",
      "Up to 1 store",
      "10 Shipments",
      "Product management",
      "Shipping APIs",
      "Up to 1 user account",
    ],
    current: true,
  },
  {
    price: "₦10,500",
    label: "Lite",
    button: "Get Started",
    features: [
      "Up to 50% shipping discount",
      "Up to 3 store",
      "200 Shipments",
      "Bulk order processing",
      "Connect Courier account",
      "Product management",
      "Shipping APIs",
      "Up to 3 user account",
      "Dedicated account manager",
    ],
  },
  {
    price: "₦24,000",
    label: "Growth",
    button: "Get Started",
    recommended: true,
    features: [
      "Up to 10% shipping discount",
      "Up to 5 store",
      "500 Shipments",
      "Shipping rules & automation",
      "Bulk order processing",
      "Connect Courier account",
      "Product management",
      "Shipping APIs",
      "Up to 3 user account",
      "Dedicated account manager",
    ],
  },
  {
    price: "₦47,000",
    label: "Premium",
    button: "Get Started",
    enterprise: true,
    features: [
      "Everything in Growth Plan",
      "Up to 50% shipping discount",
    ],
  },
];

const PricingPlans = () => {
  return (
    <div className="bg-[#F4F4F4] min-h-screen p-8">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Subscription Plan</h2>
        <p className="text-gray-600 text-sm">Flexible plans that grow with your business.</p>
      </div>

      <div className="flex justify-end mb-6">
        <div className="bg-white rounded-full p-1 text-sm font-medium">
          <button className="px-4 py-1 rounded-full text-gray-700">Monthly</button>
          <button className="px-4 py-1 bg-[#FDF2F8] text-[#BE185D] rounded-full ml-1">
            Yearly <span className="text-xs font-medium">Save 10%</span> +
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`relative bg-white rounded-xl border ${
              plan.current ? "border-blue-500" : "border-gray-200"
            } shadow-sm p-6 flex flex-col`}
          >
            {plan.recommended && (
              <span className="absolute top-[-12px] left-1/2 -translate-x-1/2 bg-black text-white text-xs font-semibold px-2 py-1 rounded-full">
                Recommended
              </span>
            )}
            {plan.enterprise && (
              <span className="absolute top-[-12px] left-1/2 -translate-x-1/2 bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
                For enterprise
              </span>
            )}

            <div className="text-2xl font-semibold mb-1">{plan.price}
              <span className="text-sm font-normal text-gray-600"> /mo</span>
            </div>

            <div className="text-blue-600 font-medium text-lg mb-4">{plan.label}</div>

            {plan.current ? (
              <button className="bg-gray-200 text-gray-600 text-sm rounded-md py-2 font-medium mb-4">
                {plan.description}
              </button>
            ) : (
              <button className="bg-[#2563EB] text-white text-sm rounded-md py-2 font-medium mb-4">
                {plan.button}
              </button>
            )}

            <ul className="text-sm space-y-2 text-gray-700">
              {plan.features.map((feat, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPlans;
