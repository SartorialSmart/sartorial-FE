import axiosInstance from "../../utils/axiosConfig";
import { API } from "../api/apiEndpoints";

const InventoryService = {
  // Dispense Inventory
  listDispenseInventory: async () => {
    const response = await axiosInstance.get(
      API.INVENTORY_MANAGEMENT.DISPENSE_INVENTORY.LIST
    );
    return response.data;
  },
  getDispenseInventory: async (id) => {
    const response = await axiosInstance.get(
      API.INVENTORY_MANAGEMENT.DISPENSE_INVENTORY.DETAIL(id)
    );
    return response.data;
  },
  createDispenseInventory: async (data) => {
    const response = await axiosInstance.post(
      API.INVENTORY_MANAGEMENT.DISPENSE_INVENTORY.CREATE,
      data
    );
    return response.data;
  },
  updateDispenseInventory: async (id, data) => {
    const response = await axiosInstance.put(
      API.INVENTORY_MANAGEMENT.DISPENSE_INVENTORY.DETAIL(id),
      data
    );
    return response.data;
  },
  deleteDispenseInventory: async (id) => {
    const response = await axiosInstance.delete(
      API.INVENTORY_MANAGEMENT.DISPENSE_INVENTORY.DETAIL(id)
    );
    return response.data;
  },

  // Inventory Category
  listInventoryCategory: async () => {
    const response = await axiosInstance.get(
      API.INVENTORY_MANAGEMENT.INVENTORY_CATEGORY.LIST
    );
    return response.data;
  },
  getInventoryCategory: async (id) => {
    const response = await axiosInstance.get(
      API.INVENTORY_MANAGEMENT.INVENTORY_CATEGORY.DETAIL(id)
    );
    return response.data;
  },
  createInventoryCategory: async (data) => {
    const response = await axiosInstance.post(
      API.INVENTORY_MANAGEMENT.INVENTORY_CATEGORY.CREATE,
      data
    );
    return response.data;
  },
  updateInventoryCategory: async (id, data) => {
    const response = await axiosInstance.put(
      API.INVENTORY_MANAGEMENT.INVENTORY_CATEGORY.DETAIL(id),
      data
    );
    return response.data;
  },
  deleteInventoryCategory: async (id) => {
    const response = await axiosInstance.delete(
      API.INVENTORY_MANAGEMENT.INVENTORY_CATEGORY.DETAIL(id)
    );
    return response.data;
  },

  // Inventory
  listInventory: async () => {
    const response = await axiosInstance.get(
      API.INVENTORY_MANAGEMENT.INVENTORY.LIST
    );
    return response.data;
  },
  getInventory: async (id) => {
    const response = await axiosInstance.get(
      API.INVENTORY_MANAGEMENT.INVENTORY.DETAIL(id)
    );
    return response.data;
  },
  createInventory: async (data) => {
    const response = await axiosInstance.post(
      API.INVENTORY_MANAGEMENT.INVENTORY.CREATE,
      data
    );
    return response.data;
  },
  updateInventory: async (id, data) => {
    const response = await axiosInstance.put(
      API.INVENTORY_MANAGEMENT.INVENTORY.DETAIL(id),
      data
    );
    return response.data;
  },
  deleteInventory: async (id) => {
    const response = await axiosInstance.delete(
      API.INVENTORY_MANAGEMENT.INVENTORY.DETAIL(id)
    );
    return response.data;
  },
};

export default InventoryService;
