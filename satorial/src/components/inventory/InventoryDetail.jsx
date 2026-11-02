import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Package, MapPin, ArrowLeft, Loader2, Edit3, AlertTriangle,
  ArrowDownCircle, ArrowUpCircle, ArrowRightCircle, RotateCcw,
  History, TrendingUp, TrendingDown, Clock, DollarSign,
  Hash, Barcode, Shield, Calendar,
} from "lucide-react";
import InventoryService from "../../services/InventoryService";
import StockMovementService from "../../services/StockMovementService";
import LocationService from "../../services/LocationService";
import AddStockMovementFormModal from "../modals/formModals/AddStockMovementFormModal";
import AddInventoryFormModal from "../modals/formModals/AddInventoryFormModal";

const LOCAL_KEY = "sartorial_stock_movements";

const getLocalMovements = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
};

const normalizeMovement = (m) => {
  const resolveId = (val) => {
    if (!val) return "";
    if (typeof val === "object") return String(val.id || "");
    const s = String(val);
    if (s.includes("/")) {
      const parts = s.replace(/\/$/, "").split("/");
      const last = parts[parts.length - 1];
      return last || "";
    }
    return s;
  };
  const rawInventory = m.inventory || m.inventory_item || m.inventory_item_id;
  const rawFrom = m.from_location;
  const rawTo = m.to_location;
  return {
    id: m.id || `gen-${Math.random().toString(36).slice(2)}`,
    _source: m._source || "api",
    movement_type: m.movement_type || "adjustment",
    inventory: resolveId(rawInventory),
    inventory_item_name: m.inventory_item_name || m.item_name || m.inventory_name || m.inventory_item?.item_name || m.inventory_item?.name || "",
    inventory_sku: m.inventory_sku || m.sku || m.inventory_item?.sku || "",
    quantity: Number(m.quantity) || 0,
    from_location: resolveId(rawFrom),
    to_location: resolveId(rawTo),
    from_location_name: m.from_location_name || (typeof rawFrom === "object" ? rawFrom?.name : "") || "",
    to_location_name: m.to_location_name || (typeof rawTo === "object" ? rawTo?.name : "") || "",
    performed_by_name: m.performed_by_name || m.performer_name || m.dispense_to_name || m.dispense_to || "",
    reason: m.reason || "",
    created_at: m.created_at || m.dispensed_at || m.date || m.updated_at || new Date().toISOString(),
  };
};

const MOVEMENT_TYPES = {
  stock_in: { label: "Stock In", icon: ArrowDownCircle, color: "text-green-600", bg: "bg-green-50", sign: "+" },
  dispense: { label: "Dispense", icon: ArrowUpCircle, color: "text-red-600", bg: "bg-red-50", sign: "-" },
  transfer: { label: "Transfer", icon: ArrowRightCircle, color: "text-blue-600", bg: "bg-blue-50", sign: "" },
  adjustment: { label: "Adjustment", icon: Edit3, color: "text-yellow-600", bg: "bg-yellow-50", sign: "" },
  return: { label: "Return", icon: RotateCcw, color: "text-purple-600", bg: "bg-purple-50", sign: "+" },
};

