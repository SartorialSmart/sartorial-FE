import { useEffect, useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { PackagePlus, Search, Send, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import ProductionService from "../../../services/ProductionService";
import InventoryService from "../../../services/InventoryService";

const formatCurrency = (v) => `₦${Number(v || 0).toLocaleString()}`;

const LAST_CATEGORY_KEY = "prod_materials_last_category";

const ProductionMaterialsStep = ({ orderId, totalQuantity, onBack, onNext }) => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [materialsData, setMaterialsData] = useState({ items: [], material_cost_per_unit: 0, total_material_cost: 0 });
  const [selectedCategory, setSelectedCategory] = useState(
    () => localStorage.getItem(LAST_CATEGORY_KEY) || "all"
  );
  const [itemSearch, setItemSearch] = useState("");
  const [qtyDrafts, setQtyDrafts] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      const [cats, inv, mats] = await Promise.all([
        InventoryService.listInventoryCategory(),
        InventoryService.listInventory(),
        ProductionService.getOrderMaterials(orderId),
      ]);
      setCategories(Array.isArray(cats) ? cats : cats?.results || []);
      setItems(Array.isArray(inv) ? inv : inv?.results || []);
      setMaterialsData(mats);
      // Drop a persisted category that no longer exists
      const saved = localStorage.getItem(LAST_CATEGORY_KEY);
      if (saved && saved !== "all") {
        const exists = (Array.isArray(cats) ? cats : cats?.results || []).some(
          (c) => String(c.id) === String(saved)
        );
        if (!exists) setSelectedCategory("all");
      }
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to load materials.");
    }
  }, [orderId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    try {
      localStorage.setItem(LAST_CATEGORY_KEY, selectedCategory);
    } catch {
      // ignore storage failures (private mode, quota, etc.)
    }
  }, [selectedCategory]);

  const filteredItems = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    return items.filter((it) => {
      const catOk = selectedCategory === "all" || String(it.category) === String(selectedCategory) || it.category_name === selectedCategory;
      const searchOk = !q || it.item_name?.toLowerCase().includes(q) || it.sku?.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [items, selectedCategory, itemSearch]);

  const handleAdd = async (item) => {
    const qty = parseInt(qtyDrafts[item.id], 10);
    if (!qty || qty < 1) {
      setError("Enter quantity per unit (at least 1).");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await ProductionService.addOrderMaterial(orderId, { inventory: item.id, quantity: qty });
      setQtyDrafts((p) => ({ ...p, [item.id]: "" }));
      const mats = await ProductionService.getOrderMaterials(orderId);
      setMaterialsData(mats);
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.response?.data?.inventory?.[0] || "Failed to add material.";
      setError(msg);
      setActionError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (mat) => {
    if (!confirm(`Remove ${mat.material_name}?`)) return;
    setBusy(true);
    try {
      await ProductionService.deleteOrderMaterial(mat.id);
      setMaterialsData(await ProductionService.getOrderMaterials(orderId));
    } catch (e) {
      const msg = e?.response?.data?.detail || "Failed to remove the material.";
      setError(msg);
      setActionError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleDispense = async (mat) => {
    if (!confirm(`Dispense ${mat.quantity}/unit of ${mat.material_name}? Total ${mat.quantity * (totalQuantity || 1)} will be deducted.`)) return;
    setBusy(true);
    try {
      await ProductionService.dispenseOrderMaterial(mat.id);
      setMaterialsData(await ProductionService.getOrderMaterials(orderId));
    } catch (e) {
      const msg = e?.response?.data?.detail || "Dispense failed. Check available stock and try again.";
      setError(msg);
      setActionError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleDispenseAll = async () => {
    setBusy(true);
    try {
      const res = await ProductionService.dispenseAllOrderMaterials(orderId);
      setMaterialsData(res);
    } catch (e) {
      const msg = e?.response?.data?.detail || "Dispense all failed. Check available stock and try again.";
      setError(msg);
      setActionError(msg);
    } finally {
      setBusy(false);
    }
  };

  const catName = (id) => categories.find((c) => String(c.id) === String(id))?.name || id || "—";

  return (
    <>
      <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <PackagePlus size={20} className="text-blue-600" /> Materials Dispensing (Step 4)
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Borrowed from Inventory → Dispense Materials. Quantity is <b>per single unit</b>; total = per-unit × {totalQuantity} units. Dispensing deducts stock.
        </p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex justify-between"><span>{error}</span><button onClick={() => setError("")} className="font-semibold">Dismiss</button></div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3">
          <p className="text-xs text-gray-500">Per-unit cost</p>
          <p className="text-xl font-bold text-indigo-700">{formatCurrency(materialsData.material_cost_per_unit)}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
          <p className="text-xs text-gray-500">Total ({totalQuantity} units)</p>
          <p className="text-xl font-bold text-emerald-700">{formatCurrency(materialsData.total_material_cost)}</p>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 flex flex-col justify-center">
          <button onClick={handleDispenseAll} disabled={busy || materialsData.items.filter((m) => m.status === "planned").length === 0} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1">
            <Send size={14} /> Dispense All Planned
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex gap-3">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} placeholder="Search inventory..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <button onClick={loadAll} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"><RefreshCw size={16} /></button>
        </div>

        <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
          {filteredItems.length === 0 ? <p className="text-sm text-gray-400 py-6 text-center">No inventory items.</p> : filteredItems.map((it) => (
            <div key={it.id} className="py-2 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{it.item_name}</p>
                <p className="text-xs text-gray-500">{catName(it.category)} · ₦{Number(it.unit_cost).toLocaleString()}/{it.unit_of_measurement} · {it.quantity} in stock</p>
              </div>
              <input type="number" min="1" value={qtyDrafts[it.id] || ""} onChange={(e) => setQtyDrafts((p) => ({ ...p, [it.id]: e.target.value }))} placeholder="Qty/unit" className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
              <button onClick={() => handleAdd(it)} disabled={busy} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1"><PackagePlus size={14} /> Add</button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="py-2 px-3">Material</th><th className="py-2 px-3">Qty/unit</th><th className="py-2 px-3">Unit cost</th><th className="py-2 px-3">Line (per unit)</th><th className="py-2 px-3">Status</th><th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {materialsData.items.length === 0 ? <tr><td colSpan="6" className="py-6 text-center text-gray-400">No materials yet. Add per-unit BOM above.</td></tr> : materialsData.items.map((m) => (
              <tr key={m.id}>
                <td className="py-2 px-3 font-medium text-gray-900">{m.material_name}</td>
                <td className="py-2 px-3">{m.quantity} {m.unit_of_measurement}</td>
                <td className="py-2 px-3">{formatCurrency(m.unit_cost)}</td>
                <td className="py-2 px-3 font-semibold">{formatCurrency(m.line_cost)}</td>
                <td className="py-2 px-3"><span className={`text-xs px-2 py-0.5 rounded-full ${m.status === "dispensed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{m.status}</span></td>
                <td className="py-2 px-3 text-right whitespace-nowrap">
                  {m.status === "planned" ? <>
                    <button onClick={() => handleDispense(m)} disabled={busy} className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs mr-1"><Send size={12} className="inline" /> Dispense</button>
                    <button onClick={() => handleDelete(m)} disabled={busy} className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs"><Trash2 size={12} className="inline" /> Remove</button>
                  </> : <span className="text-xs text-gray-400">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between pt-4 border-t border-gray-100">
        <button onClick={onBack} className="border border-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">Back to Assign</button>
        <button onClick={onNext} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700">Finish — Production Ready</button>
      </div>
      </div>

      {/* Custom action error modal */}
      <AnimatePresence>
        {actionError && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center"
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                We couldn&apos;t complete that
              </h3>
              <p className="text-sm text-gray-600 mb-6">{actionError}</p>
              <button
                onClick={() => setActionError(null)}
                className="w-full bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

ProductionMaterialsStep.propTypes = {
  orderId: PropTypes.string.isRequired,
  totalQuantity: PropTypes.number,
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};

export default ProductionMaterialsStep;
