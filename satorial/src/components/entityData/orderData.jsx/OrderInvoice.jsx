import React from "react";

const OrderInvoice = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-[600px] p-6 rounded-lg shadow-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>

        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">Invoice</h1>
        </div>

        <div className="border p-6 rounded-md bg-gray-100">
          <div className="flex justify-between">
            <p className="text-lg font-semibold">
              Invoice <span className="text-gray-500">#0123</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <p className="text-gray-500">Issued</p>
              <p>18 Jan, 2023</p>
            </div>
            <div>
              <p className="text-gray-500">Due</p>
              <p>30 Jan, 2023</p>
            </div>
            <div>
              <p className="text-gray-500">From</p>
              <p>Binta Kalu</p>
            </div>
            <div>
              <p className="text-gray-500">To</p>
              <p>Lara Adams</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-gray-500">About the project</p>
            <p className="text-gray-800">Binta’s wedding gown</p>
          </div>

          <div className="mt-6">
            <p className="text-gray-500 font-semibold">Deliverables</p>
            <div className="flex justify-between border-b py-2">
              <p className="text-gray-800">Wedding Gown</p>
              <p className="text-gray-800 font-semibold">₦250,000</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between border-t pt-2">
              <p className="text-gray-500">Subtotal</p>
              <p className="text-gray-800">₦250,000</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-500">VAT</p>
              <p className="text-gray-800">₦0.00</p>
            </div>
          </div>

          <div className="flex justify-between mt-4 p-4 bg-gray-200 rounded-md">
            <p className="text-lg font-semibold">Total</p>
            <p className="text-lg font-bold">₦250,000</p>
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Download
          </button>
          <button className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">
            Share
          </button>
          <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoice;
