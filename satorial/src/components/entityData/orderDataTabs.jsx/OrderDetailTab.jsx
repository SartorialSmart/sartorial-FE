import { Link } from "react-router-dom";


const OrderDetailTab = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="hover:underline">Dashboard</Link> &gt;
        <Link to="/orders" className="hover:underline ml-1">Orders</Link> &gt;
        <span className="ml-1">Order Details</span>
      </nav>


      <div className="flex justify-between items-center bg-white p-4 shadow rounded-md mb-4">
        <h2 className="text-2xl font-semibold">Order Details</h2>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Completed</span>
      </div>


      <div className="flex gap-2 mb-6">
        <button variant="outline">Track Order</button>
        <button variant="outline">Generate Invoice</button>
        <button variant="primary">Add Payment</button>
        <button variant="outline">Edit</button>
      </div>


      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-gray-600 text-sm font-medium">Client Name *</label>
            <input type="text" value="Binta Kalu" disabled className="w-full border p-2 rounded-md bg-gray-100" />
          </div>
          <div>
            <label className="text-gray-600 text-sm font-medium">Client Email Address *</label>
            <input type="text" value="binta@gmail.com" disabled className="w-full border p-2 rounded-md bg-gray-100" />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="text-gray-600 text-sm font-medium">Order Name *</label>
          <input type="text" value="Priscilla's Wedding Dress" disabled className="w-full border p-2 rounded-md bg-gray-100" />
        </div>

        <div className="mb-6">
          <label className="text-gray-600 text-sm font-medium">Order Category *</label>
          <div className="flex gap-3 mt-2">
            <button className="border px-3 py-1 rounded-md bg-gray-100">Gown</button>
            <button className="border px-3 py-1 rounded-md bg-blue-100 text-blue-700">Wedding Dress</button>
            <button className="border px-3 py-1 rounded-md bg-gray-100">Shirts</button>
            <button className="border px-3 py-1 rounded-md bg-gray-100">Trousers</button>
            <button className="border px-3 py-1 rounded-md bg-gray-100">Skirts</button>
            <button className="border px-3 py-1 rounded-md bg-gray-100">Others</button>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-gray-600 text-sm font-medium">Order Description *</label>
          <textarea value="Binta's Wedding Dress" disabled className="w-full border p-2 rounded-md bg-gray-100 h-24"></textarea>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="text-gray-600 text-sm font-medium">File Attachment</label>
          <div className="flex items-center gap-4 mt-2">
            <input type="text" value="Binta's wedding gown sample.png" disabled className="border p-2 rounded-md bg-gray-100 w-3/4" />
            <button variant="outline">Select File</button>
            <Link to="#" className="text-blue-600 hover:underline">Open Image</Link>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-gray-600 text-sm font-medium">Start Date *</label>
            <input type="text" value="21/01/2024" disabled className="w-full border p-2 rounded-md bg-gray-100" />
          </div>
          <div>
            <label className="text-gray-600 text-sm font-medium">Delivery Date *</label>
            <input type="text" value="02/03/2024" disabled className="w-full border p-2 rounded-md bg-gray-100" />
          </div>
          <div>
            <label className="text-gray-600 text-sm font-medium">Price *</label>
            <input type="text" value="₦250,000" disabled className="w-full border p-2 rounded-md bg-gray-100" />
          </div>
          <div>
            <label className="text-gray-600 text-sm font-medium">Order Type *</label>
            <input type="text" value="Single" disabled className="w-full border p-2 rounded-md bg-gray-100" />
          </div>
          <div>
            <label className="text-gray-600 text-sm font-medium">Initial Deposit *</label>
            <input type="text" value="₦150,000" disabled className="w-full border p-2 rounded-md bg-gray-100" />
          </div>
          <div>
            <label className="text-gray-600 text-sm font-medium">Balance *</label>
            <input type="text" value="₦100,000" disabled className="w-full border p-2 rounded-md bg-gray-100" />
          </div>
        </div>
      </div>

      {/* Receipts Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h3 className="text-lg font-semibold mb-4">Receipts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((_, index) => (
            <div key={index} className="border p-4 rounded-md flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Receipt Name ₦50,000</p>
                <p className="text-xs text-gray-500">May 15, 2024</p>
              </div>
              <div className="flex gap-3 text-blue-600 text-sm">
                <Link to="#">View</Link>
                <Link to="#">Download</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailTab;
