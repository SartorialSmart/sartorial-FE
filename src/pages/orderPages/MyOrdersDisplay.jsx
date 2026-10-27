import { useState } from "react";
import MyOrdersSideBarLayout from "../../components/navs/MyOrdersSideBarLayout";
import MyOrdersTable from "../../components/lists/MyOrdersTable";

/**
 * The staff member's own orders workspace: every order and production run
 * assigned to the signed-in staff member, with their per-parameter work
 * progress. Not part of the admin dashboard — this view only exists for
 * staff accounts.
 *
 * NOTE: Previously used Toolbar_1 (client management toolbar) which rendered
 * Upload Clients / Export / Add Client — a backdoor to Clients even without
 * clients.* permission. Replaced with a dedicated header.
 */
const MyOrdersDisplay = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <MyOrdersSideBarLayout>
      <div className="space-y-6">
        <div className="bg-white py-4 px-6 rounded-xl shadow-sm border border-gray-100">
          <nav className="flex items-center text-sm text-gray-600 mb-4">
            <span className="text-blue-600 hover:text-blue-700 cursor-pointer transition-colors">Dashboard</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 font-medium">My Orders</span>
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <p className="text-sm text-gray-500 mt-1">Orders and production runs assigned to you</p>
              </div>
            </div>
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search your orders..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <MyOrdersTable searchTerm={searchQuery} />
      </div>
    </MyOrdersSideBarLayout>
  );
};

export default MyOrdersDisplay;
