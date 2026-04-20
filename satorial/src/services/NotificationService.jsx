import axiosInstance from "../../utils/axiosConfig";
import { API } from "../api/apiEndpoints";

const NotificationService = {
  getSummary: async () => {
    const response = await axiosInstance.get(API.NOTIFICATIONS.SUMMARY);
    return response.data;
  },
};

export default NotificationService;