const formatDate = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const InventoryDetail = ({ itemId }) => {
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [apiMovements, setApiMovements] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movementModal, setMovementModal] = useState({ open: false, type: "stock_in", unassignedQty: 0 });
  const [editModal, setEditModal] = useState(false);
  const [assignLocationModal, setAssignLocationModal] = useState(false);
  const [assignLocationLoading, setAssignLocationLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [localTick, setLocalTick] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemData, movementsData, dispenseData, locationsData, categoriesData] = await Promise.allSettled([
        InventoryService.getInventory(itemId),
        StockMovementService.listMovements(),
        InventoryService.listDispenseInventory(),
        LocationService.listLocations(),
        InventoryService.listInventoryCategory(),
      ]);

      if (itemData.status === "fulfilled") {
        setItem(itemData.value);
      }

      const items = [];

      if (movementsData.status === "fulfilled") {
        const raw = movementsData.value;
        let arr = Array.isArray(raw) ? raw : raw?.results || raw?.data || raw?.items || [];
        arr.forEach((m) => items.push(normalizeMovement({ ...m, _source: "movement" })));
      } else {
        console.warn("[InventoryDetail] listMovements failed:", movementsData.reason);
      }

      if (dispenseData.status === "fulfilled") {
        const raw = dispenseData.value;
        let arr = Array.isArray(raw) ? raw : raw?.results || [];
        arr.forEach((d) => items.push(normalizeMovement({ ...d, _source: "dispense" })));
      }

      items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setApiMovements(items);

      if (locationsData.status === "fulfilled") {
        const raw = locationsData.value;
        setLocations(Array.isArray(raw) ? raw : raw?.results || []);
      }

      if (categoriesData.status === "fulfilled") {
        const cats = Array.isArray(categoriesData.value) ? categoriesData.value : [];
        const match = cats.find((c) => String(c.id) === String(itemData.value?.category));
        if (match) setCategoryName(match.name || match.category || "");
      }
    } catch {
      // errors handled in individual sections
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignLocation = async () => {
    if (!selectedLocationId || !item?.id) return;
    setAssignLocationLoading(true);
    try {
      await InventoryService.updateInventory(item.id, { location: selectedLocationId });
      const loc = locations.find((l) => String(l.id) === String(selectedLocationId));
      try {
        const LOCAL_KEY = "sartorial_item_locations";
        const map = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
        map[String(item.id)] = { locationId: selectedLocationId, locationName: loc?.name || "" };
        localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
      } catch { /* localStorage unavailable */ }
      setAssignLocationModal(false);
      setSelectedLocationId("");
      fetchData();
      setLocalTick((t) => t + 1);
    } catch {
      // still store locally if API fails
      try {
        const LOCAL_KEY = "sartorial_item_locations";
        const map = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
        const loc = locations.find((l) => String(l.id) === String(selectedLocationId));
        map[String(item.id)] = { locationId: selectedLocationId, locationName: loc?.name || "" };
        localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
      } catch { /* localStorage unavailable */ }
      setAssignLocationModal(false);
      setSelectedLocationId("");
      fetchData();
      setLocalTick((t) => t + 1);
    } finally {
      setAssignLocationLoading(false);
    }
  };

  const movements = useMemo(() => {
    const local = getLocalMovements().map((m) => normalizeMovement({ ...m, _source: "local" }));
    const allApiIds = new Set(apiMovements.map((i) => i.id));
    const merged = [...apiMovements];
    local.forEach((m) => {
      if (!allApiIds.has(m.id)) merged.push(m);
    });

    const targetId = String(itemId);
    const filtered = merged.filter((m) => {
      const mId = String(m.inventory || "");
      return mId === targetId;
    });

    const deduped = [];
    filtered.forEach((m) => {
      const key = [
        m.movement_type,
        m.inventory,
        m.quantity,
        m.from_location || "",
        m.to_location || "",
      ].join("|");
      const t = new Date(m.created_at).getTime();
      const isDup = deduped.some((d) => {
        const dKey = [
          d.movement_type,
          d.inventory,
          d.quantity,
          d.from_location || "",
          d.to_location || "",
        ].join("|");
        return dKey === key && Math.abs(new Date(d.created_at).getTime() - t) < 5000;
      });
      if (!isDup) deduped.push(m);
    });

    const locLookup = {};
    locations.forEach((loc) => {
      locLookup[String(loc.id)] = loc.name;
    });

    deduped.forEach((m) => {
      if (!m.from_location_name && m.from_location) {
        m.from_location_name = locLookup[String(m.from_location)] || "";
      }
      if (!m.to_location_name && m.to_location) {
        m.to_location_name = locLookup[String(m.to_location)] || "";
      }
    });

    deduped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return deduped;
  }, [apiMovements, itemId, localTick, locations]);

  const recentMovements = movements.slice(0, 10);

  const locationStock = (() => {
    const idMap = {};
    const nameMap = {};
    locations.forEach((loc) => {
      idMap[String(loc.id)] = { name: loc.name, onHand: 0, locationId: loc.id };
      nameMap[loc.name?.toLowerCase()] = { name: loc.name, onHand: 0, locationId: loc.id };
    });

    const resolveLocKey = (m, field) => {
      const val = m[field];
      if (!val) return null;
      if (typeof val === "object") return String(val.id || "");
      return String(val);
    };

    const resolveIdForStock = (val) => {
      if (!val) return "";
      if (typeof val === "object") return String(val.id || "");
      return String(val);
    };

    const resolveLocName = (m, idField, nameField) => {
      const id = resolveLocKey(m, idField);
      if (id && idMap[id]) return id;
      const name = m[nameField];
      if (name && nameMap[name.toLowerCase()]) return nameMap[name.toLowerCase()].locationId;
      return null;
    };

    movements.forEach((m) => {
      if (m.movement_type === "transfer") {
        const toId = resolveLocName(m, "to_location", "to_location_name");
        const fromId = resolveLocName(m, "from_location", "from_location_name");
        if (toId && idMap[String(toId)]) {
          idMap[String(toId)].onHand += Math.abs(Number(m.quantity) || 0);
        }
        if (fromId && idMap[String(fromId)]) {
          idMap[String(fromId)].onHand -= Math.abs(Number(m.quantity) || 0);
        }
      } else if (m.movement_type === "stock_in" || m.movement_type === "return") {
        const toId = resolveLocName(m, "to_location", "to_location_name");
        if (toId && idMap[String(toId)]) {
          idMap[String(toId)].onHand += Math.abs(Number(m.quantity) || 0);
        }
      } else if (m.movement_type === "dispense") {
        const fromId = resolveLocName(m, "from_location", "from_location_name");
        if (fromId && idMap[String(fromId)]) {
          idMap[String(fromId)].onHand -= Math.abs(Number(m.quantity) || 0);
        }
      }
    });

    const locatedTotal = Object.values(idMap).reduce((sum, l) => sum + l.onHand, 0);
    const itemTotal = Number(item?.quantity) || 0;
    const unassigned = itemTotal - locatedTotal;

    const result = Object.values(idMap).filter((l) => l.onHand !== 0);

    if (unassigned > 0) {
      let itemLocation = item?.location;
      let itemLocationId = resolveIdForStock(itemLocation);
      let itemLocationName = item?.location_name || (typeof itemLocation === "object" ? itemLocation?.name : "");

      if (!itemLocationId) {
        try {
          const LOCAL_KEY = "sartorial_item_locations";
          const map = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
          const stored = map[String(item?.id)];
          if (stored) {
            itemLocationId = stored.locationId ? String(stored.locationId) : "";
            itemLocationName = stored.locationName || "";
          }
        } catch { /* localStorage unavailable */ }
      }

      if (!itemLocationName && itemLocationId && idMap[itemLocationId]) {
        itemLocationName = idMap[itemLocationId].name;
      }
      const itemLocKey = itemLocationId || (itemLocationName ? itemLocationName.toLowerCase() : null);

      if (itemLocKey) {
        const existingEntry = result.find(
          (r) => String(r.locationId) === String(itemLocationId) || (r.name && itemLocationName && r.name.toLowerCase() === itemLocationName.toLowerCase())
        );
        if (existingEntry) {
          existingEntry.onHand += unassigned;
        } else {
          const resolvedId = itemLocationId || itemLocKey;
          result.push({
            name: itemLocationName || "Location",
            onHand: unassigned,
            locationId: resolvedId,
          });
        }
      } else {
        result.unshift({
          name: "Unassigned",
          onHand: unassigned,
          locationId: null,
          isUnassigned: true,
        });
      }
    }
    return result;
  })();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500">Loading inventory details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Package className="w-16 h-16 mb-4" />
        <p className="text-xl font-medium mb-2">Item not found</p>
        <button
          onClick={() => navigate("/inventory/list/overview")}
          className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft size={16} /> Back to Inventory
        </button>
      </div>
    );
  }

  const totalCost = (parseFloat(item.unit_cost) || 0) * (item.quantity || 0);
  const totalValue = (parseFloat(item.selling_price) || 0) * (item.quantity || 0);

  const inbound = movements.filter((m) => m.movement_type === "stock_in" || m.movement_type === "return");
  const outbound = movements.filter((m) => m.movement_type === "dispense");
  const inboundQty = inbound.reduce((sum, m) => sum + Math.abs(Number(m.quantity) || 0), 0);
  const outboundQty = outbound.reduce((sum, m) => sum + Math.abs(Number(m.quantity) || 0), 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back Button & Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/inventory/list/overview")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Inventory
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${item.is_low_stock ? "bg-red-50" : "bg-blue-50"}`}>
              <Package className={`w-8 h-8 ${item.is_low_stock ? "text-red-600" : "text-blue-600"}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{item.item_name || "Unnamed Item"}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                {item.sku && <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{item.sku}</span>}
                {categoryName && <span>{categoryName}</span>}
                {item.is_low_stock && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    <AlertTriangle className="w-3 h-3" /> Low Stock
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <Edit3 size={16} />
            Edit Item
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl"><Package className="w-5 h-5 text-blue-600" /></div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{item.quantity ?? 0}</div>
            <div className="text-xs text-gray-500">Qty In Stock</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl"><TrendingUp className="w-5 h-5 text-green-600" /></div>
          <div>
            <div className="text-2xl font-bold text-green-600">{inboundQty}</div>
            <div className="text-xs text-gray-500">Total Received</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl"><TrendingDown className="w-5 h-5 text-red-600" /></div>
          <div>
            <div className="text-2xl font-bold text-red-600">{outboundQty}</div>
            <div className="text-xs text-gray-500">Total Dispensed</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-teal-50 rounded-xl"><DollarSign className="w-5 h-5 text-teal-600" /></div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              ₦{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-500">Total Cost Value</div>
          </div>
        </div>
      </div>

      {/* Section 1: Product Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Product Information
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 mb-1">SKU</p>
              <p className="font-medium text-gray-900 font-mono">{item.sku || "-"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Barcode className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Barcode</p>
              <p className="font-medium text-gray-900">{item.barcode || "-"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Package className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Item Name</p>
              <p className="font-medium text-gray-900">{item.item_name || "-"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Category</p>
              <p className="font-medium text-gray-900">{categoryName || "-"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Unit of Measurement</p>
              <p className="font-medium text-gray-900">{item.unit_of_measurement || "-"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Package className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Quantity</p>
              <p className="font-medium text-gray-900">
                {item.quantity ?? "-"}
                {item.unit_of_measurement ? ` ${item.unit_of_measurement}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <DollarSign className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Unit Cost</p>
              <p className="font-medium text-gray-900">
                {item.unit_cost ? `₦${parseFloat(item.unit_cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <DollarSign className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Selling Price</p>
              <p className="font-medium text-gray-900">
                {item.selling_price ? `₦${parseFloat(item.selling_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Low Stock Threshold</p>
              <p className="font-medium text-gray-900">{item.low_stock_threshold ?? "-"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <DollarSign className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Cost Value</p>
              <p className="font-medium text-teal-700">
                ₦{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <DollarSign className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Selling Value</p>
              <p className="font-medium text-teal-700">
                ₦{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Date Added</p>
              <p className="font-medium text-gray-900">{formatDate(item.date || item.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Stock By Location */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Stock By Location
          </h2>
        </div>
        <div className="p-6">
          {locationStock.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 pr-4 font-medium">Location</th>
                    <th className="pb-3 pr-4 font-medium text-right">On Hand</th>
                    <th className="pb-3 pr-4 font-medium text-right">Threshold</th>
                    <th className="pb-3 pr-4 font-medium text-right">Available</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {locationStock.map((loc) => {
                    const onHand = loc.onHand;
                    const threshold = item.low_stock_threshold || 0;
                    const available = onHand;
                    const isLow = !loc.isUnassigned && onHand <= threshold && onHand > 0;
                    const isUnassigned = loc.isUnassigned;
                    return (
                      <tr
                        key={loc.locationId || "unassigned"}
                        className={`${isUnassigned ? "bg-amber-50/60" : "hover:bg-gray-50/50"}`}
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            {isUnassigned ? (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            ) : (
                              <MapPin className="w-4 h-4 text-blue-500" />
                            )}
                            <span className={`font-medium ${isUnassigned ? "text-amber-800" : "text-gray-900"}`}>
                              {loc.name}
                            </span>
                            {isUnassigned && (
                              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                Assign to a location
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <span className={`font-semibold ${isUnassigned ? "text-amber-800" : "text-gray-900"}`}>
                            {onHand} {item.unit_of_measurement || "units"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <span className="text-gray-600">
                            {threshold} {item.unit_of_measurement || "units"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <span className={`font-semibold ${isLow ? "text-red-600" : "text-green-600"}`}>
                            {available} {item.unit_of_measurement || "units"}
                          </span>
                          {isLow && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">
                              Low
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isUnassigned ? (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedLocationId("");
                                    setAssignLocationModal(true);
                                  }}
                                  className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                                  title="Assign to Location"
                                >
                                  <MapPin size={16} />
                                </button>
                                <button
                                  onClick={() => setMovementModal({ open: true, type: "stock_in", unassignedQty: onHand })}
                                  className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                                  title="Add Stock"
                                >
                                  <ArrowDownCircle size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setMovementModal({ open: true, type: "stock_in" })}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Add Stock"
                                >
                                  <ArrowDownCircle size={16} />
                                </button>
                                <button
                                  onClick={() => setMovementModal({ open: true, type: "dispense" })}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Deduct Stock"
                                >
                                  <ArrowUpCircle size={16} />
                                </button>
                                <button
                                  onClick={() => setMovementModal({ open: true, type: "transfer" })}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Transfer"
                                >
                                  <ArrowRightCircle size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No location-based stock data available yet.</p>
              <p className="text-xs mt-1">Record stock movements with locations to see breakdowns here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Recent Movements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Recent Movements
          </h2>
          <button
            onClick={() => navigate("/inventory/stock-movements")}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <History size={16} />
            View Full History
          </button>
        </div>
        <div className="p-6">
          {recentMovements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 pr-4 font-medium">Type</th>
                    <th className="pb-3 pr-4 font-medium">Direction</th>
                    <th className="pb-3 pr-4 font-medium">Qty</th>
                    <th className="pb-3 pr-4 font-medium">Cost Price</th>
                    <th className="pb-3 pr-4 font-medium">Selling Price</th>
                    <th className="pb-3 pr-4 font-medium">By</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentMovements.map((m) => {
                    const config = MOVEMENT_TYPES[m.movement_type] || MOVEMENT_TYPES.adjustment;
                    const Icon = config.icon;
                    return (
                      <tr key={m.id} className="hover:bg-gray-50/50">
                        <td className="py-3 pr-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {config.label}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-sm text-gray-700">
                          {m.movement_type === "transfer"
                            ? `${m.from_location_name || m.from_location?.name || "—"} → ${m.to_location_name || m.to_location?.name || "—"}`
                            : m.to_location_name || m.from_location_name || "—"
                          }
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`font-semibold text-sm ${Number(m.quantity) >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {config.sign}{Math.abs(Number(m.quantity) || 0)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-sm text-gray-700">
                          {item.unit_cost ? `₦${parseFloat(item.unit_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                        </td>
                        <td className="py-3 pr-4 text-sm text-gray-700">
                          {item.selling_price ? `₦${parseFloat(item.selling_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                        </td>
                        <td className="py-3 pr-4 text-sm text-gray-600">
                          {m.performed_by_name || m.performer_name || "—"}
                        </td>
                        <td className="py-3">
                          <div className="text-sm text-gray-600">{formatDate(m.created_at)}</div>
                          <div className="text-xs text-gray-400">{formatTime(m.created_at)}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No movements recorded for this item yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Section 4: View Full Movement History Link */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <History className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Full Movement History</h3>
              <p className="text-sm text-gray-500">View all {movements.length} movements for this item with advanced filters</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/inventory/stock-movements")}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <History size={16} />
            View History
          </button>
        </div>
      </div>

      {/* Stock Movement Modal */}
      <AddStockMovementFormModal
        isOpen={movementModal.open}
        onClose={() => {
          setMovementModal({ open: false, type: "stock_in", unassignedQty: 0 });
          setLocalTick((t) => t + 1);
        }}
        onSuccess={() => {
          fetchData();
          setLocalTick((t) => t + 1);
          setMovementModal({ open: false, type: "stock_in", unassignedQty: 0 });
        }}
        initialValues={{
          inventory_item: item.id,
          movement_type: movementModal.type,
          quantity: movementModal.unassignedQty || "",
        }}
        title={
          movementModal.type === "stock_in" && movementModal.unassignedQty > 0
            ? "Assign to Location"
            : movementModal.type === "stock_in"
            ? "Add Stock"
            : movementModal.type === "dispense"
            ? "Deduct Stock"
            : "Transfer Stock"
        }
      />

      {/* Edit Modal */}
      <AddInventoryFormModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        onSuccess={() => {
          setEditModal(false);
          fetchData();
          setLocalTick((t) => t + 1);
        }}
        initialValues={item}
        title="Edit Inventory"
      />

      {/* Assign Location Modal */}
      {assignLocationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setAssignLocationModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Assign to Location</h2>
              <button onClick={() => setAssignLocationModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <span className="text-gray-500">&times;</span>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                Assign <span className="font-semibold text-gray-900">{item?.item_name}</span> to a location. This only sets the location — no stock movements are created.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setAssignLocationModal(false)}
                disabled={assignLocationLoading}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignLocation}
                disabled={!selectedLocationId || assignLocationLoading}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {assignLocationLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Assign Location"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

InventoryDetail.propTypes = {
  itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default InventoryDetail;
