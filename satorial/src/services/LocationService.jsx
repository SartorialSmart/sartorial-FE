import { apiGet, apiPost, apiPut, apiDelete } from "../../utils/serviceHelper";
import { API } from "../api/apiEndpoints";

const LocationService = {
  listLocations: () => apiGet(API.INVENTORY_MANAGEMENT.LOCATIONS.LIST),

  getLocation: (id) => apiGet(API.INVENTORY_MANAGEMENT.LOCATIONS.DETAIL(id)),

  createLocation: (data) => apiPost(API.INVENTORY_MANAGEMENT.LOCATIONS.CREATE, data),

  updateLocation: (id, data) => apiPut(API.INVENTORY_MANAGEMENT.LOCATIONS.DETAIL(id), data),

  deleteLocation: (id) => apiDelete(API.INVENTORY_MANAGEMENT.LOCATIONS.DELETE(id)),
};

export default LocationService;
