import React from "react";

const SettingsProfile = () => {
  const colors = [
    "bg-red-500",
    "bg-green-600",
    "bg-purple-600",
    "bg-blue-600",
    "bg-orange-600",
    "bg-yellow-400",
    "bg-black",
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <div className="mt-4 flex space-x-2">
          {["Profile", "Invoice", "Roles/Tasks", "Departments", "Fabrics", "Social Media"].map((tab, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                tab === "Profile" ? "bg-blue-500 text-white" : "bg-white text-gray-700"
              } shadow-sm`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-8">
        {/* Personal Details */}
        <div>
          <h2 className="text-lg font-medium mb-4">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input-style" type="text" placeholder="Name" defaultValue="Kemi" />
            <input className="input-style" type="email" placeholder="Email Address" defaultValue="kemi@gmail.com" />
            <input className="input-style" type="tel" placeholder="Phone Number" defaultValue="08022356987" />
            <div className="relative">
              <input className="input-style pr-32" type="password" defaultValue="**********" />
              <span className="absolute top-2 right-3 text-blue-500 text-sm cursor-pointer">
                Change Password
              </span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h2 className="text-lg font-medium mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input-style" type="text" placeholder="Address" />
            <input className="input-style" type="text" placeholder="City" />
            <input className="input-style" type="text" placeholder="State" />
            <input className="input-style" type="text" placeholder="Country" />
          </div>
        </div>

        {/* Theme */}
        <div>
          <h2 className="text-lg font-medium mb-4">Theme</h2>
          <div className="mb-4 flex items-center gap-4">
            <span className="text-sm font-medium">Company Logo</span>
            <input type="file" className="border rounded-md text-sm p-2" />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Choose your brand color</p>
            <div className="flex space-x-3">
              {colors.map((color, i) => (
                <div key={i} className={`${color} w-10 h-8 rounded-md border cursor-pointer`} />
              ))}
              <div className="w-10 h-8 border rounded-md flex items-center justify-center cursor-pointer">
                <input type="color" className="opacity-0 absolute w-10 h-8 cursor-pointer" />
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 11a7 7 0 11-14 0 7 7 0 0114 0z" />
                  <path d="M12 19v4m0-4a4 4 0 004-4H8a4 4 0 004 4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Socials */}
        <div>
          <h2 className="text-lg font-medium mb-4">Socials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
              <span className="text-gray-400 mr-2">📸</span>
              <input className="bg-transparent w-full outline-none" placeholder="@username" />
            </div>
            <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
              <span className="text-gray-400 mr-2">🐦</span>
              <input className="bg-transparent w-full outline-none" placeholder="@username" />
            </div>
            <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
              <span className="text-gray-400 mr-2">🌐</span>
              <input className="bg-transparent w-full outline-none" placeholder="https://your linkhere" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tailwind input base style (in your global CSS or Tailwind config)
const inputBase = `border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full`;

export default SettingsProfile;
