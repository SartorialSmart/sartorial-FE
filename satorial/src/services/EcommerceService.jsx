import axiosInstance from "../../utils/axiosConfig";
import { API } from "../api/apiEndpoints";

const EcommerceService = {
  // Store
  listStores: async () => {
    const res = await axiosInstance.get(API.ECOMMERCE.STORES.LIST);
    return res.data;
  },
  createStore: async (data) => {
    const res = await axiosInstance.post(API.ECOMMERCE.STORES.CREATE, data);
    return res.data;
  },
  getStore: async (id) => {
    const res = await axiosInstance.get(API.ECOMMERCE.STORES.DETAIL(id));
    return res.data;
  },
  updateStore: async (id, data) => {
    const res = await axiosInstance.put(API.ECOMMERCE.STORES.UPDATE(id), data);
    return res.data;
  },
  deleteStore: async (id) => {
    const res = await axiosInstance.delete(API.ECOMMERCE.STORES.DELETE(id));
    return res.data;
  },
  verifyDomain: async (id) => {
    const res = await axiosInstance.post(API.ECOMMERCE.STORES.VERIFY_DOMAIN(id));
    return res.data;
  },
  resolveStore: async (host) => {
    const res = await axiosInstance.get(API.ECOMMERCE.STORES.RESOLVE, { params: { host } });
    return res.data;
  },
  // Products (admin)
  listProducts: async (params) => {
    const res = await axiosInstance.get(API.ECOMMERCE.PRODUCTS.LIST, { params });
    return res.data;
  },
  getProduct: async (id) => {
    const res = await axiosInstance.get(API.ECOMMERCE.PRODUCTS.DETAIL(id));
    return res.data;
  },
  createProduct: async (data) => {
    const res = await axiosInstance.post(API.ECOMMERCE.PRODUCTS.CREATE, data);
    return res.data;
  },
  updateProduct: async (id, data) => {
    const res = await axiosInstance.put(API.ECOMMERCE.PRODUCTS.UPDATE(id), data);
    return res.data;
  },
  deleteProduct: async (id) => {
    const res = await axiosInstance.delete(API.ECOMMERCE.PRODUCTS.DELETE(id));
    return res.data;
  },
  // Variants
  createVariant: async (productId, data) => {
    const res = await axiosInstance.post(API.ECOMMERCE.VARIANTS.CREATE(productId), data);
    return res.data;
  },
  updateVariant: async (id, data) => {
    const res = await axiosInstance.put(API.ECOMMERCE.VARIANTS.UPDATE(id), data);
    return res.data;
  },
  deleteVariant: async (id) => {
    const res = await axiosInstance.delete(API.ECOMMERCE.VARIANTS.DELETE(id));
    return res.data;
  },
  // Images
  createImage: async (productId, data) => {
    const res = await axiosInstance.post(API.ECOMMERCE.IMAGES.CREATE(productId), data);
    return res.data;
  },
  deleteImage: async (id) => {
    const res = await axiosInstance.delete(API.ECOMMERCE.IMAGES.DELETE(id));
    return res.data;
  },
  // Storefront (public, but uses same axiosInstance with optional auth)
  catalog: async (params) => {
    const res = await axiosInstance.get(API.ECOMMERCE.STOREFRONT.CATALOG, { params });
    return res.data;
  },
  productDetail: async (slug, params) => {
    const res = await axiosInstance.get(API.ECOMMERCE.STOREFRONT.PRODUCT_DETAIL(slug), { params });
    return res.data;
  },
  checkout: async (data) => {
    const res = await axiosInstance.post(API.ECOMMERCE.STOREFRONT.CHECKOUT, data);
    return res.data;
  },
  payOrder: async (orderId, data) => {
    const res = await axiosInstance.post(API.ECOMMERCE.STOREFRONT.PAY(orderId), data);
    return res.data;
  },
  // Admin orders
  listOrders: async (params) => {
    const res = await axiosInstance.get(API.ECOMMERCE.ADMIN_ORDERS.LIST, { params });
    return res.data;
  },
  getOrder: async (id) => {
    const res = await axiosInstance.get(API.ECOMMERCE.ADMIN_ORDERS.DETAIL(id));
    return res.data;
  },
  // External configs
  listExternalConfigs: async (params) => {
    const res = await axiosInstance.get(API.ECOMMERCE.EXTERNAL.LIST, { params });
    return res.data;
  },
  createExternalConfig: async (data) => {
    const res = await axiosInstance.post(API.ECOMMERCE.EXTERNAL.CREATE, data);
    return res.data;
  },
  updateExternalConfig: async (id, data) => {
    const res = await axiosInstance.put(API.ECOMMERCE.EXTERNAL.DETAIL(id), data);
    return res.data;
  },
  deleteExternalConfig: async (id) => {
    const res = await axiosInstance.delete(API.ECOMMERCE.EXTERNAL.DETAIL(id));
    return res.data;
  },
  // Sync errors
  listSyncErrors: async (params) => {
    const res = await axiosInstance.get(API.ECOMMERCE.SYNC_ERRORS.LIST, { params });
    return res.data;
  },
};

export default EcommerceService;
