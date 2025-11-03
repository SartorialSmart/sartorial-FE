import axios from "axios";
import axiosInstance from "../../utils/axiosConfig";
import { API } from "../api/apiEndpoints";

const ClientService = {
  getClients: async () => {
    try {
      const response = await axiosInstance.get(
        API.CLIENT_MANAGEMENT.CLIENTS.LIST
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  },

  getClientById: async (clientId) => {
    try {
      const response = await axiosInstance.get(
        API.CLIENT_MANAGEMENT.CLIENTS.DETAIL(clientId)
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching client:", error);
      throw error;
    }
  },

  createClient: async (clientData) => {
    try {
      const response = await axiosInstance.post(
        API.CLIENT_MANAGEMENT.CLIENTS.CREATE,
        clientData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  },

  updateClient: async (clientId, clientData, isMultipart = false) => {
    try {
      const headers = isMultipart
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" };

      const response = await axiosInstance.put(
        API.CLIENT_MANAGEMENT.CLIENTS.DETAIL(clientId),
        clientData,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating client:", error.response?.data || error);
      throw error;
    }
  },

  deleteClient: async (clientId) => {
    try {
      await axiosInstance.delete(
        API.CLIENT_MANAGEMENT.CLIENTS.DETAIL(clientId)
      );
    } catch (error) {
      console.error("Error deleting client:", error);
      throw error;
    }
  },

  createClientAddress: async (addressData) => {
    try {
      const response = await axiosInstance.post(
        API.CLIENT_MANAGEMENT.ADDRESSES.CREATE,
        addressData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating client address:", error);
      throw error;
    }
  },

  getClientAddresses: async () => {
    try {
      const response = await axiosInstance.get(
        API.CLIENT_MANAGEMENT.ADDRESSES.LIST
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching client addresses:", error);
      throw error;
    }
  },

  getClientAddressById: async (addressId) => {
    try {
      const response = await axiosInstance.get(
        API.CLIENT_MANAGEMENT.ADDRESSES.DETAIL(addressId)
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching client address:", error);
      throw error;
    }
  },

  createMeasurement: async (measurementData) => {
    try {
      const response = await axiosInstance.post(
        API.CLIENT_MANAGEMENT.MEASUREMENTS.CREATE,
        measurementData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating measurement:", error);
      throw error;
    }
  },

  getMeasurements: async () => {
    try {
      const response = await axiosInstance.get(
        API.CLIENT_MANAGEMENT.MEASUREMENTS.LIST
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching measurements:", error);
      throw error;
    }
  },

  getMeasurementById: async (measurementId) => {
    try {
      const response = await axiosInstance.get(
        API.CLIENT_MANAGEMENT.MEASUREMENTS.DETAIL(measurementId)
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching measurement with ID ${measurementId}:`,
        error
      );
      throw error;
    }
  },

  updateMeasurement: async (measurementId, updatedData) => {
    try {
      const response = await axiosInstance.put(
        API.CLIENT_MANAGEMENT.MEASUREMENTS.DETAIL(measurementId),
        updatedData
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating measurement with ID ${measurementId}:`,
        error
      );
      throw error;
    }
  },

  deleteMeasurement: async (measurementId) => {
    try {
      await axiosInstance.delete(
        API.CLIENT_MANAGEMENT.MEASUREMENTS.DETAIL(measurementId)
      );
      return { success: true };
    } catch (error) {
      console.error(
        `Error deleting measurement with ID ${measurementId}:`,
        error
      );
      throw error;
    }
  },
  uploadStyleImage: async (imageData) => {
    try {
      console.log("=== Service Debug ===");
      console.log("API Endpoint:", API.CLIENT_MANAGEMENT.STYLE_IMAGES.CREATE);

      // Log all FormData entries
      console.log("FormData entries in service:");
      for (let pair of imageData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File - ${pair[1].name}`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      console.log("Client from FormData:", imageData.get("client"));
      console.log("Images count:", imageData.getAll("images").length);

      const response = await axiosInstance.post(
        API.CLIENT_MANAGEMENT.STYLE_IMAGES.CREATE,
        imageData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("=== API Error Debug ===");
      console.error("Error response:", error.response?.data);
      console.error("Request config:", {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      });
      throw error;
    }
  },

  getStyleImages: async () => {
    try {
      const response = await axiosInstance.get(
        API.CLIENT_MANAGEMENT.STYLE_IMAGES.LIST
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching style images:", error);
      throw error;
    }
  },

  getStyleImageById: async (imageId) => {
    try {
      const response = await axiosInstance.get(
        API.CLIENT_MANAGEMENT.STYLE_IMAGES.DETAIL(imageId)
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching style image:", error);
      throw error;
    }
  },

  deleteStyleImage: async (imageId) => {
    try {
      const response = await axiosInstance.delete(
        API.CLIENT_MANAGEMENT.STYLE_IMAGES.DELETE(imageId)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getClientDashboard: async () => {
    try {
      const response = await axiosInstance.get(
        API.CLIENT_MANAGEMENT.DASHBOARD.OVERVIEW
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching client dashboard data:", error);
      throw error;
    }
  },
};

export default ClientService;
