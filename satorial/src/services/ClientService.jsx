import { apiGet, apiPost, apiPut, apiDelete } from "../../utils/serviceHelper";
import { API } from "../api/apiEndpoints";

const ClientService = {
  getClients: () => apiGet(API.CLIENT_MANAGEMENT.CLIENTS.LIST),

  getClientById: (clientId) =>
    apiGet(API.CLIENT_MANAGEMENT.CLIENTS.DETAIL(clientId)),

  createClient: (clientData) =>
    apiPost(API.CLIENT_MANAGEMENT.CLIENTS.CREATE, clientData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateClient: (clientId, clientData, isMultipart = false) =>
    apiPut(
      API.CLIENT_MANAGEMENT.CLIENTS.DETAIL(clientId),
      clientData,
      {
        headers: {
          "Content-Type": isMultipart
            ? "multipart/form-data"
            : "application/json",
        },
      }
    ),

  deleteClient: (clientId) =>
    apiDelete(API.CLIENT_MANAGEMENT.CLIENTS.DETAIL(clientId)),

  createClientAddress: (addressData) =>
    apiPost(API.CLIENT_MANAGEMENT.ADDRESSES.CREATE, addressData),

  getClientAddresses: () => apiGet(API.CLIENT_MANAGEMENT.ADDRESSES.LIST),

  getClientAddressById: (addressId) =>
    apiGet(API.CLIENT_MANAGEMENT.ADDRESSES.DETAIL(addressId)),

  updateClientAddress: (addressId, addressData) =>
    apiPut(API.CLIENT_MANAGEMENT.ADDRESSES.DETAIL(addressId), addressData),

  createMeasurement: (measurementData) =>
    apiPost(API.CLIENT_MANAGEMENT.MEASUREMENTS.CREATE, measurementData),

  getMeasurements: () => apiGet(API.CLIENT_MANAGEMENT.MEASUREMENTS.LIST),

  getMeasurementById: (measurementId) =>
    apiGet(API.CLIENT_MANAGEMENT.MEASUREMENTS.DETAIL(measurementId)),

  updateMeasurement: (measurementId, updatedData) =>
    apiPut(API.CLIENT_MANAGEMENT.MEASUREMENTS.DETAIL(measurementId), updatedData),

  deleteMeasurement: (measurementId) =>
    apiDelete(API.CLIENT_MANAGEMENT.MEASUREMENTS.DETAIL(measurementId)),

  uploadStyleImage: (imageData) =>
    apiPost(API.CLIENT_MANAGEMENT.STYLE_IMAGES.CREATE, imageData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getStyleImages: () => apiGet(API.CLIENT_MANAGEMENT.STYLE_IMAGES.LIST),

  getStyleImageById: (imageId) =>
    apiGet(API.CLIENT_MANAGEMENT.STYLE_IMAGES.DETAIL(imageId)),

  deleteStyleImage: (imageId) =>
    apiDelete(API.CLIENT_MANAGEMENT.STYLE_IMAGES.DELETE(imageId)),

  getClientDashboard: () => apiGet(API.CLIENT_MANAGEMENT.DASHBOARD.OVERVIEW),
};

export default ClientService;
