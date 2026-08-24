import InventorySideBarLayout from "../../components/navs/InventorySideBarLayout";
import OrderMaterialsManager from "../../components/lists/OrderMaterialsManager";

/**
 * Inventory — Dispense Materials
 * Bill of materials for assigned orders. Inventory owns stock, so this view
 * lives under Inventory Management (canonical path: /inventory/dispense-materials).
 */
const DispenseMaterialsDisplay = () => {
  return (
    <InventorySideBarLayout>
      <div className="space-y-6">
        <div className="bg-white py-4 px-6 rounded-xl shadow-sm border border-gray-100">
          <nav className="flex items-center text-sm text-gray-600 mb-2">
            <span className="text-blue-600">Dashboard</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Dispense Materials</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dispense Materials</h1>
              <p className="text-sm text-gray-500 mt-1">Pick an assigned order, build its bill of materials, and dispense stock to the assignee.</p>
            </div>
          </div>
        </div>
        <OrderMaterialsManager />
      </div>
    </InventorySideBarLayout>
  );
};

export default DispenseMaterialsDisplay;
